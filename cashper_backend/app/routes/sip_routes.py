from fastapi import APIRouter, HTTPException, status, Depends, File, UploadFile, Form
from typing import List, Optional
from datetime import datetime
import random
import string

from app.database.repository.sip_repository import SIPRepository
from app.database.schema.sip_schema import (
    SIPInquiryRequest, SIPInquiryResponse, SIPInquiryInDB,
    SIPCalculatorRequest, SIPCalculatorResponse, SIPCalculatorInDB,
    SIPApplicationRequest, SIPApplicationResponse, SIPApplicationInDB,
    InquiryStatus, ApplicationStatus
)
from app.utils.auth_middleware import get_current_user
from app.utils.file_upload import save_upload_file
from app.database.repository.dashboard_repository import dashboard_repository

router = APIRouter(prefix="/api/sip", tags=["SIP"])
repository = SIPRepository()

def generate_application_number() -> str:
    """Generate unique application number"""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_suffix = ''.join(random.choices(string.digits, k=6))
    return f"SIP{timestamp}{random_suffix}"

# ===================== Inquiry/Contact Endpoints =====================

@router.post("/contact/submit", response_model=SIPInquiryResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_inquiry(request: SIPInquiryRequest):
    """Submit a contact inquiry for SIP investment"""
    try:
        # Create inquiry in database
        inquiry_data = SIPInquiryInDB(
            fullName=request.fullName,
            email=request.email,
            phone=request.phone,
            investmentAmount=request.investmentAmount,
            duration=request.duration,
            message=request.message or "",
            status=InquiryStatus.PENDING.value
        )
        
        inquiry_id = repository.create_inquiry(inquiry_data.dict())
        
        # Return response
        return SIPInquiryResponse(
            id=inquiry_id,
            fullName=request.fullName,
            email=request.email,
            phone=request.phone,
            investmentAmount=request.investmentAmount,
            duration=request.duration,
            status=InquiryStatus.PENDING.value,
            createdAt=datetime.utcnow(),
            message="Thank you! Our investment advisor will contact you soon."
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit inquiry: {str(e)}"
        )

@router.get("/contact/all")
async def get_all_inquiries(skip: int = 0, limit: int = 100):
    """Get all contact inquiries (Admin)"""
    try:
        inquiries = repository.get_all_inquiries(skip, limit)
        return {
            "success": True,
            "count": len(inquiries),
            "inquiries": inquiries
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch inquiries: {str(e)}"
        )

@router.get("/contact/{inquiry_id}")
async def get_inquiry(inquiry_id: str):
    """Get specific inquiry by ID"""
    inquiry = repository.get_inquiry_by_id(inquiry_id)
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found"
        )
    return inquiry

@router.patch("/contact/{inquiry_id}/status")
async def update_inquiry_status(
    inquiry_id: str,
    status: str,
    notes: Optional[str] = None
):
    """Update inquiry status (Admin)"""
    try:
        # Validate status
        if status not in [s.value for s in InquiryStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {[s.value for s in InquiryStatus]}"
            )
        
        success = repository.update_inquiry_status(inquiry_id, status, notes)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inquiry not found"
            )
        
        return {
            "success": True,
            "message": "Inquiry status updated successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}"
        )

# ===================== Calculator Endpoints =====================

@router.post("/calculator/calculate", response_model=SIPCalculatorResponse)
async def calculate_sip_returns(request: SIPCalculatorRequest):
    """Calculate SIP returns"""
    try:
        # SIP calculation formula: M = P × ({[1 + i]^n – 1} / i) × (1 + i)
        # where P = monthly investment, i = monthly rate, n = number of months
        monthly_rate = request.expectedReturn / 12 / 100
        total_months = request.timePeriod * 12
        
        # Calculate future value
        if monthly_rate > 0:
            future_value = request.monthlyInvestment * (
                ((1 + monthly_rate) ** total_months - 1) / monthly_rate
            ) * (1 + monthly_rate)
        else:
            future_value = request.monthlyInvestment * total_months
        
        total_investment = request.monthlyInvestment * total_months
        estimated_returns = future_value - total_investment
        
        response = SIPCalculatorResponse(
            monthlyInvestment=request.monthlyInvestment,
            expectedReturn=request.expectedReturn,
            timePeriod=request.timePeriod,
            totalInvestment=round(total_investment, 2),
            estimatedReturns=round(estimated_returns, 2),
            futureValue=round(future_value, 2),
            totalMonths=total_months
        )
        
        # Save calculation to database
        calculation_data = SIPCalculatorInDB(
            monthlyInvestment=request.monthlyInvestment,
            expectedReturn=request.expectedReturn,
            timePeriod=request.timePeriod,
            totalInvestment=response.totalInvestment,
            estimatedReturns=response.estimatedReturns,
            futureValue=response.futureValue,
            totalMonths=total_months
        )
        repository.save_calculation(calculation_data.dict())
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Calculation failed: {str(e)}"
        )

