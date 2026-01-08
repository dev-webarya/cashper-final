from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ===================== ENUMS =====================

class IncomeRange(str, Enum):
    BELOW_20 = "below-20"
    TWENTY_1CR = "20-1cr"
    ONE_5CR = "1-5cr"
    FIVE_10CR = "5-10cr"
    TEN_50CR = "10-50cr"
    ABOVE_50CR = "above-50cr"


class BusinessType(str, Enum):
    PROPRIETORSHIP = "proprietorship"
    PARTNERSHIP = "partnership"
    LLP = "llp"
    PRIVATE_LIMITED = "private-limited"
    PUBLIC_LIMITED = "public-limited"
    STARTUP = "startup"


class BusinessStructure(str, Enum):
    PROPRIETORSHIP = "proprietorship"
    PARTNERSHIP = "partnership"
    LLP = "llp"
    PRIVATE = "private"
    PUBLIC = "public"
    STARTUP = "startup"


class IndustryType(str, Enum):
    MANUFACTURING = "manufacturing"
    IT_SERVICES = "it-services"
    RETAIL = "retail"
    CONSTRUCTION = "construction"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    HOSPITALITY = "hospitality"
    FINANCE = "finance"
    OTHER = "other"


class TurnoverRange(str, Enum):
    BELOW_20 = "below-20"
    TWENTY_1CR = "20-1cr"
    ONE_5CR = "1-5cr"
    FIVE_10CR = "5-10cr"
    TEN_50CR = "10-50cr"
    ABOVE_50CR = "above-50cr"


class EmployeeRange(str, Enum):
    ZERO_10 = "0-10"
    ELEVEN_50 = "11-50"
    FIFTY_ONE_100 = "51-100"
    HUNDRED_ONE_500 = "101-500"
    ABOVE_500 = "above-500"


class ConsultationStatus(str, Enum):
    PENDING = "pending"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ===================== FREE BUSINESS TAX CONSULTATION =====================

class BusinessTaxConsultationRequest(BaseModel):
    businessName: str = Field(..., min_length=2, max_length=200)
    ownerName: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^\+?[\d\s-]{10,15}$')
    businessType: BusinessType
    annualTurnover: IncomeRange

    @validator('phone')
    def validate_phone(cls, v):
        # Remove all spaces and dashes
        cleaned = v.replace(' ', '').replace('-', '').replace('+', '')
        if not cleaned.isdigit() or len(cleaned) < 10:
            raise ValueError('Phone number must contain at least 10 digits')
        return v

    class Config:
        use_enum_values = True


class BusinessTaxConsultationResponse(BaseModel):
    id: str
    businessName: Optional[str] = None
    ownerName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    businessType: Optional[str] = None
    annualTurnover: Optional[str] = None
    status: Optional[ConsultationStatus] = None
    createdAt: Optional[datetime] = None
    scheduledDate: Optional[datetime] = None
    adminNotes: Optional[str] = None

    class Config:
        use_enum_values = True


class BusinessTaxConsultationInDB(BaseModel):
    businessName: str
    ownerName: str
    email: str
    phone: str
    businessType: str
    annualTurnover: str
    status: ConsultationStatus
    createdAt: datetime
    scheduledDate: Optional[datetime] = None
    adminNotes: Optional[str] = None

    class Config:
        use_enum_values = True


# ===================== BUSINESS TAX SAVINGS CALCULATOR =====================

class BusinessTaxCalculatorRequest(BaseModel):
    businessType: str = Field(..., description="Type of business structure")
    annualTurnover: float = Field(..., ge=0, description="Annual business turnover")
    annualProfit: float = Field(..., ge=0, description="Annual business profit")
    depreciation: Optional[float] = Field(0, ge=0, description="Depreciation on assets")
    salaryExpenses: Optional[float] = Field(0, ge=0, description="Employee salary expenses")
    rdExpenses: Optional[float] = Field(0, ge=0, description="R&D expenses eligible for weighted deduction")
    
    # Optional contact details for follow-up
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, pattern=r'^\+?[\d\s-]{10,15}$')

    @validator('phone')
    def validate_phone(cls, v):
        if v:
            cleaned = v.replace(' ', '').replace('-', '').replace('+', '')
            if not cleaned.isdigit() or len(cleaned) < 10:
                raise ValueError('Phone number must contain at least 10 digits')
        return v


