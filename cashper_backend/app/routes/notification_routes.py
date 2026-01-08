from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.database.schema.notification_schema import (
    NotificationCreateRequest,
    NotificationUpdateRequest,
    NotificationMarkReadRequest,
    NotificationResponse,
    NotificationInDB,
    NotificationStatsResponse,
    BulkNotificationResponse
)
from app.database.repository.notification_repository import notification_repository
from app.utils.auth_middleware import get_current_user, verify_admin_token

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


# ============= ADMIN ROUTES =============

@router.post("/admin/create", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification: NotificationCreateRequest,
    current_user: dict = Depends(verify_admin_token)
):
    """
    Create a new notification (Admin only)
    - Admin can send notifications to all users or specific users
    - Can set priority, type, and expiration date
    """
    try:
        # Prepare notification data
        notification_data = NotificationInDB(
            title=notification.title,
            message=notification.message,
            type=notification.type,
            priority=notification.priority,
            targetUsers=notification.targetUsers,
            link=notification.link,
            expiresAt=notification.expiresAt,
            createdBy=str(current_user["_id"]),
            createdByName=current_user.get("fullName", current_user.get("email", "Admin"))
        )
        
        # Create notification in database
        created_notification = notification_repository.create_notification(notification_data)
        
        # Convert to response format
        response = _convert_to_response(created_notification, None)
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create notification: {str(e)}"
        )


@router.post("/admin/send-all", response_model=BulkNotificationResponse, status_code=status.HTTP_201_CREATED)
async def send_notification_to_all_users(
    notification: NotificationCreateRequest,
    current_user: dict = Depends(verify_admin_token)
):
    """
    Send notification to all users (Admin only)
    - Creates notification and sends to all registered users
    - No targetUsers filter - all users will receive it
    - Returns count of users notified
    """
    try:
        # Get all active users from database
        from app.database.repository.user_repository import user_repository
        
        # Get all user IDs
        all_users = user_repository.get_all_active_users()
        target_user_ids = [str(user["_id"]) for user in all_users] if all_users else []
        
        # Prepare notification data with all users as targets
        notification_data = NotificationInDB(
            title=notification.title,
            message=notification.message,
            type=notification.type,
            priority=notification.priority,
            targetUsers=target_user_ids if target_user_ids else None,  # None means all users
            link=notification.link,
            expiresAt=notification.expiresAt,
            createdBy=str(current_user["_id"]),
            createdByName=current_user.get("fullName", current_user.get("email", "Admin")),
            isBroadcast=True  # Mark as broadcast notification
        )
        
        # Create notification in database
        created_notification = notification_repository.create_notification(notification_data)
        
        # Return response with user count
        response = {
            "success": True,
            "message": f"Notification sent to {len(target_user_ids)} users",
            "notification": _convert_to_response(created_notification, None),
            "userCount": len(target_user_ids),
            "broadcastNotification": True
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send notification to all users: {str(e)}"
        )


@router.get("/admin/all", response_model=List[NotificationResponse])
async def get_all_notifications_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    type: Optional[str] = None,
    priority: Optional[str] = None,
    isActive: Optional[bool] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """
    Get all notifications with filters (Admin only)
    - Can filter by type, priority, and active status
    - Supports pagination
    """
    try:
        # Build filters
        filters = {}
        if type:
            filters["type"] = type
        if priority:
            filters["priority"] = priority
        if isActive is not None:
            filters["isActive"] = isActive
        
        # Get notifications
        notifications = notification_repository.get_all_notifications(skip, limit, filters)
        
        # Convert to response format
        response_list = [_convert_to_response(notif, None) for notif in notifications]
        
        return response_list
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}"
        )


@router.get("/admin/stats")
async def get_admin_notification_stats(
    current_user: dict = Depends(verify_admin_token)
):
    """
    Get overall notification statistics (Admin only)
    - Total, active, inactive notifications
    - Breakdown by type
    """
    try:
        stats = notification_repository.get_admin_stats()
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )


@router.put("/admin/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: str,
    update_data: NotificationUpdateRequest,
    current_user: dict = Depends(verify_admin_token)
):
    """
    Update notification (Admin only)
    - Can update title, message, type, priority, etc.
    """
    try:
        # Check if notification exists
        existing_notification = notification_repository.get_notification_by_id(notification_id)
        if not existing_notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        # Prepare update data (only include provided fields)
        update_dict = update_data.dict(exclude_unset=True)
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Update notification
        updated_notification = notification_repository.update_notification(notification_id, update_dict)
        
        if not updated_notification:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update notification"
            )
        
        # Convert to response format
        response = _convert_to_response(updated_notification, None)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update notification: {str(e)}"
        )


