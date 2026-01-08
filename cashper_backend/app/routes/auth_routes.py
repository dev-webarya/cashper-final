from fastapi import APIRouter, HTTPException, status, Depends, Response, File, UploadFile, Form, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional
from app.database.schema.user_schema import (
    UserRegistrationRequest, 
    UserLoginRequest, 
    UserResponse, 
    TokenResponse,
    UserInDB,
    GoogleLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    UserProfileResponse,
    DocumentUploadResponse,
    UserDocumentResponse
)
from app.database.repository.user_repository import user_repository
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.auth_middleware import get_current_user
from app.utils.file_upload import save_upload_file
from app.utils.email_service import send_otp_email, send_welcome_email
from datetime import datetime, timedelta
import random
import re
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
from bson import ObjectId
import asyncio

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Google OAuth Client ID (set in environment variable)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id.apps.googleusercontent.com")

# Temporary OTP storage (In production, use Redis or database with TTL)
otp_storage = {}

# Request/Response Models
class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., description="Email address for password reset")

class ResetPasswordRequest(BaseModel):
    email: str = Field(..., description="Email address")
    otp: str = Field(..., description="OTP received via email", min_length=6, max_length=6)
    newPassword: str = Field(..., description="New password", min_length=8)

class SendOTPRequest(BaseModel):
    phone: str = Field(..., description="10-digit mobile number", min_length=10, max_length=10)

