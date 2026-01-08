from fastapi import APIRouter, HTTPException, status, Form, UploadFile, File, Depends
from app.database.schema.health_insurance_schema import (
    HealthInsuranceInquiryRequest,
    HealthInsuranceInquiryResponse,
    HealthInsuranceInquiryInDB,
    HealthInsuranceApplicationRequest,
    HealthInsuranceApplicationResponse,
    HealthInsuranceApplicationInDB,
    InquiryStatus,
    ApplicationStatus,
    StatusUpdate
)
from app.database.schema.insurance_policy_schema import (
    InsurancePolicyCreate,
    InsuranceType,
    PolicyStatus
)
from app.database.repository.health_insurance_repository import health_insurance_repository
from app.database.repository.insurance_management_repository import insurance_management_repository
from app.database.db import get_database
from app.utils.auth_middleware import get_current_user
from app.utils.auth import get_optional_user
from datetime import datetime, timedelta
from typing import List, Optional
import os
import shutil

router = APIRouter(prefix="/health-insurance", tags=["Health Insurance"])

# ==================== INQUIRY ENDPOINTS ====================

@router.post("/contact/submit", response_model=HealthInsuranceInquiryResponse, status_code=status.HTTP_201_CREATED)
def submit_contact_inquiry(inquiry: HealthInsuranceInquiryRequest):
    """
    Submit a health insurance inquiry from the contact form.
    """
    try:
        # Create inquiry in database
        inquiry_data = HealthInsuranceInquiryInDB(**inquiry.dict())
        inquiry_id = health_insurance_repository.create_inquiry(inquiry_data)
        
        # Prepare response
        response = HealthInsuranceInquiryResponse(
            id=inquiry_id,
            **inquiry.dict(),
            status=InquiryStatus.pending,
            createdAt=datetime.now(),
            message="Thank you! Our health insurance advisor will contact you soon."
        )
        
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit inquiry: {str(e)}"
        )

@router.get("/contact/all", response_model=List[dict])
def get_all_inquiries(skip: int = 0, limit: int = 100):
    """
    Get all health insurance inquiries (Admin endpoint).
    """
    try:
        inquiries = health_insurance_repository.get_all_inquiries(skip, limit)
        return inquiries
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch inquiries: {str(e)}"
        )

@router.get("/contact/{inquiry_id}", response_model=dict)
def get_inquiry_by_id(inquiry_id: str):
    """
    Get a specific inquiry by ID.
    """
    try:
        inquiry = health_insurance_repository.get_inquiry_by_id(inquiry_id)
        if not inquiry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inquiry not found"
            )
        return inquiry
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch inquiry: {str(e)}"
        )

@router.patch("/contact/{inquiry_id}/status", response_model=dict)
def update_inquiry_status(inquiry_id: str, status_update: StatusUpdate):
    """
    Update inquiry status (Admin endpoint).
    """
    try:
        # Validate status
        try:
            inquiry_status = InquiryStatus(status_update.status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join([s.value for s in InquiryStatus])}"
            )
        
        success = health_insurance_repository.update_inquiry_status(
            inquiry_id,
            inquiry_status,
            status_update.remarks
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inquiry not found"
            )
        
        return {
            "message": "Inquiry status updated successfully",
            "inquiryId": inquiry_id,
            "newStatus": status_update.status
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update inquiry status: {str(e)}"
        )

# ==================== APPLICATION ENDPOINTS ====================

