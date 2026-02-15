import sqlalchemy
from sqlalchemy import DateTime, Integer, String, ForeignKey, func
from fastapi_users_db_sqlalchemy import GUID
import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.cart import Cart
from datetime import datetime
from app.models.user import User

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("user.id"), nullable=False)
    cart_id: Mapped[int] = mapped_column(Integer, ForeignKey("carts.id"), nullable=False)
    total_amount: Mapped[float] = mapped_column(sqlalchemy.Float, nullable=False)
    status: Mapped[str] = mapped_column(String, default="pending", nullable=False)
    stripe_payment_intent_id: Mapped[str] = mapped_column(String, unique=True, nullable=True)
    stripe_session_id: Mapped[str] = mapped_column(String, unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user: Mapped["User"] = relationship("User", back_populates="orders")
    cart: Mapped["Cart"] = relationship("Cart")