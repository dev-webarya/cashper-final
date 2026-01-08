from datetime import datetime
from typing import Optional, List, Dict
from bson import ObjectId
from pymongo import ReturnDocument
from app.database.db import get_database
from app.database.schema.notification_schema import NotificationInDB, NotificationResponse


class NotificationRepository:
    """Repository for notification database operations"""
    
    def __init__(self):
        self.collection_name = "notifications"

    def get_collection(self):
        """Get notifications collection"""
        db = get_database()
        return db[self.collection_name]

    def create_notification(self, notification_data: NotificationInDB) -> dict:
        """Create a new notification in database"""
        collection = self.get_collection()
        
        # Convert Pydantic model to dict
        notification_dict = notification_data.dict()
        
        # Insert notification into database
        result = collection.insert_one(notification_dict)
        
        # Retrieve the created notification
        created_notification = collection.find_one({"_id": result.inserted_id})
        
        return created_notification

    def get_notification_by_id(self, notification_id: str) -> Optional[dict]:
        """Get notification by ID"""
        collection = self.get_collection()
        try:
            notification = collection.find_one({"_id": ObjectId(notification_id)})
            return notification
        except Exception:
            return None

    def get_all_notifications(self, skip: int = 0, limit: int = 50, filters: dict = None) -> List[dict]:
        """Get all notifications with pagination and filters"""
        collection = self.get_collection()
        
        query = filters if filters else {}
        
        notifications = list(
            collection.find(query)
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        
        return notifications

    def get_user_notifications(self, user_id: str, skip: int = 0, limit: int = 50, 
                               include_read: bool = True) -> List[dict]:
        """Get notifications for a specific user"""
        collection = self.get_collection()
        
        # Query for notifications targeted to this user or all users
        query = {
            "$or": [
                {"targetUsers": user_id},
                {"targetUsers": None},
                {"targetUsers": {"$exists": False}}
            ],
            "isActive": True
        }
        
        # Filter by read status if needed
        if not include_read:
            query["readBy"] = {"$ne": user_id}
        
        # Check expiration
        current_time = datetime.utcnow()
        query["$or"].append({"expiresAt": None})
        query["$or"].append({"expiresAt": {"$gt": current_time}})
        
        # Reconstruct query properly
        query = {
            "$and": [
                {
                    "$or": [
                        {"targetUsers": user_id},
                        {"targetUsers": None},
                        {"targetUsers": {"$exists": False}}
                    ]
                },
                {"isActive": True},
                {
                    "$or": [
                        {"expiresAt": None},
                        {"expiresAt": {"$gt": current_time}}
                    ]
                }
            ]
        }
        
        if not include_read:
            query["$and"].append({"readBy": {"$ne": user_id}})
        
        notifications = list(
            collection.find(query)
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        
        return notifications

    def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark notification as read by user"""
        collection = self.get_collection()
        
        try:
            result = collection.update_one(
                {"_id": ObjectId(notification_id)},
                {
                    "$addToSet": {"readBy": user_id},
                    "$set": {"updatedAt": datetime.utcnow()}
                }
            )
            return result.modified_count > 0
        except Exception:
            return False

    def mark_multiple_as_read(self, notification_ids: List[str], user_id: str) -> int:
        """Mark multiple notifications as read by user"""
        collection = self.get_collection()
        
        try:
            object_ids = [ObjectId(nid) for nid in notification_ids]
            result = collection.update_many(
                {"_id": {"$in": object_ids}},
                {
                    "$addToSet": {"readBy": user_id},
                    "$set": {"updatedAt": datetime.utcnow()}
                }
            )
            return result.modified_count
        except Exception:
            return 0

    def mark_all_as_read(self, user_id: str) -> int:
        """Mark all user's notifications as read"""
        collection = self.get_collection()
        
        try:
            query = {
                "$or": [
                    {"targetUsers": user_id},
                    {"targetUsers": None},
                    {"targetUsers": {"$exists": False}}
                ],
                "readBy": {"$ne": user_id},
                "isActive": True
            }
            
            result = collection.update_many(
                query,
                {
                    "$addToSet": {"readBy": user_id},
                    "$set": {"updatedAt": datetime.utcnow()}
                }
            )
            return result.modified_count
        except Exception:
            return 0

    def update_notification(self, notification_id: str, update_data: dict) -> Optional[dict]:
        """Update notification data (admin only)"""
        collection = self.get_collection()
        
        # Add updated timestamp
        update_data["updatedAt"] = datetime.utcnow()
        
        try:
            result = collection.find_one_and_update(
                {"_id": ObjectId(notification_id)},
                {"$set": update_data},
                return_document=ReturnDocument.AFTER
            )
            return result
        except Exception:
            return None

    def delete_notification(self, notification_id: str) -> bool:
        """Delete notification (hard delete - admin only)"""
        collection = self.get_collection()
        
        try:
            result = collection.delete_one({"_id": ObjectId(notification_id)})
            return result.deleted_count > 0
        except Exception:
            return False

    def soft_delete_notification(self, notification_id: str) -> bool:
        """Soft delete notification by marking as inactive (admin only)"""
        collection = self.get_collection()
        
        try:
            result = collection.update_one(
                {"_id": ObjectId(notification_id)},
                {
                    "$set": {
                        "isActive": False,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception:
            return False

    def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications for user"""
        collection = self.get_collection()
        
        current_time = datetime.utcnow()
        
        query = {
            "$and": [
                {
                    "$or": [
                        {"targetUsers": user_id},
                        {"targetUsers": None},
                        {"targetUsers": {"$exists": False}}
                    ]
                },
                {"readBy": {"$ne": user_id}},
                {"isActive": True},
                {
                    "$or": [
                        {"expiresAt": None},
                        {"expiresAt": {"$gt": current_time}}
                    ]
                }
            ]
        }
        
        count = collection.count_documents(query)
        return count

    def get_notification_stats(self, user_id: str) -> Dict:
        """Get notification statistics for user"""
        collection = self.get_collection()
        
        current_time = datetime.utcnow()
        
        # Base query for user's notifications
        base_query = {
            "$and": [
                {
                    "$or": [
                        {"targetUsers": user_id},
                        {"targetUsers": None},
                        {"targetUsers": {"$exists": False}}
                    ]
                },
                {"isActive": True},
                {
                    "$or": [
                        {"expiresAt": None},
                        {"expiresAt": {"$gt": current_time}}
                    ]
                }
            ]
        }
        
        # Get all user's notifications
        all_notifications = list(collection.find(base_query))
        
        total_count = len(all_notifications)
        unread_count = len([n for n in all_notifications if user_id not in n.get("readBy", [])])
        read_count = total_count - unread_count
        
        # Count by type
        by_type = {}
        for notification in all_notifications:
            ntype = notification.get("type", "info")
            by_type[ntype] = by_type.get(ntype, 0) + 1
        
        # Count by priority
        by_priority = {}
        for notification in all_notifications:
            priority = notification.get("priority", "normal")
            by_priority[priority] = by_priority.get(priority, 0) + 1
        
        return {
            "totalNotifications": total_count,
            "unreadCount": unread_count,
            "readCount": read_count,
            "byType": by_type,
            "byPriority": by_priority
        }

    def get_admin_stats(self) -> Dict:
        """Get overall notification statistics for admin"""
        collection = self.get_collection()
        
        total = collection.count_documents({})
        active = collection.count_documents({"isActive": True})
        inactive = collection.count_documents({"isActive": False})
        
        # Get notifications by type
        pipeline = [
            {"$match": {"isActive": True}},
            {"$group": {
                "_id": "$type",
                "count": {"$sum": 1}
            }}
        ]
        
        by_type = {}
        for result in collection.aggregate(pipeline):
            by_type[result["_id"]] = result["count"]
        
        return {
            "total": total,
            "active": active,
            "inactive": inactive,
            "byType": by_type
        }

    def _document_to_dict(self, document: dict) -> dict:
        """Convert MongoDB document to dict with string ID"""
        if document:
            document["id"] = str(document.pop("_id"))
        return document


# Create singleton instance
notification_repository = NotificationRepository()
