import os
from dotenv import load_dotenv

DATABASE_URL = "sqlite+aiosqlite:///./sql_app.db"
SECRET_KEY = "SECRET_KEY_FOR_DEV_ONLY"

# Load the .env file
load_dotenv()

# Get the secrets
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

