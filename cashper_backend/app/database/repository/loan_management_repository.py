from bson import ObjectId
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.database.db import get_database
from app.database.schema.loan_management_schema import (
    ActiveLoanInDB,
    ActiveLoanResponse,
    LoanApplicationInDB,
    LoanApplicationResponse,
    EMIPaymentInDB,
    EMIPaymentResponse,
    LoanSummaryResponse
)
import random
import string


class LoanManagementRepository:
    """Repository for loan management operations"""

    def __init__(self):
        self.db = None

    def get_database(self):
        """Get database instance"""
        if self.db is None:
            self.db = get_database()
        return self.db

    def get_loans_collection(self):
        """Get loans collection"""
        db = self.get_database()
        return db["active_loans"]

    def get_applications_collection(self):
        """Get loan applications collection"""
        db = self.get_database()
        return db["loan_applications"]

    def get_payments_collection(self):
        """Get EMI payments collection"""
        db = self.get_database()
        return db["emi_payments"]

    # ===================== HELPER METHODS =====================

    def _format_currency(self, amount: int) -> str:
        """Format amount to Indian currency format"""
        return f"₹{amount:,}"

    def _calculate_progress(self, months_completed: int, tenure_months: int) -> int:
        """Calculate loan repayment progress percentage"""
        if tenure_months == 0:
            return 0
        return int((months_completed / tenure_months) * 100)

    def _generate_application_id(self, loan_type: str) -> str:
        """Generate unique application ID"""
        prefix_map = {
            "Personal Loan": "PL",
            "Home Loan": "HL",
            "Business Loan": "BL",
            "Short-Term Loan": "ST",
            "Vehicle Loan": "VL"
        }
        prefix = prefix_map.get(loan_type, "LN")
        random_suffix = ''.join(random.choices(string.digits, k=6))
        return f"{prefix}{datetime.now().year}{random_suffix}"

    def _generate_transaction_id(self) -> str:
        """Generate unique transaction ID"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"TXN{timestamp}{random_suffix}"

    def _format_date(self, date: datetime) -> str:
        """Format date to readable string"""
        return date.strftime("%b %d, %Y")

    # ===================== LOAN SUMMARY =====================

    def get_loan_summary(self, user_id: str) -> LoanSummaryResponse:
        """Get loan summary statistics for user"""
        try:
            collection = self.get_loans_collection()
            
            # Get all active loans
            active_loans = list(collection.find({
                "user_id": user_id,
                "status": "active"
            }))
            
            # Get completed loans count
            completed_loans = collection.count_documents({
                "user_id": user_id,
                "status": "completed"
            })
            
            # Calculate totals
            total_loan_amount = sum(loan.get("loan_amount", 0) for loan in active_loans)
            outstanding_amount = sum(loan.get("outstanding_amount", 0) for loan in active_loans)
            monthly_emi = sum(loan.get("emi_amount", 0) for loan in active_loans)
            
            return LoanSummaryResponse(
                totalLoanAmount=total_loan_amount,
                outstandingAmount=outstanding_amount,
                monthlyEMI=monthly_emi,
                activeLoans=len(active_loans),
                completedLoans=completed_loans
            )
            
        except Exception as e:
            print(f"Error getting loan summary: {str(e)}")
            raise

    # ===================== ACTIVE LOANS =====================

    def get_active_loans(self, user_id: str) -> List[ActiveLoanResponse]:
        """Get all active loans for user"""
        try:
            collection = self.get_loans_collection()
            
            loans = list(collection.find({
                "user_id": user_id,
                "status": "active"
            }).sort("created_at", -1))
            
            loan_list = []
            for loan in loans:
                progress = self._calculate_progress(
                    loan.get("months_completed", 0),
                    loan.get("tenure_months", 1)
                )
                
                loan_list.append(ActiveLoanResponse(
                    id=str(loan["_id"]),
                    type=loan.get("loan_type", "Unknown"),
                    amount=self._format_currency(loan.get("loan_amount", 0)),
                    outstanding=self._format_currency(loan.get("outstanding_amount", 0)),
                    emi=self._format_currency(loan.get("emi_amount", 0)),
                    nextDue=self._format_date(loan.get("next_due_date", datetime.now())),
                    status=loan.get("status", "active"),
                    progress=progress,
                    interestRate=f"{loan.get('interest_rate', 0)}%",
                    tenure=f"{loan.get('tenure_months', 0)} months",
                    monthsCompleted=loan.get("months_completed", 0),
                    applicationId=loan.get("application_id")
                ))
            
            return loan_list
            
        except Exception as e:
            print(f"Error getting active loans: {str(e)}")
            raise

    def get_loan_by_id(self, loan_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get loan details by ID"""
        try:
            collection = self.get_loans_collection()
            loan = collection.find_one({
                "_id": ObjectId(loan_id),
                "user_id": user_id
            })
            return loan
        except Exception as e:
            print(f"Error getting loan by ID: {str(e)}")
            return None

    # ===================== LOAN APPLICATIONS =====================

    def get_loan_applications(self, user_id: str) -> List[LoanApplicationResponse]:
        """Get recent loan applications for user"""
        try:
            # Get from multiple sources
            apps_collection = self.get_applications_collection()
            db = self.get_database()
            
            applications = []
            
            # Get from loan_applications collection
            apps = list(apps_collection.find({"user_id": user_id}).sort("created_at", -1).limit(5))
            for app in apps:
                applications.append(LoanApplicationResponse(
                    id=str(app["_id"]),
                    type=app.get("loan_type", "Unknown"),
                    amount=self._format_currency(app.get("loan_amount", 0)),
                    date=self._format_date(app.get("created_at", datetime.now())),
                    status=app.get("status", "pending"),
                    applicationId=app.get("application_id", "")
                ))
            
            # Get recent personal loan applications
            personal_loans = list(db.personal_loan_applications.find(
                {"userId": user_id}
            ).sort("created_at", -1).limit(2))
            
            for pl in personal_loans:
                applications.append(LoanApplicationResponse(
                    id=str(pl["_id"]),
                    type="Personal Loan",
                    amount=f"₹{pl.get('loanAmount', '0')}",
                    date=self._format_date(pl.get("created_at", datetime.now())),
                    status=pl.get("status", "pending"),
                    applicationId=pl.get("application_id", "")
                ))
            
            # Get recent home loan applications
            home_loans = list(db.home_loan_applications.find(
                {"userId": user_id}
            ).sort("created_at", -1).limit(2))
            
            for hl in home_loans:
                applications.append(LoanApplicationResponse(
                    id=str(hl["_id"]),
                    type="Home Loan",
                    amount=f"₹{hl.get('loanAmount', '0')}",
                    date=self._format_date(hl.get("created_at", datetime.now())),
                    status=hl.get("status", "pending"),
                    applicationId=hl.get("application_id", "")
                ))
            
            # Get recent business loan applications
            business_loans = list(db.business_loan_applications.find(
                {"userId": user_id}
            ).sort("created_at", -1).limit(2))
            
            for bl in business_loans:
                applications.append(LoanApplicationResponse(
                    id=str(bl["_id"]),
                    type="Business Loan",
                    amount=f"₹{bl.get('loanAmount', '0')}",
                    date=self._format_date(bl.get("created_at", datetime.now())),
                    status=bl.get("status", "pending"),
                    applicationId=bl.get("application_id", "")
                ))
            
            # Sort by date and return latest 10
            applications.sort(key=lambda x: x.date, reverse=True)
            return applications[:10]
            
        except Exception as e:
            print(f"Error getting loan applications: {str(e)}")
            raise

    # ===================== EMI PAYMENT =====================

    def process_emi_payment(self, payment_data: EMIPaymentInDB) -> EMIPaymentResponse:
        """Process EMI payment"""
        try:
            payments_collection = self.get_payments_collection()
            loans_collection = self.get_loans_collection()
            
            # Create payment record
            payment_dict = payment_data.dict()
            result = payments_collection.insert_one(payment_dict)
            
            if result.inserted_id:
                # Update loan details
                loan = loans_collection.find_one({"_id": ObjectId(payment_data.loan_id)})
                
                if loan:
                    new_outstanding = loan.get("outstanding_amount", 0) - payment_data.amount
                    new_months_completed = loan.get("months_completed", 0) + 1
                    
                    # Calculate next due date (next month)
                    next_due = datetime.now() + timedelta(days=30)
                    
                    # Update loan
                    update_data = {
                        "outstanding_amount": max(0, new_outstanding),
                        "months_completed": new_months_completed,
                        "next_due_date": next_due,
                        "updated_at": datetime.now()
                    }
                    
                    # Mark as completed if fully paid
                    if new_outstanding <= 0:
                        update_data["status"] = "completed"
                    
                    loans_collection.update_one(
                        {"_id": ObjectId(payment_data.loan_id)},
                        {"$set": update_data}
                    )
                
                # Get created payment
                created_payment = payments_collection.find_one({"_id": result.inserted_id})
                
                return EMIPaymentResponse(
                    id=str(created_payment["_id"]),
                    loanId=created_payment["loan_id"],
                    userId=created_payment["user_id"],
                    amount=created_payment["amount"],
                    paymentMethod=created_payment["payment_method"],
                    paymentDate=created_payment["payment_date"],
                    transactionId=created_payment["transaction_id"],
                    status=created_payment["status"]
                )
            else:
                raise Exception("Failed to process payment")
                
        except Exception as e:
            print(f"Error processing EMI payment: {str(e)}")
            raise

    def get_payment_history(self, loan_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Get payment history for a loan"""
        try:
            collection = self.get_payments_collection()
            
            payments = list(collection.find({
                "loan_id": loan_id,
                "user_id": user_id
            }).sort("payment_date", -1))
            
            return payments
            
        except Exception as e:
            print(f"Error getting payment history: {str(e)}")
            return []

    # ===================== CREATE LOAN (FOR TESTING/ADMIN) =====================

    def create_loan(self, loan_data: ActiveLoanInDB) -> ActiveLoanResponse:
        """Create a new active loan"""
        try:
            collection = self.get_loans_collection()
            
            loan_dict = loan_data.dict()
            result = collection.insert_one(loan_dict)
            
            if result.inserted_id:
                created_loan = collection.find_one({"_id": result.inserted_id})
                
                progress = self._calculate_progress(
                    created_loan.get("months_completed", 0),
                    created_loan.get("tenure_months", 1)
                )
                
                return ActiveLoanResponse(
                    id=str(created_loan["_id"]),
                    type=created_loan.get("loan_type", "Unknown"),
                    amount=self._format_currency(created_loan.get("loan_amount", 0)),
                    outstanding=self._format_currency(created_loan.get("outstanding_amount", 0)),
                    emi=self._format_currency(created_loan.get("emi_amount", 0)),
                    nextDue=self._format_date(created_loan.get("next_due_date", datetime.now())),
                    status=created_loan.get("status", "active"),
                    progress=progress,
                    interestRate=f"{created_loan.get('interest_rate', 0)}%",
                    tenure=f"{created_loan.get('tenure_months', 0)} months",
                    monthsCompleted=created_loan.get("months_completed", 0),
                    applicationId=created_loan.get("application_id")
                )
            else:
                raise Exception("Failed to create loan")
                
        except Exception as e:
            print(f"Error creating loan: {str(e)}")
            raise

    def delete_loan(self, loan_id: str, user_id: str) -> bool:
        """Delete a loan (for testing)"""
        try:
            collection = self.get_loans_collection()
            result = collection.delete_one({
                "_id": ObjectId(loan_id),
                "user_id": user_id
            })
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting loan: {str(e)}")
            return False


# Create singleton instance
loan_management_repository = LoanManagementRepository()
