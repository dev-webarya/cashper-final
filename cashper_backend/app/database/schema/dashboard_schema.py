from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
import re


class DashboardSupportRequest(BaseModel):
    """Schema for dashboard contact support submission"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=10)
    issue: str = Field(..., min_length=10, max_length=500)

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name is required')
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters')
        if not re.match(r'^[a-zA-Z\s]+$', v):
            raise ValueError('Name should only contain letters')
        return v.strip()

    @validator('phone')
    def validate_phone(cls, v):
        # Remove any spaces
        phone = v.replace(' ', '').replace('-', '')
        # Check if it's a valid 10-digit mobile number
        if not re.match(r'^\d{10}$', phone):
            raise ValueError('Phone number must be exactly 10 digits')
        return phone

    @validator('issue')
    def validate_issue(cls, v):
        if not v.strip():
            raise ValueError('Issue description is required')
        if len(v.strip()) < 10:
            raise ValueError('Issue description must be at least 10 characters')
        if len(v.strip()) > 500:
            raise ValueError('Issue description must not exceed 500 characters')
        return v.strip()


class DashboardSupportResponse(BaseModel):
    """Schema for dashboard support response"""
    id: str
    userId: str
    name: str
    email: str
    phone: str
    issue: str
    status: str = "pending"
    createdAt: datetime
    resolvedAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class DashboardSupportInDB(BaseModel):
    """Schema for dashboard support stored in database"""
    userId: str
    name: str
    email: str
    phone: str
    issue: str
    status: str = "pending"
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    resolvedAt: Optional[datetime] = None


class DocumentUploadRequest(BaseModel):
    """Schema for document upload metadata"""
    documentType: str = Field(..., description="Type of document (PAN, Aadhar, etc.)")
    category: Optional[str] = Field("general", description="Document category")


class DocumentUploadResponse(BaseModel):
    """Schema for document upload response"""
    id: str
    userId: str
    documentType: str
    fileName: str
    filePath: str
    fileUrl: str
    category: str
    fileSize: int
    mimeType: str
    uploadedAt: datetime

    class Config:
        from_attributes = True


class DocumentInDB(BaseModel):
    """Schema for document stored in database"""
    userId: str
    documentType: str
    fileName: str
    filePath: str
    fileUrl: str
    category: str
    fileSize: int
    mimeType: str
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)


class UserDocumentListResponse(BaseModel):
    """Schema for listing user documents"""
    documents: List[DocumentUploadResponse]
    total: int

    class Config:
        from_attributes = True


class DeleteDocumentResponse(BaseModel):
    """Schema for document deletion response"""
    message: str
    success: bool
