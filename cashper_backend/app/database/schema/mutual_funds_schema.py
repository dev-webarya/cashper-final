from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict
from datetime import datetime
from enum import Enum

# Enums
class InvestmentGoal(str, Enum):
    RETIREMENT = "Retirement Planning"
    WEALTH = "Wealth Creation"
    EDUCATION = "Child Education"
    TAX_SAVING = "Tax Saving"
    SHORT_TERM = "Short Term Goals"
    EMERGENCY = "Emergency Fund"

class InvestmentType(str, Enum):
    LUMPSUM = "lumpsum"
    SIP = "sip"

class RiskProfile(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    VERY_HIGH = "Very High"

class SIPFrequency(str, Enum):
    MONTHLY = "Monthly"
    QUARTERLY = "Quarterly"
    HALF_YEARLY = "Half-Yearly"
    YEARLY = "Yearly"

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

class MutualFundInquiryRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    investmentAmount: float = Field(..., gt=0, description="Investment amount in INR")
    investmentGoal: str  # Changed from InvestmentGoal enum to str for flexibility

class MutualFundInquiryResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    investmentAmount: float
    investmentGoal: str
    status: str
    createdAt: datetime
    message: str = "We will contact you soon!"

class MutualFundInquiryInDB(BaseModel):
    name: str
    email: str
    phone: str
    investmentAmount: float
    investmentGoal: str
    status: str = InquiryStatus.PENDING
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    contactedAt: Optional[datetime] = None
    notes: Optional[str] = None

# ===================== Calculator Schemas =====================

class MutualFundCalculatorRequest(BaseModel):
    investmentType: InvestmentType
    amount: Optional[float] = Field(None, gt=0, description="Lumpsum investment amount")
    sipAmount: Optional[float] = Field(None, gt=0, description="Monthly SIP amount")
    returnRate: float = Field(..., ge=1, le=30, description="Expected annual return rate (%)")
    timePeriod: int = Field(..., ge=1, le=50, description="Investment period in years")

class MutualFundCalculatorResponse(BaseModel):
    investmentType: str
    totalInvestment: float
    estimatedReturns: float
    maturityValue: float
    returnRate: float
    timePeriod: int
    monthlyInvestment: Optional[float] = None
    totalMonths: Optional[int] = None

class MutualFundCalculatorInDB(BaseModel):
    investmentType: str
    amount: Optional[float] = None
    sipAmount: Optional[float] = None
    returnRate: float
    timePeriod: int
    totalInvestment: float
    estimatedReturns: float
    maturityValue: float
    calculatedAt: datetime = Field(default_factory=datetime.utcnow)
    userEmail: Optional[str] = None

# ===================== Application Schemas =====================

class MutualFundApplicationRequest(BaseModel):
    # Personal Information
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    age: int = Field(..., ge=18, le=100)
    panNumber: str = Field(..., min_length=10, max_length=10, description="PAN Card Number")
    
    # Investment Details
    investmentType: str  # Changed from InvestmentType enum to str
    investmentAmount: float = Field(..., gt=0, description="Initial/Lumpsum investment amount")
    investmentGoal: str  # Changed from InvestmentGoal enum to str
    riskProfile: str  # Changed from RiskProfile enum to str
    
    # SIP Details (if applicable)
    sipAmount: Optional[float] = Field(None, description="Monthly SIP amount")
    sipFrequency: Optional[str] = None  # Changed from SIPFrequency enum to str
    
    # Address & KYC
    address: str = Field(..., min_length=10, max_length=500)  # Increased max length
    city: str = Field(..., min_length=2, max_length=100)  # Increased max length
    state: str = Field(..., min_length=2, max_length=100)  # Increased max length
    pincode: str = Field(..., min_length=6, max_length=10)  # Made more flexible
    
    # Document file paths (uploaded separately) - Made optional since files might not be uploaded
    panDocument: Optional[str] = None
    aadhaarDocument: Optional[str] = None
    photoDocument: Optional[str] = None
    bankProofDocument: Optional[str] = None

class MutualFundApplicationResponse(BaseModel):
    id: str
    applicationNumber: str
    
    # Personal Information
    name: str
    email: str
    phone: str
    age: int
    panNumber: str
    
    # Investment Details
    investmentType: str
    investmentAmount: float
    investmentGoal: str
    riskProfile: str
    sipAmount: Optional[float] = None
    sipFrequency: Optional[str] = None
    
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
    message: str = "Your application has been submitted successfully!"

class MutualFundApplicationInDB(BaseModel):
    applicationNumber: str
    
    # Personal Information
    name: str
    email: str
    phone: str
    age: int
    panNumber: str
    
    # Investment Details
    investmentType: str
    investmentAmount: float
    investmentGoal: str
    riskProfile: str
    sipAmount: Optional[float] = None
    sipFrequency: Optional[str] = None
    
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
