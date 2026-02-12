from pydantic import BaseModel, ConfigDict
from typing import List

class BookRead(BaseModel):
    id: int
    title: str
    description: str
    stock: int
    price: float
    images: List[str] = []
    model_config = ConfigDict(from_attributes=True)

class BookCreate(BaseModel):
    title: str
    description: str
    stock: int
    price: float
    images: List[str] = []
    model_config = ConfigDict(from_attributes=True)

class BookUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    stock: int | None = None
    model_config = ConfigDict(from_attributes=True)

class BookDelete(BaseModel):
    id: int
    model_config = ConfigDict(from_attributes=True)