from sqlalchemy import Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base import Base
import uuid
from fastapi_users_db_sqlalchemy import GUID
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.book import Book
    from app.models.user import User

class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    book_id: Mapped[int] = mapped_column(Integer, ForeignKey("books.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("user.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    comment: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    book: Mapped["Book"] = relationship("Book", back_populates="reviews")
    user: Mapped["User"] = relationship("User")
