from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional

from app.db.session import get_async_session
from app.models.user import User
from app.models.cart import Cart
from app.models.cart_items import CartItem
from app.models.orders import Order
from app.models.book import Book
from app.schemas.order import (
    OrderRead,
    OrderCreate,
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    PaymentIntentResponse,
)
from app.core.security import current_active_user
from app.core.config import STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
from app.core.stripe import stripe

router = APIRouter()

async def process_successful_payment(order: Order, session: AsyncSession):
    """Decrease stock and clear cart after payment"""
    if order and order.status != "completed":
        # Get cart with items
        cart_query = select(Cart).where(
            Cart.id == order.cart_id
        ).options(
            selectinload(Cart.items).selectinload(CartItem.book)
        )
        cart_result = await session.execute(cart_query)
        cart = cart_result.scalar_one_or_none()
        
        if cart and cart.items:
            # Decrease stock for each item
            for item in cart.items:
                if item.book:
                    # Ensure stock doesn't go negative
                    new_stock = max(0, item.book.stock - item.quantity)
                    item.book.stock = new_stock
                    
                    if new_stock == 0:
                        # User requested to delete book if stock is 0
                        await session.delete(item.book)
                    else:
                        session.add(item.book)
            
            # Delete all items from cart
            for item in list(cart.items):
                await session.delete(item)
        
        # Update order status
        order.status = "completed"
        session.add(order)
        await session.commit()
        return True
    return False

def get_cart_total(cart_items: list) -> tuple[float, list]:
    """Calculate cart total and return (total, items_data)"""
    total = 0.0
    items_data = []
    
    for item in cart_items:
        item_total = item.book.price * item.quantity
        total += item_total
        items_data.append({
            "name": item.book.title,
            "price": item.book.price + item.book.price * 0.1,  # Add 10% tax
            "quantity": item.quantity,
            "book_id": item.book.id,
        })
    
    return total, items_data

@router.post("/checkout/session", response_model=CheckoutSessionResponse, tags=["payments"])
async def create_checkout_session(
    request: CheckoutSessionRequest,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Create a Stripe checkout session for the user's cart.
    """
    # Get cart with items
    cart_query = select(Cart).where(
        (Cart.user_id == user.id) & (Cart.id == request.cart_id)
    ).options(
        selectinload(Cart.items).selectinload(CartItem.book)
    )
    cart_result = await session.execute(cart_query)
    cart = cart_result.scalar_one_or_none()
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total and prepare line items
    total_amount, items_data = get_cart_total(cart.items)
    
    # Convert to cents for Stripe
    total_cents = int(total_amount * 100)
    
    # Prepare line items for Stripe
    line_items = [
        {
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": item["name"],
                },
                "unit_amount": int(item["price"] * 100),
            },
            "quantity": item["quantity"],
        }
        for item in items_data
    ]
    
    try:
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url="http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:3000/cart",
            customer_email=user.email,
            metadata={
                "cart_id": str(request.cart_id),
                "user_id": str(user.id),
                "total_amount": str(total_amount),
            }
        )
        
        # Create order in database with pending status
        order = Order(
            user_id=user.id,
            cart_id=request.cart_id,
            total_amount=total_amount,
            status="pending",
            stripe_session_id=checkout_session.id,
        )
        session.add(order)
        await session.commit()
        await session.refresh(order)
        
        return CheckoutSessionResponse(
            session_id=checkout_session.id,
            publishable_key=STRIPE_PUBLISHABLE_KEY,
        )
    
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")

@router.post("/payment-intent", response_model=PaymentIntentResponse, tags=["payments"])
async def create_payment_intent(
    request: CheckoutSessionRequest,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Create a Stripe payment intent for the user's cart.
    Alternative to checkout session if using custom payment form.
    """
    # Get cart with items
    cart_query = select(Cart).where(
        (Cart.user_id == user.id) & (Cart.id == request.cart_id)
    ).options(
        selectinload(Cart.items).selectinload(CartItem.book)
    )
    cart_result = await session.execute(cart_query)
    cart = cart_result.scalar_one_or_none()
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total
    total_amount, _ = get_cart_total(cart.items)
    total_cents = int(total_amount * 100)
    
    try:
        # Create payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=total_cents,
            currency="usd",
            metadata={
                "cart_id": str(request.cart_id),
                "user_id": str(user.id),
                "total_amount": str(total_amount),
            },
        )
        
        # Create or update order
        order_query = select(Order).where(
            (Order.user_id == user.id) & (Order.cart_id == request.cart_id)
        )
        order_result = await session.execute(order_query)
        order = order_result.scalar_one_or_none()
        
        if not order:
            order = Order(
                user_id=user.id,
                cart_id=request.cart_id,
                total_amount=total_amount,
                status="pending",
                stripe_payment_intent_id=payment_intent.id,
            )
            session.add(order)
        else:
            order.stripe_payment_intent_id = payment_intent.id
            session.add(order)
        
        await session.commit()
        
        return PaymentIntentResponse(
            client_secret=payment_intent.client_secret,
            publishable_key=STRIPE_PUBLISHABLE_KEY,
        )
    
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")

