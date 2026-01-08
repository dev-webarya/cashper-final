from fastapi import APIRouter, HTTPException, status, File, UploadFile, Form
from fastapi.responses import FileResponse
from typing import List, Optional
from datetime import datetime
import random
import string
from pathlib import Path
import shutil

from app.database.repository.mutual_funds_repository import MutualFundsRepository
from app.database.schema.mutual_funds_schema import (
    MutualFundInquiryRequest, MutualFundInquiryResponse, MutualFundInquiryInDB,
    MutualFundCalculatorRequest, MutualFundCalculatorResponse, MutualFundCalculatorInDB,
    MutualFundApplicationRequest, MutualFundApplicationResponse, MutualFundApplicationInDB,
    InquiryStatus, ApplicationStatus
)

router = APIRouter(prefix="/api/mutual-funds", tags=["Mutual Funds"])
repository = MutualFundsRepository()

def generate_application_number() -> str:
    """Generate unique application number"""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_suffix = ''.join(random.choices(string.digits, k=6))
    return f"MF{timestamp}{random_suffix}"

# ===================== Inquiry/Contact Endpoints =====================

@router.post("/contact/submit", response_model=MutualFundInquiryResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_inquiry(request: MutualFundInquiryRequest):
    """Submit a contact inquiry for mutual fund investment"""
    try:
        # Create inquiry in database
        inquiry_data = MutualFundInquiryInDB(
            name=request.name,
            email=request.email,
            phone=request.phone,
            investmentAmount=request.investmentAmount,
            investmentGoal=request.investmentGoal,
            status=InquiryStatus.PENDING
        )
        
        inquiry_id = repository.create_inquiry(inquiry_data.dict())
        
        # Return response
        return MutualFundInquiryResponse(
            id=inquiry_id,
            name=request.name,
            email=request.email,
            phone=request.phone,
            investmentAmount=request.investmentAmount,
            investmentGoal=request.investmentGoal,
            status=InquiryStatus.PENDING,
            createdAt=datetime.utcnow(),
            message="Thank you! Our mutual fund advisor will contact you soon."
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

@router.post("/calculator/calculate", response_model=MutualFundCalculatorResponse)
async def calculate_investment_returns(request: MutualFundCalculatorRequest):
    """Calculate investment returns for lumpsum or SIP"""
    try:
        investment_type = request.investmentType
        return_rate = request.returnRate / 100  # Convert percentage to decimal
        time_period = request.timePeriod
        
        if investment_type == "lumpsum":
            if not request.amount:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Amount is required for lumpsum investment"
                )
            
            # Lumpsum calculation: A = P(1 + r/n)^(nt)
            # For annual compounding: A = P(1 + r)^t
            total_investment = request.amount
            maturity_value = total_investment * ((1 + return_rate) ** time_period)
            estimated_returns = maturity_value - total_investment
            
            response = MutualFundCalculatorResponse(
                investmentType=investment_type,
                totalInvestment=round(total_investment, 2),
                estimatedReturns=round(estimated_returns, 2),
                maturityValue=round(maturity_value, 2),
                returnRate=request.returnRate,
                timePeriod=time_period
            )
        
        else:  # SIP
            if not request.sipAmount:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="SIP amount is required for SIP investment"
                )
            
            # SIP calculation: M = P × ({[1 + i]^n – 1} / i) × (1 + i)
            # where P = monthly investment, i = monthly rate, n = number of months
            monthly_rate = return_rate / 12
            total_months = time_period * 12
            
            # Future value of SIP
            if monthly_rate > 0:
                maturity_value = request.sipAmount * (
                    ((1 + monthly_rate) ** total_months - 1) / monthly_rate
                ) * (1 + monthly_rate)
            else:
                maturity_value = request.sipAmount * total_months
            
            total_investment = request.sipAmount * total_months
            estimated_returns = maturity_value - total_investment
            
            response = MutualFundCalculatorResponse(
                investmentType=investment_type,
                totalInvestment=round(total_investment, 2),
                estimatedReturns=round(estimated_returns, 2),
                maturityValue=round(maturity_value, 2),
                returnRate=request.returnRate,
                timePeriod=time_period,
                monthlyInvestment=request.sipAmount,
                totalMonths=total_months
            )
        
        # Save calculation to database
        calculation_data = MutualFundCalculatorInDB(
            investmentType=investment_type,
            amount=request.amount,
            sipAmount=request.sipAmount,
            returnRate=request.returnRate,
            timePeriod=time_period,
            totalInvestment=response.totalInvestment,
            estimatedReturns=response.estimatedReturns,
            maturityValue=response.maturityValue
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

@router.post("/application/submit", response_model=MutualFundApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(
    # Personal Information
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    age: int = Form(...),
    panNumber: str = Form(...),
    
    # Investment Details
    investmentType: str = Form(...),
    investmentAmount: float = Form(...),
    investmentGoal: str = Form(...),
    riskProfile: str = Form(...),
    sipAmount: Optional[float] = Form(None),
    sipFrequency: Optional[str] = Form(None),
    
    # Address & KYC
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    
    # Document files
    pan_document: Optional[UploadFile] = File(None),
    aadhaar_document: Optional[UploadFile] = File(None),
    photo_document: Optional[UploadFile] = File(None),
    bank_proof_document: Optional[UploadFile] = File(None),
):
    """Submit mutual fund investment application with file uploads"""
    try:
        # Check if PAN already exists
        if repository.check_pan_exists(panNumber):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An application with this PAN number already exists"
            )
        
        # Create uploads directory if it doesn't exist
        documents_dir = Path("uploads/documents")
        documents_dir.mkdir(parents=True, exist_ok=True)
        
        # Process and save uploaded files
        document_paths = {
            "pan": None,
            "aadhaar": None,
            "photo": None,
            "bankProof": None
        }
        
        # Helper function to save file
        async def save_file(file: UploadFile, field_name: str) -> Optional[str]:
            if file:
                try:
                    # Generate unique filename
                    import uuid
                    file_ext = Path(file.filename).suffix
                    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
                    file_path = documents_dir / unique_filename
                    
                    # Save file
                    content = await file.read()
                    with open(file_path, "wb") as f:
                        f.write(content)
                    
                    return unique_filename
                except Exception as e:
                    print(f"Error saving {field_name}: {e}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Failed to upload {field_name}"
                    )
            return None
        
        # Save all documents
        document_paths["pan"] = await save_file(pan_document, "PAN document")
        document_paths["aadhaar"] = await save_file(aadhaar_document, "Aadhaar document")
        document_paths["photo"] = await save_file(photo_document, "Photo document")
        document_paths["bankProof"] = await save_file(bank_proof_document, "Bank proof document")
        
        # Generate application number
        app_number = generate_application_number()
        
        # Create application
        application_data = MutualFundApplicationInDB(
            applicationNumber=app_number,
            name=name,
            email=email,
            phone=phone,
            age=age,
            panNumber=panNumber,
            investmentType=investmentType,
            investmentAmount=investmentAmount,
            investmentGoal=investmentGoal,
            riskProfile=riskProfile,
            sipAmount=sipAmount,
            sipFrequency=sipFrequency,
            address=address,
            city=city,
            state=state,
            pincode=pincode,
            documents=document_paths,
            status=ApplicationStatus.SUBMITTED
        )
        
        application_id = repository.create_application(application_data.dict())
        
        return MutualFundApplicationResponse(
            id=application_id,
            applicationNumber=app_number,
            name=name,
            email=email,
            phone=phone,
            age=age,
            panNumber=panNumber,
            investmentType=investmentType,
            investmentAmount=investmentAmount,
            investmentGoal=investmentGoal,
            riskProfile=riskProfile,
            sipAmount=sipAmount,
            sipFrequency=sipFrequency,
            address=address,
            city=city,
            state=state,
            pincode=pincode,
            documents=document_paths,
            status=ApplicationStatus.SUBMITTED,
            submittedAt=datetime.utcnow(),
            message=f"Application submitted successfully! Your application number is {app_number}"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting application: {e}")
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

# ===================== Document Download Endpoint =====================

@router.get("/documents/download/{document_name}")
async def download_document(document_name: str):
    """Download a document from the uploads/documents directory"""
    try:
        # Define the documents directory
        documents_dir = Path("uploads/documents")
        
        # If not found, try from the backend directory
        if not documents_dir.exists():
            backend_dir = Path(__file__).parent.parent.parent
            documents_dir = backend_dir / "uploads" / "documents"
        
        # Ensure the documents directory exists
        if not documents_dir.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Documents directory not found"
            )
        
        # Construct the full file path
        file_path = documents_dir / document_name
        
        # Security: Ensure the resolved path is within the documents directory
        try:
            file_path = file_path.resolve()
            documents_dir_resolved = documents_dir.resolve()
            if not str(file_path).startswith(str(documents_dir_resolved)):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Invalid file path"
                )
        except (ValueError, RuntimeError):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Invalid file path"
            )
        
        # Check if the file exists
        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document '{document_name}' not found"
            )
        
        # Serve the file
        return FileResponse(
            path=file_path,
            filename=document_name,
            media_type="application/octet-stream"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download document: {str(e)}"
        )
