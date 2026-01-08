from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class LoanStatus(str, Enum):
    """Enum for loan application status"""
    pending = "Pending"
    under_review = "Under Review"
    approved = "Approved"
    rejected = "Rejected"
    disbursed = "Disbursed"


class LoanType(str, Enum):
    """Enum for loan types"""
    personal_loan = "Personal Loan"
    home_loan = "Home Loan"
    business_loan = "Business Loan"
    education_loan = "Education Loan"
    vehicle_loan = "Vehicle Loan"
    short_term_loan = "Short-term Loan"


# ============ ADMIN LOAN MANAGEMENT SCHEMAS ============

class AdminLoanApplication(BaseModel):
    """Model for loan application in admin panel"""
    id: str
    customer: str
    email: str
    phone: str
    type: str
    amount: str
    status: str
    appliedDate: str
    tenure: str
    interestRate: str
    purpose: str
    income: str
    cibilScore: int
    documents: List[str] = Field(default_factory=list)
    rejectionReason: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "LN001",
                "customer": "Rahul Sharma",
                "email": "rahul@example.com",
                "phone": "+91 98765 43210",
                "type": "Personal Loan",
                "amount": "₹5,00,000",
                "status": "Pending",
                "appliedDate": "2024-01-15",
                "tenure": "36 months",
                "interestRate": "12%",
                "purpose": "Medical Emergency",
                "income": "₹60,000/month",
                "cibilScore": 750,
                "documents": ["aadhar_card.pdf", "pan_card.pdf"]
            }
        }


class AdminLoanApplicationInDB(BaseModel):
    """Database model for admin loan applications"""
    customer: str
    email: EmailStr
    phone: str
    type: str
    amount: int
    status: str = "Pending"
    appliedDate: datetime = Field(default_factory=datetime.now)
    tenure: int  # in months
    interestRate: float
    purpose: str
    income: str
    cibilScore: int
    documents: List[str] = Field(default_factory=list)
    rejectionReason: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)


class LoanApplicationCreate(BaseModel):
    """Request model for creating loan application"""
    customer: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    type: LoanType
    amount: int = Field(..., gt=0)
    tenure: int = Field(..., gt=0, le=360)  # max 30 years
    interestRate: float = Field(..., gt=0, lt=50)
    purpose: str = Field(..., min_length=5, max_length=200)
    income: str
    cibilScore: int = Field(..., ge=300, le=900)
    documents: List[str] = Field(default_factory=list)


class LoanApplicationUpdate(BaseModel):
    """Model for updating loan application"""
    customer: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    type: Optional[LoanType] = None
    amount: Optional[int] = None
    tenure: Optional[int] = None
    interestRate: Optional[float] = None
    purpose: Optional[str] = None
    income: Optional[str] = None
    cibilScore: Optional[int] = None
    documents: Optional[List[str]] = None


class LoanStatusUpdate(BaseModel):
    """Model for updating loan status"""
    status: LoanStatus
    rejectionReason: Optional[str] = None


class LoanStatistics(BaseModel):
    """Model for loan statistics"""
    totalApplications: int
    pendingApplications: int
    underReviewApplications: int
    approvedApplications: int
    rejectedApplications: int
    disbursedApplications: int
    totalLoanAmount: str
    averageLoanAmount: str
    averageCibilScore: int
    homeLoanCount: int = 0
    personalLoanCount: int = 0
    businessLoanCount: int = 0
    shortTermLoanCount: int = 0
    
    class Config:
        json_schema_extra = {
            "example": {
                "totalApplications": 265,
                "pendingApplications": 23,
                "underReviewApplications": 15,
                "approvedApplications": 182,
                "rejectedApplications": 45,
                "disbursedApplications": 1234,
                "totalLoanAmount": "₹125.5Cr",
                "averageLoanAmount": "₹47.4L",
                "averageCibilScore": 745
            }
        }


class LoanApplicationResponse(BaseModel):
    """Response model for loan application"""
    id: str
    customer: str
    email: str
    phone: str
    type: str
    amount: str
    status: str
    appliedDate: str
    tenure: str
    interestRate: str
    purpose: str
    income: str
    cibilScore: int
    documents: List[str]
    rejectionReason: Optional[str] = None
    message: str = "Loan application retrieved successfully"
