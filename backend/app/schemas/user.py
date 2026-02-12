import uuid
from typing import Optional
from datetime import datetime
from fastapi_users import schemas
from pydantic import ConfigDict

class UserRead(schemas.BaseUser[uuid.UUID]):
    full_name: Optional[str]
    role: str
    created_at: datetime
    google_id: Optional[str]
    
    model_config = ConfigDict(from_attributes=True)


class UserCreate(schemas.BaseUserCreate):
    full_name: Optional[str] = None
    role: str = "user"
    google_id: Optional[str] = None


class UserUpdate(schemas.BaseUserUpdate):
    full_name: Optional[str] = None
    role: Optional[str] = None
    google_id: Optional[str] = None