@router.post("/verify-session", tags=["payments"])
async def verify_session(
    request: dict,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Verify a Stripe checkout session and complete the order.
    Fallback for when webhooks are not available (e.g. local dev).
    """
    session_id = request.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    try:
        # Retrieve the session from Stripe
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        
        if checkout_session.payment_status == "paid":
            # Get order by session ID
            order_query = select(Order).where(
                (Order.stripe_session_id == session_id) & (Order.user_id == user.id)
            )
            order_result = await session.execute(order_query)
            order = order_result.scalar_one_or_none()
            
            if order:
                updated = await process_successful_payment(order, session)
                return {"status": "success", "updated": updated}
            else:
                raise HTTPException(status_code=404, detail="Order not found")
        else:
            return {"status": "pending", "payment_status": checkout_session.payment_status}
            
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders", response_model=list[OrderRead], tags=["orders"])
async def get_user_orders(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Get all orders for the current user.
    """
    query = select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())
    result = await session.execute(query)
    orders = result.scalars().all()
    return orders

@router.get("/orders/{order_id}", response_model=OrderRead, tags=["orders"])
async def get_order(
    order_id: int,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Get a specific order for the current user.
    """
    query = select(Order).where(
        (Order.id == order_id) & (Order.user_id == user.id)
    )
    result = await session.execute(query)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

@router.post("/webhook", tags=["webhooks"])
async def stripe_webhook(
    request: Request,
    session: AsyncSession = Depends(get_async_session),
):
    """
    Handle Stripe webhook events.
    Decreases book stock and clears cart on successful payment.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_SECRET_KEY
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle different event types
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        
        # Get order by payment intent ID
        order_query = select(Order).where(
            Order.stripe_payment_intent_id == payment_intent.id
        )
        order_result = await session.execute(order_query)
        order = order_result.scalar_one_or_none()
        
        await process_successful_payment(order, session)
    
    elif event["type"] == "checkout.session.completed":
        checkout_session = event["data"]["object"]
        
        # Get order by session ID
        order_query = select(Order).where(
            Order.stripe_session_id == checkout_session.id
        )
        order_result = await session.execute(order_query)
        order = order_result.scalar_one_or_none()
        
        await process_successful_payment(order, session)
    
    elif event["type"] == "charge.refunded":
        charge = event["data"]["object"]
        
        # Update order status if refund happens
        if charge.get("payment_intent"):
            order_query = select(Order).where(
                Order.stripe_payment_intent_id == charge["payment_intent"]
            )
            order_result = await session.execute(order_query)
            order = order_result.scalar_one_or_none()
            
            if order:
                order.status = "refunded"
                session.add(order)
                await session.commit()
    
    return {"status": "received"}
