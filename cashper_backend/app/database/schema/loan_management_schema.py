from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

# ============ LOAN SUMMARY SCHEMAS ============

class LoanSummaryResponse(BaseModel):
    """Response model for loan summary statistics"""
    totalLoanAmount: int
    outstandingAmount: int
    monthlyEMI: int
    activeLoans: int
    completedLoans: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "totalLoanAmount": 6500000,
                "outstandingAmount": 5100000,
                "monthlyEMI": 85000,
                "activeLoans": 3,
                "completedLoans": 1
            }
        }


# ============ ACTIVE LOAN SCHEMAS ============

class ActiveLoanResponse(BaseModel):
    """Response model for individual active loan"""
    id: str
    type: str
    amount: str
    outstanding: str
    emi: str
    nextDue: str
    status: str
    progress: int
    interestRate: str
    tenure: str
    monthsCompleted: int
    applicationId: Optional[str] = None
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123456789",
                "type": "Personal Loan",
                "amount": "₹5,00,000",
                "outstanding": "₹3,50,000",
                "emi": "₹15,000",
                "nextDue": "Jan 5, 2025",
                "status": "active",
                "progress": 30,
                "interestRate": "12.5%",
                "tenure": "36 months",
                "monthsCompleted": 12,
                "applicationId": "PL2024001"
            }
        }


class ActiveLoanInDB(BaseModel):
    """Database model for active loan"""
    user_id: str
    loan_type: str
    loan_amount: int
    outstanding_amount: int
    emi_amount: int
    next_due_date: datetime
    status: str = "active"
    interest_rate: float
    tenure_months: int
    months_completed: int = 0
    application_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# ============ LOAN APPLICATION SCHEMAS ============

class LoanApplicationResponse(BaseModel):
    """Response model for loan application"""
    id: str
    type: str
    amount: str
    date: str
    status: str
    applicationId: str
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123456789",
                "type": "Short-Term Loan",
                "amount": "₹2,00,000",
                "date": "Dec 28, 2024",
                "status": "pending",
                "applicationId": "ST2024001"
            }
        }


class LoanApplicationInDB(BaseModel):
    """Database model for loan application"""
    user_id: str
    loan_type: str
    loan_amount: int
    application_id: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# ============ EMI PAYMENT SCHEMAS ============

class EMIPaymentCreate(BaseModel):
    """Request model for EMI payment"""
    loanId: str = Field(..., min_length=1)
    paymentMethod: str = Field(..., min_length=1)
    amount: int = Field(..., gt=0)
    
    class Config:
        json_schema_extra = {
            "example": {
                "loanId": "123456789",
                "paymentMethod": "UPI",
                "amount": 15000
            }
        }


class EMIPaymentResponse(BaseModel):
    """Response model for EMI payment"""
    id: str
    loanId: str
    userId: str
    amount: int
    paymentMethod: str
    paymentDate: datetime
    transactionId: str
    status: str
    
    class Config:
        from_attributes = True


class EMIPaymentInDB(BaseModel):
    """Database model for EMI payment"""
    loan_id: str
    user_id: str
    amount: int
    payment_method: str
    payment_date: datetime = Field(default_factory=datetime.now)
    transaction_id: str
    status: str = "completed"
    created_at: datetime = Field(default_factory=datetime.now)


# ============ LOAN DETAILS SCHEMAS ============

class LoanDetailsResponse(BaseModel):
    """Detailed response model for loan"""
    id: str
    type: str
    amount: str
    outstanding: str
    emi: str
    interestRate: str
    tenure: str
    monthsCompleted: int
    nextDue: str
    progress: int
    status: str
    applicationId: Optional[str] = None
    createdAt: datetime
    
    class Config:
        from_attributes = True


# ============ LOAN STATEMENT SCHEMAS ============

class LoanStatementResponse(BaseModel):
    """Response model for loan statement"""
    loanId: str
    loanType: str
    totalAmount: int
    outstanding: int
    emiAmount: int
    interestRate: float
    payments: List[dict] = []
    
    class Config:
        from_attributes = True


# ============ CREATE LOAN SCHEMAS ============

class CreateLoanRequest(BaseModel):
    """Request model for creating a new loan (for testing/admin)"""
    loanType: str = Field(..., min_length=1)
    loanAmount: int = Field(..., gt=0)
    interestRate: float = Field(..., gt=0)
    tenureMonths: int = Field(..., gt=0)
    
    class Config:
        json_schema_extra = {
            "example": {
                "loanType": "Personal Loan",
                "loanAmount": 500000,
                "interestRate": 12.5,
                "tenureMonths": 36
            }
        }


class CreateLoanResponse(BaseModel):
    """Response model for created loan"""
    id: str
    message: str
    loanDetails: ActiveLoanResponse
    
    class Config:
        from_attributes = True
