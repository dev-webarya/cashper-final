from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# ==================== STATUS UPDATE ====================

class StatusUpdate(BaseModel):
    """Schema for updating application status"""
    status: str = Field(..., description="New status: pending, under review, approved, rejected, disbursed")
    rejectionReason: Optional[str] = Field(None, description="Reason for rejection if status is rejected")
    reason: Optional[str] = Field(None, description="Alternative field name for rejection reason")
    
    class Config:
        populate_by_name = True

# ==================== GET IN TOUCH ====================

class ShortTermGetInTouchCreate(BaseModel):
    """Schema for Short Term Loan GET IN TOUCH form"""
    fullName: str = Field(..., min_length=2, max_length=100, alias="full_name")
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    loanAmount: float = Field(..., ge=10000, le=500000, alias="loan_amount")
    userId: Optional[str] = Field(None, alias="user_id")
    
    class Config:
        populate_by_name = True

class ShortTermGetInTouchResponse(BaseModel):
    """Response schema for GET IN TOUCH"""
    id: str
    fullName: str
    email: str
    phone: str
    loanAmount: float
    userId: Optional[str] = None
    status: str = "pending"
    createdAt: datetime
    
    class Config:
        from_attributes = True


# ==================== SHORT TERM LOAN APPLICATION ====================

class ShortTermLoanApplicationCreate(BaseModel):
    """Schema for Short Term Loan Application"""
    # Step 1: Personal & Reference Information
    fullName: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    relativeName: str = Field(..., min_length=2, max_length=100)
    relativeRelation: str
    relativePhone: str = Field(..., min_length=10, max_length=15)
    
    # Step 2: Loan Information
    loanAmount: str  # Changed to string to match frontend
    purpose: str
    employment: str
    monthlyIncome: str  # Changed to string to match frontend
    companyName: Optional[str] = None
    workExperience: Optional[str] = None
    creditScore: Optional[str] = None  # Added missing field
    
    # Step 3: Address & KYC
    panNumber: str = Field(..., min_length=10, max_length=10)
    aadharNumber: str = Field(..., min_length=12, max_length=12)
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str = Field(..., min_length=6, max_length=6)
    
    # Documents (optional filenames)
    aadhar: Optional[str] = None
    pan: Optional[str] = None
    bankStatement: Optional[str] = None
    salarySlip: Optional[str] = None
    photo: Optional[str] = None
    
    # Optional - Track user if logged in
    userId: Optional[str] = None

class ShortTermLoanApplicationUpdate(BaseModel):
    """Schema for updating loan application status"""
    status: Optional[str] = None
    notes: Optional[str] = None

class ShortTermLoanApplicationResponse(BaseModel):
    """Response schema for Short Term Loan Application"""
    id: str
    applicationId: str
    fullName: str
    email: str
    phone: str
    relativeName: str
    relativeRelation: str
    relativePhone: str
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
    status: str = "pending"
    notes: Optional[str] = None
    createdAt: datetime
    
    class Config:
        from_attributes = True


# ==================== ELIGIBILITY CRITERIA ====================

class EligibilityCriteriaCreate(BaseModel):
    """Schema for creating eligibility criteria"""
    label: str = Field(..., min_length=2, max_length=100)
    value: str = Field(..., min_length=2, max_length=200)
    order: int = Field(default=0)

class EligibilityCriteriaUpdate(BaseModel):
    """Schema for updating eligibility criteria"""
    label: Optional[str] = None
    value: Optional[str] = None
    order: Optional[int] = None

class EligibilityCriteriaResponse(BaseModel):
    """Response schema for eligibility criteria"""
    id: str
    label: str
    value: str
    order: int
    createdAt: datetime
    
    class Config:
        from_attributes = True
