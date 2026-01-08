from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, timezone

# ===================== FINANCIAL SERVICE SCHEMAS =====================

class ServiceItem(BaseModel):
    """Schema for individual service item"""
    name: str = Field(..., min_length=2, max_length=100)
    path: str = Field(..., min_length=1, max_length=200)

class FinancialServiceRequest(BaseModel):
    """Schema for financial service creation/update request"""
    category: str = Field(..., min_length=2, max_length=100)
    icon: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=10, max_length=500)
    items: List[ServiceItem] = Field(..., min_items=1, max_items=10)
    features: List[str] = Field(..., min_items=1, max_items=10)
    color: str = Field(..., min_length=5, max_length=100)
    bgColor: str = Field(..., min_length=5, max_length=100)
    textColor: str = Field(..., min_length=5, max_length=100)
    link: str = Field(..., min_length=1, max_length=200)
    stats: str = Field(..., min_length=2, max_length=100)
    isActive: bool = True 
    order: int = Field(default=0, ge=0)

    @validator('category')
    def validate_category(cls, v):
        if not v.strip():
            raise ValueError('Category cannot be empty')
        return v.strip()

class FinancialServiceResponse(BaseModel):
    """Schema for financial service response"""
    id: str
    category: str
    icon: str
    description: str
    items: List[dict]
    features: List[str]
    color: str
    bgColor: str
    textColor: str
    link: str
    stats: str
    isActive: bool
    order: int
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True

class FinancialServiceInDB(BaseModel):
    """Schema for financial service stored in database"""
    category: str
    icon: str
    description: str
    items: List[dict]
    features: List[str]
    color: str
    bgColor: str
    textColor: str
    link: str
    stats: str
    isActive: bool = True
    order: int = 0
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: Optional[datetime] = None

# ===================== FINANCIAL PRODUCT SCHEMAS =====================

class FinancialProductRequest(BaseModel):
    """Schema for financial product creation/update request"""
    title: str = Field(..., min_length=3, max_length=200)
    subtitle: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=1000)
    features: List[str] = Field(..., min_items=1, max_items=10)
    amount: str = Field(..., min_length=2, max_length=100)
    type: str = Field(..., min_length=3, max_length=50)  # loan, insurance, investment, tax
    color: str = Field(..., min_length=5, max_length=100)
    bgColor: str = Field(..., min_length=5, max_length=100)
    textColor: str = Field(..., min_length=5, max_length=100)
    link: str = Field(..., min_length=1, max_length=200)
    interestRate: Optional[str] = Field(None, max_length=100)
    rateLabel: Optional[str] = Field(None, max_length=100)
    isActive: bool = True
    isFeatured: bool = False
    order: int = Field(default=0, ge=0)

    @validator('type')
    def validate_type(cls, v):
        allowed_types = ['loan', 'insurance', 'investment', 'tax']
        if v.lower() not in allowed_types:
            raise ValueError(f'Type must be one of: {", ".join(allowed_types)}')
        return v.lower()

    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()
    
    @validator('features')
    def validate_features(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one feature is required')
        # Check each feature is non-empty
        for idx, feature in enumerate(v):
            if not feature or not feature.strip():
                raise ValueError(f'Feature at index {idx} cannot be empty')
        return v

class FinancialProductResponse(BaseModel):
    """Schema for financial product response"""
    id: str
    title: str
    subtitle: str
    description: str
    features: List[str]
    amount: str
    type: str
    color: str
    bgColor: str
    textColor: str
    link: str
    interestRate: Optional[str]
    rateLabel: Optional[str]
    isActive: bool
    isFeatured: bool
    order: int
    views: int
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True

class FinancialProductInDB(BaseModel):
    """Schema for financial product stored in database"""
    title: str
    subtitle: str
    description: str
    features: List[str]
    amount: str
    type: str
    color: str
    bgColor: str
    textColor: str
    link: str
    interestRate: Optional[str]
    rateLabel: Optional[str]
    isActive: bool = True
    isFeatured: bool = False
    order: int = 0
    views: int = 0
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: Optional[datetime] = None