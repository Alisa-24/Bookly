
from fastapi.params import Depends
from app.schemas.user import UserRead
from fastapi import HTTPException
from app.core.security import current_active_user

async def is_admin(user: UserRead = Depends(current_active_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user