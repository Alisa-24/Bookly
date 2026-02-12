from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy import select, update, delete, insert
from app.models.book import Book
from app.schemas.book import BookCreate, BookRead
from typing import List
from app.core.security import (
    auth_backend,
    fastapi_users,
    google_oauth_client,
    get_user_manager,
    get_user_db,
    get_jwt_strategy,
)
from app.schemas.user import UserRead, UserCreate, UserUpdate
from app.core.config import SECRET_KEY
from pydantic import BaseModel
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
import httpx
from app.utils.adminCheck import is_admin
import os
import shutil
from pathlib import Path

class GoogleCallbackRequest(BaseModel):
    code: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

api_router = APIRouter()

api_router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

api_router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

api_router.include_router(
    fastapi_users.get_oauth_router(google_oauth_client, auth_backend, SECRET_KEY),
    prefix="/auth/google",
    tags=["auth"],
)

@api_router.post("/auth/google/callback", response_model=TokenResponse, tags=["auth"])
async def google_oauth_callback(
    request: GoogleCallbackRequest,
    user_manager = Depends(get_user_manager),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Handle Google OAuth callback with authorization code.
    Exchanges the code for tokens and creates/updates the user.
    """
    try:
        # Exchange the authorization code for tokens
        redirect_uri = "http://localhost:3000/auth/google/callback"
        
        token = await google_oauth_client.get_access_token(
            code=request.code,
            redirect_uri=redirect_uri,
        )
        
        # Get user information from Google
        access_token_str = token.get("access_token")
        if not access_token_str:
            raise Exception(f"No access_token in response. Got keys: {token.keys()}")
        
        # Fetch user info directly from Google's userinfo endpoint
        async with httpx.AsyncClient() as client:
            userinfo_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token_str}"}
            )
            
            if userinfo_response.status_code != 200:
                raise Exception(f"Failed to get user info from Google. Status: {userinfo_response.status_code}")
            
            userinfo = userinfo_response.json()
        
        user_email = userinfo.get("email")
        if not user_email:
            raise Exception(f"No email in userinfo")
        
        google_id = userinfo.get("id")
        full_name = userinfo.get("name")
        
        # Get or create user
        existing_user = await user_manager.user_db.get_by_email(user_email)
        
        if existing_user:
            # Update google_id if not set
            if not existing_user.google_id and google_id:
                existing_user.google_id = google_id
                session.add(existing_user)
                await session.commit()
                await session.refresh(existing_user)
            user = existing_user
        else:
            # Create new user from Google info
            user_create = UserCreate(
                email=user_email,
                password=str(uuid.uuid4()),  # Random password for Google users
                is_active=True,
                google_id=google_id,
                full_name=full_name,
            )
            await user_manager.create(user_create)
            
            # Fetch the actual user object from database
            user = await user_manager.user_db.get_by_email(user_email)
        
        # Generate JWT token
        strategy = get_jwt_strategy()
        access_token = await strategy.write_token(user)
        
        return TokenResponse(access_token=access_token)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=400,
            detail=f"Google authentication failed: {str(e)}"
        )

@api_router.get("/books", response_model=list[BookRead], tags=["books"])
async def list_books(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Book))
    books = result.scalars().all()
    return books

@api_router.get("/books/{book_id}", response_model=BookRead, tags=["books"])
async def get_book(book_id: int, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@api_router.post("/upload-image", tags=["books"])
async def upload_image(
    file: UploadFile = File(...),
    _: UserRead = Depends(is_admin)
):
    """Upload book cover image"""
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/books")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"image_path": f"/uploads/books/{unique_filename}"}

@api_router.post("/books", response_model=BookRead, tags=["books"])
async def create_book(
    title: str = Form(...),
    description: str = Form(...),
    stock: int = Form(...),
    price: float = Form(...),
    images: List[UploadFile] = File(...),
    session: AsyncSession = Depends(get_async_session),
    _: UserRead = Depends(is_admin)
):
    # Validate number of images (1-4)
    if len(images) < 1 or len(images) > 4:
        raise HTTPException(
            status_code=400,
            detail="You must upload between 1 and 4 images"
        )
    
    image_paths = []
    upload_dir = Path("uploads/books")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    for image in images:
        # Generate unique filename
        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        image_paths.append(f"/uploads/books/{unique_filename}")
    
    new_book = Book(
        title=title,
        description=description,
        stock=stock,
        price=price,
        images=image_paths
    )
    session.add(new_book)
    await session.commit()
    await session.refresh(new_book)
    return new_book

@api_router.put("/books/{book_id}", response_model=BookRead, tags=["books"])
async def update_book(
    book_id: int,
    title: str = Form(...),
    description: str = Form(...),
    stock: int = Form(...),
    price: float = Form(...),
    images: List[UploadFile] = File(...),
    session: AsyncSession = Depends(get_async_session),
    _: UserRead = Depends(is_admin)
):
    result = await session.execute(select(Book).where(Book.id == book_id))
    existing_book = result.scalar_one_or_none()
    if not existing_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Validate number of images (1-4)
    if len(images) < 1 or len(images) > 4:
        raise HTTPException(
            status_code=400,
            detail="You must upload between 1 and 4 images"
        )
    
    existing_book.title = title
    existing_book.description = description
    existing_book.stock = stock
    existing_book.price = price
    
    # Delete old images if they exist
    if existing_book.images:
        for old_image_path in existing_book.images:
            old_file_path = Path(f".{old_image_path}")
            if old_file_path.exists():
                old_file_path.unlink()
    
    # Save new images
    image_paths = []
    upload_dir = Path("uploads/books")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    for image in images:
        # Generate unique filename
        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        image_paths.append(f"/uploads/books/{unique_filename}")
    
    existing_book.images = image_paths
    
    session.add(existing_book)
    await session.commit()
    await session.refresh(existing_book)
    return existing_book

@api_router.delete("/books/{book_id}", tags=["books"])
async def delete_book(
    book_id: int,
    session: AsyncSession = Depends(get_async_session),
    _: UserRead = Depends(is_admin)
):
    result = await session.execute(select(Book).where(Book.id == book_id))
    existing_book = result.scalar_one_or_none()
    if not existing_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Delete image files if they exist
    if existing_book.images:
        for image_path in existing_book.images:
            image_file_path = Path(f".{image_path}")
            if image_file_path.exists():
                image_file_path.unlink()
    
    await session.delete(existing_book)
    await session.commit()
    return {"detail": "Book deleted successfully"}
