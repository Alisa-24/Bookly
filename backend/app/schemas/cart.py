from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
import uuid

class CartItemBookRead(BaseModel):
    """Simplified book schema for cart items (without reviews)"""
    id: int
    title: str
    description: str
    stock: int
    price: float
    images: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class CartItemBase(BaseModel):
    book_id: int
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemRead(CartItemBase):
    id: int
    cart_id: int
    added_at: datetime
    book: CartItemBookRead  # Use simplified book schema

    model_config = ConfigDict(from_attributes=True)

class CartBase(BaseModel):
    pass

class CartRead(CartBase):
    id: int
    user_id: uuid.UUID
    created_at: datetime
    items: List[CartItemRead] = []

    model_config = ConfigDict(from_attributes=True)
