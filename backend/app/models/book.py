from sqlalchemy import Integer, String, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.review import Review

class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    images: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="book", cascade="all, delete-orphan", lazy="noload")