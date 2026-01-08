from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ServiceType(str, Enum):
    """Retail service type options"""
    ITR_FILING = "itr-filing"
    ITR_REVISION = "itr-revision"
    ITR_NOTICE_REPLY = "itr-notice-reply"
    INDIVIDUAL_PAN = "individual-pan"
    HUF_PAN = "huf-pan"
    PF_WITHDRAWAL = "pf-withdrawal"
    DOCUMENT_UPDATE = "document-update"
    TRADING_DEMAT = "trading-demat"
    BANK_ACCOUNT = "bank-account"
    FINANCIAL_PLANNING = "financial-planning"


class ApplicationStatus(str, Enum):
    """Status for service applications"""
    PENDING = "pending"
    UNDER_REVIEW = "under-review"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


# ===================== ITR FILING SERVICE =====================

class ITRFilingRequest(BaseModel):
    """ITR Filing Service Application"""
    fullName: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    panNumber: str = Field(..., min_length=10, max_length=10)
    aadhaarNumber: str = Field(..., min_length=12, max_length=12)
    dateOfBirth: str
    employmentType: str
    annualIncome: str
    itrType: str
    hasBusinessIncome: bool = False
    hasCapitalGains: bool = False
    hasHouseProperty: bool = False
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str = Field(..., min_length=6, max_length=6)
    # Documents as base64 encoded strings
    pan_card: Optional[str] = None
    aadhaar_card: Optional[str] = None
    form16: Optional[str] = None
    bank_statement: Optional[str] = None

    @validator('panNumber')
    def validate_pan(cls, v):
        pan = v.upper().strip()
        if len(pan) != 10:
            raise ValueError('PAN must be exactly 10 characters')
        return pan

    @validator('phone')
    def validate_phone(cls, v):
        phone = ''.join(filter(str.isdigit, v))
        if len(phone) < 10:
            raise ValueError('Phone must have at least 10 digits')
        return phone


# ===================== ITR REVISION SERVICE =====================

class ITRRevisionRequest(BaseModel):
    """ITR Revision Service Application"""
    fullName: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    panNumber: str = Field(..., min_length=10, max_length=10)
    aadhaarNumber: str = Field(..., min_length=12, max_length=12)
    acknowledgementNumber: str
    originalFilingDate: str
    reasonForRevision: str = Field(..., min_length=10)
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str


# ===================== ITR NOTICE REPLY SERVICE =====================

class ITRNoticeReplyRequest(BaseModel):
    """ITR Notice Reply Service Application"""
    fullName: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    panNumber: str = Field(..., min_length=10, max_length=10)
    noticeNumber: str
    noticeDate: str
    noticeSubject: str
    noticeDescription: str = Field(..., min_length=20)
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str


# ===================== INDIVIDUAL PAN APPLICATION =====================

class IndividualPANRequest(BaseModel):
    """Individual PAN Application"""
    fullName: str = Field(..., min_length=3)
    fatherName: str = Field(..., min_length=3)
    dateOfBirth: str
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    aadhaarNumber: str = Field(..., min_length=12, max_length=12)
    gender: str
    category: str
    applicationType: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str


# ===================== HUF PAN APPLICATION =====================

class HUFPANRequest(BaseModel):
    """HUF PAN Application"""
    hufName: str = Field(..., min_length=3)
    kartaName: str = Field(..., min_length=3)
    kartaPAN: str = Field(..., min_length=10, max_length=10)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    dateOfFormation: str
    hufMembers: int = Field(..., gt=0)
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str


# ===================== PF WITHDRAWAL APPLICATION =====================

class PFWithdrawalRequest(BaseModel):
    """PF Withdrawal Application"""
    fullName: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    panNumber: str = Field(..., min_length=10, max_length=10)
    uanNumber: str = Field(..., min_length=12, max_length=12)
    employerName: str
    withdrawalType: str
    withdrawalAmount: float = Field(..., gt=0)
    withdrawalReason: str = Field(..., min_length=20)
    lastWorkingDate: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str


# ===================== DOCUMENT UPDATE APPLICATION =====================

class DocumentUpdateRequest(BaseModel):
    """Document Update Application (Aadhaar/PAN)"""
    fullName: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    updateType: str  # 'aadhaar', 'pan', 'both'
    currentAadhaarNumber: Optional[str] = None
    currentPANNumber: Optional[str] = None
    updateReason: str = Field(..., min_length=10)
    newDetails: str = Field(..., min_length=10)
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str


# ===================== TRADING & DEMAT ACCOUNT =====================

class TradingDematRequest(BaseModel):
    """Trading & Demat Account Application"""
    fullName: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    panNumber: str = Field(..., min_length=10, max_length=10)
    aadhaarNumber: str = Field(..., min_length=12, max_length=12)
    dateOfBirth: str
    accountType: str
    tradingSegments: List[str] = []
    annualIncome: str
    occupationType: str
    experienceLevel: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str
    bankName: str
    accountNumber: str
    ifscCode: str


# ===================== BANK ACCOUNT APPLICATION =====================

class BankAccountRequest(BaseModel):
    """Bank Account Application"""
    fullName: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    panNumber: str = Field(..., min_length=10, max_length=10)
    aadhaarNumber: str = Field(..., min_length=12, max_length=12)
    dateOfBirth: str
    accountType: str
    bankPreference: str
    accountVariant: str
    monthlyIncome: str
    occupationType: str
    nomineeRequired: bool = False
    nomineeName: Optional[str] = None
    nomineeRelation: Optional[str] = None
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str
    residenceType: str


# ===================== FINANCIAL PLANNING SERVICE =====================

class FinancialPlanningRequest(BaseModel):
    """Financial Planning Service Application"""
    name: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    age: int = Field(..., gt=18, lt=100)
    occupation: str
    annualIncome: str
    existingInvestments: Optional[str] = None
    riskProfile: str
    investmentGoal: str
    timeHorizon: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str
    panNumber: str = Field(..., min_length=10, max_length=10)


# ===================== COMMON RESPONSE SCHEMAS =====================

class ServiceApplicationResponse(BaseModel):
    """Response schema for service applications"""
    id: str
    serviceType: str
    applicantName: str
    email: str
    phone: str
    status: ApplicationStatus
    createdAt: datetime
    updatedAt: datetime
    adminNotes: Optional[str] = None

    class Config:
        from_attributes = True


class ServiceApplicationInDB(BaseModel):
    """Schema for service application in database"""
    serviceType: ServiceType
    applicantName: str
    email: str
    phone: str
    applicationData: dict  # Stores complete application data
    status: ApplicationStatus = ApplicationStatus.PENDING
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    adminNotes: Optional[str] = None
    userId: Optional[str] = None
