from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Optional
from datetime import datetime
from bson import ObjectId
from ..database.db import get_database
from ..utils.auth_middleware import get_current_user

router = APIRouter(prefix="/api/user/retail-services", tags=["User Retail Services"])


@router.get("/applications")
async def get_user_retail_applications(
    current_user: dict = Depends(get_current_user),
    service_type: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all retail service applications for the current logged-in user"""
    try:
        db = get_database()
        collection = db["RetailServiceApplications"]
        
        # Build query to filter by user's email
        user_email = current_user.get("email")
        if not user_email:
            raise HTTPException(status_code=401, detail="User email not found")
        
        query = {"email": user_email}
        
        # Add optional filters
        if service_type:
            query["serviceType"] = service_type
            print(f"🔍 Filtering by service_type: {service_type}")
        if status:
            # Convert status to lowercase for case-insensitive matching
            query["status"] = status.lower()
            print(f"🔍 Filtering by status: {status.lower()}")
        
        print(f"📊 Query: {query}")
        print(f"📊 User email: {user_email}")
        
        # Fetch applications
        applications = list(collection.find(query).sort("createdAt", -1))
        print(f"✅ Found {len(applications)} applications")
        
        # Transform data for frontend
        result = []
        for app in applications:
            result.append({
                "id": str(app.get("_id")),
                "application_id": app.get("applicationId", "N/A"),
                "applicant_name": app.get("applicantName", "N/A"),
                "applicant_email": app.get("email", "N/A"),
                "service_type": app.get("serviceType", "N/A"),
                "contact": app.get("phone", "N/A"),
                "applied_on": app.get("createdAt", datetime.now()).strftime("%d %b %Y") if isinstance(app.get("createdAt"), datetime) else "N/A",
                "status": app.get("status", "pending").title(),
                "documents": app.get("documents", {})
            })
        
        return JSONResponse(content=result, status_code=200)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching user applications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/applications/{application_id}")
async def get_user_retail_application_by_id(
    application_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific retail service application by ID for the current user"""
    try:
        db = get_database()
        collection = db["RetailServiceApplications"]
        
        user_email = current_user.get("email")
        if not user_email:
            raise HTTPException(status_code=401, detail="User email not found")
        
        # Try to find by MongoDB _id first
        try:
            application = collection.find_one({
                "_id": ObjectId(application_id),
                "email": user_email
            })
        except:
            # If ObjectId fails, try to find by applicationId field
            application = collection.find_one({
                "applicationId": application_id,
                "email": user_email
            })
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Transform data
        result = {
            "id": str(application.get("_id")),
            "application_id": application.get("applicationId", "N/A"),
            "applicant_name": application.get("applicantName", "N/A"),
            "applicant_email": application.get("email", "N/A"),
            "service_type": application.get("serviceType", "N/A"),
            "contact": application.get("phone", "N/A"),
            "applied_on": application.get("createdAt", datetime.now()).strftime("%d %b %Y") if isinstance(application.get("createdAt"), datetime) else "N/A",
            "status": application.get("status", "pending").title(),
            "application_data": application.get("applicationData", {}),
            "documents": application.get("documents", {})
        }
        
        return JSONResponse(content=result, status_code=200)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error fetching application: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
