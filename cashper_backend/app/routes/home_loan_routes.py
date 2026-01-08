from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import List, Optional
from datetime import datetime

from app.database.schema.home_loan_schema import (
    StatusUpdate,
    HomeLoanGetInTouchCreate,
    HomeLoanGetInTouchResponse,
    HomeLoanGetInTouchInDB,
    HomeLoanApplicationCreate,
    HomeLoanApplicationResponse,
    HomeLoanApplicationInDB,
    EligibilityCriteriaResponse
)
from app.database.repository import home_loan_repository
from app.utils.file_upload import save_upload_file
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/home-loan", tags=["Home Loan"])

# ============ GET IN TOUCH ENDPOINTS ============

@router.post("/get-in-touch", response_model=HomeLoanGetInTouchResponse)
async def submit_get_in_touch(data: HomeLoanGetInTouchCreate):
    """Submit Get In Touch form for Home Loan"""
    try:
        # Convert to DB model
        db_data = HomeLoanGetInTouchInDB(**data.model_dump()).model_dump()
        
        # Save to database
        result = home_loan_repository.create_get_in_touch(db_data)
        
        # Return response with proper field mapping
        return HomeLoanGetInTouchResponse(
            id=str(result["_id"]),
            name=result.get("name", ""),
            email=result.get("email", ""),
            phone=result.get("phone", ""),
            loanAmount=result.get("loanAmount", ""),
            message=result.get("message", ""),
            userId=result.get("userId"),
            createdAt=result.get("created_at", datetime.now())
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit Get In Touch form: {str(e)}")

@router.get("/get-in-touch", response_model=List[HomeLoanGetInTouchResponse])
async def get_all_get_in_touch():
    """Get all Get In Touch inquiries"""
    try:
        inquiries = home_loan_repository.get_all_get_in_touch()
        return [
            HomeLoanGetInTouchResponse(
                id=str(inquiry["_id"]),
                name=inquiry.get("name", ""),
                email=inquiry.get("email", ""),
                phone=inquiry.get("phone", ""),
                loanAmount=inquiry.get("loanAmount", ""),
                message=inquiry.get("message", ""),
                userId=inquiry.get("userId"),
                createdAt=inquiry.get("created_at", datetime.now())
            )
            for inquiry in inquiries
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch inquiries: {str(e)}")

@router.get("/get-in-touch/{inquiry_id}", response_model=HomeLoanGetInTouchResponse)
async def get_get_in_touch_by_id(inquiry_id: str):
    """Get Get In Touch inquiry by ID"""
    try:
        inquiry = home_loan_repository.get_get_in_touch_by_id(inquiry_id)
        if not inquiry:
            raise HTTPException(status_code=404, detail="Inquiry not found")
        
        return HomeLoanGetInTouchResponse(
            id=str(inquiry["_id"]),
            fullName=inquiry.get("fullName", ""),
            email=inquiry.get("email", ""),
            phone=inquiry.get("phone", ""),
            loanAmount=inquiry.get("loanAmount", ""),
            userId=inquiry.get("userId"),
            createdAt=inquiry.get("created_at", datetime.now())
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch inquiry: {str(e)}")

# ============ DOCUMENT UPLOAD ENDPOINT ============

@router.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    """Upload a document for Home Loan application"""
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
async def get_uploaded_documents(application_id: Optional[str] = None):
    """
    Get all uploaded documents or documents for specific application
    
    Query Parameters:
    - application_id (optional): Filter documents by application ID
    
    Returns:
        List of applications with their documents
    """
    try:
        if application_id:
            # Get specific application with documents
            application = home_loan_repository.get_application_by_application_id(application_id)
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
            applications = home_loan_repository.get_all_applications()
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

# ============ APPLICATION ENDPOINTS ============

@router.post("/apply", response_model=HomeLoanApplicationResponse)
async def submit_home_loan_application(
    data: HomeLoanApplicationCreate,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """Submit Home Loan application - Works with or without login"""
    try:
        # Convert to dict
        data_dict = data.model_dump()
        
        # Add userId from authenticated user if available
        if current_user:
            data_dict['userId'] = str(current_user["_id"])
        
        # Convert to DB model (will auto-generate application_id and set status)
        db_data = HomeLoanApplicationInDB(
            **data_dict,
            application_id="",  # Will be generated in repository
            status="pending"
        ).model_dump()
        
        # Remove empty application_id
        db_data.pop("application_id", None)
        
        # Save to database
        result = home_loan_repository.create_application(db_data)
        
        # Manual field mapping for response
        return HomeLoanApplicationResponse(
            id=str(result["_id"]),
            fullName=result.get("fullName", ""),
            email=result.get("email", ""),
            phone=result.get("phone", ""),
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
            applicationId=result.get("application_id", ""),
            status=result.get("status", "pending"),
            createdAt=result.get("created_at", datetime.now())
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

@router.get("/applications", response_model=List[HomeLoanApplicationResponse])
async def get_all_applications(current_user: dict = Depends(get_current_user)):
    """Get authenticated user's Home Loan applications"""
    try:
        from app.database.db import get_database
        db = get_database()
        user_id_str = str(current_user["_id"])
        applications = list(db["home_loan_applications"].find({"userId": user_id_str}))
        return [
            HomeLoanApplicationResponse(
                id=str(app["_id"]),
                fullName=app.get("fullName", ""),
                email=app.get("email", ""),
                phone=app.get("phone", ""),
                loanAmount=app.get("loanAmount", ""),
                purpose=app.get("purpose", ""),
                employment=app.get("employment", ""),
                monthlyIncome=app.get("monthlyIncome", ""),
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
                applicationId=app.get("application_id", ""),
                status=app.get("status", "pending"),
                createdAt=app.get("created_at", datetime.now())
            )
            for app in applications
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")

@router.get("/applications/{application_id}", response_model=HomeLoanApplicationResponse)
async def get_application_by_id(application_id: str):
    """Get Home Loan application by ID"""
    try:
        app = home_loan_repository.get_application_by_id(application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return HomeLoanApplicationResponse(
            id=str(app["_id"]),
            fullName=app.get("fullName", ""),
            email=app.get("email", ""),
            phone=app.get("phone", ""),
            loanAmount=app.get("loanAmount", ""),
            purpose=app.get("purpose", ""),
            employment=app.get("employment", ""),
            monthlyIncome=app.get("monthlyIncome", ""),
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
            applicationId=app.get("application_id", ""),
            status=app.get("status", "pending"),
            createdAt=app.get("created_at", datetime.now())
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch application: {str(e)}")

# ============ UPDATE APPLICATION STATUS ============

@router.patch("/applications/{application_id}/status")
async def update_application_status(application_id: str, status_update: StatusUpdate):
    """Update Home Loan application status"""
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
        collection = db["home_loan_applications"]
        
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

# ============ ELIGIBILITY CRITERIA ENDPOINTS ============

@router.get("/information")
async def get_home_loan_information():
    """Get Home Loan information including features, benefits, and requirements"""
    return {
        "title": "Home Loan",
        "description": "Get your dream home with our flexible home loan options. Competitive interest rates starting from 8.5% p.a.",
        "features": [
            {
                "title": "Low Interest Rates",
                "description": "Interest rates starting from 8.5% p.a.",
                "icon": "percentage"
            },
            {
                "title": "Flexible Tenure",
                "description": "Loan tenure up to 30 years",
                "icon": "calendar"
            },
            {
                "title": "Quick Processing",
                "description": "Get approval in 48-72 hours",
                "icon": "clock"
            },
            {
                "title": "High Loan Amount",
                "description": "Loan up to ₹5 Crores",
                "icon": "rupee"
            }
        ],
        "eligibility": [
            "Age: 21-65 years",
            "Minimum Income: ₹25,000/month",
            "Employment: Salaried or Self-employed",
            "Credit Score: 650 and above"
        ],
        "documents": [
            "Identity Proof (Aadhaar/PAN/Passport)",
            "Address Proof",
            "Income Proof (Salary Slips/ITR)",
            "Bank Statements (6 months)",
            "Property Documents"
        ],
        "benefits": [
            "Tax benefits under Section 80C and 24(b)",
            "No prepayment charges after 6 months",
            "Balance transfer facility",
            "Top-up loan facility"
        ]
    }

@router.get("/eligibility-criteria", response_model=List[EligibilityCriteriaResponse])
async def get_eligibility_criteria():
    """Get Home Loan eligibility criteria"""
    try:
        # Seed data if not exists
        home_loan_repository.seed_eligibility_criteria()
        
        criteria = home_loan_repository.get_all_eligibility_criteria()
        return [
            EligibilityCriteriaResponse(
                id=str(c["_id"]),
                label=c.get("label", ""),
                value=c.get("value", ""),
                order=c.get("order", 0),
                createdAt=c.get("created_at", datetime.now())
            )
            for c in criteria
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch eligibility criteria: {str(e)}")

# ============ UTILITY ENDPOINTS ============

@router.get("/application-by-number/{application_number}", response_model=HomeLoanApplicationResponse)
async def get_application_by_number(application_number: str):
    """Get Home Loan application by application number"""
    try:
        app = home_loan_repository.get_application_by_application_id(application_number)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return HomeLoanApplicationResponse(
            id=str(app["_id"]),
            fullName=app.get("fullName", ""),
            email=app.get("email", ""),
            phone=app.get("phone", ""),
            loanAmount=app.get("loanAmount", ""),
            purpose=app.get("purpose", ""),
            employment=app.get("employment", ""),
            monthlyIncome=app.get("monthlyIncome", ""),
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
            applicationId=app.get("application_id", ""),
            status=app.get("status", "pending"),
            createdAt=app.get("created_at", datetime.now())
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch application: {str(e)}")
