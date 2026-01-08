from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
import re
from enum import Enum


class TaxRegime(str, Enum):
    """Tax regime options"""
    OLD = "old"
    NEW = "new"
    NOT_SURE = "not-sure"


class IncomeRange(str, Enum):
    """Income range options"""
    BELOW_5 = "below-5"
    FIVE_TO_TEN = "5-10"
    TEN_TO_TWENTY = "10-20"
    TWENTY_TO_FIFTY = "20-50"
    ABOVE_50 = "above-50"


class EmploymentType(str, Enum):
    """Employment type options"""
    SALARIED = "salaried"
    SELF_EMPLOYED = "self-employed"
    FREELANCER = "freelancer"
    BUSINESS = "business"
    RETIRED = "retired"


class ConsultationStatus(str, Enum):
    """Status for consultation requests"""
    PENDING = "pending"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ===================== BOOK FREE TAX CONSULTATION =====================

class TaxConsultationBookingRequest(BaseModel):
    """Schema for booking free tax consultation (Hero section form)"""
    name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    income: IncomeRange
    taxRegime: TaxRegime

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name is required')
        if len(v.strip()) < 3:
            raise ValueError('Name must be at least 3 characters')
        return v.strip()

    @validator('phone')
    def validate_phone(cls, v):
        # Remove all non-digit characters
        phone = ''.join(filter(str.isdigit, v))
        if len(phone) < 10:
            raise ValueError('Phone number must have at least 10 digits')
        if len(phone) > 15:
            raise ValueError('Phone number cannot exceed 15 digits')
        return phone


class TaxConsultationBookingResponse(BaseModel):
    """Response schema for tax consultation booking"""
    id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    income: Optional[str] = None
    taxRegime: Optional[str] = None
    status: Optional[ConsultationStatus] = None
    createdAt: Optional[datetime] = None
    scheduledDate: Optional[datetime] = None
    adminNotes: Optional[str] = None

    class Config:
        from_attributes = True


class TaxConsultationBookingInDB(BaseModel):
    """Schema for tax consultation booking in database"""
    name: str
    email: str
    phone: str
    income: str
    taxRegime: str
    status: ConsultationStatus = ConsultationStatus.PENDING
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    scheduledDate: Optional[datetime] = None
    adminNotes: Optional[str] = None


# ===================== GET EXPERT TAX PLANNING CONSULTATION (Tax Calculator Section) =====================

class TaxCalculatorRequest(BaseModel):
    """Schema for tax calculation consultation request"""
    grossIncome: float = Field(..., ge=0, description="Annual gross income")
    section80C: Optional[float] = Field(0, ge=0, le=150000, description="Section 80C investments (Max 1.5L)")
    section80D: Optional[float] = Field(0, ge=0, le=50000, description="Section 80D health insurance (Max 50K)")
    nps80CCD1B: Optional[float] = Field(0, ge=0, le=50000, description="NPS additional deduction (Max 50K)")
    homeLoanInterest: Optional[float] = Field(0, ge=0, le=200000, description="Home loan interest (Max 2L)")
    
    # Optional contact details for follow-up
    name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=15)

    @validator('phone')
    def validate_phone(cls, v):
        if v:
            phone = v.replace(' ', '').replace('-', '')
            if not re.match(r'^\d{10}$', phone):
                raise ValueError('Invalid phone number (10 digits required)')
            return phone
        return v


class TaxCalculatorResponse(BaseModel):
    """Response schema for tax calculation"""
    id: str
    grossIncome: float
    section80C: float
    section80D: float
    nps80CCD1B: float
    homeLoanInterest: float
    totalDeductions: float
    taxableIncome: float
    taxWithoutPlanning: float
    taxAfterPlanning: float
    totalSavings: float
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    createdAt: datetime

    class Config:
        from_attributes = True


class TaxCalculatorInDB(BaseModel):
    """Schema for tax calculator data in database"""
    grossIncome: float
    section80C: float
    section80D: float
    nps80CCD1B: float
    homeLoanInterest: float
    totalDeductions: float
    taxableIncome: float
    taxWithoutPlanning: float
    taxAfterPlanning: float
    totalSavings: float
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)


# ===================== APPLY FOR PERSONAL TAX PLANNING SERVICE =====================

class PersonalTaxPlanningApplicationRequest(BaseModel):
    """Schema for personal tax planning service application (Main form)"""
    fullName: str = Field(..., min_length=3, max_length=100)
    emailAddress: EmailStr
    phoneNumber: str = Field(..., min_length=10, max_length=15)
    panNumber: str = Field(..., min_length=10, max_length=10)
    annualIncome: IncomeRange
    employmentType: EmploymentType
    preferredTaxRegime: Optional[TaxRegime] = None
    additionalInfo: Optional[str] = Field(None, max_length=2000)

    @validator('fullName')
    def validate_full_name(cls, v):
        if not v.strip():
            raise ValueError('Full name is required')
        if len(v.strip()) < 3:
            raise ValueError('Full name must be at least 3 characters')
        return v.strip()

    @validator('phoneNumber')
    def validate_phone_number(cls, v):
        # Remove all non-digit characters
        phone = ''.join(filter(str.isdigit, v))
        if len(phone) < 10:
            raise ValueError('Phone number must have at least 10 digits')
        if len(phone) > 15:
            raise ValueError('Phone number cannot exceed 15 digits')
        # Return cleaned phone number (digits only)
        return phone

    @validator('panNumber')
    def validate_pan_number(cls, v):
        pan = v.upper().replace(' ', '')
        if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', pan):
            raise ValueError('Invalid PAN number format (Format: ABCDE1234F)')
        return pan

    @validator('preferredTaxRegime', pre=True)
    def validate_preferred_tax_regime(cls, v):
        """Convert empty string to None for optional preferredTaxRegime field"""
        if v == '' or v is None:
            return None
        return v


class PersonalTaxPlanningApplicationResponse(BaseModel):
    """Response schema for tax planning application"""
    id: str
    fullName: str
    emailAddress: str
    phoneNumber: str
    panNumber: str
    annualIncome: str
    employmentType: str
    preferredTaxRegime: Optional[str] = None
    additionalInfo: Optional[str] = None
    userId: Optional[str] = None
    status: ConsultationStatus
    createdAt: datetime
    assignedTo: Optional[str] = None
    adminNotes: Optional[str] = None

    class Config:
        from_attributes = True


class PersonalTaxPlanningApplicationInDB(BaseModel):
    """Schema for tax planning application in database"""
    fullName: str
    emailAddress: str
    phoneNumber: str
    panNumber: str
    annualIncome: str
    employmentType: str
    preferredTaxRegime: Optional[str] = None
    additionalInfo: Optional[str] = None
    userId: Optional[str] = None
    status: ConsultationStatus = ConsultationStatus.PENDING
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    assignedTo: Optional[str] = None
    adminNotes: Optional[str] = None


# ===================== ADMIN UPDATE SCHEMAS =====================

class UpdateConsultationStatusRequest(BaseModel):
    """Schema for updating consultation status"""
    status: ConsultationStatus
    scheduledDate: Optional[datetime] = None
    adminNotes: Optional[str] = Field(None, max_length=1000)


class AssignConsultantRequest(BaseModel):
    """Schema for assigning consultant to application"""
    assignedTo: str = Field(..., min_length=3, max_length=100)
    adminNotes: Optional[str] = Field(None, max_length=1000)
