from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

# Enums
class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class PolicyType(str, Enum):
    individual = "individual"
    family_floater = "family_floater"
    senior_citizen = "senior_citizen"
    critical_illness = "critical_illness"

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
class HealthInsuranceInquiryRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    age: int = Field(..., ge=1, le=100)
    familySize: int = Field(..., ge=1, le=20)
    coverageAmount: Optional[str] = None

class HealthInsuranceInquiryResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    age: int
    familySize: int
    coverageAmount: Optional[str]
    status: InquiryStatus
    createdAt: datetime
    message: str

class HealthInsuranceInquiryInDB(BaseModel):
    name: str
    email: str
    phone: str
    age: int
    familySize: int
    coverageAmount: Optional[str]
    status: InquiryStatus = InquiryStatus.pending
    remarks: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

# Application Models
class HealthInsuranceApplicationRequest(BaseModel):
    # Personal Information
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    age: int = Field(..., ge=1, le=100)
    gender: str
    
    # Policy Details
    familySize: int = Field(..., ge=1, le=20)
    coverageAmount: str
    policyType: str
    existingConditions: Optional[str] = None
    
    # Address Information
    address: str = Field(..., min_length=10, max_length=500)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=6, max_length=10)
    
    # Document filenames (files uploaded separately)
    aadhar: Optional[str] = None
    pan: Optional[str] = None
    photo: Optional[str] = None
    medicalReports: Optional[str] = None
    addressProof: Optional[str] = None

class HealthInsuranceApplicationResponse(BaseModel):
    id: str
    applicationNumber: str
    # Personal Information
    name: str
    email: str
    phone: str
    age: int
    gender: str
    
    # Policy Details
    familySize: int
    coverageAmount: str
    policyType: str
    existingConditions: Optional[str] = None
    
    # Address Information
    address: str
    city: str
    state: str
    pincode: str
    
    # Status and Metadata
    status: ApplicationStatus
    submittedAt: datetime
    message: str
    userId: Optional[str] = None
    remarks: Optional[str] = None
    
    # Documents
    aadhar: Optional[str] = None
    pan: Optional[str] = None
    photo: Optional[str] = None
    medicalReports: Optional[str] = None
    addressProof: Optional[str] = None

class HealthInsuranceApplicationInDB(BaseModel):
    userId: str  # User ID from auth token
    applicationNumber: str
    # Personal Information
    name: str
    email: str
    phone: str
    age: int
    gender: str
    
    # Policy Details
    familySize: int
    coverageAmount: str
    policyType: str
    existingConditions: Optional[str] = None
    
    # Address Information
    address: str
    city: str
    state: str
    pincode: str
    
    # Documents
    aadhar: Optional[str] = None
    pan: Optional[str] = None
    photo: Optional[str] = None
    medicalReports: Optional[str] = None
    addressProof: Optional[str] = None
    
    # Status
    status: ApplicationStatus = ApplicationStatus.submitted
    remarks: Optional[str] = None
    submittedAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

# Status Update Model
class StatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None