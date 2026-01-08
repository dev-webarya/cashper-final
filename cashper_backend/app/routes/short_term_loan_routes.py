from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File
from typing import Optional, List
from datetime import datetime
from app.database.schema.short_term_loan_schema import (
    StatusUpdate,
    ShortTermGetInTouchCreate,
    ShortTermGetInTouchResponse,
    ShortTermLoanApplicationCreate,
    ShortTermLoanApplicationUpdate,
    ShortTermLoanApplicationResponse,
    EligibilityCriteriaCreate,
    EligibilityCriteriaUpdate,
    EligibilityCriteriaResponse
)
from app.database.repository.short_term_loan_repository import (
    ShortTermGetInTouchRepository,
    ShortTermLoanApplicationRepository,
    EligibilityCriteriaRepository
)
from app.utils.auth_middleware import verify_admin_token
from app.utils.file_upload import save_upload_file
from app.utils.auth import get_current_user, get_optional_user
import jwt

router = APIRouter(prefix="/api/short-term-loan", tags=["Short Term Loan"])

# Helper function to extract user ID from token if present (optional authentication)
async def get_optional_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extract user ID from token if present, return None if not"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    try:
        token = authorization.split(" ")[1]
        from app.config import SECRET_KEY
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload.get("user_id")
    except:
        return None


# ==================== GET IN TOUCH ENDPOINTS ====================

@router.post("/get-in-touch", response_model=ShortTermGetInTouchResponse, status_code=201)
async def submit_get_in_touch(
    data: ShortTermGetInTouchCreate,
    user_id: Optional[str] = Depends(get_optional_user_id)
):
    """
    Submit GET IN TOUCH form for Short Term Loan
    - No login required
    - If user is logged in, their ID will be tracked
    """
    request_data = data.dict(by_alias=False)
    request_data["userId"] = user_id
    
    result = ShortTermGetInTouchRepository.create(request_data)
    return ShortTermGetInTouchResponse(
        id=result["_id"],
        fullName=result.get("fullName", ""),
        email=result.get("email", ""),
        phone=result.get("phone", ""),
        loanAmount=result.get("loanAmount", 0),
        userId=result.get("userId"),
        status=result.get("status", "pending"),
        createdAt=result.get("created_at", datetime.now())
    )


@router.get("/get-in-touch", response_model=List[ShortTermGetInTouchResponse])
async def get_all_get_in_touch_requests(admin_user: dict = Depends(verify_admin_token)):
    """Get all GET IN TOUCH requests (Admin only)"""
    requests = ShortTermGetInTouchRepository.get_all()
    return [
        ShortTermGetInTouchResponse(id=req["_id"], **{k: v for k, v in req.items() if k != "_id"})
        for req in requests
    ]


