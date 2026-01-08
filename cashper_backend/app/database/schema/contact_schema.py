from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
import re
from enum import Enum


class ContactStatus(str, Enum):
    """Status enum for contact submissions"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class ContactSubmissionRequest(BaseModel):
    """Schema for contact form submission request"""
    name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=10)
    subject: str = Field(..., min_length=3, max_length=200)
    message: str = Field(..., min_length=10, max_length=2000)

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name is required')
        if len(v.strip()) < 3:
            raise ValueError('Name must be at least 3 characters')
        return v.strip()

    @validator('phone')
    def validate_phone(cls, v):
        # Remove any spaces
        phone = v.replace(' ', '').replace('-', '')
        # Check if it's a valid 10-digit mobile number
        if not re.match(r'^\d{10}$', phone):
            raise ValueError('Invalid phone number (10 digits required)')
        return phone

    @validator('subject')
    def validate_subject(cls, v):
        if not v.strip():
            raise ValueError('Subject is required')
        return v.strip()

    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message is required')
        if len(v.strip()) < 10:
            raise ValueError('Message must be at least 10 characters')
        return v.strip()


class ContactSubmissionResponse(BaseModel):
    """Schema for contact submission response"""
    id: str
    name: str
    email: str
    phone: str
    subject: str
    message: str
    status: ContactStatus
    isRead: bool = False
    adminNotes: Optional[str] = None
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    resolvedAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContactSubmissionInDB(BaseModel):
    """Schema for contact submission stored in database"""
    name: str
    email: str
    phone: str
    subject: str
    message: str
    status: ContactStatus = ContactStatus.PENDING
    isRead: bool = False
    adminNotes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None
    resolvedAt: Optional[datetime] = None


class ContactUpdateStatusRequest(BaseModel):
    """Schema for updating contact submission status"""
    status: ContactStatus
    adminNotes: Optional[str] = None




class ContactStatisticsResponse(BaseModel):
    """Schema for contact statistics response"""
    total: int
    pending: int
    in_progress: int
    resolved: int
    closed: int
    unread: int
    today: int
    thisWeek: int
    thisMonth: int


class PaginatedContactResponse(BaseModel):
    """Schema for paginated contact submissions response"""
    data: List[ContactSubmissionResponse]
    total: int
    skip: int
    limit: int
    hasMore: bool
    
    class Config:
        from_attributes = True

