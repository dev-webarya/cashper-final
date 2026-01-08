from app.database.db import get_database
from app.database.schema.contact_schema import (
    ContactSubmissionInDB, 
    ContactSubmissionResponse,
    ContactStatus,
    ContactStatisticsResponse
)
from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class ContactRepository:
    def __init__(self):
        self.contact_collection_name = "contact_submissions"
        self._indexes_created = False
    
    def get_contact_collection(self):
        """Get contact submissions collection"""
        db = get_database()
        collection = db[self.contact_collection_name]
        self._ensure_indexes()
        return collection
    
    def _ensure_indexes(self):
        """Create indexes if not already created"""
        if self._indexes_created:
            return
        
        try:
            db = get_database()
            contact_collection = db[self.contact_collection_name]
            
            # Create indexes for contact submissions
            contact_collection.create_index("email")
            contact_collection.create_index("status")
            contact_collection.create_index("createdAt")
            contact_collection.create_index("isRead")
            
            self._indexes_created = True
        except Exception as e:
            logger.warning(f"Could not create indexes: {e}")

    # ===================== CONTACT SUBMISSIONS =====================

    def create_submission(self, submission: ContactSubmissionInDB) -> ContactSubmissionResponse:
        """Create a new contact submission"""
        collection = self.get_contact_collection()
        submission_dict = submission.dict()
        submission_dict["status"] = submission_dict["status"].value
        
        result = collection.insert_one(submission_dict)
        submission_dict["_id"] = result.inserted_id
        
        return ContactSubmissionResponse(
            id=str(result.inserted_id),
            **submission_dict
        )

    def get_submission_by_id(self, submission_id: str) -> Optional[dict]:
        """Get a contact submission by ID"""
        try:
            collection = self.get_contact_collection()
            submission = collection.find_one({"_id": ObjectId(submission_id)})
            return submission
        except Exception as e:
            logger.error(f"Error fetching submission: {e}")
            return None

    def get_all_submissions(
        self, 
        skip: int = 0, 
        limit: int = 50,
        status: Optional[ContactStatus] = None,
        is_read: Optional[bool] = None
    ) -> List[dict]:
        """Get all contact submissions with pagination and filters"""
        collection = self.get_contact_collection()
        query = {}
        
        if status:
            query["status"] = status.value
        
        if is_read is not None:
            query["isRead"] = is_read
        
        submissions = list(
            collection
            .find(query)
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        
        return submissions

    def count_submissions(
        self,
        status: Optional[ContactStatus] = None,
        is_read: Optional[bool] = None
    ) -> int:
        """Count total submissions with filters"""
        collection = self.get_contact_collection()
        query = {}
        
        if status:
            query["status"] = status.value
        
        if is_read is not None:
            query["isRead"] = is_read
        
        return collection.count_documents(query)

    def update_submission_status(
        self, 
        submission_id: str, 
        status: ContactStatus,
        admin_notes: Optional[str] = None
    ) -> bool:
        """Update the status of a contact submission"""
        try:
            collection = self.get_contact_collection()
            update_data = {
                "status": status.value,
                "updatedAt": datetime.utcnow()
            }
            
            if admin_notes is not None:
                update_data["adminNotes"] = admin_notes
            
            if status == ContactStatus.RESOLVED or status == ContactStatus.CLOSED:
                update_data["resolvedAt"] = datetime.utcnow()
            
            result = collection.update_one(
                {"_id": ObjectId(submission_id)},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating submission status: {e}")
            return False

    def mark_as_read(self, submission_id: str) -> bool:
        """Mark a submission as read"""
        try:
            collection = self.get_contact_collection()
            result = collection.update_one(
                {"_id": ObjectId(submission_id)},
                {
                    "$set": {
                        "isRead": True,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error marking submission as read: {e}")
            return False

    def delete_submission(self, submission_id: str) -> bool:
        """Delete a contact submission"""
        try:
            collection = self.get_contact_collection()
            result = collection.delete_one({"_id": ObjectId(submission_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting submission: {e}")
            return False

    def get_statistics(self) -> ContactStatisticsResponse:
        """Get contact submission statistics"""
        collection = self.get_contact_collection()
        now = datetime.utcnow()
        today_start = datetime(now.year, now.month, now.day)
        week_start = now - timedelta(days=7)
        month_start = datetime(now.year, now.month, 1)
        
        total = collection.count_documents({})
        pending = collection.count_documents({"status": ContactStatus.PENDING.value})
        in_progress = collection.count_documents({"status": ContactStatus.IN_PROGRESS.value})
        resolved = collection.count_documents({"status": ContactStatus.RESOLVED.value})
        closed = collection.count_documents({"status": ContactStatus.CLOSED.value})
        unread = collection.count_documents({"isRead": False})
        today = collection.count_documents({"createdAt": {"$gte": today_start}})
        this_week = collection.count_documents({"createdAt": {"$gte": week_start}})
        this_month = collection.count_documents({"createdAt": {"$gte": month_start}})
        
        return ContactStatisticsResponse(
            total=total,
            pending=pending,
            in_progress=in_progress,
            resolved=resolved,
            closed=closed,
            unread=unread,
            today=today,
            thisWeek=this_week,
            thisMonth=this_month
        )

    # ===================== FAQ MANAGEMENT =====================

# Create singleton instance
contact_repository = ContactRepository()

