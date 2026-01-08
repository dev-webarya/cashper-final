from pymongo import MongoClient
from app.database.db import get_database
from bson import ObjectId
from datetime import datetime
import random
import string

def get_collections():
    """Get database collections"""
    db = get_database()
    return {
        'get_in_touch': db["home_loan_get_in_touch"],
        'applications': db["home_loan_applications"],
        'eligibility': db["home_loan_eligibility_criteria"]
    }

# Helper function to get collection
def _get_collection(name):
    return get_collections()[name]

# ============ GET IN TOUCH OPERATIONS ============

def create_get_in_touch(data: dict) -> dict:
    """Create a new Get In Touch inquiry"""
    collection = _get_collection('get_in_touch')
    if "status" not in data:
        data["status"] = "pending"
    if "created_at" not in data:
        data["created_at"] = datetime.now()
    result = collection.insert_one(data)
    created_doc = collection.find_one({"_id": result.inserted_id})
    return created_doc

def get_all_get_in_touch():
    """Get all Get In Touch inquiries"""
    collection = _get_collection('get_in_touch')
    return list(collection.find())

def get_get_in_touch_by_id(inquiry_id: str):
    """Get Get In Touch inquiry by ID"""
    collection = _get_collection('get_in_touch')
    return collection.find_one({"_id": ObjectId(inquiry_id)})

def update_get_in_touch_status(inquiry_id: str, status: str) -> bool:
    """Update Get In Touch inquiry status"""
    collection = _get_collection('get_in_touch')
    result = collection.update_one(
        {"_id": ObjectId(inquiry_id)},
        {"$set": {"status": status, "updated_at": datetime.now()}}
    )
    return result.modified_count > 0

# ============ APPLICATION OPERATIONS ============

def generate_application_id() -> str:
    """Generate unique application ID"""
    prefix = "HL"
    timestamp = datetime.now().strftime("%Y%m%d")
    random_suffix = ''.join(random.choices(string.digits, k=6))
    return f"{prefix}{timestamp}{random_suffix}"

def create_application(data: dict) -> dict:
    """Create a new Home Loan application"""
    collection = _get_collection('applications')
    # Generate application ID
    data["application_id"] = generate_application_id()
    data["status"] = "pending"
    
    result = collection.insert_one(data)
    created_doc = collection.find_one({"_id": result.inserted_id})
    return created_doc

def get_all_applications():
    """Get all Home Loan applications"""
    collection = _get_collection('applications')
    return list(collection.find())

def get_application_by_id(application_id: str):
    """Get application by MongoDB ID"""
    collection = _get_collection('applications')
    return collection.find_one({"_id": ObjectId(application_id)})

def get_application_by_application_id(application_id: str):
    """Get application by application_id"""
    collection = _get_collection('applications')
    return collection.find_one({"application_id": application_id})

def update_application_status(application_id: str, status: str):
    """Update application status"""
    collection = _get_collection('applications')
    return collection.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {"status": status, "updated_at": datetime.now()}}
    )

# ============ ELIGIBILITY CRITERIA OPERATIONS ============

def get_all_eligibility_criteria():
    """Get all eligibility criteria"""
    collection = _get_collection('eligibility')
    return list(collection.find().sort("order", 1))

def create_eligibility_criteria(data: dict) -> dict:
    """Create eligibility criteria"""
    collection = _get_collection('eligibility')
    result = collection.insert_one(data)
    created_doc = collection.find_one({"_id": result.inserted_id})
    return created_doc

def seed_eligibility_criteria():
    """Seed initial eligibility criteria if not exists"""
    collection = _get_collection('eligibility')
    if collection.count_documents({}) == 0:
        criteria = [
            {"label": "Age", "value": "21 to 65 years", "order": 1, "created_at": datetime.now()},
            {"label": "Employment", "value": "Salaried/Self-employed/Business", "order": 2, "created_at": datetime.now()},
            {"label": "Minimum Income", "value": "₹25,000 per month", "order": 3, "created_at": datetime.now()},
            {"label": "Credit Score", "value": "750 and above (preferred)", "order": 4, "created_at": datetime.now()},
            {"label": "Work Experience", "value": "Minimum 2 years", "order": 5, "created_at": datetime.now()},
            {"label": "Property", "value": "Approved & Clear Title", "order": 6, "created_at": datetime.now()},
        ]
        collection.insert_many(criteria)
        return True
    return False
