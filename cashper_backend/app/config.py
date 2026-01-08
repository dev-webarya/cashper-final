import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Configuration
mongo_url = os.getenv("MONGO_URL", "mongodb+srv://kumuyadav249_db_user:O0zb3rZlZXArZiSg@cluster0.mnzwn7m.mongodb.net/")
mongo_db = os.getenv("MONGO_DB", "cashper_db")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production-use-long-random-string-min-32-characters")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Development/Testing Configuration
# WARNING: Set to False in production!
DISABLE_AUTH_FOR_TESTING = os.getenv("DISABLE_AUTH_FOR_TESTING", "False").lower() == "true"