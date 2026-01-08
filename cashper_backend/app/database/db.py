from pymongo import MongoClient
from app.config import mongo_url, mongo_db

# MongoDB client
client = None
database = None


def connect_to_mongo():
    """Connect to MongoDB - graceful fallback if unavailable"""
    global client, database
    try:
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
        database = client[mongo_db]
        # Test the connection
        client.admin.command('ping')
        print("[+] Connected to MongoDB successfully!")
    except Exception as e:
        print(f"[!] Warning: MongoDB connection failed: {e}")
        print("[*] Using fallback data strategy - API will return hardcoded data")
        # Don't raise - allow server to continue with fallback data
        client = None
        database = None


def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_database():
    """Get database instance"""
    return database


def is_mongo_connected():
    """Check if MongoDB is connected"""
    return client is not None and database is not None