class BusinessTaxCalculatorResponse(BaseModel):
    id: str
    businessType: str
    annualTurnover: float
    annualProfit: float
    depreciation: float
    salaryExpenses: float
    rdExpenses: float
    totalDeductions: float
    taxableIncome: float
    taxWithoutPlanning: float
    taxAfterPlanning: float
    totalSavings: float
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    createdAt: datetime


class BusinessTaxCalculatorInDB(BaseModel):
    businessType: str
    annualTurnover: float
    annualProfit: float
    depreciation: float
    salaryExpenses: float
    rdExpenses: float
    totalDeductions: float
    taxableIncome: float
    taxWithoutPlanning: float
    taxAfterPlanning: float
    totalSavings: float
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    createdAt: datetime


# ===================== APPLY FOR BUSINESS TAX PLANNING SERVICE =====================

class BusinessTaxPlanningApplicationRequest(BaseModel):
    businessName: str = Field(..., min_length=2, max_length=200)
    businessPAN: str = Field(..., pattern=r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$')
    ownerName: str = Field(..., min_length=3, max_length=100)
    contactNumber: str = Field(..., pattern=r'^\+?[\d\s-]{10,15}$')
    businessEmail: EmailStr
    gstNumber: Optional[str] = Field(None, pattern=r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$')
    businessStructure: BusinessStructure
    industryType: IndustryType
    turnoverRange: TurnoverRange
    numberOfEmployees: Optional[EmployeeRange] = None
    servicesRequired: Optional[List[str]] = None
    businessDetails: Optional[str] = Field(None, max_length=1000)

    @validator('contactNumber')
    def validate_phone(cls, v):
        cleaned = v.replace(' ', '').replace('-', '').replace('+', '')
        if not cleaned.isdigit() or len(cleaned) < 10:
            raise ValueError('Contact number must contain at least 10 digits')
        return v

    @validator('businessPAN')
    def validate_pan_uppercase(cls, v):
        return v.upper()

    @validator('gstNumber')
    def validate_gst_uppercase(cls, v):
        if v:
            return v.upper()
        return v

    class Config:
        use_enum_values = True


class BusinessTaxPlanningApplicationResponse(BaseModel):
    id: str
    businessName: str
    businessPAN: str
    ownerName: str
    contactNumber: str
    businessEmail: str
    gstNumber: Optional[str] = None
    businessStructure: str
    industryType: str
    turnoverRange: str
    numberOfEmployees: Optional[str] = None
    servicesRequired: Optional[List[str]] = None
    businessDetails: Optional[str] = None
    userId: Optional[str] = None
    status: ConsultationStatus
    createdAt: datetime
    assignedTo: Optional[str] = None
    adminNotes: Optional[str] = None

    class Config:
        use_enum_values = True


class BusinessTaxPlanningApplicationInDB(BaseModel):
    businessName: str
    businessPAN: str
    ownerName: str
    contactNumber: str
    businessEmail: str
    gstNumber: Optional[str] = None
    businessStructure: str
    industryType: str
    turnoverRange: str
    numberOfEmployees: Optional[str] = None
    servicesRequired: Optional[List[str]] = None
    businessDetails: Optional[str] = None
    userId: Optional[str] = None
    status: ConsultationStatus
    createdAt: datetime
    assignedTo: Optional[str] = None
    adminNotes: Optional[str] = None

    class Config:
        use_enum_values = True


# ===================== ADMIN UPDATE SCHEMAS =====================

class UpdateConsultationStatusRequest(BaseModel):
    status: ConsultationStatus
    scheduledDate: Optional[datetime] = None
    adminNotes: Optional[str] = Field(None, max_length=500)

    class Config:
        use_enum_values = True


class AssignConsultantRequest(BaseModel):
    assignedTo: str = Field(..., min_length=3, max_length=100)
    adminNotes: Optional[str] = Field(None, max_length=500)