class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., description="10-digit mobile number", min_length=10, max_length=10)
    otp: str = Field(..., description="6-digit OTP", min_length=6, max_length=6)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegistrationRequest):
    """
    Register a new user account
    
    This endpoint handles user registration with the following validations:
    - Full name must be at least 3 characters
    - Valid email format
    - Valid 10-digit Indian mobile number (starting with 6-9)
    - Password must be at least 8 characters with uppercase, lowercase, and number
    - Passwords must match
    - User must agree to terms and conditions
    """
    
    # Convert email to lowercase for consistency
    email_lower = user_data.email.lower()
    
    # Check if user with email already exists
    existing_user = user_repository.get_user_by_email(email_lower)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please use a different email or login."
        )
    
    # Check if user with phone already exists
    existing_phone = user_repository.get_user_by_phone(user_data.phone)
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered. Please use a different phone number."
        )
    
    # Hash the password
    hashed_password = hash_password(user_data.password)
    
    # Create user in database
    user_in_db = UserInDB(
        fullName=user_data.fullName,
        email=email_lower,
        phone=user_data.phone,
        hashedPassword=hashed_password,
        agreeToTerms=user_data.agreeToTerms,
        isEmailVerified=False,
        isPhoneVerified=False,
        isActive=True,
        createdAt=datetime.utcnow()
    )
    
    try:
        created_user = user_repository.create_user(user_in_db)
        
        # Create access token
        access_token = create_access_token(data={"sub": created_user.id, "email": created_user.email})
        
        # Return token and user data
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=created_user
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user account. Please try again. Error: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
def login_user(login_data: UserLoginRequest):
    """
    Login user with email and password
    
    Returns JWT access token and user information
    """
    
    # Convert email to lowercase
    email_lower = login_data.email.lower()
    
    # Get user from database
    user = user_repository.get_user_by_email(email_lower)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if user has hashedPassword field
    if not user.get("hashedPassword"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    try:
        password_valid = verify_password(login_data.password, user["hashedPassword"])
    except Exception as e:
        print(f"Password verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if user is active
    if not user.get("isActive", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )
    
    # Update lastLogin for admin users
    if user.get("isAdmin") and str(user["_id"]) == "admin_user":
        from app.database.db import get_database
        db = get_database()
        db["admin_profiles"].update_one(
            {"_id": "admin_user"},
            {"$set": {"lastLogin": datetime.utcnow()}},
            upsert=True
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user["_id"]), "email": user["email"], "role": user.get("role", "user")})
    
    # Convert user to response format
    user_response = UserResponse(
        id=str(user["_id"]),
        fullName=user["fullName"],
        email=user["email"],
        phone=user["phone"],
        role=user.get("role", "user"),
        isAdmin=user.get("isAdmin", False),
        isEmailVerified=user.get("isEmailVerified", False),
        isPhoneVerified=user.get("isPhoneVerified", False),
        createdAt=user["createdAt"],
        updatedAt=user.get("updatedAt")
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.post("/google-login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def google_login(request: GoogleLoginRequest):
    """
    Google OAuth Login/Registration
    
    This endpoint handles Google OAuth authentication with the following flow:
    1. Validates the Google ID token from the client
    2. Extracts user information from the verified token
    3. Checks if user exists in database (by email)
    4. If exists: Updates Google ID and auth provider if not already set
    5. If new: Creates a new user account with Google OAuth data
    6. Generates and returns JWT access token with user information
    
    Args:
        request (GoogleLoginRequest): Contains the Google ID token
        
    Returns:
        TokenResponse: JWT access token and user information
        
    Raises:
        HTTPException 401: Invalid or expired Google token
        HTTPException 500: Database or server errors
    """
    try:
        # Validate that token is provided
        if not request.token or not request.token.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google token is required"
            )
        
        # Verify Google token with Google's servers
        try:
            idinfo = id_token.verify_oauth2_token(
                request.token, 
                google_requests.Request(), 
                GOOGLE_CLIENT_ID
            )
        except ValueError as ve:
            # Token verification failed (expired, invalid signature, wrong audience, etc.)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Google token. Please sign in again."
            )
        except Exception as ve:
            # Other token verification errors
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to verify Google token. Please try again."
            )
        
        # Extract user information from verified Google token
        google_id = idinfo.get('sub')
        email = idinfo.get('email')
        full_name = idinfo.get('name')
        email_verified = idinfo.get('email_verified', False)
        
        # Validate required fields from Google
        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google token: missing required user information"
            )
        
        # Normalize email to lowercase for consistency
        email = email.lower()
        
        # Use email username as fallback if name not provided
        if not full_name:
            full_name = email.split('@')[0].title()
        
        # Check if user already exists in database
        user = user_repository.get_user_by_email(email)
        
        if user:
            # Block admin users from logging in with Google
            if user.get('isAdmin') or user.get('role') == 'admin':
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin users cannot login with Google. Please use email and password."
                )
            
            # Existing user - update Google credentials if not already set
            update_fields = {}
            
            if not user.get('googleId'):
                update_fields['googleId'] = google_id
                
            if not user.get('authProvider') or user.get('authProvider') != 'google':
                update_fields['authProvider'] = 'google'
            
            # Update email verification status if Google confirms it
            if email_verified and not user.get('isEmailVerified'):
                update_fields['isEmailVerified'] = True
            
            # Perform update if there are changes
            if update_fields:
                update_fields['updatedAt'] = datetime.utcnow()
                collection = user_repository.get_collection()
                collection.update_one(
                    {"_id": user["_id"]},
                    {"$set": update_fields}
                )
                # Refresh user data after update
                user = user_repository.get_user_by_id(str(user["_id"]))
                
        else:
            # New user - create account with Google OAuth data
            new_user_data = {
                "fullName": full_name,
                "email": email,
                "phone": "",  # Phone is optional for Google OAuth users
                "googleId": google_id,
                "authProvider": "google",
                "isEmailVerified": email_verified,
                "isPhoneVerified": False,
                "isActive": True,
                "agreeToTerms": True,  # Implicit agreement through Google OAuth
                "createdAt": datetime.utcnow(),
                "updatedAt": None
            }
            
            try:
                collection = user_repository.get_collection()
                result = collection.insert_one(new_user_data)
                user = user_repository.get_user_by_id(str(result.inserted_id))
                
                if not user:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to create user account. Please try again."
                    )
            except Exception as db_error:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Database error during user creation: {str(db_error)}"
                )
        
        # Check if account is active
        if not user.get('isActive', True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact support."
            )
        
        # Generate JWT access token for the user
        access_token = create_access_token(
            data={
                "sub": str(user["_id"]),
                "email": user["email"]
            }
        )
        
        # Convert database user to response format
        user_response = UserResponse(
            id=str(user["_id"]),
            fullName=user["fullName"],
            email=user["email"],
            phone=user.get("phone", ""),
            isEmailVerified=user.get("isEmailVerified", False),
            isPhoneVerified=user.get("isPhoneVerified", False),
            createdAt=user["createdAt"],
            updatedAt=user.get("updatedAt")
        )
        
        # Return token and user information
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
        
    except Exception as e:
        # Catch-all for unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during Google authentication: {str(e)}"
        )