@router.get("/get-in-touch/my-requests", response_model=List[ShortTermGetInTouchResponse])
async def get_my_get_in_touch_requests(user_id: str = Depends(get_optional_user_id)):
    """Get user's own GET IN TOUCH requests (Login required)"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    requests = ShortTermGetInTouchRepository.get_by_user_id(user_id)
    return [
        ShortTermGetInTouchResponse(id=req["_id"], **{k: v for k, v in req.items() if k != "_id"})
        for req in requests
    ]


@router.patch("/get-in-touch/{request_id}/status")
async def update_get_in_touch_status(
    request_id: str,
    status: str,
    admin_user: dict = Depends(verify_admin_token)
):
    """Update GET IN TOUCH request status (Admin only)"""
    if status not in ["pending", "contacted", "converted"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    success = ShortTermGetInTouchRepository.update_status(request_id, status)
    if not success:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return {"message": "Status updated successfully", "status": status}


# ============ DOCUMENT UPLOAD ENDPOINT ============

@router.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    """Upload a document for Short Term Loan application"""
    try:
        # Save the file
        file_path = await save_upload_file(file, upload_type="document")
        
        return {
            "success": True,
            "message": "Document uploaded successfully",
            "filePath": file_path,
            "fileName": file.filename
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")


@router.get("/upload-document")
async def get_uploaded_documents(application_id: Optional[str] = None, admin_user: dict = Depends(verify_admin_token)):
    """
    Get all uploaded documents or documents for specific application (Admin only)
    
    Query Parameters:
    - application_id (optional): Filter documents by application ID
    
    Returns:
        List of applications with their documents
    """
    try:
        if application_id:
            # Get specific application with documents
            application = ShortTermLoanApplicationRepository.get_by_application_id(application_id)
            if not application:
                raise HTTPException(status_code=404, detail="Application not found")
            
            documents = {}
            if application.get("aadhar"):
                documents["aadhar"] = application.get("aadhar")
            if application.get("pan"):
                documents["pan"] = application.get("pan")
            if application.get("bankStatement"):
                documents["bankStatement"] = application.get("bankStatement")
            if application.get("salarySlip"):
                documents["salarySlip"] = application.get("salarySlip")
            if application.get("photo"):
                documents["photo"] = application.get("photo")
            
            return {
                "success": True,
                "applicationId": application_id,
                "applicantName": application.get("fullName"),
                "email": application.get("email"),
                "phone": application.get("phone"),
                "documents": documents,
                "uploadedAt": str(application.get("created_at")) if application.get("created_at") else None
            }
        else:
            # Get all applications with documents
            applications = ShortTermLoanApplicationRepository.get_all()
            apps_with_docs = []
            
            for app in applications:
                documents = {}
                if app.get("aadhar"):
                    documents["aadhar"] = app.get("aadhar")
                if app.get("pan"):
                    documents["pan"] = app.get("pan")
                if app.get("bankStatement"):
                    documents["bankStatement"] = app.get("bankStatement")
                if app.get("salarySlip"):
                    documents["salarySlip"] = app.get("salarySlip")
                if app.get("photo"):
                    documents["photo"] = app.get("photo")
                
                if documents:  # Only include if has documents
                    apps_with_docs.append({
                        "id": str(app.get("_id")) if app.get("_id") else None,
                        "applicationId": app.get("application_id"),
                        "applicantName": app.get("fullName"),
                        "email": app.get("email"),
                        "phone": app.get("phone"),
                        "documents": documents,
                        "status": app.get("status"),
                        "uploadedAt": str(app.get("created_at")) if app.get("created_at") else None
                    })
            
            return {
                "success": True,
                "totalApplications": len(apps_with_docs),
                "applications": apps_with_docs
            }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve documents: {str(e)}")


# ==================== SHORT TERM LOAN APPLICATION ENDPOINTS ====================

@router.post("/applications", response_model=ShortTermLoanApplicationResponse, status_code=201)
async def submit_short_term_loan_application(
    data: ShortTermLoanApplicationCreate,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Submit Short Term Loan Application
    - No login required
    - If user is logged in, their ID will be tracked
    - Returns unique application ID for tracking
    """
    app_data = data.dict()
    # Capture userId if user is logged in
    app_data["userId"] = str(current_user["_id"]) if current_user else None
    
    print(f"\n📝 SHORT-TERM LOAN POST ENDPOINT")
    print(f"✓ Current user logged in: {current_user is not None}")
    if current_user:
        print(f"✓ User ID: {current_user.get('_id')}")
        print(f"✓ Saving userId as string: {app_data['userId']} (type: {type(app_data['userId']).__name__})")
    
    result = ShortTermLoanApplicationRepository.create(app_data)
    print(f"✓ Application saved with ID: {result.get('_id')}")
    print(f"✓ Stored userId in DB: {result.get('userId')} (type: {type(result.get('userId')).__name__})")
    
    return ShortTermLoanApplicationResponse(
        id=result["_id"],
        applicationId=result.get("application_id", ""),
        fullName=result.get("fullName", ""),
        email=result.get("email", ""),
        phone=result.get("phone", ""),
        relativeName=result.get("relativeName", ""),
        relativeRelation=result.get("relativeRelation", ""),
        relativePhone=result.get("relativePhone", ""),
        loanAmount=result.get("loanAmount", ""),
        purpose=result.get("purpose", ""),
        employment=result.get("employment", ""),
        monthlyIncome=result.get("monthlyIncome", ""),
        companyName=result.get("companyName"),
        workExperience=result.get("workExperience"),
        creditScore=result.get("creditScore"),
        panNumber=result.get("panNumber", ""),
        aadharNumber=result.get("aadharNumber", ""),
        address=result.get("address", ""),
        city=result.get("city", ""),
        state=result.get("state", ""),
        pincode=result.get("pincode", ""),
        aadhar=result.get("aadhar"),
        pan=result.get("pan"),
        bankStatement=result.get("bankStatement"),
        salarySlip=result.get("salarySlip"),
        photo=result.get("photo"),
        userId=result.get("userId"),
        status=result.get("status", "pending"),
        notes=result.get("notes"),
        createdAt=result.get("created_at", datetime.now())
    )