@router.get("/calculator/all")
async def get_all_calculations(skip: int = 0, limit: int = 100):
    """Get all calculations (Admin)"""
    try:
        calculations = repository.get_all_calculations(skip, limit)
        return {
            "success": True,
            "count": len(calculations),
            "calculations": calculations
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch calculations: {str(e)}"
        )

# ===================== Application Endpoints =====================

@router.post("/documents/upload", status_code=status.HTTP_201_CREATED)
async def upload_sip_document(
    file: UploadFile = File(...),
    documentType: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload document for SIP application"""
    try:
        user_id = str(current_user["_id"])
        
        # Validate file type
        allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png'}
        file_extension = '.' + file.filename.split('.')[-1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: PDF, JPG, PNG"
            )
        
        # Save file
        file_path = await save_upload_file(file, "documents")
        
        return {
            "success": True,
            "filePath": file_path,
            "fileName": file.filename,
            "documentType": documentType,
            "message": f"{documentType} uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )

@router.post("/application/submit", response_model=SIPApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(request: SIPApplicationRequest, current_user: dict = Depends(get_current_user)):
    """Submit SIP application"""
    try:
        user_id = str(current_user["_id"])
        user_email = current_user["email"]
        
        # Check if PAN already exists
        if repository.check_pan_exists(request.panNumber):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An application with this PAN number already exists"
            )
        
        # Generate application number
        app_number = generate_application_number()
        
        # Create application
        application_data = SIPApplicationInDB(
            applicationNumber=app_number,
            userId=user_id,
            userEmail=user_email,
            name=request.name,
            email=request.email,
            phone=request.phone,
            age=request.age,
            panNumber=request.panNumber,
            sipAmount=request.sipAmount,
            sipFrequency=request.sipFrequency,
            tenure=request.tenure,
            investmentGoal=request.investmentGoal,
            riskProfile=request.riskProfile,
            address=request.address,
            city=request.city,
            state=request.state,
            pincode=request.pincode,
            documents={
                "pan": request.panDocument,
                "aadhaar": request.aadhaarDocument,
                "photo": request.photoDocument,
                "bankProof": request.bankProofDocument
            },
            status=ApplicationStatus.SUBMITTED
        )
        
        application_id = repository.create_application(application_data.dict())
        
        return SIPApplicationResponse(
            id=application_id,
            applicationNumber=app_number,
            name=request.name,
            email=request.email,
            phone=request.phone,
            age=request.age,
            panNumber=request.panNumber,
            sipAmount=request.sipAmount,
            sipFrequency=request.sipFrequency,
            tenure=request.tenure,
            investmentGoal=request.investmentGoal,
            riskProfile=request.riskProfile,
            address=request.address,
            city=request.city,
            state=request.state,
            pincode=request.pincode,
            documents={
                "pan": request.panDocument,
                "aadhaar": request.aadhaarDocument,
                "photo": request.photoDocument,
                "bankProof": request.bankProofDocument
            },
            status=ApplicationStatus.SUBMITTED,
            submittedAt=datetime.utcnow(),
            message=f"Your SIP application has been submitted successfully! Your application number is {app_number}"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit application: {str(e)}"
        )

@router.get("/application/all")
async def get_all_applications(skip: int = 0, limit: int = 100):
    """Get all applications (Admin)"""
    try:
        applications = repository.get_all_applications(skip, limit)
        return {
            "success": True,
            "count": len(applications),
            "applications": applications
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch applications: {str(e)}"
        )

@router.get("/application/user/{email}")
async def get_user_applications(email: str):
    """Get all applications for a specific user by email"""
    try:
        applications = repository.get_applications_by_email(email)
        return {
            "success": True,
            "count": len(applications),
            "applications": applications
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user applications: {str(e)}"
        )

@router.get("/application/{application_id}")
async def get_application(application_id: str):
    """Get specific application by ID"""
    application = repository.get_application_by_id(application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return application

@router.get("/application/number/{app_number}")
async def get_application_by_number(app_number: str):
    """Get application by application number"""
    application = repository.get_application_by_number(app_number)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return application

@router.patch("/application/{application_id}/status")
async def update_application_status(
    application_id: str,
    new_status: str,
    reviewed_by: Optional[str] = None,
    remarks: Optional[str] = None
):
    """Update application status (Admin)"""
    try:
        # Validate status
        if new_status not in [s.value for s in ApplicationStatus]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {[s.value for s in ApplicationStatus]}"
            )
        
        success = repository.update_application_status(
            application_id, new_status, reviewed_by, remarks
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        return {
            "success": True,
            "message": "Application status updated successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}"
        )

# ===================== Statistics Endpoint =====================

@router.get("/statistics")
async def get_statistics():
    """Get overall statistics (Admin)"""
    try:
        stats = repository.get_statistics()
        return {
            "success": True,
            "statistics": stats
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )
