from app.database.db import get_database
from app.database.schema.personal_tax_schema import (
    TaxConsultationBookingInDB,
    TaxConsultationBookingResponse,
    TaxCalculatorInDB,
    TaxCalculatorResponse,
    PersonalTaxPlanningApplicationInDB,
    PersonalTaxPlanningApplicationResponse,
    ConsultationStatus
)
from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class PersonalTaxRepository:
    def __init__(self):
        self.consultation_collection_name = "tax_consultations"
        self.calculator_collection_name = "tax_calculations"
        self.application_collection_name = "tax_planning_applications"
        self._indexes_created = False
    
    def get_consultation_collection(self):
        """Get tax consultation bookings collection"""
        db = get_database()
        collection = db[self.consultation_collection_name]
        self._ensure_indexes()
        return collection
    
    def get_calculator_collection(self):
        """Get tax calculator submissions collection"""
        db = get_database()
        collection = db[self.calculator_collection_name]
        self._ensure_indexes()
        return collection
    
    def get_application_collection(self):
        """Get tax planning applications collection"""
        db = get_database()
        collection = db[self.application_collection_name]
        self._ensure_indexes()
        return collection
    
    def _ensure_indexes(self):
        """Create indexes if not already created"""
        if self._indexes_created:
            return
        
        try:
            db = get_database()
            consultation_collection = db[self.consultation_collection_name]
            calculator_collection = db[self.calculator_collection_name]
            application_collection = db[self.application_collection_name]
            
            # Indexes for consultations
            consultation_collection.create_index("email")
            consultation_collection.create_index("phone")
            consultation_collection.create_index("status")
            consultation_collection.create_index("createdAt")
            
            # Indexes for calculator
            calculator_collection.create_index("email")
            calculator_collection.create_index("createdAt")
            
            # Indexes for applications
            application_collection.create_index("emailAddress")
            application_collection.create_index("panNumber")
            application_collection.create_index("status")
            application_collection.create_index("createdAt")
            application_collection.create_index("assignedTo")
            
            self._indexes_created = True
        except Exception as e:
            logger.warning(f"Could not create indexes: {e}")

    # ===================== TAX CONSULTATION BOOKINGS =====================

    def create_consultation_booking(self, booking: TaxConsultationBookingInDB) -> TaxConsultationBookingResponse:
        """Create a new tax consultation booking"""
        collection = self.get_consultation_collection()
        booking_dict = booking.dict()
        booking_dict["status"] = booking_dict["status"].value
        
        result = collection.insert_one(booking_dict)
        booking_dict["_id"] = result.inserted_id
        
        return TaxConsultationBookingResponse(
            id=str(result.inserted_id),
            name=booking_dict["name"],
            email=booking_dict["email"],
            phone=booking_dict["phone"],
            income=booking_dict["income"],
            taxRegime=booking_dict["taxRegime"],
            status=ConsultationStatus(booking_dict["status"]),
            createdAt=booking_dict["createdAt"],
            scheduledDate=booking_dict.get("scheduledDate"),
            adminNotes=booking_dict.get("adminNotes")
        )

    def get_consultation_by_id(self, consultation_id: str) -> Optional[dict]:
        """Get a consultation booking by ID"""
        try:
            collection = self.get_consultation_collection()
            consultation = collection.find_one({"_id": ObjectId(consultation_id)})
            return consultation
        except Exception as e:
            logger.error(f"Error fetching consultation: {e}")
            return None

    def get_all_consultations(
        self, 
        skip: int = 0, 
        limit: int = 50,
        status: Optional[str] = None
    ) -> List[dict]:
        """Get all consultation bookings with pagination"""
        collection = self.get_consultation_collection()
        query = {}
        
        if status:
            query["status"] = status
        
        consultations = list(
            collection.find(query)
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        
        return consultations

    def count_consultations(self, status: Optional[str] = None) -> int:
        """Count consultation bookings"""
        collection = self.get_consultation_collection()
        query = {}
        
        if status:
            query["status"] = status
        
        return collection.count_documents(query)

    def update_consultation_status(
        self, 
        consultation_id: str, 
        status: ConsultationStatus,
        scheduled_date: Optional[datetime] = None,
        admin_notes: Optional[str] = None
    ) -> bool:
        """Update consultation booking status"""
        try:
            collection = self.get_consultation_collection()
            update_data = {
                "status": status.value,
                "updatedAt": datetime.utcnow()
            }
            
            if scheduled_date:
                update_data["scheduledDate"] = scheduled_date
            if admin_notes:
                update_data["adminNotes"] = admin_notes
            
            result = collection.update_one(
                {"_id": ObjectId(consultation_id)},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating consultation status: {e}")
            return False

    def delete_consultation(self, consultation_id: str) -> bool:
        """Delete a consultation booking"""
        try:
            collection = self.get_consultation_collection()
            result = collection.delete_one({"_id": ObjectId(consultation_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting consultation: {e}")
            return False

    # ===================== TAX CALCULATOR =====================

    def save_tax_calculation(self, calculation: TaxCalculatorInDB) -> TaxCalculatorResponse:
        """Save tax calculation data"""
        collection = self.get_calculator_collection()
        calculation_dict = calculation.dict()
        
        result = collection.insert_one(calculation_dict)
        calculation_dict["_id"] = result.inserted_id
        
        return TaxCalculatorResponse(
            id=str(result.inserted_id),
            **calculation_dict
        )

    def get_calculation_by_id(self, calculation_id: str) -> Optional[dict]:
        """Get a tax calculation by ID"""
        try:
            collection = self.get_calculator_collection()
            calculation = collection.find_one({"_id": ObjectId(calculation_id)})
            return calculation
        except Exception as e:
            logger.error(f"Error fetching calculation: {e}")
            return None

    def get_all_calculations(
        self, 
        skip: int = 0, 
        limit: int = 50
    ) -> List[dict]:
        """Get all tax calculations with pagination"""
        collection = self.get_calculator_collection()
        
        calculations = list(
            collection.find()
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        
        return calculations

    def count_calculations(self) -> int:
        """Count tax calculations"""
        collection = self.get_calculator_collection()
        return collection.count_documents({})

    # ===================== TAX PLANNING APPLICATIONS =====================

    def create_tax_planning_application(
        self, 
        application: PersonalTaxPlanningApplicationInDB
    ) -> PersonalTaxPlanningApplicationResponse:
        """Create a new tax planning application"""
        collection = self.get_application_collection()
        application_dict = application.dict()
        application_dict["status"] = application_dict["status"].value
        
        result = collection.insert_one(application_dict)
        application_dict["_id"] = result.inserted_id
        
        return PersonalTaxPlanningApplicationResponse(
            id=str(result.inserted_id),
            fullName=application_dict["fullName"],
            emailAddress=application_dict["emailAddress"],
            phoneNumber=application_dict["phoneNumber"],
            panNumber=application_dict["panNumber"],
            annualIncome=application_dict["annualIncome"],
            employmentType=application_dict["employmentType"],
            preferredTaxRegime=application_dict.get("preferredTaxRegime"),
            additionalInfo=application_dict.get("additionalInfo"),
            userId=application_dict.get("userId"),
            status=ConsultationStatus(application_dict["status"]),
            createdAt=application_dict["createdAt"],
            assignedTo=application_dict.get("assignedTo"),
            adminNotes=application_dict.get("adminNotes")
        )

    def get_application_by_id(self, application_id: str) -> Optional[dict]:
        """Get a tax planning application by ID"""
        try:
            collection = self.get_application_collection()
            application = collection.find_one({"_id": ObjectId(application_id)})
            return application
        except Exception as e:
            logger.error(f"Error fetching application: {e}")
            return None

    def get_application_by_pan(self, pan_number: str) -> Optional[dict]:
        """Get a tax planning application by PAN number"""
        try:
            collection = self.get_application_collection()
            application = collection.find_one({"panNumber": pan_number})
            return application
        except Exception as e:
            logger.error(f"Error fetching application by PAN: {e}")
            return None

    def get_all_applications(
        self, 
        skip: int = 0, 
        limit: int = 50,
        status: Optional[str] = None,
        assigned_to: Optional[str] = None
    ) -> List[dict]:
        """Get all tax planning applications with pagination"""
        collection = self.get_application_collection()
        query = {}
        
        if status:
            query["status"] = status
        if assigned_to:
            query["assignedTo"] = assigned_to
        
        applications = list(
            collection.find(query)
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        
        return applications

    def count_applications(
        self, 
        status: Optional[str] = None,
        assigned_to: Optional[str] = None
    ) -> int:
        """Count tax planning applications"""
        collection = self.get_application_collection()
        query = {}
        
        if status:
            query["status"] = status
        if assigned_to:
            query["assignedTo"] = assigned_to
        
        return collection.count_documents(query)

    def get_applications_by_email(self, email: str) -> List[dict]:
        """Get all tax planning applications for a specific user by email"""
        collection = self.get_application_collection()
        applications = list(
            collection.find({"emailAddress": email.lower()})
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
            collection = self.get_application_collection()
            update_data = {
                "status": status.value,
                "updatedAt": datetime.utcnow()
            }
            
            if admin_notes:
                update_data["adminNotes"] = admin_notes
            
            result = collection.update_one(
                {"_id": ObjectId(application_id)},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating application status: {e}")
            return False

    def assign_consultant(
        self, 
        application_id: str, 
        assigned_to: str,
        admin_notes: Optional[str] = None
    ) -> bool:
        """Assign consultant to application"""
        try:
            collection = self.get_application_collection()
            update_data = {
                "assignedTo": assigned_to,
                "updatedAt": datetime.utcnow()
            }
            
            if admin_notes:
                update_data["adminNotes"] = admin_notes
            
            result = collection.update_one(
                {"_id": ObjectId(application_id)},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error assigning consultant: {e}")
            return False

    def delete_application(self, application_id: str) -> bool:
        """Delete a tax planning application"""
        try:
            collection = self.get_application_collection()
            result = collection.delete_one({"_id": ObjectId(application_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting application: {e}")
            return False

    # ===================== STATISTICS =====================

    def get_statistics(self) -> dict:
        """Get statistics for all personal tax services"""
        consultation_collection = self.get_consultation_collection()
        application_collection = self.get_application_collection()
        calculator_collection = self.get_calculator_collection()
        
        now = datetime.utcnow()
        today_start = datetime(now.year, now.month, now.day)
        week_start = today_start - timedelta(days=7)
        month_start = datetime(now.year, now.month, 1)
        
        stats = {
            "consultations": {
                "total": consultation_collection.count_documents({}),
                "pending": consultation_collection.count_documents({"status": "pending"}),
                "scheduled": consultation_collection.count_documents({"status": "scheduled"}),
                "completed": consultation_collection.count_documents({"status": "completed"}),
                "today": consultation_collection.count_documents({"createdAt": {"$gte": today_start}}),
                "thisWeek": consultation_collection.count_documents({"createdAt": {"$gte": week_start}}),
                "thisMonth": consultation_collection.count_documents({"createdAt": {"$gte": month_start}})
            },
            "applications": {
                "total": application_collection.count_documents({}),
                "pending": application_collection.count_documents({"status": "pending"}),
                "scheduled": application_collection.count_documents({"status": "scheduled"}),
                "completed": application_collection.count_documents({"status": "completed"}),
                "today": application_collection.count_documents({"createdAt": {"$gte": today_start}}),
                "thisWeek": application_collection.count_documents({"createdAt": {"$gte": week_start}}),
                "thisMonth": application_collection.count_documents({"createdAt": {"$gte": month_start}})
            },
            "calculations": {
                "total": calculator_collection.count_documents({}),
                "today": calculator_collection.count_documents({"createdAt": {"$gte": today_start}}),
                "thisWeek": calculator_collection.count_documents({"createdAt": {"$gte": week_start}}),
                "thisMonth": calculator_collection.count_documents({"createdAt": {"$gte": month_start}})
            }
        }
        
        return stats


# Create singleton instance
personal_tax_repository = PersonalTaxRepository()
