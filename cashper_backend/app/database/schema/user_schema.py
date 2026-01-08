from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
import re


class UserRegistrationRequest(BaseModel):
    """Schema for user registration request"""
    fullName: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=10)
    password: str = Field(..., min_length=8)
    confirmPassword: str
    agreeToTerms: bool

    @validator('fullName')
    def validate_full_name(cls, v):
        if not v.strip():
            raise ValueError('Full name cannot be empty')
        if len(v.strip()) < 3:
            raise ValueError('Name must be at least 3 characters')
        return v.strip()

    @validator('phone')
    def validate_phone(cls, v):
        # Remove any spaces
        phone = v.replace(' ', '')
        # Check if it's a valid 10-digit Indian mobile number
        if not re.match(r'^[6-9]\d{9}$', phone):
            raise ValueError('Please enter a valid 10-digit mobile number')
        return phone

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v

    @validator('confirmPassword')
    def validate_confirm_password(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

    @validator('agreeToTerms')
    def validate_terms(cls, v):
        if not v:
            raise ValueError('You must agree to the terms and conditions')
        return v


class UserLoginRequest(BaseModel):
    """Schema for user login request"""
    email: EmailStr
    password: str = Field(..., min_length=8)


class GoogleLoginRequest(BaseModel):
    """Schema for Google OAuth login"""
    token: str = Field(..., description="Google OAuth token")
    
    
class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Schema for reset password request"""
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    newPassword: str = Field(..., min_length=8)

    @validator('newPassword')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v


class UserResponse(BaseModel):
    """Schema for user response (without sensitive data)"""
    id: str
    fullName: str
    email: str
    phone: str
    role: str = "user"
    isAdmin: bool = False
    isEmailVerified: bool = False
    isPhoneVerified: bool = False
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserInDB(BaseModel):
    """Schema for user stored in database"""
    fullName: str
    email: str
    phone: str
    hashedPassword: Optional[str] = None  # Optional for Google OAuth users
    googleId: Optional[str] = None  # Google user ID
    authProvider: str = "email"  # "email" or "google"
    role: str = "user"  # "user" or "admin"
    isEmailVerified: bool = False
    isPhoneVerified: bool = False
    isActive: bool = True
    agreeToTerms: bool
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None


class TokenResponse(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UpdateProfileRequest(BaseModel):
    """Schema for updating user profile"""
    fullName: Optional[str] = Field(None, min_length=3, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=10)
    address: Optional[str] = None
    panCard: Optional[str] = None
    aadhar: Optional[str] = None
    dateOfBirth: Optional[str] = None
    occupation: Optional[str] = None
    annualIncome: Optional[str] = None

    @validator('fullName')
    def validate_full_name(cls, v):
        if v and not v.strip():
            raise ValueError('Full name cannot be empty')
        if v and len(v.strip()) < 3:
            raise ValueError('Name must be at least 3 characters')
        return v.strip() if v else v

    @validator('phone')
    def validate_phone(cls, v):
        if v:
            phone = v.replace(' ', '')
            if not re.match(r'^[6-9]\d{9}$', phone):
                raise ValueError('Please enter a valid 10-digit mobile number')
            return phone
        return v

    @validator('panCard')
    def validate_pan(cls, v):
        if v and not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', v):
            raise ValueError('Invalid PAN card format')
        return v


class ChangePasswordRequest(BaseModel):
    """Schema for changing password"""
    currentPassword: str = Field(...)
    newPassword: str = Field(..., min_length=8)
    confirmPassword: str

    @validator('newPassword')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', v):
            raise ValueError('Password must contain at least one special character')
        return v

    @validator('confirmPassword')
    def validate_confirm_password(cls, v, values):
        if 'newPassword' in values and v != values['newPassword']:
            raise ValueError('Passwords do not match')
        return v


class UserProfileResponse(BaseModel):
    """Extended user profile response"""
    id: str
    fullName: str
    email: str
    phone: str
    role: str = "user"
    profileImage: Optional[str] = None
    address: Optional[str] = None
    panCard: Optional[str] = None
    aadhar: Optional[str] = None
    dateOfBirth: Optional[str] = None
    occupation: Optional[str] = None
    annualIncome: Optional[str] = None
    bio: Optional[str] = None
    department: Optional[str] = None
    isEmailVerified: bool = False
    isPhoneVerified: bool = False
    authProvider: str = "email"
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    lastLogin: Optional[datetime] = None

    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    """Schema for document upload response"""
    id: str
    documentType: str
    fileName: str
    filePath: str
    category: str
    verificationStatus: str = "pending"
    uploadedAt: datetime

    class Config:
        from_attributes = True


class UserDocumentResponse(BaseModel):
    """Schema for user document in response"""
    id: str
    documentType: str
    fileName: str
    filePath: str
    category: str
    verificationStatus: str
    uploadedAt: datetime
    verifiedAt: Optional[datetime] = None

    class Config:
        from_attributes = True

