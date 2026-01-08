from fastapi import APIRouter, HTTPException, status, Form, UploadFile, File, Depends
from app.database.schema.motor_insurance_schema import (
    MotorInsuranceInquiryRequest,
    MotorInsuranceInquiryResponse,
    MotorInsuranceInquiryInDB,
    MotorInsuranceApplicationRequest,
    MotorInsuranceApplicationResponse,
    MotorInsuranceApplicationInDB,
    InquiryStatus,
    ApplicationStatus,
    StatusUpdate
)
from app.database.schema.insurance_policy_schema import (
    InsurancePolicyCreate,
    InsuranceType,
    PolicyStatus
)
from app.database.repository.motor_insurance_repository import motor_insurance_repository
from app.database.repository.insurance_management_repository import insurance_management_repository
from app.utils.auth_middleware import get_current_user
from app.utils.auth import get_optional_user
from app.database.db import get_database
from datetime import datetime, timedelta
from typing import List, Optional
import os
import shutil

router = APIRouter(prefix="/motor-insurance", tags=["Motor Insurance"])

# ==================== INQUIRY ENDPOINTS ====================

@router.post("/contact/submit", response_model=MotorInsuranceInquiryResponse, status_code=status.HTTP_201_CREATED)
def submit_contact_inquiry(inquiry: MotorInsuranceInquiryRequest):
    """
    Submit a motor insurance inquiry from the contact form.
    """
    try:
        # Create inquiry in database
        inquiry_data = MotorInsuranceInquiryInDB(**inquiry.dict())
        inquiry_id = motor_insurance_repository.create_inquiry(inquiry_data)
        
        # Prepare response
        response = MotorInsuranceInquiryResponse(
            id=inquiry_id,
            **inquiry.dict(),
            status=InquiryStatus.pending,
            createdAt=datetime.now(),
            message="Thank you! Our motor insurance advisor will contact you soon."
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
    Get all motor insurance inquiries (Admin endpoint).
    """
    try:
        inquiries = motor_insurance_repository.get_all_inquiries(skip, limit)
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
        inquiry = motor_insurance_repository.get_inquiry_by_id(inquiry_id)
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
        
        success = motor_insurance_repository.update_inquiry_status(
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

@router.post("/application/submit", response_model=MotorInsuranceApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_application(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    age: int = Form(...),
    vehicleType: str = Form(...),
    registrationNumber: str = Form(...),
    makeModel: str = Form(...),
    manufacturingYear: int = Form(...),
    vehicleValue: float = Form(...),
    policyType: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    rc: Optional[UploadFile] = File(None),
    dl: Optional[UploadFile] = File(None),
    vehiclePhotos: Optional[UploadFile] = File(None),
    previousPolicy: Optional[UploadFile] = File(None),
    addressProof: Optional[UploadFile] = File(None),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Submit a motor insurance application with file uploads.
    """
    try:
        # Generate application number
        app_number = f"MI{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Create uploads directory if not exists
        upload_dir = "uploads/motor_insurance"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Process uploaded files
        document_paths = {}
        
        if rc:
            file_path = os.path.join(upload_dir, f"{app_number}_rc_{rc.filename}")
            with open(file_path, 'wb') as f:
                f.write(rc.file.read())
            document_paths['rc'] = file_path
            
        if dl:
            file_path = os.path.join(upload_dir, f"{app_number}_dl_{dl.filename}")
            with open(file_path, 'wb') as f:
                f.write(dl.file.read())
            document_paths['dl'] = file_path
            
        if vehiclePhotos:
            file_path = os.path.join(upload_dir, f"{app_number}_vehicle_{vehiclePhotos.filename}")
            with open(file_path, 'wb') as f:
                f.write(vehiclePhotos.file.read())
            document_paths['vehiclePhotos'] = file_path
            
        if previousPolicy:
            file_path = os.path.join(upload_dir, f"{app_number}_previous_{previousPolicy.filename}")
            with open(file_path, 'wb') as f:
                f.write(previousPolicy.file.read())
            document_paths['previousPolicy'] = file_path
            
        if addressProof:
            file_path = os.path.join(upload_dir, f"{app_number}_address_{addressProof.filename}")
            with open(file_path, 'wb') as f:
                f.write(addressProof.file.read())
            document_paths['addressProof'] = file_path
        
        # Create application in database
        application_data = MotorInsuranceApplicationInDB(
            userId=str(current_user["_id"]),
            applicationNumber=app_number,
            name=name,
            email=email,
            phone=phone,
            age=age,
            vehicleType=vehicleType,
            registrationNumber=registrationNumber,
            makeModel=makeModel,
            manufacturingYear=manufacturingYear,
            vehicleValue=vehicleValue,
            policyType=policyType,
            address=address,
            city=city,
            state=state,
            pincode=pincode,
            rc=document_paths.get('rc'),
            dl=document_paths.get('dl'),
            vehiclePhotos=document_paths.get('vehiclePhotos'),
            previousPolicy=document_paths.get('previousPolicy'),
            addressProof=document_paths.get('addressProof')
        )
        application_id = motor_insurance_repository.create_application(application_data)
        
        # Also create policy entry for admin panel
        try:
            policy_data = InsurancePolicyCreate(
                customer=name,
                email=email,
                phone=phone,
                type=InsuranceType.motor_insurance,
                premium=f"₹{vehicleValue * 0.03 / 100000:.1f}L/year",  # 3% of vehicle value
                coverage=f"₹{vehicleValue / 100000:.1f}L",
                startDate=datetime.now().strftime("%Y-%m-%d"),
                endDate=(datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d"),
                status=PolicyStatus.pending,
                nominee=f"Vehicle: {registrationNumber}",
                documents=[
                    doc for doc in [
                        document_paths.get('rc'),
                        document_paths.get('dl'),
                        document_paths.get('vehiclePhotos'),
                        document_paths.get('previousPolicy'),
                        document_paths.get('addressProof')
                    ] if doc is not None
                ]
            )
            insurance_management_repository.create_policy(policy_data)
        except Exception as policy_error:
            print(f"Warning: Failed to create policy entry: {str(policy_error)}")
        
        # Prepare response with all fields
        response = MotorInsuranceApplicationResponse(
            id=application_id,
            userId=str(current_user["_id"]) if current_user else None,
            applicationNumber=app_number,
            name=name,
            email=email,
            phone=phone,
            age=age,
            vehicleType=vehicleType,
            registrationNumber=registrationNumber,
            makeModel=makeModel,
            manufacturingYear=manufacturingYear,
            vehicleValue=vehicleValue,
            policyType=policyType,
            address=address,
            city=city,
            state=state,
            pincode=pincode,
            status=ApplicationStatus.submitted,
            submittedAt=datetime.now(),
            message=f"Your motor insurance application has been submitted successfully! Your application number is {app_number}",
            rc=document_paths.get('rc'),
            dl=document_paths.get('dl'),
            vehiclePhotos=document_paths.get('vehiclePhotos'),
            previousPolicy=document_paths.get('previousPolicy'),
            addressProof=document_paths.get('addressProof')
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
    Get motor insurance applications filtered by user.
    Admin sees all, regular users see only their own.
    """
    try:
        db = get_database()
        
        # If no user is logged in, return empty list
        if not current_user:
            print("⚠️ No current user in motor insurance - returning empty list")
            return []
        
        print(f"✓ Motor Insurance - Current user: {current_user.get('_id')}")
        
        # Check if user is admin
        is_admin = current_user.get("isAdmin", False)
        print(f"Admin check: is_admin = {is_admin}")
        
        if is_admin:
            # Admin can see all applications
            print("👨‍💼 Admin user - fetching all motor applications")
            applications = motor_insurance_repository.get_all_applications(skip, limit)
        else:
            # Regular users see only their own applications
            user_id = str(current_user["_id"])
            print(f"📝 Searching motor applications for userId: {user_id}")
            collection = db["motor_insurance_applications"]
            applications = list(collection.find({"userId": user_id}).skip(skip).limit(limit))
            print(f"✓ Found {len(applications)} motor applications for user")
            
            # Convert ObjectId to string for JSON serialization
            for app in applications:
                app["_id"] = str(app["_id"])
                if "userId" in app:
                    app["userId"] = str(app["userId"])
        
        print(f"📤 Returning {len(applications)} motor applications")
        return applications
    except Exception as e:
        print(f"❌ Error in motor insurance GET: {str(e)}")
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
        application = motor_insurance_repository.get_application_by_id(application_id)
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
        application = motor_insurance_repository.get_application_by_number(app_number)
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
        
        success = motor_insurance_repository.update_application_status(
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
    Get motor insurance statistics (Admin endpoint).
    """
    try:
        stats = motor_insurance_repository.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )
