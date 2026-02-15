from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.books import router as books_router
from app.api.cart import router as cart_router
from app.api.payment import router as payment_router
from app.api.reviews import router as reviews_router
from app.core.security import fastapi_users
from app.schemas.user import UserRead, UserUpdate

api_router = APIRouter()

# Authentication routes
api_router.include_router(auth_router, prefix="/auth")

# Books routes
api_router.include_router(books_router, prefix="/books", tags=["books"])

# User management routes
api_router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

# Cart routes
api_router.include_router(
    cart_router,
    prefix="/cart",
    tags=["cart"],
)

# Payment routes
api_router.include_router(
    payment_router,
    prefix="/payments",
    tags=["payments"],
)

# Reviews routes
api_router.include_router(
    reviews_router,
    prefix="/reviews",
    tags=["reviews"],
)
