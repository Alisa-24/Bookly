from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.db.session import get_async_session
from app.models.user import User
from app.models.review import Review
from app.models.book import Book
from app.schemas.review import ReviewCreate, ReviewRead
from app.core.security import current_active_user

router = APIRouter()

@router.get("/book/{book_id}", response_model=List[ReviewRead])
async def get_book_reviews(
    book_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all reviews for a specific book"""
    query = select(Review).where(Review.book_id == book_id).options(selectinload(Review.user)).order_by(Review.created_at.desc())
    result = await session.execute(query)
    reviews = result.scalars().all()
    
    # Process user_name for each review
    for review in reviews:
        review.user_name = review.user.full_name or review.user.email
        
    return reviews

@router.post("/", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Create a new review for a book. Must be logged in."""
    # Check if book exists
    book_query = select(Book).where(Book.id == review_data.book_id)
    book_result = await session.execute(book_query)
    if not book_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Book not found")

    # Optional: Check if user already reviewed this book
    check_query = select(Review).where(
        (Review.book_id == review_data.book_id) & (Review.user_id == user.id)
    )
    check_result = await session.execute(check_query)
    if check_result.scalar_one_or_none():
        raise HTTPException(
            status_code=400, 
            detail="You have already reviewed this book"
        )

    new_review = Review(
        **review_data.model_dump(),
        user_id=user.id
    )
    session.add(new_review)
    await session.commit()
    await session.refresh(new_review)
    
    # Load user for the response
    await session.refresh(new_review, ["user"])
    new_review.user_name = new_review.user.full_name or new_review.user.email
    
    return new_review

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a review. Only the owner or an admin can delete."""
    query = select(Review).where(Review.id == review_id)
    result = await session.execute(query)
    review = result.scalar_one_or_none()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    if review.user_id != user.id and user.role != "admin":
        raise HTTPException(
            status_code=403, 
            detail="Not authorized to delete this review"
        )
        
    await session.delete(review)
    await session.commit()
    return None
