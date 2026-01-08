from pymongo.collection import Collection
from bson import ObjectId
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.database.db import get_database
from app.database.schema.business_tax_schema import (
    BusinessTaxConsultationInDB,
    BusinessTaxCalculatorInDB,
    BusinessTaxPlanningApplicationInDB,
    ConsultationStatus
)


class BusinessTaxRepository:
    def __init__(self):
        self.consultation_collection_name = "business_tax_consultations"
        self.calculator_collection_name = "business_tax_calculations"
        self.application_collection_name = "business_tax_applications"
        self._indexes_created = False
    
    def get_consultation_collection(self):
        """Get business tax consultation bookings collection"""
        db = get_database()
        collection = db[self.consultation_collection_name]
        self._ensure_indexes()
        return collection
    
    def get_calculator_collection(self):
        """Get business tax calculations collection"""
        db = get_database()
        collection = db[self.calculator_collection_name]
        self._ensure_indexes()
        return collection
    
    def get_application_collection(self):
        """Get business tax planning applications collection"""
        db = get_database()
        collection = db[self.application_collection_name]
        self._ensure_indexes()
        return collection

    def _ensure_indexes(self):
        """Create indexes for better query performance (only once)"""
        if self._indexes_created:
            return
        
        try:
            db = get_database()
            
            # Consultation indexes
            consultation_collection = db[self.consultation_collection_name]
            consultation_collection.create_index("email")
            consultation_collection.create_index("phone")
            consultation_collection.create_index("status")
            consultation_collection.create_index("createdAt")
            
            # Calculator indexes
            calculator_collection = db[self.calculator_collection_name]
            calculator_collection.create_index("email")
            calculator_collection.create_index("createdAt")
            
            # Application indexes
            application_collection = db[self.application_collection_name]
            application_collection.create_index("businessPAN", unique=True)
            application_collection.create_index("businessEmail")
            application_collection.create_index("status")
            application_collection.create_index("assignedTo")
            application_collection.create_index("createdAt")
            
            self._indexes_created = True
        except Exception as e:
            # Log error but don't fail if indexes already exist
            pass

    # ===================== CONSULTATION METHODS =====================

    def create_consultation_booking(self, booking: BusinessTaxConsultationInDB) -> Dict:
        """Create a new business tax consultation booking"""
        booking_dict = booking.dict()
        collection = self.get_consultation_collection()
        result = collection.insert_one(booking_dict)
        booking_dict["_id"] = result.inserted_id
        booking_dict["id"] = str(result.inserted_id)
        return booking_dict

    def get_all_consultations(self, skip: int = 0, limit: int = 50, status: Optional[str] = None) -> List[Dict]:
        """Get all consultation bookings with optional filters"""
        query = {}
        if status:
            query["status"] = status
        
        collection = self.get_consultation_collection()
        consultations = list(
            collection.find(query)
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        
        return consultations

    def get_consultation_by_id(self, consultation_id: str) -> Optional[Dict]:
        """Get a specific consultation booking by ID"""
        try:
            collection = self.get_consultation_collection()
            return collection.find_one({"_id": ObjectId(consultation_id)})
        except:
            return None

    def update_consultation_status(
        self, 
        consultation_id: str, 
        status: ConsultationStatus, 
        scheduled_date: Optional[datetime] = None,
        admin_notes: Optional[str] = None
    ) -> bool:
        """Update consultation booking status"""
        try:
            update_data = {"status": status.value}
            if scheduled_date:
                update_data["scheduledDate"] = scheduled_date
            if admin_notes is not None:
                update_data["adminNotes"] = admin_notes
            
            collection = self.get_consultation_collection()
            result = collection.update_one(
                {"_id": ObjectId(consultation_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False

    def delete_consultation(self, consultation_id: str) -> bool:
        """Delete a consultation booking"""
        try:
            collection = self.get_consultation_collection()
            result = collection.delete_one({"_id": ObjectId(consultation_id)})
            return result.deleted_count > 0
        except:
            return False

    # ===================== CALCULATOR METHODS =====================

    def save_tax_calculation(self, calculation: BusinessTaxCalculatorInDB) -> Dict:
        """Save a business tax calculation"""
        calc_dict = calculation.dict()
        collection = self.get_calculator_collection()
        result = collection.insert_one(calc_dict)
        calc_dict["_id"] = result.inserted_id
        calc_dict["id"] = str(result.inserted_id)
        return calc_dict

    def get_all_calculations(self, skip: int = 0, limit: int = 50) -> List[Dict]:
        """Get all tax calculations"""
        collection = self.get_calculator_collection()
        return list(
            collection.find()
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )

    def get_calculation_by_id(self, calculation_id: str) -> Optional[Dict]:
        """Get a specific calculation by ID"""
        try:
            collection = self.get_calculator_collection()
            return collection.find_one({"_id": ObjectId(calculation_id)})
        except:
            return None

    # ===================== APPLICATION METHODS =====================

    def create_tax_planning_application(self, application: BusinessTaxPlanningApplicationInDB) -> Dict:
        """Create a new business tax planning application"""
        app_dict = application.dict()
        collection = self.get_application_collection()
        result = collection.insert_one(app_dict)
        app_dict["_id"] = result.inserted_id
        app_dict["id"] = str(result.inserted_id)
        return app_dict

    def get_all_applications(
        self, 
        skip: int = 0, 
        limit: int = 50, 
        status: Optional[str] = None,
        assigned_to: Optional[str] = None
    ) -> List[Dict]:
        """Get all tax planning applications with optional filters"""
        query = {}
        if status:
            query["status"] = status
        if assigned_to:
            query["assignedTo"] = assigned_to
        
        collection = self.get_application_collection()
        return list(
            collection.find(query)
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )

    def get_application_by_id(self, application_id: str) -> Optional[Dict]:
        """Get a specific application by ID"""
        try:
            collection = self.get_application_collection()
            return collection.find_one({"_id": ObjectId(application_id)})
        except:
            return None

    def get_application_by_pan(self, pan: str) -> Optional[Dict]:
        """Get application by PAN number"""
        collection = self.get_application_collection()
        return collection.find_one({"businessPAN": pan.upper()})

    def get_applications_by_email(self, email: str) -> List[Dict]:
        """Get all business tax planning applications for a specific user by email"""
        collection = self.get_application_collection()
        applications = list(
            collection.find({"businessEmail": email.lower()})
            .sort("createdAt", -1)
        )
        return applications

    def update_application_status(
        self, 
        application_id: str, 
        status: ConsultationStatus,
        admin_notes: Optional[str] = None
    ) -> bool:
        """Update application status"""
        try:
            update_data = {"status": status.value}
            if admin_notes is not None:
                update_data["adminNotes"] = admin_notes
            
            collection = self.get_application_collection()
            result = collection.update_one(
                {"_id": ObjectId(application_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False

    def assign_consultant(
        self, 
        application_id: str, 
        assigned_to: str,
        admin_notes: Optional[str] = None
    ) -> bool:
        """Assign consultant to an application"""
        try:
            update_data = {"assignedTo": assigned_to}
            if admin_notes is not None:
                update_data["adminNotes"] = admin_notes
            
            collection = self.get_application_collection()
            result = collection.update_one(
                {"_id": ObjectId(application_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False

    def delete_application(self, application_id: str) -> bool:
        """Delete a tax planning application"""
        try:
            collection = self.get_application_collection()
            result = collection.delete_one({"_id": ObjectId(application_id)})
            return result.deleted_count > 0
        except:
            return False

    # ===================== STATISTICS METHODS =====================

    def get_statistics(self) -> Dict:
        """Get comprehensive statistics for business tax services"""
        now = datetime.utcnow()
        today_start = datetime(now.year, now.month, now.day)
        week_start = today_start - timedelta(days=7)
        month_start = datetime(now.year, now.month, 1)
        
        consultation_collection = self.get_consultation_collection()
        calculator_collection = self.get_calculator_collection()
        application_collection = self.get_application_collection()
        
        # Consultation statistics
        total_consultations = consultation_collection.count_documents({})
        consultations_today = consultation_collection.count_documents(
            {"createdAt": {"$gte": today_start}}
        )
        consultations_this_week = consultation_collection.count_documents(
            {"createdAt": {"$gte": week_start}}
        )
        consultations_this_month = consultation_collection.count_documents(
            {"createdAt": {"$gte": month_start}}
        )
        
        consultation_by_status = {}
        for status in ConsultationStatus:
            count = consultation_collection.count_documents({"status": status.value})
            consultation_by_status[status.value] = count
        
        # Application statistics
        total_applications = application_collection.count_documents({})
        applications_today = application_collection.count_documents(
            {"createdAt": {"$gte": today_start}}
        )
        applications_this_week = application_collection.count_documents(
            {"createdAt": {"$gte": week_start}}
        )
        applications_this_month = application_collection.count_documents(
            {"createdAt": {"$gte": month_start}}
        )
        
        application_by_status = {}
        for status in ConsultationStatus:
            count = application_collection.count_documents({"status": status.value})
            application_by_status[status.value] = count
        
        # Calculator statistics
        total_calculations = calculator_collection.count_documents({})
        calculations_today = calculator_collection.count_documents(
            {"createdAt": {"$gte": today_start}}
        )
        calculations_this_week = calculator_collection.count_documents(
            {"createdAt": {"$gte": week_start}}
        )
        calculations_this_month = calculator_collection.count_documents(
            {"createdAt": {"$gte": month_start}}
        )
        
        return {
            "consultations": {
                "total": total_consultations,
                "today": consultations_today,
                "this_week": consultations_this_week,
                "this_month": consultations_this_month,
                "by_status": consultation_by_status
            },
            "applications": {
                "total": total_applications,
                "today": applications_today,
                "this_week": applications_this_week,
                "this_month": applications_this_month,
                "by_status": application_by_status
            },
            "calculations": {
                "total": total_calculations,
                "today": calculations_today,
                "this_week": calculations_this_week,
                "this_month": calculations_this_month
            }
        }


# Create a singleton instance
business_tax_repository = BusinessTaxRepository()