@router.get("/me", response_model=UserProfileResponse)
@router.get("/profile", response_model=UserProfileResponse)
def get_current_user_info(
    response: Response,
    current_user: dict = Depends(get_current_user)
):
    """
    Get current authenticated user information with complete profile
    
    Requires valid JWT token in Authorization header
    Returns complete user profile including address, PAN, Aadhar, etc.
    Accessible via both /api/auth/me and /api/auth/profile
    Works for both regular users and admin users
    """
    # Don't cache profile data to ensure fresh data after updates
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    # Check if admin user
    if current_user.get("isAdmin") and str(current_user["_id"]) == "admin_user":
        # Fetch from admin_profiles collection
        from app.database.db import get_database
        db = get_database()
        admin_profile = db["admin_profiles"].find_one({"_id": "admin_user"})
        
        if admin_profile:
            return UserProfileResponse(
                id="admin_user",
                fullName=admin_profile.get("fullName", "Admin"),
                email=admin_profile.get("email", current_user.get("email", "sudha@gmail.com")),
                phone=admin_profile.get("phone", ""),
                profileImage=admin_profile.get("profileImage"),
                address=admin_profile.get("address"),
                panCard=None,
                aadhar=None,
                dateOfBirth=None,
                occupation=admin_profile.get("occupation", "Administrator"),
                annualIncome=None,
                bio=admin_profile.get("bio", ""),
                department=admin_profile.get("department", "Administration"),
                isEmailVerified=True,
                isPhoneVerified=False,
                authProvider="admin",
                createdAt=admin_profile.get("createdAt", datetime.utcnow()),
                updatedAt=admin_profile.get("updatedAt", datetime.utcnow()),
                lastLogin=admin_profile.get("lastLogin")
            )
    
    # Regular user
    return UserProfileResponse(
        id=str(current_user["_id"]),
        fullName=current_user["fullName"],
        email=current_user["email"],
        phone=current_user["phone"],
        profileImage=current_user.get("profileImage"),
        address=current_user.get("address"),
        panCard=current_user.get("panCard"),
        aadhar=current_user.get("aadhar"),
        dateOfBirth=current_user.get("dateOfBirth"),
        occupation=current_user.get("occupation"),
        annualIncome=current_user.get("annualIncome"),
        isEmailVerified=current_user.get("isEmailVerified", False),
        isPhoneVerified=current_user.get("isPhoneVerified", False),
        authProvider=current_user.get("authProvider", "email"),
        createdAt=current_user["createdAt"],
        updatedAt=current_user.get("updatedAt")
    )


