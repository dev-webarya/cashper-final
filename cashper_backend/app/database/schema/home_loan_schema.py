from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId

# ============ STATUS UPDATE SCHEMAS ============

class StatusUpdate(BaseModel):
    """Schema for updating application status"""
    status: str = Field(..., description="New status: pending, under review, approved, rejected, disbursed")
    rejectionReason: Optional[str] = Field(None, description="Reason for rejection if status is rejected")
    reason: Optional[str] = Field(None, description="Alternative field name for rejection reason")
    
    class Config:
        populate_by_name = True

# ============ GET IN TOUCH SCHEMAS ============

class HomeLoanGetInTouchCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    loanAmount: str  # Keep as string to match frontend
    message: Optional[str] = Field(default="", max_length=500)
    userId: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Rahul Sharma",
                "email": "rahul@example.com",
                "phone": "9876543210",
                "loanAmount": "5000000",
                "message": "Looking for home loan with low interest rate",
                "userId": "user123"
            }
        }

class HomeLoanGetInTouchResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    loanAmount: str
    message: Optional[str] = None
    userId: Optional[str] = None
    createdAt: datetime

    class Config:
        from_attributes = True

class HomeLoanGetInTouchInDB(BaseModel):
    name: str
    email: str
    phone: str
    loanAmount: str
    message: Optional[str] = None
    userId: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

# ============ APPLICATION SCHEMAS ============

class HomeLoanApplicationCreate(BaseModel):
    # Step 1: Personal Information
    fullName: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    
    # Step 2: Loan Information
    loanAmount: str  # Keep as string
    purpose: str
    employment: str
    monthlyIncome: str  # Keep as string
    companyName: Optional[str] = None
    workExperience: Optional[str] = None
    creditScore: Optional[str] = None
    
    # Step 3: Address & KYC
    panNumber: str = Field(..., min_length=10, max_length=10)
    aadharNumber: str = Field(..., min_length=12, max_length=12)
    address: str
    city: str
    state: str
    pincode: str = Field(..., min_length=6, max_length=6)
    
    # Step 4: Documents (filenames)
    aadhar: Optional[str] = None
    pan: Optional[str] = None
    bankStatement: Optional[str] = None
    salarySlip: Optional[str] = None
    photo: Optional[str] = None
    
    userId: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "fullName": "Rahul Sharma",
                "email": "rahul@example.com",
                "phone": "9876543210",
                "loanAmount": "5000000",
                "purpose": "purchase",
                "employment": "salaried",
                "monthlyIncome": "75000",
                "companyName": "TCS",
                "workExperience": "5",
                "creditScore": "750",
                "panNumber": "ABCDE1234F",
                "aadharNumber": "123456789012",
                "address": "123 MG Road",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001",
                "aadhar": "aadhar.pdf",
                "pan": "pan.pdf",
                "bankStatement": "bank.pdf",
                "salarySlip": "salary.pdf",
                "photo": "photo.jpg"
            }
        }

class HomeLoanApplicationResponse(BaseModel):
    id: str
    fullName: str
    email: str
    phone: str
    loanAmount: str
    purpose: str
    employment: str
    monthlyIncome: str
    companyName: Optional[str] = None
    workExperience: Optional[str] = None
    creditScore: Optional[str] = None
    panNumber: str
    aadharNumber: str
    address: str
    city: str
    state: str
    pincode: str
    aadhar: Optional[str] = None
    pan: Optional[str] = None
    bankStatement: Optional[str] = None
    salarySlip: Optional[str] = None
    photo: Optional[str] = None
    userId: Optional[str] = None
    applicationId: str
    status: str
    createdAt: datetime

    class Config:
        from_attributes = True

class HomeLoanApplicationInDB(BaseModel):
    fullName: str
    email: str
    phone: str
    loanAmount: str
    purpose: str
    employment: str
    monthlyIncome: str
    companyName: Optional[str] = None
    workExperience: Optional[str] = None
    creditScore: Optional[str] = None
    panNumber: str
    aadharNumber: str
    address: str
    city: str
    state: str
    pincode: str
    aadhar: Optional[str] = None
    pan: Optional[str] = None
    bankStatement: Optional[str] = None
    salarySlip: Optional[str] = None
    photo: Optional[str] = None
    userId: Optional[str] = None
    application_id: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.now)

# ============ ELIGIBILITY CRITERIA SCHEMAS ============

class EligibilityCriteriaResponse(BaseModel):
    id: str
    label: str
    value: str
    order: int = 0
    createdAt: datetime

    class Config:
        from_attributes = True

class EligibilityCriteriaInDB(BaseModel):
    label: str
    value: str
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
