from typing import List, Optional
from app.database.db import get_database
from bson import ObjectId
from datetime import datetime
import random
import string


class ShortTermGetInTouchRepository:
    """Repository for Short Term Loan GET IN TOUCH form"""
    
    @classmethod
    def get_collection(cls):
        db = get_database()
        return db["short_term_loan_get_in_touch"]
    
    @classmethod
    def create(cls, data: dict) -> dict:
        """Create a new GET IN TOUCH request"""
        collection = cls.get_collection()
        doc = {
            **data,
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        result = collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc
    
    @classmethod
    def get_all(cls) -> List[dict]:
        """Get all GET IN TOUCH requests (Admin only)"""
        collection = cls.get_collection()
        requests = list(collection.find().sort("created_at", -1))
        for req in requests:
            req["_id"] = str(req["_id"])
        return requests
    
    @classmethod
    def get_by_user_id(cls, user_id: str) -> List[dict]:
        """Get GET IN TOUCH requests by user ID"""
        collection = cls.get_collection()
        requests = list(collection.find({"user_id": user_id}).sort("created_at", -1))
        for req in requests:
            req["_id"] = str(req["_id"])
        return requests
    
    @classmethod
    def update_status(cls, request_id: str, status: str) -> bool:
        """Update status of GET IN TOUCH request"""
        collection = cls.get_collection()
        result = collection.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0


class ShortTermLoanApplicationRepository:
    """Repository for Short Term Loan Applications"""
    
    @classmethod
    def get_collection(cls):
        db = get_database()
        return db["short_term_loan_applications"]
    
    @classmethod
    def generate_application_id(cls) -> str:
        """Generate unique application ID like: STL-20251110-ABCDEF"""
        date_str = datetime.utcnow().strftime("%Y%m%d")
        random_str = ''.join(random.choices(string.ascii_uppercase, k=6))
        return f"STL-{date_str}-{random_str}"
    
    @classmethod
    def create(cls, data: dict) -> dict:
        """Create a new Short Term Loan Application"""
        collection = cls.get_collection()
        doc = {
            **data,
            "application_id": cls.generate_application_id(),
            "status": "pending",
            "notes": None,
            "created_at": datetime.utcnow()
        }
        result = collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc
    
    @classmethod
    def get_all(cls) -> List[dict]:
        """Get all applications (Admin only)"""
        collection = cls.get_collection()
        applications = list(collection.find().sort("created_at", -1))
        for app in applications:
            app["_id"] = str(app["_id"])
        return applications
    
    @classmethod
    def get_by_application_id(cls, application_id: str) -> Optional[dict]:
        """Get application by application ID (for tracking)"""
        collection = cls.get_collection()
        app = collection.find_one({"application_id": application_id})
        if app:
            app["_id"] = str(app["_id"])
        return app
    
    @classmethod
    def get_by_user_id(cls, user_id: str) -> List[dict]:
        """Get applications by user ID"""
        collection = cls.get_collection()
        # Use userId (camelCase) to match database field
        applications = list(collection.find({"userId": user_id}).sort("created_at", -1))
        for app in applications:
            app["_id"] = str(app["_id"])
        return applications
    
    @classmethod
    def update(cls, application_id: str, data: dict) -> bool:
        """Update application (Admin only)"""
        collection = cls.get_collection()
        result = collection.update_one(
            {"application_id": application_id},
            {"$set": {**data, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    @classmethod
    def delete(cls, application_id: str) -> bool:
        """Delete application (Admin only)"""
        collection = cls.get_collection()
        result = collection.delete_one({"application_id": application_id})
        return result.deleted_count > 0


class EligibilityCriteriaRepository:
    """Repository for Eligibility Criteria"""
    
    @classmethod
    def get_collection(cls):
        db = get_database()
        return db["short_term_loan_eligibility_criteria"]
    
    @classmethod
    def create(cls, data: dict) -> dict:
        """Create new eligibility criteria"""
        collection = cls.get_collection()
        doc = {
            **data,
            "created_at": datetime.utcnow()
        }
        result = collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc
    
    @classmethod
    def get_all(cls) -> List[dict]:
        """Get all eligibility criteria (sorted by order)"""
        collection = cls.get_collection()
        criteria = list(collection.find().sort("order", 1))
        for criterion in criteria:
            criterion["_id"] = str(criterion["_id"])
        return criteria
    
    @classmethod
    def get_by_id(cls, criteria_id: str) -> Optional[dict]:
        """Get eligibility criteria by ID"""
        collection = cls.get_collection()
        criterion = collection.find_one({"_id": ObjectId(criteria_id)})
        if criterion:
            criterion["_id"] = str(criterion["_id"])
        return criterion
    
    @classmethod
    def update(cls, criteria_id: str, data: dict) -> bool:
        """Update eligibility criteria"""
        collection = cls.get_collection()
        result = collection.update_one(
            {"_id": ObjectId(criteria_id)},
            {"$set": {**data, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    @classmethod
    def delete(cls, criteria_id: str) -> bool:
        """Delete eligibility criteria"""
        collection = cls.get_collection()
        result = collection.delete_one({"_id": ObjectId(criteria_id)})
        return result.deleted_count > 0
