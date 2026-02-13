from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

from app.models.book import Book
from app.models.user import User
from app.models.cart import Cart
from app.models.cart_items import CartItem