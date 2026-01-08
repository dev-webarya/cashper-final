# This module provides backward compatibility for auth imports
# The actual implementation is in auth_middleware
from app.utils.auth_middleware import get_current_user, verify_admin_token, get_optional_user

__all__ = ["get_current_user", "verify_admin_token", "get_optional_user"]
