from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any
from app.database.schema.settings_schema import (
    UpdateSettingsRequest,
    SettingsResponse,
    Enable2FARequest,
    TwoFactorResponse,
    LoginHistoryResponse,
    DataDownloadRequest,
    DataDownloadResponse,
    DeleteAccountRequest,
    DeleteAccountResponse,
    LogoutSessionRequest,
    LogoutAllSessionsResponse,
    UpdateThemeRequest,
    ThemeResponse,
    NotificationPreferences
)
from app.database.repository.settings_repository import settings_repository
from app.utils.auth_middleware import get_current_user
from app.utils.security import verify_password
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/settings", tags=["Settings"])


# ===================== USER SETTINGS ENDPOINTS =====================

@router.get("/", response_model=SettingsResponse)
def get_user_settings(current_user: dict = Depends(get_current_user)):
    """
    Get user settings including notification preferences, theme, and 2FA status
    """
    try:
        user_id = str(current_user["_id"])
        settings = settings_repository.get_user_settings(user_id)
        
        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User settings not found"
            )
        
        return SettingsResponse(
            notificationPreferences=NotificationPreferences(**settings["notificationPreferences"]),
            theme=settings["theme"],
            twoFactorEnabled=settings["twoFactorEnabled"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch settings: {str(e)}"
        )


@router.put("/", response_model=SettingsResponse)
def update_user_settings(
    settings_data: UpdateSettingsRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user settings (notification preferences, theme)
    """
    try:
        user_id = str(current_user["_id"])
        
        # Update notification preferences if provided
        if settings_data.notificationPreferences:
            prefs = settings_data.notificationPreferences.dict()
            settings_repository.update_notification_preferences(user_id, prefs)
        
        # Update theme if provided
        if settings_data.theme:
            if settings_data.theme not in ["light", "dark"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Theme must be 'light' or 'dark'"
                )
            settings_repository.update_theme(user_id, settings_data.theme)
        
        # Fetch updated settings
        updated_settings = settings_repository.get_user_settings(user_id)
        
        return SettingsResponse(
            notificationPreferences=NotificationPreferences(**updated_settings["notificationPreferences"]),
            theme=updated_settings["theme"],
            twoFactorEnabled=updated_settings["twoFactorEnabled"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update settings: {str(e)}"
        )


@router.put("/notifications", response_model=Dict[str, Any])
def update_notification_preferences(
    preferences: NotificationPreferences,
    current_user: dict = Depends(get_current_user)
):
    """
    Update notification preferences only
    """
    try:
        user_id = str(current_user["_id"])
        prefs_dict = preferences.dict()
        
        success = settings_repository.update_notification_preferences(user_id, prefs_dict)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update notification preferences"
            )
        
        return {
            "message": "Notification preferences updated successfully",
            "preferences": prefs_dict
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update notification preferences: {str(e)}"
        )


@router.put("/theme", response_model=ThemeResponse)
def update_theme_preference(
    theme_data: UpdateThemeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update theme preference
    """
    try:
        user_id = str(current_user["_id"])
        
        if theme_data.theme not in ["light", "dark"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Theme must be 'light' or 'dark'"
            )
        
        success = settings_repository.update_theme(user_id, theme_data.theme)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update theme"
            )
        
        return ThemeResponse(
            theme=theme_data.theme,
            message=f"Theme changed to {theme_data.theme} mode successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update theme: {str(e)}"
        )


# ===================== TWO-FACTOR AUTHENTICATION ENDPOINTS =====================

@router.post("/2fa/setup", response_model=TwoFactorResponse)
def setup_2fa(current_user: dict = Depends(get_current_user)):
    """
    Generate 2FA secret and QR code for setup
    
    Returns QR code and backup codes. User must verify with authenticator app to enable.
    """
    try:
        user_id = str(current_user["_id"])
        email = current_user["email"]
        
        # Check if 2FA is already enabled
        settings = settings_repository.get_user_settings(user_id)
        if settings["twoFactorEnabled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Two-factor authentication is already enabled"
            )
        
        # Generate 2FA setup data
        setup_data = settings_repository.generate_2fa_secret(user_id, email)
        
        return TwoFactorResponse(
            secret=setup_data["secret"],
            qrCode=setup_data["qrCode"],
            backupCodes=setup_data["backupCodes"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to setup 2FA: {str(e)}"
        )


@router.post("/2fa/enable", response_model=Dict[str, Any])
def enable_2fa(
    request: Enable2FARequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Verify code from authenticator app and enable 2FA
    """
    try:
        user_id = str(current_user["_id"])
        
        # Verify code and enable 2FA
        success = settings_repository.verify_and_enable_2fa(user_id, request.verificationCode)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
        
        return {
            "message": "Two-factor authentication enabled successfully",
            "twoFactorEnabled": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enable 2FA: {str(e)}"
        )


@router.post("/2fa/disable", response_model=Dict[str, Any])
def disable_2fa(current_user: dict = Depends(get_current_user)):
    """
    Disable two-factor authentication
    """
    try:
        user_id = str(current_user["_id"])
        
        success = settings_repository.disable_2fa(user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to disable 2FA"
            )
        
        return {
            "message": "Two-factor authentication disabled successfully",
            "twoFactorEnabled": False
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disable 2FA: {str(e)}"
        )


# ===================== LOGIN HISTORY ENDPOINTS =====================

@router.get("/login-history", response_model=LoginHistoryResponse)
def get_login_history(
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """
    Get user's login history
    
    Returns list of recent login sessions with device, location, and time information
    """
    try:
        user_id = str(current_user["_id"])
        
        sessions = settings_repository.get_login_history(user_id, limit)
        
        return LoginHistoryResponse(
            sessions=sessions,
            total=len(sessions)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch login history: {str(e)}"
        )


@router.post("/logout-session", response_model=Dict[str, str])
def logout_specific_session(
    request: LogoutSessionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Logout a specific session
    """
    try:
        user_id = str(current_user["_id"])
        
        success = settings_repository.logout_session(request.sessionId, user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        return {"message": "Session logged out successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to logout session: {str(e)}"
        )


@router.post("/logout-all-sessions", response_model=LogoutAllSessionsResponse)
def logout_all_other_sessions(current_user: dict = Depends(get_current_user)):
    """
    Logout all sessions except the current one
    """
    try:
        user_id = str(current_user["_id"])
        current_session_id = current_user.get("sessionId", "")
        
        if not current_session_id:
            # If no session ID, create a dummy one so we don't accidentally logout current session
            current_session_id = "current_session"
        
        count = settings_repository.logout_all_sessions_except_current(user_id, current_session_id)
        
        return LogoutAllSessionsResponse(
            message=f"Successfully logged out from {count} other device(s)",
            sessionsLoggedOut=count
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to logout sessions: {str(e)}"
        )


# ===================== DATA DOWNLOAD ENDPOINTS =====================

@router.post("/download-data", response_model=DataDownloadResponse)
def request_data_download(
    request: DataDownloadRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Request a copy of all user data
    
    Creates a download request. Data will be prepared and sent to email within 24-48 hours
    """
    try:
        user_id = str(current_user["_id"])
        
        request_id = settings_repository.create_data_download_request(
            user_id,
            request.includeDocuments,
            request.includeTransactions,
            request.includeApplications
        )
        
        return DataDownloadResponse(
            message="Data download request submitted successfully. You will receive an email with download link within 24-48 hours.",
            requestId=request_id,
            estimatedTime="24-48 hours"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create download request: {str(e)}"
        )


# ===================== ACCOUNT DELETION ENDPOINTS =====================

@router.post("/delete-account", response_model=DeleteAccountResponse)
def request_account_deletion(
    request: DeleteAccountRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Request account deletion
    
    Account will be scheduled for deletion in 30 days. Can be cancelled within this period.
    """
    try:
        user_id = str(current_user["_id"])
        
        # Validate confirmation
        if request.confirmation != "DELETE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please type 'DELETE' to confirm account deletion"
            )
        
        # Verify password if provided
        if request.password:
            if not current_user.get("hashedPassword"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password verification not available for OAuth accounts"
                )
            
            if not verify_password(request.password, current_user["hashedPassword"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect password"
                )
        
        # Create deletion request
        deletion_data = settings_repository.create_deletion_request(user_id, request.reason)
        
        return DeleteAccountResponse(
            message="Account deletion scheduled. You can cancel this request within 30 days by logging in.",
            scheduledDate=deletion_data["scheduledDate"],
            cancellationPeriod=deletion_data["cancellationPeriod"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to request account deletion: {str(e)}"
        )


@router.post("/cancel-deletion", response_model=Dict[str, str])
def cancel_account_deletion(current_user: dict = Depends(get_current_user)):
    """
    Cancel pending account deletion request
    """
    try:
        user_id = str(current_user["_id"])
        
        success = settings_repository.cancel_deletion_request(user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No pending deletion request found"
            )
        
        return {"message": "Account deletion request cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel deletion request: {str(e)}"
        )


@router.get("/deletion-status", response_model=Dict[str, Any])
def get_deletion_status(current_user: dict = Depends(get_current_user)):
    """
    Get status of account deletion request
    """
    try:
        user_id = str(current_user["_id"])
        
        deletion_request = settings_repository.get_deletion_request(user_id)
        
        if not deletion_request:
            return {
                "hasPendingDeletion": False,
                "message": "No pending deletion request"
            }
        
        return {
            "hasPendingDeletion": True,
            "scheduledDate": deletion_request["scheduledDate"],
            "cancellationPeriod": deletion_request["cancellationPeriod"],
            "reason": deletion_request.get("reason"),
            "message": "Account is scheduled for deletion"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch deletion status: {str(e)}"
        )