@router.delete("/admin/{notification_id}")
async def delete_notification(
    notification_id: str,
    hard_delete: bool = Query(False, description="Permanently delete notification"),
    current_user: dict = Depends(verify_admin_token)
):
    """
    Delete notification (Admin only)
    - Soft delete by default (marks as inactive)
    - Hard delete if hard_delete=true (permanently removes)
    """
    try:
        # Check if notification exists
        existing_notification = notification_repository.get_notification_by_id(notification_id)
        if not existing_notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        if hard_delete:
            # Permanent delete
            success = notification_repository.delete_notification(notification_id)
            message = "Notification permanently deleted"
        else:
            # Soft delete
            success = notification_repository.soft_delete_notification(notification_id)
            message = "Notification marked as inactive"
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete notification"
            )
        
        return {
            "success": True,
            "message": message
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete notification: {str(e)}"
        )


# ============= USER ROUTES =============

@router.get("/my-notifications", response_model=List[NotificationResponse])
async def get_user_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    include_read: bool = Query(True, description="Include read notifications"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get user's notifications
    - Shows notifications targeted to user or all users
    - Can filter to show only unread notifications
    - Excludes expired notifications
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get user notifications
        notifications = notification_repository.get_user_notifications(
            user_id, skip, limit, include_read
        )
        
        # Convert to response format
        response_list = [_convert_to_response(notif, user_id) for notif in notifications]
        
        return response_list
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}"
        )


@router.get("/unread-count")
async def get_unread_count(
    current_user: dict = Depends(get_current_user)
):
    """
    Get count of unread notifications for user
    - Quick endpoint to display unread badge
    """
    try:
        user_id = str(current_user["_id"])
        count = notification_repository.get_unread_count(user_id)
        
        return {
            "success": True,
            "unreadCount": count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch unread count: {str(e)}"
        )


@router.get("/stats", response_model=NotificationStatsResponse)
async def get_user_notification_stats(
    current_user: dict = Depends(get_current_user)
):
    """
    Get notification statistics for user
    - Total, read, unread counts
    - Breakdown by type and priority
    """
    try:
        user_id = str(current_user["_id"])
        stats = notification_repository.get_notification_stats(user_id)
        
        return NotificationStatsResponse(**stats)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )


@router.post("/mark-read")
async def mark_notifications_as_read(
    request: NotificationMarkReadRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Mark specific notifications as read
    - User can mark one or multiple notifications as read
    """
    try:
        user_id = str(current_user["_id"])
        
        if not request.notificationIds:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No notification IDs provided"
            )
        
        # Mark notifications as read
        affected_count = notification_repository.mark_multiple_as_read(
            request.notificationIds, user_id
        )
        
        return {
            "success": True,
            "message": f"Marked {affected_count} notification(s) as read",
            "affectedCount": affected_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark notifications as read: {str(e)}"
        )


@router.post("/mark-all-read")
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user)
):
    """
    Mark all user's notifications as read
    - Quick action to clear all unread notifications
    """
    try:
        user_id = str(current_user["_id"])
        
        # Mark all notifications as read
        affected_count = notification_repository.mark_all_as_read(user_id)
        
        return {
            "success": True,
            "message": f"Marked all notifications as read",
            "affectedCount": affected_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark all notifications as read: {str(e)}"
        )


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification_by_id(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get specific notification by ID
    - Automatically marks as read when accessed
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get notification
        notification = notification_repository.get_notification_by_id(notification_id)
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        # Check if user has access to this notification
        target_users = notification.get("targetUsers")
        if target_users and user_id not in target_users:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this notification"
            )
        
        # Mark as read
        notification_repository.mark_as_read(notification_id, user_id)
        
        # Refresh notification data
        notification = notification_repository.get_notification_by_id(notification_id)
        
        # Convert to response format
        response = _convert_to_response(notification, user_id)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notification: {str(e)}"
        )


# ============= HELPER FUNCTIONS =============

def _convert_to_response(notification: dict, user_id: Optional[str]) -> NotificationResponse:
    """Convert MongoDB document to NotificationResponse"""
    if not notification:
        return None
    
    # Determine if notification is read by user
    is_read = False
    read_at = None
    
    if user_id:
        read_by = notification.get("readBy", [])
        is_read = user_id in read_by
        
        # For read_at, we'll use updatedAt if marked as read (simplified)
        if is_read:
            read_at = notification.get("updatedAt")
    
    return NotificationResponse(
        id=str(notification["_id"]),
        title=notification["title"],
        message=notification["message"],
        type=notification["type"],
        priority=notification.get("priority", "normal"),
        targetUsers=notification.get("targetUsers"),
        isRead=is_read,
        isActive=notification.get("isActive", True),
        link=notification.get("link"),
        createdBy=notification["createdBy"],
        createdByName=notification.get("createdByName"),
        createdAt=notification["createdAt"],
        updatedAt=notification.get("updatedAt"),
        expiresAt=notification.get("expiresAt"),
        readAt=read_at
    )
