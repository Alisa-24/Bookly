from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
import uuid
from app.schemas.cart import CartRead

class OrderBase(BaseModel):
    total_amount: float

class OrderCreate(OrderBase):
    cart_id: int

class OrderRead(OrderBase):
    id: int
    user_id: uuid.UUID
    cart_id: int
    status: str
    stripe_payment_intent_id: Optional[str] = None
    stripe_session_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class OrderUpdate(BaseModel):
    status: str

# Stripe checkout session schemas
class CheckoutSessionRequest(BaseModel):
    cart_id: int

class CheckoutSessionResponse(BaseModel):
    session_id: str
    client_secret: Optional[str] = None
    publishable_key: str

class PaymentIntentResponse(BaseModel):
    client_secret: str
    publishable_key: str
