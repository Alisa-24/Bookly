from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.book import Book
from app.schemas.book import BookRead
from app.schemas.user import UserRead
from app.db.session import get_async_session
from app.utils.adminCheck import is_admin
from typing import List
import uuid
import os
import shutil
from pathlib import Path

router = APIRouter()

@router.get("", response_model=list[BookRead])
async def list_books(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Book))
    books = result.scalars().all()
    return books

@router.get("/{book_id}", response_model=BookRead)
async def get_book(book_id: int, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.post("/upload-image")
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

@router.post("", response_model=BookRead)
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

@router.put("/{book_id}", response_model=BookRead)
async def update_book(
    book_id: int,
    title: str = Form(...),
    description: str = Form(...),
    stock: int = Form(...),
    price: float = Form(...),
    keep_images: str = Form("[]"),  # JSON string of image paths to keep
    images: List[UploadFile] = File(None),
    session: AsyncSession = Depends(get_async_session),
    _: UserRead = Depends(is_admin)
):
    import json
    try:
        keep_images_list = json.loads(keep_images)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid keep_images format: {str(e)}")

    result = await session.execute(select(Book).where(Book.id == book_id))
    existing_book = result.scalar_one_or_none()
    if not existing_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Calculate total images after update
    new_images = [img for img in images if img.filename] if images else []
    new_images_count = len(new_images)
    total_images_count = len(keep_images_list) + new_images_count
    
    if total_images_count < 1 or total_images_count > 4:
        raise HTTPException(
            status_code=400,
            detail="Book must have between 1 and 4 images total"
        )
    
    # Identify images to delete from disk
    current_images = existing_book.images or []
    images_to_delete = [img for img in current_images if img not in keep_images_list]
    
    for old_image_path in images_to_delete:
        old_file_path = Path(f".{old_image_path}")
        if old_file_path.exists():
            old_file_path.unlink()
    
    # Start with kept images
    updated_image_paths = keep_images_list
    
    # Save new images if provided
    if new_images:
        upload_dir = Path("uploads/books")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        for image in new_images:
            # Generate unique filename
            file_extension = os.path.splitext(image.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = upload_dir / unique_filename
            
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            updated_image_paths.append(f"/uploads/books/{unique_filename}")
    
    existing_book.title = title
    existing_book.description = description
    existing_book.stock = stock
    existing_book.price = price
    existing_book.images = updated_image_paths
    
    session.add(existing_book)
    await session.commit()
    await session.refresh(existing_book)
    return existing_book
    
    session.add(existing_book)
    await session.commit()
    await session.refresh(existing_book)
    return existing_book

@router.delete("/{book_id}")
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
