from app.database.db import get_database
from app.database.schema.motor_insurance_schema import (
    MotorInsuranceInquiryInDB,
    MotorInsuranceApplicationInDB,
    InquiryStatus,
    ApplicationStatus
)
from bson import ObjectId
from datetime import datetime
from typing import Optional, List

class MotorInsuranceRepository:
    def __init__(self):
        self.db = None

    def get_inquiry_collection(self):
        """Lazy initialization for inquiry collection"""
        if self.db is None:
            self.db = get_database()
        return self.db["motor_insurance_inquiries"]
    
    def get_application_collection(self):
        """Lazy initialization for application collection"""
        if self.db is None:
            self.db = get_database()
        return self.db["motor_insurance_applications"]

    # ==================== INQUIRY OPERATIONS ====================
    
    def create_inquiry(self, inquiry_data: MotorInsuranceInquiryInDB) -> str:
        """Create a new motor insurance inquiry"""
        collection = self.get_inquiry_collection()
        inquiry_dict = inquiry_data.dict()
        result = collection.insert_one(inquiry_dict)
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
        inquiries = list(collection.find().skip(skip).limit(limit).sort("createdAt", -1))
        for inquiry in inquiries:
            inquiry["_id"] = str(inquiry["_id"])
        return inquiries

    def update_inquiry_status(
        self, 
        inquiry_id: str, 
        status: InquiryStatus, 
        remarks: Optional[str] = None
    ) -> bool:
        """Update inquiry status"""
        collection = self.get_inquiry_collection()
        update_data = {
            "status": status,
            "updatedAt": datetime.now()
        }
        if remarks:
            update_data["remarks"] = remarks
            
        result = collection.update_one(
            {"_id": ObjectId(inquiry_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0

    def get_inquiries_by_status(self, status: InquiryStatus) -> List[dict]:
        """Get inquiries by status"""
        collection = self.get_inquiry_collection()
        inquiries = list(collection.find({"status": status}).sort("createdAt", -1))
        for inquiry in inquiries:
            inquiry["_id"] = str(inquiry["_id"])
        return inquiries

    # ==================== APPLICATION OPERATIONS ====================
    
    def create_application(self, application_data: MotorInsuranceApplicationInDB) -> str:
        """Create a new motor insurance application"""
        collection = self.get_application_collection()
        application_dict = application_data.dict()
        result = collection.insert_one(application_dict)
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

    def get_all_applications(self, skip: int = 0, limit: int = 100) -> List[dict]:
        """Get all applications with pagination"""
        collection = self.get_application_collection()
        applications = list(collection.find().skip(skip).limit(limit).sort("submittedAt", -1))
        for application in applications:
            application["_id"] = str(application["_id"])
        return applications

    def update_application_status(
        self, 
        application_id: str, 
        status: ApplicationStatus, 
        remarks: Optional[str] = None
    ) -> bool:
        """Update application status"""
        collection = self.get_application_collection()
        update_data = {
            "status": status,
            "updatedAt": datetime.now()
        }
        if remarks:
            update_data["remarks"] = remarks
            
        result = collection.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0

    def get_applications_by_status(self, status: ApplicationStatus) -> List[dict]:
        """Get applications by status"""
        collection = self.get_application_collection()
        applications = list(collection.find({"status": status}).sort("submittedAt", -1))
        for application in applications:
            application["_id"] = str(application["_id"])
        return applications

    def get_applications_by_email(self, email: str) -> List[dict]:
        """Get all applications for a specific email"""
        collection = self.get_application_collection()
        applications = list(collection.find({"email": email}).sort("submittedAt", -1))
        for application in applications:
            application["_id"] = str(application["_id"])
        return applications

    # ==================== STATISTICS ====================
    
    def get_statistics(self) -> dict:
        """Get overall statistics"""
        inquiry_collection = self.get_inquiry_collection()
        application_collection = self.get_application_collection()
        
        # Inquiry statistics
        total_inquiries = inquiry_collection.count_documents({})
        pending_inquiries = inquiry_collection.count_documents({"status": InquiryStatus.pending})
        contacted_inquiries = inquiry_collection.count_documents({"status": InquiryStatus.contacted})
        converted_inquiries = inquiry_collection.count_documents({"status": InquiryStatus.converted})
        
        # Application statistics
        total_applications = application_collection.count_documents({})
        submitted_applications = application_collection.count_documents({"status": ApplicationStatus.submitted})
        under_review_applications = application_collection.count_documents({"status": ApplicationStatus.under_review})
        approved_applications = application_collection.count_documents({"status": ApplicationStatus.approved})
        policy_issued = application_collection.count_documents({"status": ApplicationStatus.policy_issued})
        
        return {
            "inquiries": {
                "total": total_inquiries,
                "pending": pending_inquiries,
                "contacted": contacted_inquiries,
                "converted": converted_inquiries
            },
            "applications": {
                "total": total_applications,
                "submitted": submitted_applications,
                "underReview": under_review_applications,
                "approved": approved_applications,
                "policyIssued": policy_issued
            }
        }

# Create a singleton instance
motor_insurance_repository = MotorInsuranceRepository()
