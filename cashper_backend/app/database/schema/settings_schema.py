from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ===================== USER SETTINGS SCHEMAS =====================

class NotificationPreferences(BaseModel):
    """Notification preferences for user"""
    email: bool = Field(True, description="Enable email notifications")
    sms: bool = Field(True, description="Enable SMS notifications")
    push: bool = Field(False, description="Enable push notifications")


class UserSettings(BaseModel):
    """User settings model"""
    notificationPreferences: NotificationPreferences = Field(default_factory=NotificationPreferences)
    theme: str = Field("light", description="UI theme (light/dark)")
    twoFactorEnabled: bool = Field(False, description="2FA enabled status")


class UpdateSettingsRequest(BaseModel):
    """Request to update user settings"""
    notificationPreferences: Optional[NotificationPreferences] = None
    theme: Optional[str] = None


class SettingsResponse(BaseModel):
    """Settings response model"""
    notificationPreferences: NotificationPreferences
    theme: str
    twoFactorEnabled: bool


# ===================== 2FA SCHEMAS =====================

class Enable2FARequest(BaseModel):
    """Request to enable 2FA"""
    verificationCode: str = Field(..., description="6-digit verification code", min_length=6, max_length=6)


class Verify2FARequest(BaseModel):
    """Request to verify 2FA code"""
    code: str = Field(..., description="6-digit 2FA code", min_length=6, max_length=6)


class TwoFactorResponse(BaseModel):
    """2FA setup response"""
    secret: str = Field(..., description="2FA secret key")
    qrCode: str = Field(..., description="QR code data URL for authenticator app")
    backupCodes: list[str] = Field(..., description="Backup codes for account recovery")


# ===================== LOGIN HISTORY SCHEMAS =====================

class LoginHistoryEntry(BaseModel):
    """Single login history entry"""
    id: str = Field(..., description="Login session ID")
    device: str = Field(..., description="Device information")
    browser: str = Field(..., description="Browser information")
    location: str = Field(..., description="Login location (city, country)")
    ipAddress: str = Field(..., description="IP address")
    loginTime: datetime = Field(..., description="Login timestamp")
    isActive: bool = Field(..., description="Whether this is the current session")


class LoginHistoryResponse(BaseModel):
    """Login history response"""
    sessions: list[LoginHistoryEntry] = Field(..., description="List of login sessions")
    total: int = Field(..., description="Total number of sessions")


# ===================== ACCOUNT DATA SCHEMAS =====================

class DataDownloadRequest(BaseModel):
    """Request to download user data"""
    includeDocuments: bool = Field(True, description="Include uploaded documents")
    includeTransactions: bool = Field(True, description="Include transaction history")
    includeApplications: bool = Field(True, description="Include loan/insurance applications")


class DataDownloadResponse(BaseModel):
    """Data download response"""
    message: str = Field(..., description="Status message")
    requestId: str = Field(..., description="Download request ID")
    estimatedTime: str = Field(..., description="Estimated time for data preparation")


# ===================== ACCOUNT DELETION SCHEMAS =====================

class DeleteAccountRequest(BaseModel):
    """Request to delete account"""
    confirmation: str = Field(..., description="User must type 'DELETE' to confirm")
    password: Optional[str] = Field(None, description="Current password for verification")
    reason: Optional[str] = Field(None, description="Reason for account deletion")


class DeleteAccountResponse(BaseModel):
    """Account deletion response"""
    message: str = Field(..., description="Deletion status message")
    scheduledDate: datetime = Field(..., description="Date when account will be permanently deleted")
    cancellationPeriod: int = Field(..., description="Days within which deletion can be cancelled")


# ===================== SECURITY SCHEMAS =====================

class LogoutSessionRequest(BaseModel):
    """Request to logout a specific session"""
    sessionId: str = Field(..., description="Session ID to logout")


class LogoutAllSessionsResponse(BaseModel):
    """Response for logging out all sessions"""
    message: str = Field(..., description="Status message")
    sessionsLoggedOut: int = Field(..., description="Number of sessions terminated")


# ===================== THEME PREFERENCE SCHEMAS =====================

class UpdateThemeRequest(BaseModel):
    """Request to update theme preference"""
    theme: str = Field(..., description="Theme name (light/dark)")


class ThemeResponse(BaseModel):
    """Theme response"""
    theme: str = Field(..., description="Current theme")
    message: str = Field(..., description="Status message")
