from datetime import datetime
from typing import List, Optional, Dict
from bson import ObjectId
from app.database.db import get_database

class SIPRepository:
    def __init__(self):
        self.db = None
    
    def get_inquiry_collection(self):
        """Lazy initialization for inquiry collection"""
        if self.db is None:
            self.db = get_database()
        return self.db["sip_inquiries"]
    
    def get_calculator_collection(self):
        """Lazy initialization for calculator collection"""
        if self.db is None:
            self.db = get_database()
        return self.db["sip_calculations"]
    
    def get_application_collection(self):
        """Lazy initialization for application collection"""
        if self.db is None:
            self.db = get_database()
        return self.db["sip_applications"]
    
    # ===================== Inquiry Methods =====================
    
    def create_inquiry(self, inquiry_data: dict) -> str:
        """Create a new SIP inquiry"""
        collection = self.get_inquiry_collection()
        result = collection.insert_one(inquiry_data)
        return str(result.inserted_id)
    
    def get_inquiry_by_id(self, inquiry_id: str) -> Optional[dict]:
        """Get inquiry by ID"""
        collection = self.get_inquiry_collection()
        inquiry = collection.find_one({"_id": ObjectId(inquiry_id)})
        if inquiry:
            inquiry["_id"] = str(inquiry["_id"])
        return inquiry
    
    def get_all_inquiries(self, skip: int = 0, limit: int = 100) -> List[dict]:
        """Get all inquiries with pagination"""
        collection = self.get_inquiry_collection()
        inquiries = list(collection.find().sort("createdAt", -1).skip(skip).limit(limit))
        for inquiry in inquiries:
            inquiry["_id"] = str(inquiry["_id"])
        return inquiries
    
    def update_inquiry_status(self, inquiry_id: str, status: str, notes: Optional[str] = None) -> bool:
        """Update inquiry status"""
        collection = self.get_inquiry_collection()
        update_data = {
            "status": status,
            "contactedAt": datetime.utcnow()
        }
        if notes:
            update_data["notes"] = notes
        
        result = collection.update_one(
            {"_id": ObjectId(inquiry_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    def get_inquiries_by_status(self, status: str) -> List[dict]:
        """Get inquiries by status"""
        collection = self.get_inquiry_collection()
        inquiries = list(collection.find({"status": status}).sort("createdAt", -1))
        for inquiry in inquiries:
            inquiry["_id"] = str(inquiry["_id"])
        return inquiries
    
    # ===================== Calculator Methods =====================
    
    def save_calculation(self, calculation_data: dict) -> str:
        """Save a calculation result"""
        collection = self.get_calculator_collection()
        result = collection.insert_one(calculation_data)
        return str(result.inserted_id)
    
    def get_calculation_by_id(self, calculation_id: str) -> Optional[dict]:
        """Get calculation by ID"""
        collection = self.get_calculator_collection()
        calculation = collection.find_one({"_id": ObjectId(calculation_id)})
        if calculation:
            calculation["_id"] = str(calculation["_id"])
        return calculation
    
    def get_all_calculations(self, skip: int = 0, limit: int = 100) -> List[dict]:
        """Get all calculations with pagination"""
        collection = self.get_calculator_collection()
        calculations = list(collection.find().sort("calculatedAt", -1).skip(skip).limit(limit))
        for calc in calculations:
            calc["_id"] = str(calc["_id"])
        return calculations
    
    # ===================== Application Methods =====================
    
    def create_application(self, application_data: dict) -> str:
        """Create a new SIP application"""
        collection = self.get_application_collection()
        result = collection.insert_one(application_data)
        return str(result.inserted_id)
    
    def get_application_by_id(self, application_id: str) -> Optional[dict]:
        """Get application by ID"""
        collection = self.get_application_collection()
        application = collection.find_one({"_id": ObjectId(application_id)})
        if application:
            application["_id"] = str(application["_id"])
        return application
    
    def get_application_by_number(self, app_number: str) -> Optional[dict]:
        """Get application by application number"""
        collection = self.get_application_collection()
        application = collection.find_one({"applicationNumber": app_number})
        if application:
            application["_id"] = str(application["_id"])
        return application
    
    def check_pan_exists(self, pan_number: str) -> bool:
        """Check if PAN already exists in applications"""
        collection = self.get_application_collection()
        return collection.count_documents({"panNumber": pan_number}) > 0
    
    def get_all_applications(self, skip: int = 0, limit: int = 100) -> List[dict]:
        """Get all applications with pagination"""
        collection = self.get_application_collection()
        applications = list(collection.find().sort("submittedAt", -1).skip(skip).limit(limit))
        for app in applications:
            app["_id"] = str(app["_id"])
        return applications
    
    def update_application_status(
        self, 
        application_id: str, 
        status: str, 
        reviewed_by: Optional[str] = None,
        remarks: Optional[str] = None
    ) -> bool:
        """Update application status"""
        collection = self.get_application_collection()
        update_data = {
            "status": status,
            "reviewedAt": datetime.utcnow()
        }
        if reviewed_by:
            update_data["reviewedBy"] = reviewed_by
        if remarks:
            update_data["remarks"] = remarks
        
        result = collection.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0
    
    def get_applications_by_status(self, status: str) -> List[dict]:
        """Get applications by status"""
        collection = self.get_application_collection()
        applications = list(collection.find({"status": status}).sort("submittedAt", -1))
        for app in applications:
            app["_id"] = str(app["_id"])
        return applications
    
    def get_applications_by_email(self, email: str) -> List[dict]:
        """Get applications by email"""
        collection = self.get_application_collection()
        applications = list(collection.find({"email": email}).sort("submittedAt", -1))
        for app in applications:
            app["_id"] = str(app["_id"])
        return applications
    
    # ===================== Statistics Methods =====================
    
    def get_statistics(self) -> Dict:
        """Get overall statistics for SIP"""
        inquiry_collection = self.get_inquiry_collection()
        calculator_collection = self.get_calculator_collection()
        application_collection = self.get_application_collection()
        
        return {
            "inquiries": {
                "total": inquiry_collection.count_documents({}),
                "pending": inquiry_collection.count_documents({"status": "pending"}),
                "contacted": inquiry_collection.count_documents({"status": "contacted"}),
                "converted": inquiry_collection.count_documents({"status": "converted"})
            },
            "calculations": {
                "total": calculator_collection.count_documents({})
            },
            "applications": {
                "total": application_collection.count_documents({}),
                "submitted": application_collection.count_documents({"status": "submitted"}),
                "under_review": application_collection.count_documents({"status": "under_review"}),
                "approved": application_collection.count_documents({"status": "approved"}),
                "active": application_collection.count_documents({"status": "active"})
            }
        }
