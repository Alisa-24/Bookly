from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.db.base import Base
from app.db.session import engine, async_session_maker
from app.api.routers import api_router
from app.models.user import User
from fastapi_users.password import PasswordHelper
from pathlib import Path

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create default admin user if not exists
    async with async_session_maker() as session:
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == "admin@bookly.com"))
        admin_user = result.scalar_one_or_none()
        
        if not admin_user:
            password_helper = PasswordHelper()
            hashed_password = password_helper.hash("password123")
            
            admin_user = User(
                email="admin@bookly.com",
                hashed_password=hashed_password,
                is_active=True,
                is_superuser=True,
                is_verified=True,
                role="admin",
                full_name="Admin User"
            )
            session.add(admin_user)
            await session.commit()
            print("Default admin user created: admin@bookly.com / password123")
        else:
            print("Admin user already exists")
    
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(lifespan=lifespan)

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads/books")
uploads_dir.mkdir(parents=True, exist_ok=True)

# Mount static files for uploaded images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "Hello World"}
