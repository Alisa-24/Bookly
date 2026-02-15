from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import (
    auth_backend,
    fastapi_users,
    google_oauth_client,
    get_user_manager,
    get_jwt_strategy,
)
from app.schemas.user import UserRead, UserCreate, UserUpdate
from app.core.config import SECRET_KEY
from app.db.session import get_async_session
from pydantic import BaseModel
import httpx
import uuid

router = APIRouter()

class GoogleCallbackRequest(BaseModel):
    code: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Auth routes from routers.py
router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/jwt",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_reset_password_router(),
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_verify_router(UserRead),
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_oauth_router(google_oauth_client, auth_backend, SECRET_KEY),
    prefix="/google",
    tags=["auth"],
)

@router.post("/google/callback", response_model=TokenResponse, tags=["auth"])
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

# User management route
router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
)
