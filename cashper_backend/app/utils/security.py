from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
def decode_access_token(token: str) -> Optional[dict]:
    """Decode JWT access token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
def get_password_strength(password: str) -> dict:
    """
    Calculate password strength
    Returns dict with strength level and suggestions
    """
    strength = 0
    suggestions = []
    
    if len(password) >= 8:
        strength += 1
    else:
        suggestions.append("Use at least 8 characters")
    
    if any(c.islower() for c in password) and any(c.isupper() for c in password):
        strength += 1
    else:
        suggestions.append("Include both uppercase and lowercase letters")
    
    if any(c.isdigit() for c in password):
        strength += 1
    else:
        suggestions.append("Include at least one number")
    
    if any(not c.isalnum() for c in password):
        strength += 1
    else:
        suggestions.append("Include at least one special character")
    levels = {
        0: "Very Weak",
        1: "Weak",
        2: "Fair",
        3: "Good",
        4: "Strong"
    }
    return {
        "strength": strength,
        "level": levels[strength],
        "suggestions": suggestions
    }