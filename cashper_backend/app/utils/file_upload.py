"""
File Upload Utility
==================
Handles image uploads for testimonials and blog posts
"""

import os
import uuid
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from pathlib import Path
import shutil

# Configuration
UPLOAD_DIR = Path("uploads")
TESTIMONIAL_DIR = UPLOAD_DIR / "testimonials"
BLOG_DIR = UPLOAD_DIR / "blogs"
DOCUMENTS_DIR = UPLOAD_DIR / "documents"
PROFILE_DIR = UPLOAD_DIR / "profiles"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}


def init_upload_directories():
    """Create upload directories if they don't exist"""
    UPLOAD_DIR.mkdir(exist_ok=True)
    TESTIMONIAL_DIR.mkdir(exist_ok=True)
    BLOG_DIR.mkdir(exist_ok=True)
    DOCUMENTS_DIR.mkdir(exist_ok=True)
    PROFILE_DIR.mkdir(exist_ok=True)


def validate_image_file(file: UploadFile) -> None:
    """
    Validate uploaded image file
    
    Args:
        file: Uploaded file
        
    Raises:
        HTTPException: If file is invalid
    """
    # Check if file is provided
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Check file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check content type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )


def validate_document_file(file: UploadFile) -> None:
    """
    Validate uploaded document file (PDF, images, Word docs)
    
    Args:
        file: Uploaded file
        
    Raises:
        HTTPException: If file is invalid
    """
    # Check if file is provided
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Check file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_DOCUMENT_EXTENSIONS)}"
        )


async def save_upload_file(
    file: UploadFile,
    upload_type: str = "general"
) -> str:
    """
    Save uploaded file to disk
    
    Args:
        file: Uploaded file
        upload_type: Type of upload ("testimonial", "blog", or "document")
        
    Returns:
        str: Relative path to saved file
        
    Raises:
        HTTPException: If file cannot be saved
    """
    try:
        # Validate file based on type
        if upload_type == "document":
            validate_document_file(file)
        else:
            validate_image_file(file)
        
        # Initialize directories
        init_upload_directories()
        
        # Determine upload directory
        if upload_type == "testimonial":
            target_dir = TESTIMONIAL_DIR
        elif upload_type == "blog":
            target_dir = BLOG_DIR
        elif upload_type == "document":
            target_dir = DOCUMENTS_DIR
        elif upload_type == "profile":
            target_dir = PROFILE_DIR
        else:
            target_dir = UPLOAD_DIR
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}{file_ext}"
        file_path = target_dir / unique_filename
        
        # Save file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return relative path (for database storage)
        if upload_type == "document":
            relative_path = f"/uploads/documents/{unique_filename}"
        elif upload_type == "profile":
            relative_path = f"/uploads/profiles/{unique_filename}"
        else:
            relative_path = f"/uploads/{upload_type}s/{unique_filename}"
        
        return relative_path
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )
    finally:
        # Close file
        await file.close()


def delete_file(file_path: str) -> bool:
    """
    Delete file from disk
    
    Args:
        file_path: Relative path to file
        
    Returns:
        bool: True if deleted, False otherwise
    """
    try:
        # Convert relative path to absolute
        if file_path.startswith("/uploads/"):
            file_path = file_path[1:]  # Remove leading slash
        
        full_path = Path(file_path)
        
        if full_path.exists():
            full_path.unlink()
            return True
        
        return False
        
    except Exception as e:
        print(f"Error deleting file: {e}")
        return False


def get_file_size(file_path: str) -> Optional[int]:
    """
    Get file size in bytes
    
    Args:
        file_path: Path to file
        
    Returns:
        int: File size in bytes, or None if file doesn't exist
    """
    try:
        if file_path.startswith("/uploads/"):
            file_path = file_path[1:]
        
        full_path = Path(file_path)
        
        if full_path.exists():
            return full_path.stat().st_size
        
        return None
        
    except Exception:
        return None


async def replace_file(
    old_file_path: Optional[str],
    new_file: UploadFile,
    upload_type: str = "general"
) -> str:
    """
    Replace existing file with new one
    
    Args:
        old_file_path: Path to old file (will be deleted)
        new_file: New file to upload
        upload_type: Type of upload
        
    Returns:
        str: Path to new file
    """
    # Save new file
    new_path = await save_upload_file(new_file, upload_type)
    
    # Delete old file if it exists
    if old_file_path and old_file_path.startswith("/uploads/"):
        delete_file(old_file_path)
    
    return new_path

