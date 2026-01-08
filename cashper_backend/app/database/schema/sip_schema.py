from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict
from datetime import datetime
from enum import Enum

# Enums
class SIPFrequency(str, Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"

class InvestmentGoal(str, Enum):
    WEALTH = "wealth"
    RETIREMENT = "retirement"
    EDUCATION = "education"
    HOME = "home"
    MARRIAGE = "marriage"

class RiskProfile(str, Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"

class InquiryStatus(str, Enum):
    PENDING = "pending"
    CONTACTED = "contacted"
    CONVERTED = "converted"
    CLOSED = "closed"

class ApplicationStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    KYC_PENDING = "kyc_pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"

# ===================== Contact/Inquiry Schemas =====================

class SIPInquiryRequest(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    investmentAmount: Optional[float] = Field(default=500, gt=0, description="Monthly investment amount in INR")
    duration: Optional[str] = Field(default="1 year", description="Investment duration")
    message: Optional[str] = Field(default="", description="Inquiry message or comments")

class SIPInquiryResponse(BaseModel):
    id: str
    fullName: str
    email: str
    phone: str
    investmentAmount: float
    duration: str
    status: str
    createdAt: datetime
    message: str = "Thank you! Our investment advisor will contact you soon."

class SIPInquiryInDB(BaseModel):
    fullName: str
    email: str
    phone: str
    investmentAmount: float
    duration: str
    message: str = ""
    status: str = "pending"
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    contactedAt: Optional[datetime] = None
    notes: Optional[str] = None

# ===================== Calculator Schemas =====================

class SIPCalculatorRequest(BaseModel):
    monthlyInvestment: float = Field(..., gt=0, description="Monthly investment amount")
    expectedReturn: float = Field(..., ge=1, le=30, description="Expected annual return rate (%)")
    timePeriod: int = Field(..., ge=1, le=50, description="Investment period in years")

class SIPCalculatorResponse(BaseModel):
    monthlyInvestment: float
    expectedReturn: float
    timePeriod: int
    totalInvestment: float
    estimatedReturns: float
    futureValue: float
    totalMonths: int

class SIPCalculatorInDB(BaseModel):
    monthlyInvestment: float
    expectedReturn: float
    timePeriod: int
    totalInvestment: float
    estimatedReturns: float
    futureValue: float
    totalMonths: int
    calculatedAt: datetime = Field(default_factory=datetime.utcnow)
    userEmail: Optional[str] = None

# ===================== Application Schemas =====================

class SIPApplicationRequest(BaseModel):
    # Personal Information
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    age: int = Field(..., ge=18, le=100)
    panNumber: str = Field(..., min_length=10, max_length=10, description="PAN Card Number")
    
    # SIP Details
    sipAmount: float = Field(..., gt=0, description="Monthly SIP amount")
    sipFrequency: str  # Monthly, Quarterly, Annually
    tenure: int = Field(..., ge=1, le=30, description="Investment tenure in years")
    investmentGoal: str  # Investment goal
    riskProfile: str  # Risk profile
    
    # Address & KYC
    address: str = Field(..., min_length=10, max_length=500)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=6, max_length=10)
    
    # Document file paths (uploaded separately)
    panDocument: Optional[str] = None
    aadhaarDocument: Optional[str] = None
    photoDocument: Optional[str] = None
    bankProofDocument: Optional[str] = None

class SIPApplicationResponse(BaseModel):
    id: str
    applicationNumber: str
    
    # Personal Information
    name: str
    email: str
    phone: str
    age: int
    panNumber: str
    
    # SIP Details
    sipAmount: float
    sipFrequency: str
    tenure: int
    investmentGoal: str
    riskProfile: str
    
    # Address & KYC
    address: str
    city: str
    state: str
    pincode: str
    
    # Documents
    documents: Dict[str, Optional[str]] = {
        "pan": None,
        "aadhaar": None,
        "photo": None,
        "bankProof": None
    }
    
    # Status & Tracking
    status: str
    submittedAt: datetime
    message: str = "Your SIP application has been submitted successfully!"

class SIPApplicationInDB(BaseModel):
    applicationNumber: str
    
    # User identification (for authenticated users)
    userId: Optional[str] = None
    userEmail: Optional[str] = None
    
    # Personal Information
    name: str
    email: str
    phone: str
    age: int
    panNumber: str
    
    # SIP Details
    sipAmount: float
    sipFrequency: str
    tenure: int
    investmentGoal: str
    riskProfile: str
    
    # Address & KYC
    address: str
    city: str
    state: str
    pincode: str
    
    # Documents
    documents: Dict[str, Optional[str]] = {
        "pan": None,
        "aadhaar": None,
        "photo": None,
        "bankProof": None
    }
    
    # Status & Tracking
    status: str = ApplicationStatus.SUBMITTED
    submittedAt: datetime = Field(default_factory=datetime.utcnow)
    reviewedAt: Optional[datetime] = None
    reviewedBy: Optional[str] = None
    remarks: Optional[str] = None
