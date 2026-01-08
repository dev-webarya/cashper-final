from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

# Enums
class VehicleType(str, Enum):
    car = "car"
    bike = "bike"
    commercial = "commercial"

class PolicyType(str, Enum):
    third_party = "third_party"
    comprehensive = "comprehensive"

class InquiryStatus(str, Enum):
    pending = "pending"
    contacted = "contacted"
    converted = "converted"
    closed = "closed"

class ApplicationStatus(str, Enum):
    submitted = "submitted"
    under_review = "under_review"
    documents_pending = "documents_pending"
    inspection_pending = "inspection_pending"
    approved = "approved"
    rejected = "rejected"
    policy_issued = "policy_issued"

# Contact Inquiry Models
class MotorInsuranceInquiryRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    age: int = Field(..., ge=18, le=100)
    vehicleType: str
    vehicleModel: Optional[str] = Field(default="", max_length=100)
    registrationNumber: Optional[str] = Field(None, max_length=20)

class MotorInsuranceInquiryResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    age: int
    vehicleType: str
    vehicleModel: str
    registrationNumber: Optional[str]
    status: InquiryStatus
    createdAt: datetime
    message: str

class MotorInsuranceInquiryInDB(BaseModel):
    name: str
    email: str
    phone: str
    age: int
    vehicleType: str
    vehicleModel: str
    registrationNumber: Optional[str] = None
    status: InquiryStatus = InquiryStatus.pending
    remarks: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

# Application Models
class MotorInsuranceApplicationRequest(BaseModel):
    # Personal Information
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    age: int = Field(..., ge=18, le=100)
    
    # Vehicle Details
    vehicleType: str
    registrationNumber: str = Field(..., min_length=3, max_length=20)
    makeModel: str = Field(..., min_length=2, max_length=100)
    manufacturingYear: int = Field(..., ge=1950, le=2030)
    vehicleValue: float = Field(..., gt=0)
    policyType: str
    
    # Address Information
    address: str = Field(..., min_length=10, max_length=500)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    pincode: str = Field(..., min_length=6, max_length=10)
    
    # Document filenames (files uploaded separately)
    rc: Optional[str] = None
    dl: Optional[str] = None
    vehiclePhotos: Optional[str] = None
    previousPolicy: Optional[str] = None
    addressProof: Optional[str] = None

class MotorInsuranceApplicationResponse(BaseModel):
    id: str
    applicationNumber: str
    # Personal Information
    name: str
    email: str
    phone: str
    age: int
    
    # Vehicle Details
    vehicleType: str
    registrationNumber: str
    makeModel: str
    manufacturingYear: int
    vehicleValue: float
    policyType: str
    
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
    rc: Optional[str] = None
    dl: Optional[str] = None
    vehiclePhotos: Optional[str] = None
    previousPolicy: Optional[str] = None
    addressProof: Optional[str] = None

class MotorInsuranceApplicationInDB(BaseModel):
    userId: str  # User ID from auth token
    applicationNumber: str
    # Personal Information
    name: str
    email: str
    phone: str
    age: int
    
    # Vehicle Details
    vehicleType: str
    registrationNumber: str
    makeModel: str
    manufacturingYear: int
    vehicleValue: float
    policyType: str
    
    # Address Information
    address: str
    city: str
    state: str
    pincode: str
    
    # Documents
    rc: Optional[str] = None
    dl: Optional[str] = None
    vehiclePhotos: Optional[str] = None
    previousPolicy: Optional[str] = None
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