@router.get("/applications", response_model=List[ShortTermLoanApplicationResponse])
async def get_all_applications(current_user: dict = Depends(get_current_user)):
    """
    Get Short Term Loan applications
    - Admin: Gets all applications
    - Regular user: Gets only their own applications
    """
    try:
        from app.database.db import get_database
        db = get_database()
        
        print(f"\n🔍 SHORT-TERM LOAN GET ENDPOINT")
        print(f"✓ Current user: {current_user.get('_id')}, Email: {current_user.get('email')}")
        
        # Check if user is admin
        is_admin = current_user.get("isAdmin", False) or current_user.get("role") == "admin"
        print(f"Admin check: is_admin = {is_admin}")
        
        if is_admin:
            # Admin gets all applications
            print("👨‍💼 Admin user - fetching all short-term loan applications")
            applications = list(db["short_term_loan_applications"].find())
        else:
            # Regular user gets only their applications
            user_id_str = str(current_user["_id"])
            print(f"📝 Searching short-term loans with userId: {user_id_str}")
            
            # First, let's see what's in the database
            all_apps = list(db["short_term_loan_applications"].find())
            print(f"📊 Total short-term loans in database: {len(all_apps)}")
            
            # Show sample userId values from database
            if all_apps:
                print(f"📋 Sample database records userId types:")
                for app in all_apps[:3]:
                    stored_id = app.get("userId")
                    print(f"  - Stored userId: {stored_id} (type: {type(stored_id).__name__})")
                    print(f"    Query userId: {user_id_str} (type: {type(user_id_str).__name__})")
                    print(f"    Match: {stored_id == user_id_str}")
            
            # Query for user's applications
            applications = list(db["short_term_loan_applications"].find({"userId": user_id_str}))
            print(f"✓ Found {len(applications)} short-term loan applications for user")
        
        if not applications:
            print(f"📤 No applications found, returning empty list")
            return []
        
        print(f"📤 Returning {len(applications)} short-term loan applications")
        
        return [
            ShortTermLoanApplicationResponse(
                id=str(app["_id"]),
                fullName=app.get("fullName", ""),
                email=app.get("email", ""),
                phone=app.get("phone", ""),
                relativeName=app.get("relativeName", ""),
                relativeRelation=app.get("relativeRelation", ""),
                relativePhone=app.get("relativePhone", ""),
                loanAmount=str(app.get("loanAmount", "")),
                purpose=app.get("purpose", ""),
                employment=app.get("employment", ""),
                monthlyIncome=str(app.get("monthlyIncome", "")),
                companyName=app.get("companyName"),
                workExperience=app.get("workExperience"),
                creditScore=app.get("creditScore"),
                panNumber=app.get("panNumber", ""),
                aadharNumber=app.get("aadharNumber", ""),
                address=app.get("address", ""),
                city=app.get("city", ""),
                state=app.get("state", ""),
                pincode=app.get("pincode", ""),
                aadhar=app.get("aadhar"),
                pan=app.get("pan"),
                bankStatement=app.get("bankStatement"),
                salarySlip=app.get("salarySlip"),
                photo=app.get("photo"),
                userId=app.get("userId"),
                applicationId=app.get("application_id", app.get("applicationId", "")),
                status=app.get("status", "pending"),
                notes=app.get("notes"),
                createdAt=app.get("createdAt", app.get("created_at", datetime.now()))
            )
            for app in applications
        ]
    except Exception as e:
        import traceback
        print(f"\n❌ ERROR in Short Term Loan /applications:")
        print(f"Exception: {str(e)}")
        print(f"Traceback:\n{traceback.format_exc()}")
        # If collection doesn't exist or any error, return empty list
        return []


