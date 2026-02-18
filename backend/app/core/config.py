import os
from dotenv import load_dotenv

DATABASE_URL = "sqlite+aiosqlite:///./sql_app.db"
SECRET_KEY = "SECRET_KEY_FOR_DEV_ONLY"

# Load the .env file
load_dotenv()

# Token lifetimes
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# Get the secrets
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

# Stripe keys
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")

