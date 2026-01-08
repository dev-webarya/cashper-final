from datetime import datetime
from typing import Optional
from bson import ObjectId
from pymongo import ReturnDocument
from app.database.db import get_database
from app.database.schema.user_schema import UserInDB, UserResponse


class UserRepository:
    """Repository for user database operations"""
    
    def __init__(self):
        self.collection_name = "users"

    def get_collection(self):
        """Get users collection"""
        db = get_database()
        return db[self.collection_name]

    def create_user(self, user_data: UserInDB) -> UserResponse:
        """Create a new user in database"""
        collection = self.get_collection()
        
        # Convert Pydantic model to dict
        user_dict = user_data.dict()
        
        # Insert user into database
        result = collection.insert_one(user_dict)
        
        # Retrieve the created user
        created_user = collection.find_one({"_id": result.inserted_id})
        
        # Convert MongoDB document to UserResponse
        return self._document_to_user_response(created_user)

    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email"""
        collection = self.get_collection()
        user = collection.find_one({"email": email.lower()})
        return user

    def get_user_by_phone(self, phone: str) -> Optional[dict]:
        """Get user by phone number"""
        collection = self.get_collection()
        user = collection.find_one({"phone": phone})
        return user

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID"""
        collection = self.get_collection()
        try:
            user = collection.find_one({"_id": ObjectId(user_id)})
            return user
        except Exception:
            return None

    def update_user(self, user_id: str, update_data: dict) -> Optional[UserResponse]:
        """Update user data"""
        collection = self.get_collection()
        
        # Add updated timestamp
        update_data["updatedAt"] = datetime.utcnow()
        
        try:
            result = collection.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$set": update_data},
                return_document=ReturnDocument.AFTER
            )
            
            if result:
                return self._document_to_user_response(result)
            return None
        except Exception:
            return None

    def verify_email(self, user_id: str) -> bool:
        """Mark user email as verified"""
        collection = self.get_collection()
        try:
            result = collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"isEmailVerified": True, "updatedAt": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception:
            return False

    def verify_phone(self, user_id: str) -> bool:
        """Mark user phone as verified"""
        collection = self.get_collection()
        try:
            result = collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"isPhoneVerified": True, "updatedAt": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception:
            return False

    def update_password(self, user_id: str, hashed_password: str) -> bool:
        """Update user password"""
        collection = self.get_collection()
        try:
            result = collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"hashedPassword": hashed_password, "updatedAt": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception:
            return False

    def deactivate_user(self, user_id: str) -> bool:
        """Deactivate user account"""
        collection = self.get_collection()
        try:
            result = collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"isActive": False, "updatedAt": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception:
            return False

    def get_all_active_users(self) -> list:
        """Get all active users for notification broadcast"""
        collection = self.get_collection()
        try:
            users = list(collection.find({"isActive": True}, {"_id": 1}))
            return users
        except Exception:
            return []

    def _document_to_user_response(self, document: dict) -> UserResponse:
        """Convert MongoDB document to UserResponse"""
        return UserResponse(
            id=str(document["_id"]),
            fullName=document["fullName"],
            email=document["email"],
            phone=document["phone"],
            role=document.get("role", "user"),
            isEmailVerified=document.get("isEmailVerified", False),
            isPhoneVerified=document.get("isPhoneVerified", False),
            createdAt=document["createdAt"],
            updatedAt=document.get("updatedAt")
        )


# Singleton instance
user_repository = UserRepository()