@router.post("/application/submit", response_model=HealthInsuranceApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_application(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    familySize: int = Form(...),
    coverageAmount: str = Form(...),
    policyType: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    existingConditions: Optional[str] = Form(None),
    aadhar: Optional[UploadFile] = File(None),
    pan: Optional[UploadFile] = File(None),
    photo: Optional[UploadFile] = File(None),
    medicalReports: Optional[UploadFile] = File(None),
    addressProof: Optional[UploadFile] = File(None),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Submit a health insurance application with file uploads.
    """
    try:
        # Generate application number
        app_number = f"HI{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Create uploads directory if not exists
        upload_dir = "uploads/health_insurance"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Process uploaded files
        document_paths = {}
        
        async def save_file(file: Optional[UploadFile], field_name: str) -> Optional[str]:
            if file:
                try:
                    file_path = os.path.join(upload_dir, f"{app_number}_{field_name}_{file.filename}")
                    # Handle async file save
                    import aiofiles
                    async with aiofiles.open(file_path, 'wb') as f:
                        await f.write(await file.read())
                    return file_path
                except Exception as e:
                    print(f"Warning: Failed to save {field_name}: {str(e)}")
                    return None
            return None
        
        # For sync endpoint, save files synchronously
        import tempfile
        
        if aadhar:
            file_path = os.path.join(upload_dir, f"{app_number}_aadhar_{aadhar.filename}")
            with open(file_path, 'wb') as f:
                f.write(aadhar.file.read())
            document_paths['aadhar'] = file_path
            
        if pan:
            file_path = os.path.join(upload_dir, f"{app_number}_pan_{pan.filename}")
            with open(file_path, 'wb') as f:
                f.write(pan.file.read())
            document_paths['pan'] = file_path
            
        if photo:
            file_path = os.path.join(upload_dir, f"{app_number}_photo_{photo.filename}")
            with open(file_path, 'wb') as f:
                f.write(photo.file.read())
            document_paths['photo'] = file_path
            
        if medicalReports:
            file_path = os.path.join(upload_dir, f"{app_number}_medical_{medicalReports.filename}")
            with open(file_path, 'wb') as f:
                f.write(medicalReports.file.read())
            document_paths['medicalReports'] = file_path
            
        if addressProof:
            file_path = os.path.join(upload_dir, f"{app_number}_address_{addressProof.filename}")
            with open(file_path, 'wb') as f:
                f.write(addressProof.file.read())
            document_paths['addressProof'] = file_path
        
        # Create application in database
        application_data = HealthInsuranceApplicationInDB(
            userId=str(current_user["_id"]),
            applicationNumber=app_number,
            name=name,
            email=email,
            phone=phone,
            age=age,
            gender=gender,
            familySize=familySize,
            coverageAmount=coverageAmount,
            policyType=policyType,
            address=address,
            city=city,
            state=state,
            pincode=pincode,
            existingConditions=existingConditions,
            aadhar=document_paths.get('aadhar'),
            pan=document_paths.get('pan'),
            photo=document_paths.get('photo'),
            medicalReports=document_paths.get('medicalReports'),
            addressProof=document_paths.get('addressProof')
        )
        application_id = health_insurance_repository.create_application(application_data)
        
        # Also create policy entry for admin panel
        try:
            policy_data = InsurancePolicyCreate(
                customer=name,
                email=email,
                phone=phone,
                type=InsuranceType.health_insurance,
                premium=f"₹{int(float(coverageAmount.replace('₹', '').replace('L', '00000').replace(',', ''))) * 0.02 / 100000:.1f}L/year",  # 2% of coverage
                coverage=coverageAmount,
                startDate=datetime.now().strftime("%Y-%m-%d"),
                endDate=(datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d"),
                status=PolicyStatus.pending,
                nominee=f"Family ({familySize} members)",
                documents=[
                    doc for doc in [
                        document_paths.get('aadhar'),
                        document_paths.get('pan'),
                        document_paths.get('photo'),
                        document_paths.get('medicalReports'),
                        document_paths.get('addressProof')
                    ] if doc is not None
                ]
            )
            insurance_management_repository.create_policy(policy_data)
        except Exception as policy_error:
            print(f"Warning: Failed to create policy entry: {str(policy_error)}")
        
        # Prepare response with all fields
        response = HealthInsuranceApplicationResponse(
            id=application_id,
            applicationNumber=app_number,
            userId=str(current_user["_id"]) if current_user else None,
            name=name,
            email=email,
            phone=phone,
            age=age,
            gender=gender,
            familySize=familySize,
            coverageAmount=coverageAmount,
            policyType=policyType,
            existingConditions=existingConditions,
            address=address,
            city=city,
            state=state,
            pincode=pincode,
            status=ApplicationStatus.submitted,
            submittedAt=datetime.now(),
            message=f"Your health insurance application has been submitted successfully! Your application number is {app_number}",
            aadhar=document_paths.get('aadhar'),
            pan=document_paths.get('pan'),
            photo=document_paths.get('photo'),
            medicalReports=document_paths.get('medicalReports'),
            addressProof=document_paths.get('addressProof')
        )
        
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit application: {str(e)}"
        )

@router.get("/application/all", response_model=List[dict])
def get_all_applications(
    skip: int = 0,
    limit: int = 100,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Get health insurance applications (User sees own, Admin sees all).
    """
    try:
        # If no user logged in, return empty list
        if not current_user:
            print("⚠️ No current user - returning empty list")
            return []
        
        print(f"✓ Current user: {current_user.get('_id')}, Email: {current_user.get('email')}")
        
        # Check if user is admin
        is_admin = current_user.get("isAdmin", False)
        print(f"Admin check: is_admin = {is_admin}")
        
        if is_admin:
            # Admin can see all applications
            print("👨‍💼 Admin user - fetching all applications")
            applications = health_insurance_repository.get_all_applications(skip, limit)
        else:
            # Regular user sees only their own applications
            print("👤 Regular user - fetching user-specific applications")
            db = get_database()
            user_id_str = str(current_user["_id"])
            print(f"📝 Searching for applications with userId: {user_id_str}")
            
            applications = list(
                db["health_insurance_applications"]
                .find({"userId": user_id_str})
                .sort("submittedAt", -1)
                .skip(skip)
                .limit(limit)
            )
            
            print(f"✓ Found {len(applications)} applications for user")
            
            # Convert ObjectId to string for JSON serialization
            for application in applications:
                application["_id"] = str(application["_id"])
                if "userId" in application and hasattr(application["userId"], '__str__'):
                    application["userId"] = str(application["userId"])
        
        print(f"📤 Returning {len(applications)} applications")
        return applications
    except Exception as e:
        print(f"❌ Error in get_all_applications: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch applications: {str(e)}"
        )

@router.get("/application/{application_id}", response_model=dict)
def get_application_by_id(application_id: str):
    """
    Get a specific application by ID.
    """
    try:
        application = health_insurance_repository.get_application_by_id(application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        return application
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch application: {str(e)}"
        )

@router.get("/application/number/{app_number}", response_model=dict)
def get_application_by_number(app_number: str):
    """
    Get application by application number (for tracking).
    """
    try:
        application = health_insurance_repository.get_application_by_number(app_number)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        return application
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch application: {str(e)}"
        )

@router.patch("/application/{application_id}/status", response_model=dict)
def update_application_status(application_id: str, status_update: StatusUpdate):
    """
    Update application status (Admin endpoint).
    """
    try:
        # Validate status
        try:
            app_status = ApplicationStatus(status_update.status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join([s.value for s in ApplicationStatus])}"
            )
        
        success = health_insurance_repository.update_application_status(
            application_id,
            app_status,
            status_update.remarks
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        return {
            "message": "Application status updated successfully",
            "applicationId": application_id,
            "newStatus": status_update.status
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update application status: {str(e)}"
        )

# ==================== STATISTICS ENDPOINT ====================

@router.get("/statistics", response_model=dict)
def get_statistics():
    """
    Get health insurance statistics (Admin endpoint).
    """
    try:
        stats = health_insurance_repository.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )
