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

class BusinessLoanGetInTouchCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    loanAmount: str  # Keep as string to match frontend
    message: Optional[str] = Field(default="", max_length=500)
    userId: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Rajesh Kumar",
                "email": "rajesh@example.com",
                "phone": "9876543210",
                "loanAmount": "2500000",
                "message": "Need working capital loan for business expansion",
                "userId": "user123"
            }
        }

class BusinessLoanGetInTouchResponse(BaseModel):
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

class BusinessLoanGetInTouchInDB(BaseModel):
    name: str
    email: str
    phone: str
    loanAmount: str
    message: Optional[str] = None
    userId: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

# ============ APPLICATION SCHEMAS ============

class BusinessLoanApplicationCreate(BaseModel):
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
                "fullName": "Rajesh Kumar",
                "email": "rajesh@example.com",
                "phone": "9876543210",
                "loanAmount": "2500000",
                "purpose": "expansion",
                "employment": "business",
                "monthlyIncome": "150000",
                "companyName": "Kumar Enterprises",
                "workExperience": "10",
                "creditScore": "750",
                "panNumber": "ABCDE1234F",
                "aadharNumber": "123456789012",
                "address": "456 Business Park",
                "city": "Delhi",
                "state": "Delhi",
                "pincode": "110001",
                "aadhar": "aadhar.pdf",
                "pan": "pan.pdf",
                "bankStatement": "bank.pdf",
                "salarySlip": "income.pdf",
                "photo": "photo.jpg"
            }
        }

class BusinessLoanApplicationResponse(BaseModel):
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

class BusinessLoanApplicationInDB(BaseModel):
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