@router.get("/applications/tracking/{application_id}", response_model=ShortTermLoanApplicationResponse)
async def track_application(application_id: str):
    """
    Track application status by application ID
    - Public API, no authentication required
    - Anyone can track using application ID
    """
    application = ShortTermLoanApplicationRepository.get_by_application_id(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return ShortTermLoanApplicationResponse(
        id=application["_id"],
        **{k: v for k, v in application.items() if k != "_id"}
    )


@router.get("/applications/my-applications", response_model=List[ShortTermLoanApplicationResponse])
async def get_my_applications(user_id: str = Depends(get_optional_user_id)):
    """Get user's own applications (Login required)"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    applications = ShortTermLoanApplicationRepository.get_by_user_id(user_id)
    return [
        ShortTermLoanApplicationResponse(id=app["_id"], **{k: v for k, v in app.items() if k != "_id"})
        for app in applications
    ]


@router.patch("/applications/{application_id}", response_model=dict)
async def update_application(
    application_id: str,
    data: ShortTermLoanApplicationUpdate,
    admin_user: dict = Depends(verify_admin_token)
):
    """Update Short Term Loan application (Admin only)"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    success = ShortTermLoanApplicationRepository.update(application_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {"message": "Application updated successfully"}


@router.patch("/applications/{application_id}/status")
async def update_application_status(application_id: str, status_update: StatusUpdate):
    """Update Short Term Loan application status"""
    try:
        from bson import ObjectId
        from app.database.db import get_database
        
        # Validate status
        new_status = status_update.status.lower()
        valid_statuses = ["pending", "under review", "approved", "rejected", "disbursed"]
        if new_status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status: {new_status}")
        
        # Get database
        db = get_database()
        collection = db["short_term_loan_applications"]
        
        # Prepare update data
        update_data = {"status": new_status}
        rejection_reason = status_update.rejectionReason or status_update.reason
        if new_status == "rejected" and rejection_reason:
            update_data["rejectionReason"] = rejection_reason
        
        # Update in database
        result = collection.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Failed to update status")
        
        return {
            "success": True,
            "message": f"Status updated to {new_status}",
            "applicationId": application_id,
            "newStatus": new_status
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")


@router.delete("/applications/{application_id}")
async def delete_application(
    application_id: str,
    admin_user: dict = Depends(verify_admin_token)
):
    """Delete Short Term Loan application (Admin only)"""
    success = ShortTermLoanApplicationRepository.delete(application_id)
    if not success:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {"message": "Application deleted successfully"}


# ==================== ELIGIBILITY CRITERIA ENDPOINTS ====================

@router.get("/eligibility-criteria", response_model=List[EligibilityCriteriaResponse])
async def get_eligibility_criteria():
    """
    Get all eligibility criteria for Short Term Loan
    - Public API, no authentication required
    """
    criteria = EligibilityCriteriaRepository.get_all()
    return [
        EligibilityCriteriaResponse(
            id=c["_id"],
            label=c.get("label", ""),
            value=c.get("value", ""),
            order=c.get("order", 0),
            createdAt=c.get("created_at", datetime.now())
        )
        for c in criteria
    ]


@router.post("/eligibility-criteria", response_model=EligibilityCriteriaResponse, status_code=201)
async def create_eligibility_criteria(
    data: EligibilityCriteriaCreate,
    admin_user: dict = Depends(verify_admin_token)
):
    """Create new eligibility criteria (Admin only)"""
    result = EligibilityCriteriaRepository.create(data.dict())
    return EligibilityCriteriaResponse(
        id=result["_id"],
        **{k: v for k, v in result.items() if k != "_id"}
    )


@router.get("/eligibility-criteria/{criteria_id}", response_model=EligibilityCriteriaResponse)
async def get_eligibility_criteria_by_id(criteria_id: str):
    """Get eligibility criteria by ID"""
    criterion = EligibilityCriteriaRepository.get_by_id(criteria_id)
    if not criterion:
        raise HTTPException(status_code=404, detail="Criteria not found")
    
    return EligibilityCriteriaResponse(
        id=criterion["_id"],
        **{k: v for k, v in criterion.items() if k != "_id"}
    )


@router.patch("/eligibility-criteria/{criteria_id}", response_model=dict)
async def update_eligibility_criteria(
    criteria_id: str,
    data: EligibilityCriteriaUpdate,
    admin_user: dict = Depends(verify_admin_token)
):
    """Update eligibility criteria (Admin only)"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    success = EligibilityCriteriaRepository.update(criteria_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Criteria not found")
    
    return {"message": "Criteria updated successfully"}


@router.delete("/eligibility-criteria/{criteria_id}")
async def delete_eligibility_criteria(
    criteria_id: str,
    admin_user: dict = Depends(verify_admin_token)
):
    """Delete eligibility criteria (Admin only)"""
    success = EligibilityCriteriaRepository.delete(criteria_id)
    if not success:
        raise HTTPException(status_code=404, detail="Criteria not found")
    
    return {"message": "Criteria deleted successfully"}
