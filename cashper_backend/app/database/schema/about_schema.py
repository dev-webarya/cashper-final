from pydantic import BaseModel, Field, validator, HttpUrl
from typing import Optional
from datetime import datetime


# ===================== TESTIMONIAL SCHEMAS =====================

class TestimonialRequest(BaseModel):
    """Schema for testimonial creation/update request"""
    name: str = Field(..., min_length=3, max_length=100)
    position: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=3, max_length=100)
    image: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    text: str = Field(..., min_length=20, max_length=1000)
    loanType: str = Field(..., min_length=5, max_length=100)
    timeframe: str = Field(..., min_length=5, max_length=50)
    isActive: bool = True
    order: int = Field(default=0, ge=0)

    @validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v


class TestimonialResponse(BaseModel):
    """Schema for testimonial response"""
    id: str
    name: str
    position: str
    location: str
    image: Optional[str]
    rating: int
    text: str
    loanType: str
    timeframe: str
    isActive: bool
    order: int
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class TestimonialInDB(BaseModel):
    """Schema for testimonial stored in database"""
    name: str
    position: str
    location: str
    image: Optional[str]
    rating: int
    text: str
    loanType: str
    timeframe: str
    isActive: bool = True
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None


# ===================== ACHIEVEMENT SCHEMAS =====================

class AchievementRequest(BaseModel):
    """Schema for achievement creation/update request"""
    title: str = Field(..., min_length=5, max_length=200)
    organization: str = Field(..., min_length=3, max_length=200)
    year: str = Field(..., min_length=4, max_length=4)
    description: str = Field(..., min_length=20, max_length=500)
    icon: Optional[str] = None
    isActive: bool = True
    order: int = Field(default=0, ge=0)

    @validator('year')
    def validate_year(cls, v):
        if not v.isdigit() or len(v) != 4:
            raise ValueError('Year must be a 4-digit number')
        year_int = int(v)
        if year_int < 2000 or year_int > 2100:
            raise ValueError('Year must be between 2000 and 2100')
        return v


class AchievementResponse(BaseModel):
    """Schema for achievement response"""
    id: str
    title: str
    organization: str
    year: str
    description: str
    icon: Optional[str]
    isActive: bool
    order: int
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class AchievementInDB(BaseModel):
    """Schema for achievement stored in database"""
    title: str
    organization: str
    year: str
    description: str
    icon: Optional[str]
    isActive: bool = True
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None


# ===================== STAT SCHEMAS =====================

class StatRequest(BaseModel):
    """Schema for stat creation/update request"""
    label: str = Field(..., min_length=3, max_length=50)
    value: str = Field(..., min_length=1, max_length=50)
    icon: Optional[str] = None
    color: Optional[str] = None
    isActive: bool = True
    order: int = Field(default=0, ge=0)


class StatResponse(BaseModel):
    """Schema for stat response"""
    id: str
    label: str
    value: str
    icon: Optional[str]
    color: Optional[str]
    isActive: bool
    order: int
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class StatInDB(BaseModel):
    """Schema for stat stored in database"""
    label: str
    value: str
    icon: Optional[str]
    color: Optional[str]
    isActive: bool = True
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None


# ===================== MILESTONE SCHEMAS =====================

class MilestoneRequest(BaseModel):
    """Schema for milestone creation/update request"""
    year: str = Field(..., min_length=4, max_length=4)
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=500)
    icon: Optional[str] = None
    isActive: bool = True
    order: int = Field(default=0, ge=0)

    @validator('year')
    def validate_year(cls, v):
        if not v.isdigit() or len(v) != 4:
            raise ValueError('Year must be a 4-digit number')
        year_int = int(v)
        if year_int < 2000 or year_int > 2100:
            raise ValueError('Year must be between 2000 and 2100')
        return v


class MilestoneResponse(BaseModel):
    """Schema for milestone response"""
    id: str
    year: str
    title: str
    description: str
    icon: Optional[str]
    isActive: bool
    order: int
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class MilestoneInDB(BaseModel):
    """Schema for milestone stored in database"""
    year: str
    title: str
    description: str
    icon: Optional[str]
    isActive: bool = True
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None



