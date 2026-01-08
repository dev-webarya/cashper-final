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

class PersonalLoanGetInTouchCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    loanAmount: str  # Keep as string to match frontend
    message: Optional[str] = Field(default="", max_length=500)
    userId: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Amit Patel",
                "email": "amit@example.com",
                "phone": "9876543210",
                "loanAmount": "500000",
                "message": "I need a personal loan for medical emergency",
                "userId": "user123"
            }
        }

class PersonalLoanGetInTouchResponse(BaseModel):
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

class PersonalLoanGetInTouchInDB(BaseModel):
    name: str
    email: str
    phone: str
    loanAmount: str
    message: Optional[str] = None
    userId: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

# ============ APPLICATION SCHEMAS ============

class PersonalLoanApplicationCreate(BaseModel):
    # Step 1: Personal Information
    fullName: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    
    # Step 2: Loan Information
    loanAmount: str  # Keep as string
    purpose: Optional[str] = ""
    employment: Optional[str] = ""
    monthlyIncome: Optional[str] = ""  # Keep as string
    companyName: Optional[str] = ""
    workExperience: Optional[str] = ""
    creditScore: Optional[str] = ""
    
    # Step 3: Address & KYC
    panNumber: Optional[str] = ""
    aadharNumber: Optional[str] = ""
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    pincode: Optional[str] = ""
    
    # Step 4: Documents (individual fields)
    aadhar: Optional[str] = ""
    pan: Optional[str] = ""
    bankStatement: Optional[str] = ""
    salarySlip: Optional[str] = ""
    photo: Optional[str] = ""
    
    # Legacy documents field for backwards compatibility
    documents: Optional[str] = ""
    
    userId: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "fullName": "Amit Patel",
                "email": "amit@example.com",
                "phone": "9876543210",
                "loanAmount": "500000",
                "purpose": "wedding",
                "employment": "salaried",
                "monthlyIncome": "50000",
                "companyName": "Infosys",
                "workExperience": "3",
                "creditScore": "720",
                "panNumber": "ABCDE1234F",
                "aadharNumber": "123456789012",
                "address": "789 Park Street",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001",
                "aadhar": "/uploads/aadhar.pdf",
                "pan": "/uploads/pan.pdf",
                "bankStatement": "/uploads/bank.pdf",
                "salarySlip": "/uploads/salary.pdf",
                "photo": "/uploads/photo.jpg"
            }
        }

class PersonalLoanApplicationResponse(BaseModel):
    id: str
    fullName: str
    email: str
    phone: str
    loanAmount: str
    purpose: Optional[str] = ""
    employment: Optional[str] = ""
    monthlyIncome: Optional[str] = ""
    companyName: Optional[str] = ""
    workExperience: Optional[str] = ""
    creditScore: Optional[str] = ""
    panNumber: Optional[str] = ""
    aadharNumber: Optional[str] = ""
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    pincode: Optional[str] = ""
    documents: Optional[str] = ""  # Combined/formatted documents field
    userId: Optional[str] = None
    applicationId: str
    status: str
    createdAt: datetime

    class Config:
        from_attributes = True

class PersonalLoanApplicationInDB(BaseModel):
    fullName: str
    email: str
    phone: str
    loanAmount: str
    purpose: Optional[str] = ""
    employment: Optional[str] = ""
    monthlyIncome: Optional[str] = ""
    companyName: Optional[str] = ""
    workExperience: Optional[str] = ""
    creditScore: Optional[str] = ""
    panNumber: Optional[str] = ""
    aadharNumber: Optional[str] = ""
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    pincode: Optional[str] = ""
    
    # Individual document fields
    aadhar: Optional[str] = ""
    pan: Optional[str] = ""
    bankStatement: Optional[str] = ""
    salarySlip: Optional[str] = ""
    photo: Optional[str] = ""
    
    # Legacy documents field
    documents: Optional[str] = ""
    
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
