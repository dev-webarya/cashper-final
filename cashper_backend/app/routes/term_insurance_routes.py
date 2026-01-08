from fastapi import APIRouter, HTTPException, status, Form, UploadFile, File, Depends
from app.database.schema.term_insurance_schema import (
    TermInsuranceInquiryRequest,
    TermInsuranceInquiryResponse,
    TermInsuranceInquiryInDB,
    TermInsuranceApplicationRequest,
    TermInsuranceApplicationResponse,
    TermInsuranceApplicationInDB,
    InquiryStatus,
    ApplicationStatus,
    StatusUpdate
)
from app.database.schema.insurance_policy_schema import (
    InsurancePolicyCreate,
    InsuranceType,
    PolicyStatus
)
from app.database.repository.term_insurance_repository import term_insurance_repository
from app.database.repository.insurance_management_repository import insurance_management_repository
from app.utils.auth_middleware import get_current_user
from app.utils.auth import get_optional_user
from app.database.db import get_database
from datetime import datetime, timedelta
from typing import List, Optional
import os
import shutil

router = APIRouter(prefix="/term-insurance", tags=["Term Insurance"])

# ==================== INQUIRY ENDPOINTS ====================

@router.post("/contact/submit", response_model=TermInsuranceInquiryResponse, status_code=status.HTTP_201_CREATED)
def submit_contact_inquiry(inquiry: TermInsuranceInquiryRequest):
    """
    Submit a term insurance inquiry from the contact form.
    """
    try:
        # Create inquiry in database
        inquiry_data = TermInsuranceInquiryInDB(**inquiry.dict())
        inquiry_id = term_insurance_repository.create_inquiry(inquiry_data)
        
        # Prepare response
        response = TermInsuranceInquiryResponse(
            id=inquiry_id,
            **inquiry.dict(),
            status=InquiryStatus.pending,
            createdAt=datetime.now(),
            message="Thank you! Our term insurance advisor will contact you soon."
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
    Get all term insurance inquiries (Admin endpoint).
    """
    try:
        inquiries = term_insurance_repository.get_all_inquiries(skip, limit)
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
        inquiry = term_insurance_repository.get_inquiry_by_id(inquiry_id)
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
        
        success = term_insurance_repository.update_inquiry_status(
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

@router.post("/application/submit", response_model=TermInsuranceApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_application(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    occupation: str = Form(...),
    annualIncome: str = Form(...),
    coverage: str = Form(...),
    term: int = Form(default=20),
    smokingStatus: str = Form(default='no'),
    existingConditions: Optional[str] = Form(None),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    nomineeRelation: Optional[str] = Form(None),
    aadhar: Optional[UploadFile] = File(None),
    pan: Optional[UploadFile] = File(None),
    photo: Optional[UploadFile] = File(None),
    incomeProof: Optional[UploadFile] = File(None),
    medicalReports: Optional[UploadFile] = File(None),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Submit a term insurance application with file uploads.
    """
    try:
        # Generate application number
        app_number = f"TI{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Create uploads directory if not exists
        upload_dir = "uploads/term_insurance"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Process uploaded files
        document_paths = {}
        
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
            
        if incomeProof:
            file_path = os.path.join(upload_dir, f"{app_number}_income_{incomeProof.filename}")
            with open(file_path, 'wb') as f:
                f.write(incomeProof.file.read())
            document_paths['incomeProof'] = file_path
            
        if medicalReports:
            file_path = os.path.join(upload_dir, f"{app_number}_medical_{medicalReports.filename}")
            with open(file_path, 'wb') as f:
                f.write(medicalReports.file.read())
            document_paths['medicalReports'] = file_path
        
        # Create application in database
        application_data = TermInsuranceApplicationInDB(
            userId=str(current_user["_id"]),
            applicationNumber=app_number,
            name=name,
            email=email,
            phone=phone,
            age=age,
            gender=gender,
            occupation=occupation,
            annualIncome=annualIncome,
            coverage=coverage,
            term=term,
            smokingStatus=smokingStatus,
            existingConditions=existingConditions,
            address=address,
            city=city,
            state=state,
            pincode=pincode,
            nomineeRelation=nomineeRelation,
            aadhar=document_paths.get('aadhar'),
            pan=document_paths.get('pan'),
            photo=document_paths.get('photo'),
            incomeProof=document_paths.get('incomeProof'),
            medicalReports=document_paths.get('medicalReports')
        )
        application_id = term_insurance_repository.create_application(application_data)
        
        # Also create policy entry for admin panel
        try:
            # Calculate premium based on coverage and age
            coverage_value = float(coverage.replace('₹', '').replace('Cr', '0000000').replace('L', '00000').replace(',', ''))
            age_factor = 1 + (age - 25) * 0.02  # 2% increase per year above 25
            premium_value = (coverage_value * 0.005 * age_factor) / 100000  # 0.5% of coverage adjusted by age
            
            policy_data = InsurancePolicyCreate(
                customer=name,
                email=email,
                phone=phone,
                type=InsuranceType.term_insurance,
                premium=f"₹{premium_value:.1f}L/year",
                coverage=coverage,
                startDate=datetime.now().strftime("%Y-%m-%d"),
                endDate=(datetime.now() + timedelta(days=term * 365 if term else 365 * 20)).strftime("%Y-%m-%d"),
                status=PolicyStatus.pending,
                nominee=nomineeRelation,
                documents=[
                    doc for doc in [
                        document_paths.get('aadhar'),
                        document_paths.get('pan'),
                        document_paths.get('photo'),
                        document_paths.get('incomeProof'),
                        document_paths.get('medicalReports')
                    ] if doc is not None
                ]
            )
            insurance_management_repository.create_policy(policy_data)
        except Exception as policy_error:
            print(f"Warning: Failed to create policy entry: {str(policy_error)}")
        
        # Prepare response with all fields
        response = TermInsuranceApplicationResponse(
            id=application_id,
            userId=str(current_user["_id"]) if current_user else None,
            applicationNumber=app_number,
            name=name,
            email=email,
            phone=phone,
            age=age,
            gender=gender,
            occupation=occupation,
            annualIncome=annualIncome,
            smokingStatus=smokingStatus,
            existingConditions=existingConditions,
            coverage=coverage,
            term=term,
            nomineeRelation=nomineeRelation,
            address=address,
            city=city,
            state=state,
            pincode=pincode,
            status=ApplicationStatus.submitted,
            submittedAt=datetime.now(),
            message=f"Your term insurance application has been submitted successfully! Your application number is {app_number}",
            aadhar=document_paths.get('aadhar'),
            pan=document_paths.get('pan'),
            photo=document_paths.get('photo'),
            incomeProof=document_paths.get('incomeProof'),
            medicalReports=document_paths.get('medicalReports')
        )
        
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit application: {str(e)}"
        )

