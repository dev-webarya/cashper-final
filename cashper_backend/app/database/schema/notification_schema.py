from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


class NotificationCreateRequest(BaseModel):
    """Schema for admin creating notification"""
    title: str = Field(..., min_length=3, max_length=200, description="Notification title")
    message: str = Field(..., min_length=10, max_length=1000, description="Notification message")
    type: str = Field(..., description="Type: info, warning, success, error")
    targetUsers: Optional[List[str]] = Field(None, description="Specific user IDs (empty for all users)")
    priority: Optional[str] = Field("normal", description="Priority: low, normal, high, urgent")
    expiresAt: Optional[datetime] = Field(None, description="Expiration date for notification")
    link: Optional[str] = Field(None, description="Optional link for notification")
    
    @validator('type')
    def validate_type(cls, v):
        valid_types = ['info', 'warning', 'success', 'error', 'announcement', 'update', 'alert']
        if v not in valid_types:
            raise ValueError(f'Type must be one of: {", ".join(valid_types)}')
        return v
    
    @validator('priority')
    def validate_priority(cls, v):
        valid_priorities = ['low', 'normal', 'high', 'urgent']
        if v not in valid_priorities:
            raise ValueError(f'Priority must be one of: {", ".join(valid_priorities)}')
        return v


class NotificationUpdateRequest(BaseModel):
    """Schema for admin updating notification"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    message: Optional[str] = Field(None, min_length=10, max_length=1000)
    type: Optional[str] = None
    priority: Optional[str] = None
    expiresAt: Optional[datetime] = None
    link: Optional[str] = None
    isActive: Optional[bool] = None
    
    @validator('type')
    def validate_type(cls, v):
        if v is not None:
            valid_types = ['info', 'warning', 'success', 'error', 'announcement', 'update', 'alert']
            if v not in valid_types:
                raise ValueError(f'Type must be one of: {", ".join(valid_types)}')
        return v
    
    @validator('priority')
    def validate_priority(cls, v):
        if v is not None:
            valid_priorities = ['low', 'normal', 'high', 'urgent']
            if v not in valid_priorities:
                raise ValueError(f'Priority must be one of: {", ".join(valid_priorities)}')
        return v


class NotificationMarkReadRequest(BaseModel):
    """Schema for marking notification as read"""
    notificationIds: List[str] = Field(..., description="List of notification IDs to mark as read")


class NotificationResponse(BaseModel):
    """Schema for notification response"""
    id: str
    title: str
    message: str
    type: str
    priority: str
    targetUsers: Optional[List[str]] = None
    isRead: bool = False
    isActive: bool = True
    link: Optional[str] = None
    createdBy: str
    createdByName: Optional[str] = None
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    expiresAt: Optional[datetime] = None
    readAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class NotificationInDB(BaseModel):
    """Schema for notification stored in database"""
    title: str
    message: str
    type: str
    priority: str = "normal"
    targetUsers: Optional[List[str]] = None  # None means all users
    readBy: List[str] = []  # User IDs who read this notification
    isActive: bool = True
    link: Optional[str] = None
    createdBy: str  # Admin user ID
    createdByName: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None
    expiresAt: Optional[datetime] = None


class NotificationStatsResponse(BaseModel):
    """Schema for notification statistics"""
    totalNotifications: int
    unreadCount: int
    readCount: int
    byType: dict
    byPriority: dict
    
    class Config:
        from_attributes = True


class BulkNotificationResponse(BaseModel):
    """Schema for bulk notification operations"""
    success: bool
    message: str
    affectedCount: int
    notificationIds: Optional[List[str]] = None
    
    class Config:
        from_attributes = True
