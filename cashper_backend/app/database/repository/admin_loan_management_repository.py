from bson import ObjectId
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database.db import get_database
from app.database.schema.admin_loan_management_schema import (
    AdminLoanApplicationInDB,
    AdminLoanApplication,
    LoanStatistics,
    LoanStatus
)


class AdminLoanManagementRepository:
    """Repository for admin loan management operations"""

    def __init__(self):
        self.db = None

    def get_database(self):
        """Get database instance with lazy initialization"""
        if self.db is None:
            self.db = get_database()
        return self.db

    def get_collection(self):
        """Get admin loan applications collection"""
        db = self.get_database()
        return db["admin_loan_applications"]

    # ===================== HELPER METHODS =====================

    def _format_currency(self, amount: int) -> str:
        """Format amount to Indian currency format"""
        if amount >= 10000000:  # 1 Crore or more
            return f"₹{amount / 10000000:.1f}Cr"
        elif amount >= 100000:  # 1 Lakh or more
            return f"₹{amount / 100000:.1f}L"
        else:
            return f"₹{amount:,}"

    def _format_date(self, date: datetime) -> str:
        """Format date to YYYY-MM-DD string"""
        # Handle both string and datetime objects
        if isinstance(date, str):
            # If it's already a string, try to parse it and return just the date part
            if 'T' in date:  # ISO format
                return date.split('T')[0]
            return date
        return date.strftime("%Y-%m-%d")

    def _loan_to_response(self, loan: Dict[str, Any], collection_name: str = "") -> AdminLoanApplication:
        """Convert database loan to response model - handles both admin and individual collections"""
        # Handle customer name from different field names
        customer = loan.get("customer") or loan.get("fullName") or "Unknown"
        
        # Handle loan type - intelligently detect based on collection or field
        loan_type = loan.get("type", "")
        
        # If type is not set, infer from collection name or other context
        if not loan_type:
            if "short_term" in collection_name:
                loan_type = "Short-term Loan"
            elif "personal" in collection_name:
                loan_type = "Personal Loan"
            elif "business" in collection_name:
                loan_type = "Business Loan"
            elif "home" in collection_name:
                loan_type = "Home Loan"
            else:
                # Last resort: check purpose field
                purpose = str(loan.get("purpose", "")).lower()
                if "wedding" in purpose or "medical" in purpose or "education" in purpose:
                    loan_type = "Short-term Loan"
                else:
                    loan_type = "Loan"
        
        # Format currency - handle different formats
        amount = loan.get("amount") or loan.get("loanAmount") or 0
        if isinstance(amount, str):
            try:
                amount = int(float(amount.replace("₹", "").replace(",", "")))
            except:
                amount = 0
        
        # Format income - handle both string and numeric values
        income = loan.get("income") or loan.get("monthlyIncome") or ""
        if isinstance(income, (int, float)):
            income = f"₹{income:,}/month"
        elif isinstance(income, str) and income:
            # Clean up income string if it's numeric
            try:
                income_num = float(income.replace("₹", "").replace(",", "").replace("/month", "").strip())
                income = f"₹{int(income_num):,}/month"
            except:
                income = str(income)
        
        # Handle dates - createdAt or appliedDate
        date_field = loan.get("appliedDate") or loan.get("createdAt") or datetime.now()
        
        # Handle documents - ensure it's always a list
        documents = []
        
        # First check if documents field exists and is a list
        docs_field = loan.get("documents")
        if isinstance(docs_field, list):
            documents = docs_field
        elif isinstance(docs_field, str) and docs_field:
            documents = [docs_field]
        
        # If no documents in documents field, collect from individual fields
        if not documents:
            doc_fields = {
                "aadhar": loan.get("aadhar"),
                "pan": loan.get("pan"),
                "bankStatement": loan.get("bankStatement"),
                "salarySlip": loan.get("salarySlip"),
                "photo": loan.get("photo")
            }
            
            for field_name, field_value in doc_fields.items():
                if field_value and isinstance(field_value, str):
                    # Add full path if it doesn't already have it
                    if field_value.startswith('/uploads'):
                        documents.append(field_value)
                    else:
                        documents.append(f"/uploads/documents/{field_value}")
        
        return AdminLoanApplication(
            id=str(loan.get("_id", "")),
            customer=customer,
            email=loan.get("email", ""),
            phone=loan.get("phone", ""),
            type=loan_type,
            amount=self._format_currency(int(amount)) if amount else "N/A",
            status=loan.get("status", "Pending").capitalize(),
            appliedDate=self._format_date(date_field),
            tenure=str(loan.get("tenure", "N/A")),
            interestRate=str(loan.get("interestRate", "N/A")),
            purpose=loan.get("purpose", ""),
            income=str(income) if income else "",
            cibilScore=loan.get("cibilScore") or loan.get("creditScore") or 0,
            documents=documents,
            rejectionReason=loan.get("rejectionReason")
        )

    # ===================== STATISTICS =====================

    def get_statistics(self) -> LoanStatistics:
        """Get loan application statistics from all loan collections"""
        try:
            db = self.get_database()
            
            # Collections to count from with their type mapping
            collections_to_query = [
                ('admin_loan_applications', None),  # Can have any type
                ('short_term_loan_applications', 'short-term'),
                ('personal_loan_applications', 'personal'),
                ('business_loan_applications', 'business'),
                ('home_loan_applications', 'home')
            ]
            
            # Initialize counters
            total_apps = 0
            pending = 0
            under_review = 0
            approved = 0
            rejected = 0
            disbursed = 0
            home_loan_count = 0
            personal_loan_count = 0
            business_loan_count = 0
            short_term_loan_count = 0
            total_amount = 0
            total_cibil = 0
            cibil_count = 0
            
            # Count from all collections
            for col_name, col_type in collections_to_query:
                try:
                    collection = db[col_name]
                    
                    # Count total
                    total_apps += collection.count_documents({})
                    
                    # Count by status
                    pending += collection.count_documents({"status": {"$regex": "pending", "$options": "i"}})
                    under_review += collection.count_documents({"status": {"$regex": "under review|review", "$options": "i"}})
                    approved += collection.count_documents({"status": {"$regex": "approved", "$options": "i"}})
                    rejected += collection.count_documents({"status": {"$regex": "rejected", "$options": "i"}})
                    disbursed += collection.count_documents({"status": {"$regex": "disbursed", "$options": "i"}})
                    
                    # Count by loan type
                    # For dedicated loan collections, increment the appropriate counter
                    if col_type == 'short-term':
                        short_term_loan_count += collection.count_documents({})
                    elif col_type == 'personal':
                        personal_loan_count += collection.count_documents({})
                    elif col_type == 'business':
                        business_loan_count += collection.count_documents({})
                    elif col_type == 'home':
                        home_loan_count += collection.count_documents({})
                    else:
                        # For admin_loan_applications, count by type field
                        home_loan_count += collection.count_documents({"type": {"$regex": "home", "$options": "i"}})
                        personal_loan_count += collection.count_documents({"type": {"$regex": "personal", "$options": "i"}})
                        business_loan_count += collection.count_documents({"type": {"$regex": "business", "$options": "i"}})
                        short_term_loan_count += collection.count_documents({"type": {"$regex": "short", "$options": "i"}})
                    
                    # Calculate amounts and averages
                    for doc in collection.find({}):
                        amount = doc.get("amount") or doc.get("loanAmount") or 0
                        if isinstance(amount, str):
                            try:
                                amount = int(float(amount.replace("₹", "").replace(",", "")))
                            except:
                                amount = 0
                        total_amount += int(amount) if amount else 0
                        
                        # Get CIBIL/credit score
                        cibil = doc.get("cibilScore") or doc.get("creditScore") or 0
                        if cibil and cibil > 0:
                            total_cibil += int(cibil)
                            cibil_count += 1
                
                except Exception as e:
                    print(f"Error counting from {col_name}: {str(e)}")
                    continue
            
            # Calculate average CIBIL
            avg_cibil = int(total_cibil / cibil_count) if cibil_count > 0 else 0
            
            # Calculate average amount
            avg_amount = int(total_amount / total_apps) if total_apps > 0 else 0
            
            return LoanStatistics(
                totalApplications=total_apps,
                pendingApplications=pending,
                underReviewApplications=under_review,
                approvedApplications=approved,
                rejectedApplications=rejected,
                disbursedApplications=disbursed,
                totalLoanAmount=self._format_currency(total_amount),
                averageLoanAmount=self._format_currency(avg_amount),
                averageCibilScore=avg_cibil,
                homeLoanCount=home_loan_count,
                personalLoanCount=personal_loan_count,
                businessLoanCount=business_loan_count,
                shortTermLoanCount=short_term_loan_count
            )
            
        except Exception as e:
            print(f"Error getting statistics: {str(e)}")
            raise

    # ===================== CRUD OPERATIONS =====================

    def create_application(self, application: AdminLoanApplicationInDB) -> str:
        """Create new loan application"""
        try:
            collection = self.get_collection()
            application_dict = application.dict()
            result = collection.insert_one(application_dict)
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"Error creating application: {str(e)}")
            raise

    def get_all_applications(
        self,
        status: Optional[str] = None,
        loan_type: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[AdminLoanApplication], int]:
        """Get all loan applications from both admin and individual collections"""
        try:
            db = self.get_database()
            all_loans = []
            
            # Collections to fetch from with their loan type names
            collections_to_query = [
                ('admin_loan_applications', None),  # Can have any type
                ('short_term_loan_applications', 'Short-term Loan'),
                ('personal_loan_applications', 'Personal Loan'),
                ('business_loan_applications', 'Business Loan'),
                ('home_loan_applications', 'Home Loan')
            ]
            
            # Build status filter (if provided)
            status_query = {}
            if status and status.lower() != "all":
                # Use regex pattern for case-insensitive status matching
                status_query["status"] = {"$regex": status, "$options": "i"}
            
            # Build search filter (if provided)
            search_query = {}
            if search:
                search_query["$or"] = [
                    {"customer": {"$regex": search, "$options": "i"}},
                    {"fullName": {"$regex": search, "$options": "i"}},
                    {"email": {"$regex": search, "$options": "i"}},
                    {"phone": {"$regex": search, "$options": "i"}},
                    {"purpose": {"$regex": search, "$options": "i"}}
                ]
            
            # Determine which collections to query based on loan_type filter
            collections_to_fetch = collections_to_query
            if loan_type and loan_type.lower() != "all":
                # Filter collections based on loan type
                filtered_collections = []
                for col_name, col_type in collections_to_query:
                    if col_type and (col_type.lower().startswith(loan_type.lower()) or loan_type.lower() in col_type.lower()):
                        filtered_collections.append((col_name, col_type))
                    elif not col_type:  # admin_loan_applications can have any type, so include it
                        filtered_collections.append((col_name, col_type))
                
                collections_to_fetch = filtered_collections if filtered_collections else collections_to_query
            
            # Fetch from relevant collections
            for col_name, col_type in collections_to_fetch:
                try:
                    collection = db[col_name]
                    
                    # Build combined query for this collection
                    combined_query = {}
                    combined_query.update(status_query)
                    combined_query.update(search_query)
                    
                    # For admin_loan_applications, also filter by type if specified
                    if col_name == 'admin_loan_applications' and loan_type and loan_type.lower() != "all":
                        combined_query["type"] = {"$regex": loan_type, "$options": "i"}
                    
                    # Try to find and sort by appliedDate, fall back to createdAt
                    try:
                        loans = list(collection.find(combined_query).sort("appliedDate", -1))
                    except:
                        # If appliedDate doesn't exist as index, use createdAt or _id
                        try:
                            loans = list(collection.find(combined_query).sort("createdAt", -1))
                        except:
                            loans = list(collection.find(combined_query).sort("_id", -1))
                    
                    # Add collection name and type to each loan for proper processing
                    for loan in loans:
                        loan["_collection_name"] = col_name
                        if col_type:
                            loan["_inferred_type"] = col_type
                    
                    all_loans.extend(loans)
                except Exception as e:
                    print(f"Error querying {col_name}: {str(e)}")
                    continue
            
            # Sort all loans by date
            all_loans.sort(key=lambda x: x.get("appliedDate") or x.get("createdAt") or datetime.now(), reverse=True)
            
            # Get total count
            total = len(all_loans)
            
            # Apply pagination
            paginated_loans = all_loans[skip:skip + limit]
            
            # Convert to response format with collection name
            loan_list = [self._loan_to_response(loan, loan.get("_collection_name", "")) for loan in paginated_loans]
            
            return loan_list, total
            
        except Exception as e:
            print(f"Error getting applications: {str(e)}")
            raise

    def get_application_by_id(self, application_id: str) -> Optional[Dict[str, Any]]:
        """Get loan application by ID"""
        try:
            collection = self.get_collection()
            loan = collection.find_one({"_id": ObjectId(application_id)})
            return loan
            
        except Exception as e:
            print(f"Error getting application by ID: {str(e)}")
            return None

    def update_application(self, application_id: str, update_data: Dict[str, Any]) -> bool:
        """Update loan application"""
        try:
            collection = self.get_collection()
            update_data["updatedAt"] = datetime.now()
            
            result = collection.update_one(
                {"_id": ObjectId(application_id)},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            print(f"Error updating application: {str(e)}")
            raise

    def update_status(self, application_id: str, status: str, rejection_reason: Optional[str] = None) -> bool:
        """Update loan application status"""
        try:
            collection = self.get_collection()
            
            update_data = {
                "status": status,
                "updatedAt": datetime.now()
            }
            
            if rejection_reason:
                update_data["rejectionReason"] = rejection_reason
            
            result = collection.update_one(
                {"_id": ObjectId(application_id)},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            print(f"Error updating status: {str(e)}")
            raise

    def delete_application(self, application_id: str) -> bool:
        """Delete loan application"""
        try:
            collection = self.get_collection()
            result = collection.delete_one({"_id": ObjectId(application_id)})
            return result.deleted_count > 0
            
        except Exception as e:
            print(f"Error deleting application: {str(e)}")
            raise

    def bulk_delete(self, application_ids: List[str]) -> int:
        """Delete multiple applications"""
        try:
            collection = self.get_collection()
            object_ids = [ObjectId(id) for id in application_ids]
            result = collection.delete_many({"_id": {"$in": object_ids}})
            return result.deleted_count
            
        except Exception as e:
            print(f"Error bulk deleting: {str(e)}")
            raise


# Create singleton instance
admin_loan_management_repository = AdminLoanManagementRepository()