@router.get("/application/all", response_model=List[dict])
def get_all_applications(skip: int = 0, limit: int = 100, current_user: Optional[dict] = Depends(get_optional_user)):
    """
    Get term insurance applications filtered by user.
    Admin sees all, regular users see only their own.
    """
    try:
        db = get_database()
        
        # If no user is logged in, return empty list
        if not current_user:
            print("⚠️ No current user in term insurance - returning empty list")
            return []
        
        print(f"✓ Term Insurance - Current user: {current_user.get('_id')}")
        
        # Check if user is admin
        is_admin = current_user.get("isAdmin", False)
        print(f"Admin check: is_admin = {is_admin}")
        
        if is_admin:
            # Admin can see all applications
            print("👨‍💼 Admin user - fetching all term applications")
            applications = term_insurance_repository.get_all_applications(skip, limit)
        else:
            # Regular users see only their own applications
            user_id = str(current_user["_id"])
            print(f"📝 Searching term applications for userId: {user_id}")
            collection = db["term_insurance_applications"]
            applications = list(collection.find({"userId": user_id}).skip(skip).limit(limit))
            print(f"✓ Found {len(applications)} term applications for user")
            
            # Convert ObjectId to string for JSON serialization
            for app in applications:
                app["_id"] = str(app["_id"])
                if "userId" in app:
                    app["userId"] = str(app["userId"])
        
        print(f"📤 Returning {len(applications)} term applications")
        return applications
    except Exception as e:
        print(f"❌ Error in term insurance GET: {str(e)}")
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
        application = term_insurance_repository.get_application_by_id(application_id)
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
        application = term_insurance_repository.get_application_by_number(app_number)
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
        
        success = term_insurance_repository.update_application_status(
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
    Get term insurance statistics (Admin endpoint).
    """
    try:
        stats = term_insurance_repository.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )
