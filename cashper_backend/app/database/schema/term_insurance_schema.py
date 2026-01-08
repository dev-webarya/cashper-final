from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

# Enums
class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class SmokingHabits(str, Enum):
    non_smoker = "non-smoker"
    smoker = "smoker"
    occasional = "occasional"

class InquiryStatus(str, Enum):
    pending = "pending"
    contacted = "contacted"
    converted = "converted"
    closed = "closed"

class ApplicationStatus(str, Enum):
    submitted = "submitted"
    under_review = "under_review"
    documents_pending = "documents_pending"
    medical_pending = "medical_pending"
    approved = "approved"
    rejected = "rejected"
    policy_issued = "policy_issued"

# Contact Inquiry Models
class TermInsuranceInquiryRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    age: int = Field(..., ge=18, le=65)
    coverage: Optional[int] = None
    term: Optional[int] = Field(None, ge=5, le=40)  # Policy term in years

class TermInsuranceInquiryResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    age: int
    coverage: Optional[int]
    status: InquiryStatus
    createdAt: datetime
    message: str

class TermInsuranceInquiryInDB(BaseModel):
    name: str
    email: str
    phone: str
    age: int
    coverage: Optional[int]
    term: Optional[int] = None  # Policy term in years
    status: InquiryStatus = InquiryStatus.pending
    remarks: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

# Application Models
class TermInsuranceApplicationRequest(BaseModel):
    # Personal Information
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    age: int = Field(..., ge=18, le=65)
    gender: str
    occupation: str = Field(..., min_length=2, max_length=100)
    annualIncome: str
    smokingStatus: Optional[str] = None  # Smoking status (matches frontend field)
    existingConditions: Optional[str] = None  # Any existing medical conditions
    
    # Coverage Details
    coverage: str
    term: Optional[int] = Field(None, ge=5, le=40)  # Policy term in years
    nomineeRelation: str
    
    # Address Information
    address: str = Field(..., min_length=10, max_length=500)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=6, max_length=10)
    
    # Document filenames (files uploaded separately)
    aadhar: Optional[str] = None
    pan: Optional[str] = None
    photo: Optional[str] = None
    incomeProof: Optional[str] = None
    medicalReports: Optional[str] = None

class TermInsuranceApplicationResponse(BaseModel):
    id: str
    userId: Optional[str] = None
    applicationNumber: str
    # Personal Information
    name: str
    email: str
    phone: str
    age: int
    gender: str
    occupation: str
    annualIncome: str
    smokingStatus: Optional[str] = None
    existingConditions: Optional[str] = None
    
    # Coverage Details
    coverage: str
    term: Optional[int] = None
    nomineeRelation: str
    
    # Address Information
    address: str
    city: str
    state: str
    pincode: str
    
    # Status and Metadata
    status: ApplicationStatus
    submittedAt: datetime
    message: str
    remarks: Optional[str] = None
    
    # Documents
    aadhar: Optional[str] = None
    pan: Optional[str] = None
    photo: Optional[str] = None
    incomeProof: Optional[str] = None
    medicalReports: Optional[str] = None

class TermInsuranceApplicationInDB(BaseModel):
    userId: str  # User ID from auth token
    applicationNumber: str
    # Personal Information
    name: str
    email: str
    phone: str
    age: int
    gender: str
    occupation: str
    annualIncome: str
    smokingStatus: Optional[str] = None  # Smoking status
    existingConditions: Optional[str] = None  # Existing medical conditions
    
    # Coverage Details
    coverage: str
    term: Optional[int] = None  # Policy term in years
    nomineeRelation: str
    
    # Address Information
    address: str
    city: str
    state: str
    pincode: str
    
    # Documents
    aadhar: Optional[str] = None
    pan: Optional[str] = None
    photo: Optional[str] = None
    incomeProof: Optional[str] = None
    medicalReports: Optional[str] = None
    
    # Status
    status: ApplicationStatus = ApplicationStatus.submitted
    remarks: Optional[str] = None
    submittedAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

# Status Update Model
class StatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None
