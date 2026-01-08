from app.database.db import get_database
from datetime import datetime, timedelta
from bson import ObjectId
import secrets
import pyotp
import qrcode
import io
import base64
from typing import Optional, Dict, List


class SettingsRepository:
    def __init__(self):
        self.db = None
        self.users_collection = None
        self.sessions_collection = None
        self.data_requests_collection = None
        self.deletion_requests_collection = None
    
    def _ensure_db(self):
        """Ensure database connection is initialized"""
        if self.db is None:
            self.db = get_database()
            self.users_collection = self.db["users"]
            self.sessions_collection = self.db["login_sessions"]
            self.data_requests_collection = self.db["data_download_requests"]
            self.deletion_requests_collection = self.db["account_deletion_requests"]
        
    # ===================== USER SETTINGS =====================
    
    def get_user_settings(self, user_id: str) -> Dict:
        """Get user settings"""
        self._ensure_db()
        user = self.users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return None
        
        # Default settings if not set
        settings = user.get("settings", {})
        
        return {
            "notificationPreferences": settings.get("notificationPreferences", {
                "email": True,
                "sms": True,
                "push": False
            }),
            "theme": settings.get("theme", "light"),
            "twoFactorEnabled": user.get("twoFactorEnabled", False)
        }
    
    def update_notification_preferences(self, user_id: str, preferences: Dict) -> bool:
        """Update notification preferences"""
        self._ensure_db()
        result = self.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "settings.notificationPreferences": preferences,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    def update_theme(self, user_id: str, theme: str) -> bool:
        """Update theme preference"""
        self._ensure_db()
        result = self.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "settings.theme": theme,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    # ===================== TWO-FACTOR AUTHENTICATION =====================
    
    def generate_2fa_secret(self, user_id: str, email: str) -> Dict:
        """Generate 2FA secret and QR code"""
        self._ensure_db()
        # Generate secret
        secret = pyotp.random_base32()
        
        # Create TOTP object
        totp = pyotp.TOTP(secret)
        
        # Generate provisioning URI
        provisioning_uri = totp.provisioning_uri(
            name=email,
            issuer_name="Cashper Finance"
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        qr_code_data = base64.b64encode(buffered.getvalue()).decode()
        qr_code_url = f"data:image/png;base64,{qr_code_data}"
        
        # Generate backup codes
        backup_codes = [secrets.token_hex(4).upper() for _ in range(10)]
        
        # Store secret (but don't enable 2FA yet)
        self.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "twoFactorSecret": secret,
                    "twoFactorBackupCodes": backup_codes,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return {
            "secret": secret,
            "qrCode": qr_code_url,
            "backupCodes": backup_codes
        }
    
    def verify_and_enable_2fa(self, user_id: str, code: str) -> bool:
        """Verify code and enable 2FA"""
        self._ensure_db()
        user = self.users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user or not user.get("twoFactorSecret"):
            return False
        
        # Verify code
        totp = pyotp.TOTP(user["twoFactorSecret"])
        if not totp.verify(code, valid_window=1):
            return False
        
        # Enable 2FA
        result = self.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "twoFactorEnabled": True,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return result.modified_count > 0
    
    def verify_2fa_code(self, user_id: str, code: str) -> bool:
        """Verify 2FA code for login"""
        self._ensure_db()
        user = self.users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user or not user.get("twoFactorEnabled") or not user.get("twoFactorSecret"):
            return False
        
        # Check backup codes first
        if code in user.get("twoFactorBackupCodes", []):
            # Remove used backup code
            self.users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$pull": {"twoFactorBackupCodes": code},
                    "$set": {"updatedAt": datetime.utcnow()}
                }
            )
            return True
        
        # Verify TOTP code
        totp = pyotp.TOTP(user["twoFactorSecret"])
        return totp.verify(code, valid_window=1)
    
    def disable_2fa(self, user_id: str) -> bool:
        """Disable 2FA"""
        self._ensure_db()
        result = self.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "twoFactorEnabled": False,
                    "updatedAt": datetime.utcnow()
                },
                "$unset": {
                    "twoFactorSecret": "",
                    "twoFactorBackupCodes": ""
                }
            }
        )
        return result.modified_count > 0
    
    # ===================== LOGIN HISTORY =====================
    
    def create_login_session(self, user_id: str, device: str, browser: str, 
                            location: str, ip_address: str) -> str:
        """Create new login session"""
        self._ensure_db()
        session = {
            "_id": ObjectId(),
            "userId": ObjectId(user_id),
            "device": device,
            "browser": browser,
            "location": location,
            "ipAddress": ip_address,
            "loginTime": datetime.utcnow(),
            "lastActivity": datetime.utcnow(),
            "isActive": True
        }
        
        result = self.sessions_collection.insert_one(session)
        return str(result.inserted_id)
    
    def get_login_history(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Get user's login history"""
        self._ensure_db()
        sessions = list(self.sessions_collection.find(
            {"userId": ObjectId(user_id)}
        ).sort("loginTime", -1).limit(limit))
        
        return [
            {
                "id": str(session["_id"]),
                "device": session["device"],
                "browser": session["browser"],
                "location": session["location"],
                "ipAddress": session["ipAddress"],
                "loginTime": session["loginTime"],
                "isActive": session.get("isActive", False)
            }
            for session in sessions
        ]
    
    def logout_session(self, session_id: str, user_id: str) -> bool:
        """Logout specific session"""
        self._ensure_db()
        result = self.sessions_collection.update_one(
            {"_id": ObjectId(session_id), "userId": ObjectId(user_id)},
            {
                "$set": {
                    "isActive": False,
                    "logoutTime": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    def logout_all_sessions_except_current(self, user_id: str, current_session_id: str) -> int:
        """Logout all sessions except the current one"""
        self._ensure_db()
        result = self.sessions_collection.update_many(
            {
                "userId": ObjectId(user_id),
                "_id": {"$ne": ObjectId(current_session_id)},
                "isActive": True
            },
            {
                "$set": {
                    "isActive": False,
                    "logoutTime": datetime.utcnow()
                }
            }
        )
        return result.modified_count
    
    # ===================== DATA DOWNLOAD =====================
    
    def create_data_download_request(self, user_id: str, include_documents: bool,
                                     include_transactions: bool, include_applications: bool) -> str:
        """Create data download request"""
        self._ensure_db()
        request = {
            "_id": ObjectId(),
            "userId": ObjectId(user_id),
            "includeDocuments": include_documents,
            "includeTransactions": include_transactions,
            "includeApplications": include_applications,
            "status": "pending",
            "requestedAt": datetime.utcnow(),
            "completedAt": None,
            "downloadUrl": None
        }
        
        result = self.data_requests_collection.insert_one(request)
        return str(result.inserted_id)
    
    def get_data_download_request(self, request_id: str, user_id: str) -> Optional[Dict]:
        """Get data download request"""
        self._ensure_db()
        request = self.data_requests_collection.find_one({
            "_id": ObjectId(request_id),
            "userId": ObjectId(user_id)
        })
        
        if not request:
            return None
        
        return {
            "id": str(request["_id"]),
            "status": request["status"],
            "requestedAt": request["requestedAt"],
            "completedAt": request.get("completedAt"),
            "downloadUrl": request.get("downloadUrl")
        }
    
    # ===================== ACCOUNT DELETION =====================
    
    def create_deletion_request(self, user_id: str, reason: Optional[str] = None) -> Dict:
        """Create account deletion request"""
        self._ensure_db()
        scheduled_date = datetime.utcnow() + timedelta(days=30)
        
        # Check if there's already a pending deletion request
        existing = self.deletion_requests_collection.find_one({
            "userId": ObjectId(user_id),
            "status": "pending"
        })
        
        if existing:
            return {
                "id": str(existing["_id"]),
                "scheduledDate": existing["scheduledDate"],
                "cancellationPeriod": 30
            }
        
        request = {
            "_id": ObjectId(),
            "userId": ObjectId(user_id),
            "reason": reason,
            "status": "pending",
            "requestedAt": datetime.utcnow(),
            "scheduledDate": scheduled_date,
            "cancellationPeriod": 30
        }
        
        result = self.deletion_requests_collection.insert_one(request)
        
        return {
            "id": str(result.inserted_id),
            "scheduledDate": scheduled_date,
            "cancellationPeriod": 30
        }
    
    def cancel_deletion_request(self, user_id: str) -> bool:
        """Cancel account deletion request"""
        self._ensure_db()
        result = self.deletion_requests_collection.update_one(
            {"userId": ObjectId(user_id), "status": "pending"},
            {
                "$set": {
                    "status": "cancelled",
                    "cancelledAt": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    def get_deletion_request(self, user_id: str) -> Optional[Dict]:
        """Get pending deletion request"""
        self._ensure_db()
        request = self.deletion_requests_collection.find_one({
            "userId": ObjectId(user_id),
            "status": "pending"
        })
        
        if not request:
            return None
        
        return {
            "id": str(request["_id"]),
            "scheduledDate": request["scheduledDate"],
            "cancellationPeriod": request["cancellationPeriod"],
            "reason": request.get("reason")
        }


# Create singleton instance
settings_repository = SettingsRepository()
