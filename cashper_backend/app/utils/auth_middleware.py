from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.utils.security import decode_access_token
from app.database.repository.user_repository import user_repository
from app.config import DISABLE_AUTH_FOR_TESTING

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        raise credentials_exception
    
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        
        if payload is None:
            raise credentials_exception
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        is_admin: bool = payload.get("isAdmin", False)
        
        if user_id is None:
            raise credentials_exception
        
        # Handle admin user
        if is_admin and user_id == "admin_user":
            from datetime import datetime
            return {
                "_id": "admin_user",
                "email": email,
                "fullName": "Admin",
                "phone": "",  # Admin doesn't have a phone
                "isAdmin": True,
                "isActive": True,
                "isEmailVerified": True,
                "isPhoneVerified": False,
                "profileImage": None,
                "address": None,
                "panCard": None,
                "aadhar": None,
                "dateOfBirth": None,
                "occupation": "Administrator",
                "annualIncome": None,
                "authProvider": "admin",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        
        user = user_repository.get_user_by_id(user_id)
        
        if user is None:
            raise credentials_exception
        
        if not user.get("isActive", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        raise credentials_exception

def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    if not current_user.get("isActive", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

def get_current_verified_user(current_user: dict = Depends(get_current_user)) -> dict:
    if not current_user.get("isEmailVerified", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified"
        )
    return current_user

def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if DISABLE_AUTH_FOR_TESTING:
        return {
            "_id": "test_admin_user",
            "email": "test@admin.com",
            "name": "Test Admin",
            "role": "admin",
            "isActive": True,
            "isEmailVerified": True
        }
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        
        if payload is None:
            raise credentials_exception
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        is_admin: bool = payload.get("isAdmin", False)
        
        if user_id is None:
            raise credentials_exception
        
        # Handle admin user
        if is_admin and user_id == "admin_user":
            from datetime import datetime
            return {
                "_id": "admin_user",
                "email": email,
                "fullName": "Admin",
                "phone": "",  # Admin doesn't have a phone
                "isAdmin": True,
                "isActive": True,
                "isEmailVerified": True,
                "isPhoneVerified": False,
                "profileImage": None,
                "address": None,
                "panCard": None,
                "aadhar": None,
                "dateOfBirth": None,
                "occupation": "Administrator",
                "annualIncome": None,
                "authProvider": "admin",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        
        user = user_repository.get_user_by_id(user_id)
        
        if user is None:
            raise credentials_exception
        
        if not user.get("isActive", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        raise credentials_exception

def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    """Get current user if authenticated, otherwise return None (no error raised)"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        
        if payload is None:
            return None
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        is_admin: bool = payload.get("isAdmin", False)
        
        if user_id is None:
            return None
        
        # Handle admin user
        if is_admin and user_id == "admin_user":
            from datetime import datetime
            return {
                "_id": "admin_user",
                "email": email,
                "fullName": "Admin",
                "phone": "",
                "isAdmin": True,
                "isActive": True,
                "isEmailVerified": True,
                "isPhoneVerified": False,
                "profileImage": None,
                "address": None,
                "panCard": None,
                "aadhar": None,
                "dateOfBirth": None,
                "occupation": "Administrator",
                "annualIncome": None,
                "authProvider": "admin",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        
        user = user_repository.get_user_by_id(user_id)
        
        if user is None:
            return None
        
        if not user.get("isActive", False):
            return None
        
        return user
        
    except Exception as e:
        return None

def verify_admin_token(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin" and not current_user.get("isAdmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    return current_user

# Alias for verify_admin_token (used in loan_routes and dashboard_routes)
admin_required = verify_admin_token

# Dependency function to get current user (used in dashboard_routes)
def get_current_user_dependency():
    return Depends(get_current_user_optional)
