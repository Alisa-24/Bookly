from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import List

from app.db.session import get_async_session
from app.models.user import User
from app.models.cart import Cart
from app.models.cart_items import CartItem
from app.models.book import Book
from app.schemas.cart import CartRead, CartItemCreate, CartItemUpdate
from app.core.security import current_active_user

router = APIRouter()

@router.get("/", response_model=CartRead)
async def get_cart(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Get the current user's cart. Creates one if it doesn't exist.
    """
    query = select(Cart).where(Cart.user_id == user.id).options(
        selectinload(Cart.items).selectinload(CartItem.book)
    )
    result = await session.execute(query)
    cart = result.scalar_one_or_none()

    if not cart:
        cart = Cart(user_id=user.id)
        session.add(cart)
        await session.commit()
        await session.refresh(cart)
        # Re-query to load relationships
        result = await session.execute(query)
        cart = result.scalar_one()
    
    return cart

@router.post("/items", response_model=CartRead)
async def add_item_to_cart(
    item_in: CartItemCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Add a book to the cart. If the book is already in the cart, updates the quantity.
    """
    # 1. Get or create cart
    query = select(Cart).where(Cart.user_id == user.id).options(selectinload(Cart.items))
    result = await session.execute(query)
    cart = result.scalar_one_or_none()

    if not cart:
        cart = Cart(user_id=user.id)
        session.add(cart)
        await session.commit()
        await session.refresh(cart)

    # 2. Check if book exists
    book_query = select(Book).where(Book.id == item_in.book_id)
    book_result = await session.execute(book_query)
    book = book_result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # 3. Check if item already exists in cart
    item_query = select(CartItem).where(
        and_(CartItem.cart_id == cart.id, CartItem.book_id == item_in.book_id)
    )
    item_result = await session.execute(item_query)
    existing_item = item_result.scalar_one_or_none()

    if existing_item:
        existing_item.quantity += item_in.quantity
        session.add(existing_item)
    else:
        new_item = CartItem(
            cart_id=cart.id,
            book_id=item_in.book_id,
            quantity=item_in.quantity
        )
        session.add(new_item)
    
    await session.commit()
    
    # Return updated cart
    query = select(Cart).where(Cart.user_id == user.id).options(
        selectinload(Cart.items).selectinload(CartItem.book)
    )
    result = await session.execute(query)
    return result.scalar_one()

@router.put("/items/{item_id}", response_model=CartRead)
async def update_cart_item(
    item_id: int,
    item_in: CartItemUpdate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Update the quantity of a cart item.
    """
    # Verify item belongs to user's cart
    query = select(CartItem).join(Cart).where(
        and_(CartItem.id == item_id, Cart.user_id == user.id)
    )
    result = await session.execute(query)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if item_in.quantity <= 0:
        await session.delete(item)
    else:
        item.quantity = item_in.quantity
        session.add(item)
    
    await session.commit()

    # Return updated cart
    cart_query = select(Cart).where(Cart.user_id == user.id).options(
        selectinload(Cart.items).selectinload(CartItem.book)
    )
    cart_result = await session.execute(cart_query)
    return cart_result.scalar_one()

@router.delete("/items/{item_id}", response_model=CartRead)
async def remove_cart_item(
    item_id: int,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Remove an item from the cart.
    """
    query = select(CartItem).join(Cart).where(
        and_(CartItem.id == item_id, Cart.user_id == user.id)
    )
    result = await session.execute(query)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await session.delete(item)
    await session.commit()

    # Return updated cart
    cart_query = select(Cart).where(Cart.user_id == user.id).options(
        selectinload(Cart.items).selectinload(CartItem.book)
    )
    cart_result = await session.execute(cart_query)
    return cart_result.scalar_one()
