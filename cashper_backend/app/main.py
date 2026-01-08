"""
Main FastAPI application entry point
This file imports the app from __init__.py to support both import styles:
- from app import app
- from app.main import app
"""

from app import app

# Re-export for uvicorn
__all__ = ['app']
