"""
Insurance Policy Schema for Admin Management
Combines all insurance types (Term, Health, Motor) with unified policy management
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

# Enums
class InsuranceType(str, Enum):
    term_insurance = "Term Insurance"
    health_insurance = "Health Insurance"
    motor_insurance = "Motor Insurance"

class PolicyStatus(str, Enum):
    active = "Active"
    pending = "Pending"
    expired = "Expired"
    cancelled = "Cancelled"

# Insurance Policy Model (Complete model for admin management)
class InsurancePolicy(BaseModel):
    """Complete insurance policy model matching frontend requirements"""
    # Policy Identification
    id: str  # Policy ID (e.g., INS001)
    
    # Customer Details
    customer: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    
    # Policy Details
    type: InsuranceType  # Term, Health, or Motor
    premium: str  # e.g., "₹12,000/year"
    coverage: str  # e.g., "₹1 Crore"
    status: PolicyStatus
    
    # Dates
    startDate: str  # Format: YYYY-MM-DD
    endDate: str  # Format: YYYY-MM-DD
    
    # Additional Information
    nominee: str = Field(..., min_length=2, max_length=100)
    documents: List[str] = Field(default_factory=list)
    
    # Metadata
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

class InsurancePolicyInDB(BaseModel):
    """Database model for insurance policies"""
    # Policy Identification
    policyId: str  # Unique policy ID
    
    # Customer Details
    customer: str
    email: str
    phone: str
    
    # Policy Details
    type: str  # "Term Insurance", "Health Insurance", "Motor Insurance"
    premium: str
    coverage: str
    status: str  # "Active", "Pending", "Expired", "Cancelled"
    
    # Dates
    startDate: str
    endDate: str
    
    # Additional Information
    nominee: str
    documents: List[str] = Field(default_factory=list)
    
    # Metadata
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

class InsurancePolicyCreate(BaseModel):
    """Model for creating a new policy"""
    customer: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    type: InsuranceType
    premium: str
    coverage: str
    startDate: str
    endDate: str
    nominee: str = Field(..., min_length=2, max_length=100)
    documents: List[str] = Field(default_factory=list)
    status: PolicyStatus = PolicyStatus.pending

class InsurancePolicyUpdate(BaseModel):
    """Model for updating policy details"""
    customer: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    type: Optional[InsuranceType] = None
    premium: Optional[str] = None
    coverage: Optional[str] = None
    status: Optional[PolicyStatus] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    nominee: Optional[str] = None
    documents: Optional[List[str]] = None

class PolicyStatusUpdate(BaseModel):
    """Model for updating only policy status"""
    status: PolicyStatus
    remarks: Optional[str] = None

class InsurancePolicyResponse(BaseModel):
    """Response model for policy operations"""
    id: str
    customer: str
    email: str
    phone: str
    type: str
    premium: str
    coverage: str
    status: str
    startDate: str
    endDate: str
    nominee: str
    documents: List[str]
    message: Optional[str] = None

class InsurancePolicyListResponse(BaseModel):
    """Response model for list of policies"""
    total: int
    policies: List[dict]
    page: Optional[int] = None
    limit: Optional[int] = None

class InsuranceStatistics(BaseModel):
    """Statistics model for dashboard"""
    totalPolicies: int
    activePolicies: int
    pendingPolicies: int
    expiredPolicies: int
    totalClaims: int
    premiumCollected: str
    
    # Type-wise breakdown
    termInsuranceCount: int
    healthInsuranceCount: int
    motorInsuranceCount: int

class InsuranceFilterParams(BaseModel):
    """Filter parameters for policy search"""
    type: Optional[str] = None
    status: Optional[str] = None
    searchTerm: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    skip: int = 0
    limit: int = 100