@router.post("/verify-email/{user_id}", status_code=status.HTTP_200_OK)
def verify_email(user_id: str):
    """
    Verify user email (for future email verification flow)
    """
    success = user_repository.verify_email(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Email verified successfully"}


@router.post("/verify-phone/{user_id}", status_code=status.HTTP_200_OK)
def verify_phone(user_id: str):
    """
    Verify user phone (for future phone verification flow)
    """
    success = user_repository.verify_phone(user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Phone verified successfully"}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    """
    Send OTP to email for password reset
    """
    email_lower = request.email.lower()
    
    # Validate Gmail credentials first
    gmail_user = os.getenv("GMAIL_USER")
    gmail_password = os.getenv("GMAIL_APP_PASSWORD")
    
    if not gmail_user or not gmail_password or gmail_user == "your-email@gmail.com" or gmail_password == "your-app-password-here":
        print(f"\n{'='*60}")
        print(f"❌ GMAIL CONFIGURATION ERROR")
        print(f"{'='*60}")
        print(f"Gmail credentials not properly configured in .env file")
        print(f"Current GMAIL_USER: {gmail_user}")
        print(f"Current GMAIL_APP_PASSWORD: {'SET' if gmail_password else 'NOT SET'}")
        print(f"\n📖 SETUP INSTRUCTIONS:")
        print(f"1. Go to: https://myaccount.google.com/apppasswords")
        print(f"2. Enable 2-Step Verification if not enabled")
        print(f"3. Create an App Password for 'Mail' application")
        print(f"4. Update cashper_backend\\.env file:")
        print(f"   GMAIL_USER=your-actual-email@gmail.com")
        print(f"   GMAIL_APP_PASSWORD=your-16-digit-app-password")
        print(f"5. Restart the backend server")
        print(f"{'='*60}\n")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service not configured. Please contact administrator."
        )
    
    # Check if user exists
    user = user_repository.get_user_by_email(email_lower)
    if not user:
        # Don't reveal if email exists or not (security)
        return {
            "message": "If the email exists, an OTP has been sent",
            "success": True
        }
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store OTP with expiry (5 minutes)
    otp_storage[email_lower] = {
        "otp": otp,
        "expiry": datetime.utcnow() + timedelta(minutes=5),
        "type": "password_reset"
    }
    
    # Print OTP in console for development
    print(f"\n{'='*50}")
    print(f"PASSWORD RESET OTP for {email_lower}: {otp}")
    print(f"Valid for 5 minutes")
    print(f"{'='*50}\n")
    
    # Get user name for email personalization
    user_name = user.get("fullName", "User")
    
    # Try to send email synchronously first to validate it works
    try:
        email_sent = await send_otp_email(request.email, otp, user_name)
        
        if not email_sent:
            print(f"⚠️  WARNING: Failed to send OTP email to {request.email}")
            print(f"   But OTP is stored and valid: {otp}")
            # Still return success because OTP is generated and stored
            # User can use OTP from console logs
        else:
            print(f"✅ OTP email sent successfully to {request.email}")
            
    except Exception as e:
        print(f"❌ Error sending OTP email: {str(e)}")
        print(f"   But OTP is stored and valid: {otp}")
        # Continue anyway - OTP is still valid from console
    
    # Return success
    return {
        "message": "OTP has been sent to your email address. Please check your inbox and spam folder.",
        "success": True,
        "otp_expiry_minutes": 5
    }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(request: ResetPasswordRequest):
    """
    Reset password using OTP
    """
    email_lower = request.email.lower()
    
    # Validate OTP
    if email_lower not in otp_storage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    stored = otp_storage[email_lower]
    
    # Check expiry
    if datetime.utcnow() > stored["expiry"]:
        del otp_storage[email_lower]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one"
        )
    
    # Check OTP match
    if stored["otp"] != request.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Get user
    user = user_repository.get_user_by_email(email_lower)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Hash new password
    hashed_password = hash_password(request.newPassword)
    
    # Update password in database
    user_repository.update_password(str(user["_id"]), hashed_password)
    
    # Remove used OTP
    del otp_storage[email_lower]
    
    return {"message": "Password reset successful. Please login with your new password"}


@router.post("/send-otp", status_code=status.HTTP_200_OK)
def send_otp(request: SendOTPRequest):
    """
    Send OTP to mobile number for login
    """
    phone = request.phone
    
    # Validate phone format
    if not re.match(r'^[6-9]\d{9}$', phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid mobile number. Must be 10 digits starting with 6-9"
        )
    
    # Check if user exists with this phone
    user = user_repository.get_user_by_phone(phone)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this mobile number. Please register first."
        )
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store OTP with expiry (5 minutes)
    otp_storage[phone] = {
        "otp": otp,
        "expiry": datetime.utcnow() + timedelta(minutes=5),
        "type": "mobile_login"
    }
    
    # In production: Send OTP via SMS service (Twilio, AWS SNS, etc.)
    print(f"\n{'='*50}")
    print(f"LOGIN OTP for {phone}: {otp}")
    print(f"Valid for 5 minutes")
    print(f"{'='*50}\n")
    
    return {
        "message": "OTP sent to your mobile number",
        "dev_otp": otp  # Remove in production!
    }


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(request: VerifyOTPRequest):
    """
    Verify OTP and login user
    """
    phone = request.phone
    
    # Validate OTP exists
    if phone not in otp_storage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    stored = otp_storage[phone]
    
    # Check expiry
    if datetime.utcnow() > stored["expiry"]:
        del otp_storage[phone]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one"
        )
    
    # Check OTP match
    if stored["otp"] != request.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Get user
    user = user_repository.get_user_by_phone(phone)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is active
    if not user.get("isActive", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )
    
    # Mark phone as verified
    user_repository.verify_phone(str(user["_id"]))
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user["_id"]), "email": user["email"]})
    
    # Remove used OTP
    del otp_storage[phone]
    
    # Convert user to response format
    user_response = UserResponse(
        id=str(user["_id"]),
        fullName=user["fullName"],
        email=user["email"],
        phone=user["phone"],
        isEmailVerified=user.get("isEmailVerified", False),
        isPhoneVerified=True,
        createdAt=user["createdAt"],
        updatedAt=user.get("updatedAt")
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout_user(current_user: dict = Depends(get_current_user)):
    """
    Logout user (client should remove token)
    
    Since we're using JWT, actual logout happens on client side by removing the token.
    This endpoint is here for completeness and can be extended for token blacklisting if needed.
    """
    return {"message": "Logged out successfully"}


# ===================== PROFILE MANAGEMENT ENDPOINTS =====================


@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    fullName: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    panCard: Optional[str] = Form(None),
    aadhar: Optional[str] = Form(None),
    dateOfBirth: Optional[str] = Form(None),
    occupation: Optional[str] = Form(None),
    annualIncome: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    profileImage: Optional[UploadFile] = File(None),
    removeProfileImage: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Update user profile information (supports partial updates)
    
    Allows updating: fullName, phone, address, PAN, Aadhar, DOB, occupation, income, bio, department, profileImage
    Any field can be updated independently or all together
    Works for both regular users and admin users
    """
    try:
        user_id = str(current_user["_id"])
        is_admin = current_user.get("isAdmin", False)
        
        # Build update dictionary (only include provided values)
        update_data = {}
        
        # Helper function to check if value is provided and not empty
        def has_value(val):
            return val is not None and str(val).strip() != "" and str(val).strip().lower() != "null"
        
        if has_value(fullName):
            if len(fullName.strip()) < 3:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Name must be at least 3 characters"
                )
            update_data["fullName"] = fullName.strip()
            
        if has_value(phone):
            # Validate phone format
            phone_clean = phone.replace(' ', '')
            if not re.match(r'^[6-9]\d{9}$', phone_clean):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Please enter a valid 10-digit mobile number"
                )
            # Check if phone is already used by another user (skip for admin)
            if not is_admin:
                existing_user = user_repository.get_user_by_phone(phone_clean)
                if existing_user and str(existing_user["_id"]) != user_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Phone number already in use"
                    )
            update_data["phone"] = phone_clean
            
        if has_value(address):
            update_data["address"] = address.strip()
            
        if has_value(panCard):
            pan_upper = panCard.strip().upper()
            if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', pan_upper):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid PAN card format"
                )
            update_data["panCard"] = pan_upper
            
        if has_value(aadhar):
            update_data["aadhar"] = aadhar.strip()
            
        if has_value(dateOfBirth):
            update_data["dateOfBirth"] = dateOfBirth.strip()
            
        if has_value(occupation):
            update_data["occupation"] = occupation.strip()
            
        if has_value(annualIncome):
            update_data["annualIncome"] = annualIncome.strip()
            
        if has_value(bio):
            update_data["bio"] = bio.strip()
            
        if has_value(department):
            update_data["department"] = department.strip()
        
        # Handle profile image removal (explicit flag)
        if removeProfileImage == "true":
            update_data["profileImage"] = None
            print("Profile image removed")
        # Handle profile image upload
        elif profileImage and profileImage.filename:
            try:
                # Save the uploaded image
                image_path = await save_upload_file(profileImage, "profile")
                update_data["profileImage"] = image_path
                print(f"Profile image saved to: {image_path}")  # Debug log
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to upload profile image: {str(e)}"
                )
        
        # For admin users, store in admin_profiles collection
        if is_admin and user_id == "admin_user":
            from app.database.db import get_database
            db = get_database()
            collection = db["admin_profiles"]
            
            if not update_data:
                # Return current admin profile if no updates
                admin_profile = collection.find_one({"_id": "admin_user"})
                if not admin_profile:
                    # Create default admin profile
                    admin_profile = {
                        "_id": "admin_user",
                        "fullName": current_user.get("fullName", "Admin"),
                        "email": current_user.get("email", "sudha@gmail.com"),
                        "phone": "",
                        "profileImage": None,
                        "address": None,
                        "bio": None,
                        "department": "Administration",
                        "occupation": "Administrator",
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    }
                    collection.insert_one(admin_profile)
                
                return UserProfileResponse(
                    id="admin_user",
                    fullName=admin_profile.get("fullName", "Admin"),
                    email=admin_profile.get("email", "sudha@gmail.com"),
                    phone=admin_profile.get("phone", ""),
                    profileImage=admin_profile.get("profileImage"),
                    address=admin_profile.get("address"),
                    panCard=None,
                    aadhar=None,
                    dateOfBirth=None,
                    occupation=admin_profile.get("occupation", "Administrator"),
                    annualIncome=None,
                    bio=admin_profile.get("bio", ""),
                    department=admin_profile.get("department", "Administration"),
                    isEmailVerified=True,
                    isPhoneVerified=False,
                    authProvider="admin",
                    createdAt=admin_profile.get("createdAt", datetime.utcnow()),
                    updatedAt=admin_profile.get("updatedAt", datetime.utcnow()),
                    lastLogin=admin_profile.get("lastLogin")
                )
            
            # Add updated timestamp
            update_data["updatedAt"] = datetime.utcnow()
            
            # Update or create admin profile
            result = collection.update_one(
                {"_id": "admin_user"},
                {"$set": update_data},
                upsert=True
            )
            
            # Fetch updated admin profile
            updated_admin = collection.find_one({"_id": "admin_user"})
            if not updated_admin:
                # If still not found, create it
                updated_admin = {
                    "_id": "admin_user",
                    "fullName": update_data.get("fullName", "Admin"),
                    "email": current_user.get("email", "sudha@gmail.com"),
                    "phone": update_data.get("phone", ""),
                    "profileImage": update_data.get("profileImage"),
                    "address": update_data.get("address"),
                    "bio": update_data.get("bio"),
                    "department": update_data.get("department", "Administration"),
                    "occupation": "Administrator",
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
                collection.insert_one(updated_admin)
            
            print(f"Updated admin profile image field: {updated_admin.get('profileImage', 'None')}")  # Debug log
            
            return UserProfileResponse(
                id="admin_user",
                fullName=updated_admin.get("fullName", "Admin"),
                email=updated_admin.get("email", "sudha@gmail.com"),
                phone=updated_admin.get("phone", ""),
                profileImage=updated_admin.get("profileImage"),
                address=updated_admin.get("address"),
                panCard=None,
                aadhar=None,
                dateOfBirth=None,
                occupation=updated_admin.get("occupation", "Administrator"),
                annualIncome=None,
                bio=updated_admin.get("bio", ""),
                department=updated_admin.get("department", "Administration"),
                isEmailVerified=True,
                isPhoneVerified=False,
                authProvider="admin",
                createdAt=updated_admin.get("createdAt", datetime.utcnow()),
                updatedAt=updated_admin.get("updatedAt", datetime.utcnow()),
                lastLogin=updated_admin.get("lastLogin")
            )
        
        # For regular users
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Add updated timestamp
        update_data["updatedAt"] = datetime.utcnow()
        
        # Update user in database
        collection = user_repository.get_collection()
        result = collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Fetch updated user
        updated_user = collection.find_one({"_id": ObjectId(user_id)})
        
        print(f"Updated user profile image field: {updated_user.get('profileImage', 'None')}")  # Debug log
        
        return UserProfileResponse(
            id=str(updated_user["_id"]),
            fullName=updated_user["fullName"],
            email=updated_user["email"],
            phone=updated_user["phone"],
            profileImage=updated_user.get("profileImage"),
            address=updated_user.get("address"),
            panCard=updated_user.get("panCard"),
            aadhar=updated_user.get("aadhar"),
            dateOfBirth=updated_user.get("dateOfBirth"),
            occupation=updated_user.get("occupation"),
            annualIncome=updated_user.get("annualIncome"),
            isEmailVerified=updated_user.get("isEmailVerified", False),
            isPhoneVerified=updated_user.get("isPhoneVerified", False),
            authProvider=updated_user.get("authProvider", "email"),
            createdAt=updated_user["createdAt"],
            updatedAt=updated_user.get("updatedAt")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    password_data: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Change user password
    
    Requires current password verification before updating
    """
    try:
        # Get user ID from current_user dict
        user_id = current_user.get("_id")
        is_admin = current_user.get("isAdmin", False)
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID"
            )
        
        # For admin users, update in a special admin collection or the users collection with admin flag
        if is_admin and user_id == "admin_user":
            collection = user_repository.get_collection()
            # Find admin user by email
            admin_email = current_user.get("email")
            user = collection.find_one({"email": admin_email, "isAdmin": True})
            
            if not user:
                # Create admin user in database if doesn't exist
                admin_data = {
                    "email": admin_email,
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
                    "updatedAt": datetime.utcnow(),
                    "hashedPassword": hash_password(password_data.currentPassword)
                }
                result = collection.insert_one(admin_data)
                # Use the inserted ID for the update
                query = {"_id": result.inserted_id}
            else:
                query = {"email": admin_email, "isAdmin": True}
        else:
            collection = user_repository.get_collection()
            # Handle both string IDs (admin) and ObjectId (regular users)
            query = {"_id": user_id}
            if isinstance(user_id, str) and user_id != "admin_user":
                try:
                    query = {"_id": ObjectId(user_id)}
                except:
                    query = {"_id": user_id}
        
        user = collection.find_one(query)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user has password (not Google OAuth user)
        if not user.get("hashedPassword"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change password for Google OAuth accounts. Please use Google to manage your account."
            )
        
        # Verify current password
        if not verify_password(password_data.currentPassword, user["hashedPassword"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        new_hashed_password = hash_password(password_data.newPassword)
        
        # Verify the new password hash works before updating
        try:
            hash_test = verify_password(password_data.newPassword, new_hashed_password)
            if not hash_test:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Password hashing error: new hash doesn't verify"
                )
        except Exception as e:
            print(f"Hash verification error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Password hashing error: {str(e)}"
            )
        
        # Update password in database
        result = collection.update_one(
            query,
            {
                "$set": {
                    "hashedPassword": new_hashed_password,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update password in database"
            )
        
        # Verify the password was updated correctly
        updated_user = collection.find_one(query)
        if updated_user and verify_password(password_data.newPassword, updated_user.get("hashedPassword", "")):
            print(f"✅ Password update verified successfully for user {query}")
        else:
            print(f"⚠️ Warning: Password update failed verification for user {query}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Password update verification failed"
            )
        
        return {
            "message": "Password changed successfully",
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Change password error: {str(e)}")  # Log for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change password: {str(e)}"
        )


@router.post("/upload-document", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    documentType: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a document for the current user
    
    Requires authentication. Allowed document types: PAN, Aadhar, Income Proof, Bank Statement, Address Proof
    """
    try:
        user_id = str(current_user["_id"])
        
        # Validate document type
        valid_doc_types = ["pan", "aadhar", "income", "bank", "address", "other"]
        doc_type_lower = documentType.lower()
        
        if doc_type_lower not in valid_doc_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid document type. Must be one of: {', '.join(valid_doc_types)}"
            )
        
        # Save the uploaded document
        try:
            file_path = await save_upload_file(file, "document")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to upload file: {str(e)}"
            )
        
        # Determine document category
        if doc_type_lower in ["pan", "aadhar"]:
            category = "Identity"
        elif doc_type_lower in ["income", "bank"]:
            category = "Financial"
        else:
            category = "Other"
        
        # Create document record
        document_data = {
            "_id": ObjectId(),
            "userId": ObjectId(user_id),
            "documentType": documentType,
            "fileName": file.filename,
            "filePath": file_path,
            "category": category,
            "verificationStatus": "pending",
            "uploadedAt": datetime.utcnow(),
            "verifiedAt": None
        }
        
        # Get database collection
        from app.database.db import get_database
        db = get_database()
        documents_collection = db["user_documents"]
        
        # Insert document
        result = documents_collection.insert_one(document_data)
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save document to database"
            )
        
        return DocumentUploadResponse(
            id=str(document_data["_id"]),
            documentType=document_data["documentType"],
            fileName=document_data["fileName"],
            filePath=document_data["filePath"],
            category=document_data["category"],
            verificationStatus=document_data["verificationStatus"],
            uploadedAt=document_data["uploadedAt"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Document upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )


@router.get("/documents", response_model=list[UserDocumentResponse])
def get_user_documents(
    current_user: dict = Depends(get_current_user)
):
    """
    Get all documents uploaded by the current user
    
    Requires authentication
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get database collection
        from app.database.db import get_database
        db = get_database()
        documents_collection = db["user_documents"]
        
        # Find all documents for the user
        documents = list(documents_collection.find({"userId": ObjectId(user_id)}).sort("uploadedAt", -1))
        
        return [
            UserDocumentResponse(
                id=str(doc["_id"]),
                documentType=doc["documentType"],
                fileName=doc["fileName"],
                filePath=doc["filePath"],
                category=doc["category"],
                verificationStatus=doc["verificationStatus"],
                uploadedAt=doc["uploadedAt"],
                verifiedAt=doc.get("verifiedAt")
            )
            for doc in documents
        ]
        
    except Exception as e:
        print(f"Get documents error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve documents: {str(e)}"
        )


@router.delete("/documents/{document_id}", status_code=status.HTTP_200_OK)
def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a document
    
    Requires authentication. Users can only delete their own documents
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get database collection
        from app.database.db import get_database
        db = get_database()
        documents_collection = db["user_documents"]
        
        # Find the document
        document = documents_collection.find_one({
            "_id": ObjectId(document_id),
            "userId": ObjectId(user_id)
        })
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Delete file from disk
        from app.utils.file_upload import delete_file
        delete_file(document["filePath"])
        
        # Delete document from database
        result = documents_collection.delete_one({
            "_id": ObjectId(document_id),
            "userId": ObjectId(user_id)
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete document"
            )
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete document error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )

