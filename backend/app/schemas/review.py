from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class ReviewBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str

class ReviewCreate(ReviewBase):
    book_id: int

class ReviewRead(ReviewBase):
    id: int
    book_id: int
    user_id: UUID
    user_name: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
