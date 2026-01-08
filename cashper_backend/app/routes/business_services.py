"""
Carporate Services API Routes
Handles all business-related service applications including:
- Company Registration
- Company Compliance
- Tax Audit
- Legal Advice
- Provident Fund Services
- TDS Services
- GST Services
- Payroll Services
- Accounting & Bookkeeping
"""

from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from fastapi.responses import JSONResponse
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field
import os
import uuid
import base64

from ..database.db import get_database
from ..utils.auth_middleware import get_current_user

router = APIRouter(prefix="/api/business-services", tags=["Carporate Services"])

# ======================== PYDANTIC MODELS ========================

class CompanyRegistrationApplication(BaseModel):
    full_name: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., pattern=r"^[0-9]{10}$")
    pan_number: str = Field(..., pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    proposed_company_name: str = Field(..., min_length=3)
    company_type: str
    number_of_directors: int = Field(..., ge=1)
    registration_state: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str = Field(..., pattern=r"^[0-9]{6}$")
    # Documents as base64 encoded strings
    director_pan: Optional[str] = None
    director_aadhaar: Optional[str] = None
    director_photo: Optional[str] = None
    address_proof: Optional[str] = None

class CompanyComplianceApplication(BaseModel):
    full_name: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., pattern=r"^[0-9]{10}$")
    pan_number: str = Field(..., pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    company_name: str
    cin: str = Field(..., pattern=r"^[LUu]{1}[0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$")
    compliance_type: str
    registration_date: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str = Field(..., pattern=r"^[0-9]{6}$")
    # Documents as base64 encoded strings
    cin_certificate: Optional[str] = None
    pan_card: Optional[str] = None
    financial_statements: Optional[str] = None

class TaxAuditApplication(BaseModel):
    full_name: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., pattern=r"^[0-9]{10}$")
    pan_number: str = Field(..., pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    business_name: str
    turnover: float = Field(..., gt=0)
    audit_type: str
    financial_year: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str = Field(..., pattern=r"^[0-9]{6}$")
    # Documents as base64 encoded strings
    pan_card: Optional[str] = None
    gst_returns: Optional[str] = None
    balance_sheet: Optional[str] = None

class LegalAdviceApplication(BaseModel):
    name: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., pattern=r"^[0-9]{10}$")
    company_name: str
    legal_issue_type: str
    case_description: str = Field(..., min_length=20)
    urgency: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str = Field(..., pattern=r"^[0-9]{6}$")
    company_pan: str = Field(..., pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    # Documents as base64 encoded strings
    legal_documents: Optional[str] = None
    supporting_documents: Optional[str] = None
    company_registration: Optional[str] = None

class ProvidentFundServicesApplication(BaseModel):
    name: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., pattern=r"^[0-9]{10}$")
    company_name: str
    number_of_employees: int = Field(..., ge=1)
    existing_pf_number: Optional[str] = None
    existing_esi_number: Optional[str] = None
    service_required: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str = Field(..., pattern=r"^[0-9]{6}$")
    company_pan: str = Field(..., pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    # Documents as base64 encoded strings
    pf_account_statement: Optional[str] = None
    bank_passbook: Optional[str] = None
    cancelled_cheque: Optional[str] = None

class TDSServicesApplication(BaseModel):
    full_name: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., pattern=r"^[0-9]{10}$")
    pan_number: str = Field(..., pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    company_name: str
    tan_number: str = Field(..., pattern=r"^[A-Z]{4}[0-9]{5}[A-Z]{1}$")
    service_type: str
    quarter_year: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str = Field(..., pattern=r"^[0-9]{6}$")

class GSTServicesApplication(BaseModel):
    full_name: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., pattern=r"^[0-9]{10}$")
    pan_number: str = Field(..., pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    business_name: str
    gstin: Optional[str] = Field(None, pattern=r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")
    service_type: str
    turnover: float = Field(..., gt=0)
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str = Field(..., pattern=r"^[0-9]{6}$")

class PayrollServicesApplication(BaseModel):
    name: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., pattern=r"^[0-9]{10}$")
    company_name: str
    number_of_employees: int = Field(..., ge=1)
    industry_type: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str = Field(..., pattern=r"^[0-9]{6}$")
    company_pan: str = Field(..., pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    gst_number: Optional[str] = None
    pf_number: Optional[str] = None
    esi_number: Optional[str] = None

class AccountingBookkeepingApplication(BaseModel):
    full_name: str = Field(..., min_length=3)
    email: EmailStr
    phone: str = Field(..., pattern=r"^[0-9]{10}$")
    pan_number: str = Field(..., pattern=r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    business_name: str
    business_type: str
    service_required: str
    number_of_transactions: str
    address: str = Field(..., min_length=10)
    city: str
    state: str
    pincode: str = Field(..., pattern=r"^[0-9]{6}$")

class StatusUpdate(BaseModel):
    status: str = Field(..., description="New status: Pending, Approved, Completed, or Rejected")

# ======================== HELPER FUNCTIONS ========================

def generate_application_id(service_prefix: str) -> str:
    """Generate unique application ID"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"{service_prefix}{timestamp}{str(uuid.uuid4())[:6].upper()}"

def save_base64_file(base64_string: str, folder: str, filename: str) -> str:
    """Decode base64 string and save as file"""
    try:
        # Remove data URL prefix if present (e.g., "data:image/png;base64,")
        if "," in base64_string and base64_string.startswith("data:"):
            base64_string = base64_string.split(",")[1]
        
        # Decode base64
        file_data = base64.b64decode(base64_string)
        
        # Create directory
        upload_dir = os.path.join("uploads", folder)
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_dir, filename)
        with open(file_path, "wb") as f:
            f.write(file_data)
        
        return file_path
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid file data: {str(e)}")

def save_uploaded_file(file: UploadFile, folder: str) -> str:
    """Save uploaded file and return file path (kept for backward compatibility)"""
    if not file:
        return None
    
    upload_dir = os.path.join("uploads", folder)
    os.makedirs(upload_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    
    return file_path

# ======================== COMPANY REGISTRATION APIs ========================

@router.post("/company-registration")
async def submit_company_registration(
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    pan_number: str = Form(...),
    proposed_company_name: str = Form(...),
    company_type: str = Form(...),
    number_of_directors: int = Form(...),
    registration_state: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    director_pan: Optional[UploadFile] = File(None),
    director_aadhaar: Optional[UploadFile] = File(None),
    director_photo: Optional[UploadFile] = File(None),
    address_proof: Optional[UploadFile] = File(None),
    moa_draft: Optional[UploadFile] = File(None),
    aoa_draft: Optional[UploadFile] = File(None)
):
    """Submit Company Registration Application with file uploads"""
    try:
        db = get_database()
        collection = db["company_registration_applications"]
        
        application_id = generate_application_id("CREG")
        
        application_data = {
            "application_id": application_id,
            "user_id": None,
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "pan_number": pan_number.upper(),
            "proposed_company_name": proposed_company_name,
            "company_type": company_type,
            "number_of_directors": int(number_of_directors),
            "registration_state": registration_state,
            "address": address,
            "city": city,
            "state": state,
            "pincode": pincode,
            "status": "Pending",
            "documents": {},
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # Handle file uploads
        file_mapping = {
            "director_pan": director_pan,
            "director_aadhaar": director_aadhaar,
            "director_photo": director_photo,
            "address_proof": address_proof,
            "moa_draft": moa_draft,
            "aoa_draft": aoa_draft
        }
        
        for doc_name, file_obj in file_mapping.items():
            if file_obj and file_obj.filename:
                file_path = save_uploaded_file(file_obj, f"company_registration/{application_id}")
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        application_data["_id"] = str(result.inserted_id)
        application_data["created_at"] = application_data["created_at"].isoformat()
        application_data["updated_at"] = application_data["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "message": "Company registration application submitted successfully",
            "application_id": application_data["application_id"],
            "data": application_data
        }, status_code=201)
        
    except Exception as e:
        print(f"Error submitting company registration: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/company-registration")
async def get_company_registration_applications(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's company registration applications"""
    try:
        db = get_database()
        collection = db["company_registration_applications"]
        
        # Filter by user email
        query = {"email": current_user.get("email")}
        if status:
            query["status"] = status
        
        applications = list(collection.find(query).sort("created_at", -1))
        
        for app in applications:
            app["_id"] = str(app["_id"])
            if "created_at" in app and hasattr(app["created_at"], "isoformat"):
                app["created_at"] = app["created_at"].isoformat()
            if "updated_at" in app and hasattr(app["updated_at"], "isoformat"):
                app["updated_at"] = app["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "count": len(applications),
            "applications": applications
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")

@router.get("/company-registration/{application_id}")
async def get_company_registration_by_id(
    application_id: str
):
    """Get specific company registration application"""
    try:
        db = get_database()
        collection = db["company_registration_applications"]
        
        application = collection.find_one({
            "application_id": application_id,
            "user_id": None  # No authentication
        })
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        application["_id"] = str(application["_id"])
        
        return JSONResponse(content={
            "success": True,
            "application": application
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch application: {str(e)}")

# ======================== COMPANY COMPLIANCE APIs ========================

@router.post("/company-compliance")
async def submit_company_compliance(
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    pan_number: str = Form(...),
    company_name: str = Form(...),
    cin: str = Form(...),
    compliance_type: str = Form(...),
    registration_date: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    cin_certificate: Optional[UploadFile] = File(None),
    moa: Optional[UploadFile] = File(None),
    aoa: Optional[UploadFile] = File(None),
    director_pan: Optional[UploadFile] = File(None),
    address_proof: Optional[UploadFile] = File(None)
):
    """Submit Company Compliance Application with file uploads"""
    try:
        db = get_database()
        collection = db["company_compliance_applications"]
        
        application_id = generate_application_id("CCOMP")
        
        application_data = {
            "application_id": application_id,
            "user_id": None,
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "pan_number": pan_number.upper(),
            "company_name": company_name,
            "cin": cin.upper(),
            "compliance_type": compliance_type,
            "registration_date": registration_date,
            "address": address,
            "city": city,
            "state": state,
            "pincode": pincode,
            "status": "Pending",
            "documents": {},
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # Handle file uploads - all 5 documents
        file_mapping = {
            "cin_certificate": cin_certificate,
            "moa": moa,
            "aoa": aoa,
            "director_pan": director_pan,
            "address_proof": address_proof
        }
        
        for doc_name, file_obj in file_mapping.items():
            if file_obj and file_obj.filename:
                file_path = save_uploaded_file(file_obj, f"company_compliance/{application_id}")
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        application_data["_id"] = str(result.inserted_id)
        application_data["created_at"] = application_data["created_at"].isoformat()
        application_data["updated_at"] = application_data["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "message": "Company compliance application submitted successfully",
            "application_id": application_data["application_id"],
            "data": application_data
        }, status_code=201)
        
    except Exception as e:
        print(f"Error submitting company compliance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/company-compliance")
async def get_company_compliance_applications(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's company compliance applications"""
    try:
        db = get_database()
        collection = db["company_compliance_applications"]
        
        # Filter by user email
        query = {"email": current_user.get("email")}
        if status:
            query["status"] = status
        
        applications = list(collection.find(query).sort("created_at", -1))
        
        for app in applications:
            app["_id"] = str(app["_id"])
            if "created_at" in app and hasattr(app["created_at"], "isoformat"):
                app["created_at"] = app["created_at"].isoformat()
            if "updated_at" in app and hasattr(app["updated_at"], "isoformat"):
                app["updated_at"] = app["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "count": len(applications),
            "applications": applications
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")

# ======================== TAX AUDIT APIs ========================

@router.post("/tax-audit")
async def submit_tax_audit(
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    pan_number: str = Form(...),
    business_name: str = Form(...),
    turnover: float = Form(...),
    audit_type: str = Form(...),
    financial_year: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    pan_card: Optional[UploadFile] = File(None),
    gst_returns: Optional[UploadFile] = File(None),
    balance_sheet: Optional[UploadFile] = File(None),
    profit_loss: Optional[UploadFile] = File(None),
    bank_statements: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """Submit Tax Audit Application with file uploads"""
    try:
        db = get_database()
        collection = db["tax_audit_applications"]
        
        application_id = generate_application_id("TAUD")
        
        application_data = {
            "application_id": application_id,
            "user_id": str(current_user["_id"]),
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "pan_number": pan_number.upper(),
            "business_name": business_name,
            "turnover": float(turnover),
            "audit_type": audit_type,
            "financial_year": financial_year,
            "address": address,
            "city": city,
            "state": state,
            "pincode": pincode,
            "status": "Pending",
            "documents": {},
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # Handle file uploads
        file_mapping = {
            "pan_card": pan_card,
            "gst_returns": gst_returns,
            "balance_sheet": balance_sheet,
            "profit_loss": profit_loss,
            "bank_statements": bank_statements
        }
        
        for doc_name, file_obj in file_mapping.items():
            if file_obj:
                file_path = save_uploaded_file(file_obj, f"tax_audit/{application_id}")
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        application_data["_id"] = str(result.inserted_id)
        application_data["created_at"] = application_data["created_at"].isoformat()
        application_data["updated_at"] = application_data["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "message": "Tax audit application submitted successfully",
            "application_id": application_data["application_id"],
            "data": application_data
        }, status_code=201)
        
    except Exception as e:
        print(f"Error submitting tax audit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tax-audit")
async def get_tax_audit_applications(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's tax audit applications"""
    try:
        db = get_database()
        collection = db["tax_audit_applications"]
        
        # Filter by user_id to get only user's applications
        query = {"user_id": str(current_user["_id"])}
        if status:
            query["status"] = status
        
        applications = list(collection.find(query).sort("created_at", -1))
        
        for app in applications:
            app["_id"] = str(app["_id"])
            if "created_at" in app and hasattr(app["created_at"], "isoformat"):
                app["created_at"] = app["created_at"].isoformat()
            if "updated_at" in app and hasattr(app["updated_at"], "isoformat"):
                app["updated_at"] = app["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "count": len(applications),
            "applications": applications
        })
        
    except Exception as e:
        print(f"Error fetching tax audit applications: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")

# ======================== LEGAL ADVICE APIs ========================

@router.post("/legal-advice")
async def submit_legal_advice(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    companyName: str = Form(...),
    legalIssueType: str = Form(...),
    caseDescription: str = Form(...),
    urgency: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    companyPAN: str = Form(...),
    companyDocuments: Optional[UploadFile] = File(None),
    caseDocuments: Optional[UploadFile] = File(None),
    legalNotices: Optional[UploadFile] = File(None)
):
    """Submit Legal Advice Application with file uploads"""
    try:
        db = get_database()
        collection = db["legal_advice_applications"]
        
        application_id = generate_application_id("LEGAL")
        
        application_data = {
            "application_id": application_id,
            "user_id": None,
            "name": name,
            "email": email,
            "phone": phone,
            "company_name": companyName,
            "legal_issue_type": legalIssueType,
            "case_description": caseDescription,
            "urgency": urgency,
            "address": address,
            "city": city,
            "state": state,
            "pincode": pincode,
            "company_pan": companyPAN.upper(),
            "status": "Pending",
            "documents": {},
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # Handle file uploads
        file_mapping = {
            "company_documents": companyDocuments,
            "case_documents": caseDocuments,
            "legal_notices": legalNotices
        }
        
        for doc_name, file_obj in file_mapping.items():
            if file_obj:
                file_path = save_uploaded_file(file_obj, f"legal_advice/{application_id}")
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        application_data["_id"] = str(result.inserted_id)
        application_data["created_at"] = application_data["created_at"].isoformat()
        application_data["updated_at"] = application_data["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "message": "Legal advice application submitted successfully",
            "application_id": application_data["application_id"],
            "data": application_data
        }, status_code=201)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

@router.get("/legal-advice")
async def get_legal_advice_applications(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's legal advice applications"""
    try:
        db = get_database()
        collection = db["legal_advice_applications"]
        
        # Filter by user email
        query = {"email": current_user.get("email")}
        if status:
            query["status"] = status
        
        applications = list(collection.find(query).sort("created_at", -1))
        
        for app in applications:
            app["_id"] = str(app["_id"])
            if "created_at" in app and hasattr(app["created_at"], "isoformat"):
                app["created_at"] = app["created_at"].isoformat()
            if "updated_at" in app and hasattr(app["updated_at"], "isoformat"):
                app["updated_at"] = app["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "count": len(applications),
            "applications": applications
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")

# ======================== PROVIDENT FUND SERVICES APIs ========================

@router.post("/provident-fund-services")
async def submit_pf_services(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    companyName: str = Form(...),
    numberOfEmployees: str = Form(...),
    serviceRequired: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    companyPAN: str = Form(...),
    existingPFNumber: Optional[str] = Form(None),
    existingESINumber: Optional[str] = Form(None),
    employeeList: Optional[UploadFile] = File(None),
    companyRegistration: Optional[UploadFile] = File(None),
    existingPFDocuments: Optional[UploadFile] = File(None)
):
    """Submit Provident Fund Services Application with file uploads"""
    try:
        db = get_database()
        collection = db["pf_services_applications"]
        
        application_id = generate_application_id("PFSER")
        
        application_data = {
            "application_id": application_id,
            "user_id": None,
            "name": name,
            "email": email,
            "phone": phone,
            "company_name": companyName,
            "number_of_employees": numberOfEmployees,
            "existing_pf_number": existingPFNumber,
            "existing_esi_number": existingESINumber,
            "service_required": serviceRequired,
            "address": address,
            "city": city,
            "state": state,
            "pincode": pincode,
            "company_pan": companyPAN.upper() if companyPAN else None,
            "status": "Pending",
            "documents": {},
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # Handle file uploads
        file_mapping = {
            "employee_list": employeeList,
            "company_registration": companyRegistration,
            "existing_pf_documents": existingPFDocuments
        }
        
        for doc_name, file_obj in file_mapping.items():
            if file_obj:
                file_path = save_uploaded_file(file_obj, f"pf_services/{application_id}")
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        application_data["_id"] = str(result.inserted_id)
        application_data["created_at"] = application_data["created_at"].isoformat()
        application_data["updated_at"] = application_data["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "message": "PF services application submitted successfully",
            "application_id": application_data["application_id"],
            "data": application_data
        }, status_code=201)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

@router.get("/provident-fund-services")
async def get_pf_services_applications(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's PF services applications"""
    try:
        db = get_database()
        collection = db["pf_services_applications"]
        
        # Filter by user email
        query = {"email": current_user.get("email")}
        if status:
            query["status"] = status
        
        applications = list(collection.find(query).sort("created_at", -1))
        
        for app in applications:
            app["_id"] = str(app["_id"])
            if "created_at" in app and hasattr(app["created_at"], "isoformat"):
                app["created_at"] = app["created_at"].isoformat()
            if "updated_at" in app and hasattr(app["updated_at"], "isoformat"):
                app["updated_at"] = app["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "count": len(applications),
            "applications": applications
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")

# ======================== TDS SERVICES APIs ========================

@router.post("/tds-services")
async def submit_tds_services(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    panNumber: str = Form(...),
    companyName: str = Form(...),
    tanNumber: str = Form(...),
    serviceType: str = Form(...),
    quarterYear: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    form16: Optional[UploadFile] = File(None),
    form26AS: Optional[UploadFile] = File(None),
    salaryRegister: Optional[UploadFile] = File(None),
    tdsReturns: Optional[UploadFile] = File(None),
    panCard: Optional[UploadFile] = File(None)
):
    """Submit TDS Services Application with file uploads"""
    try:
        db = get_database()
        collection = db["tds_services_applications"]
        
        application_id = generate_application_id("TDSER")
        
        application_data = {
            "application_id": application_id,
            "user_id": None,
            "full_name": fullName,
            "email": email,
            "phone": phone,
            "pan_number": panNumber.upper(),
            "company_name": companyName,
            "tan_number": tanNumber.upper(),
            "service_type": serviceType,
            "quarter_year": quarterYear,
            "address": address,
            "city": city,
            "state": state,
            "pincode": pincode,
            "status": "Pending",
            "documents": {},
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # Handle file uploads - map all documents the frontend sends
        file_mapping = {
            "form16": form16,
            "form26AS": form26AS,
            "salary_register": salaryRegister,
            "tds_returns": tdsReturns,
            "pan_card": panCard
        }
        
        for doc_name, file_obj in file_mapping.items():
            if file_obj and file_obj.filename:  # Check if file exists and has a filename
                file_path = save_uploaded_file(file_obj, f"tds_services/{application_id}")
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        application_data["_id"] = str(result.inserted_id)
        application_data["created_at"] = application_data["created_at"].isoformat()
        application_data["updated_at"] = application_data["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "message": "TDS services application submitted successfully",
            "application_id": application_data["application_id"],
            "data": application_data
        }, status_code=201)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

@router.get("/tds-services")
async def get_tds_services_applications(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's TDS services applications"""
    try:
        db = get_database()
        collection = db["tds_services_applications"]
        
        # Filter by user email
        query = {"email": current_user.get("email")}
        if status:
            query["status"] = status
        
        applications = list(collection.find(query).sort("created_at", -1))
        
        for app in applications:
            app["_id"] = str(app["_id"])
            if "created_at" in app and hasattr(app["created_at"], "isoformat"):
                app["created_at"] = app["created_at"].isoformat()
            if "updated_at" in app and hasattr(app["updated_at"], "isoformat"):
                app["updated_at"] = app["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "count": len(applications),
            "applications": applications
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")

# ======================== GST SERVICES APIs ========================

@router.post("/gst-services")
async def submit_gst_services(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    panNumber: str = Form(...),
    businessName: str = Form(...),
    serviceType: str = Form(...),
    turnover: float = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    gstin: Optional[str] = Form(None),
    gstCertificate: Optional[UploadFile] = File(None),
    salesInvoices: Optional[UploadFile] = File(None),
    purchaseInvoices: Optional[UploadFile] = File(None),
    bankStatements: Optional[UploadFile] = File(None),
    panCard: Optional[UploadFile] = File(None)
):
    """Submit GST Services Application with file uploads"""
    try:
        db = get_database()
        collection = db["gst_services_applications"]
        
        application_id = generate_application_id("GSTSER")
        
        application_data = {
            "application_id": application_id,
            "user_id": None,
            "full_name": fullName,
            "email": email,
            "phone": phone,
            "pan_number": panNumber.upper(),
            "business_name": businessName,
            "gstin": gstin.upper() if gstin else None,
            "service_type": serviceType,
            "turnover": float(turnover),
            "address": address,
            "city": city,
            "state": state,
            "pincode": pincode,
            "status": "Pending",
            "documents": {},
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # Handle file uploads - map all documents the frontend sends
        file_mapping = {
            "gst_certificate": gstCertificate,
            "sales_invoices": salesInvoices,
            "purchase_invoices": purchaseInvoices,
            "bank_statements": bankStatements,
            "pan_card": panCard
        }
        
        for doc_name, file_obj in file_mapping.items():
            if file_obj and file_obj.filename:  # Check if file exists and has a filename
                file_path = save_uploaded_file(file_obj, f"gst_services/{application_id}")
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        application_data["_id"] = str(result.inserted_id)
        application_data["created_at"] = application_data["created_at"].isoformat()
        application_data["updated_at"] = application_data["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "message": "GST services application submitted successfully",
            "application_id": application_data["application_id"],
            "data": application_data
        }, status_code=201)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

@router.get("/gst-services")
async def get_gst_services_applications(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's GST services applications"""
    try:
        db = get_database()
        collection = db["gst_services_applications"]
        
        # Filter by user email
        query = {"email": current_user.get("email")}
        if status:
            query["status"] = status
        
        applications = list(collection.find(query).sort("created_at", -1))
        
        for app in applications:
            app["_id"] = str(app["_id"])
            if "created_at" in app and hasattr(app["created_at"], "isoformat"):
                app["created_at"] = app["created_at"].isoformat()
            if "updated_at" in app and hasattr(app["updated_at"], "isoformat"):
                app["updated_at"] = app["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "count": len(applications),
            "applications": applications
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")

# ======================== PAYROLL SERVICES APIs ========================

@router.post("/payroll-services")
async def submit_payroll_services(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    companyName: str = Form(...),
    numberOfEmployees: str = Form(...),
    industryType: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    companyPAN: str = Form(...),
    gstNumber: Optional[str] = Form(None),
    pfNumber: Optional[str] = Form(None),
    esiNumber: Optional[str] = Form(None),
    employeeData: Optional[UploadFile] = File(None),
    companyDocuments: Optional[UploadFile] = File(None),
    registrationProofs: Optional[UploadFile] = File(None)
):
    """Submit Payroll Services Application with file uploads"""
    try:
        db = get_database()
        collection = db["payroll_services_applications"]
        
        application_id = generate_application_id("PAYROLL")
        
        application_data = {
            "application_id": application_id,
            "user_id": None,
            "name": name,
            "email": email,
            "phone": phone,
            "company_name": companyName,
            "number_of_employees": numberOfEmployees,
            "industry_type": industryType,
            "address": address,
            "city": city,
            "state": state,
            "pincode": pincode,
            "company_pan": companyPAN.upper(),
            "gst_number": gstNumber,
            "pf_number": pfNumber,
            "esi_number": esiNumber,
            "status": "Pending",
            "documents": {},
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # Handle file uploads
        file_mapping = {
            "employee_data": employeeData,
            "company_documents": companyDocuments,
            "registration_proofs": registrationProofs
        }
        
        for doc_name, file_obj in file_mapping.items():
            if file_obj and file_obj.filename:
                file_path = save_uploaded_file(file_obj, f"payroll_services/{application_id}")
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        application_data["_id"] = str(result.inserted_id)
        application_data["created_at"] = application_data["created_at"].isoformat()
        application_data["updated_at"] = application_data["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "message": "Payroll services application submitted successfully",
            "application_id": application_data["application_id"],
            "data": application_data
        }, status_code=201)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

@router.get("/payroll-services")
async def get_payroll_services_applications(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's payroll services applications"""
    try:
        db = get_database()
        collection = db["payroll_services_applications"]
        
        # Filter by user email
        query = {"email": current_user.get("email")}
        if status:
            query["status"] = status
        
        applications = list(collection.find(query).sort("created_at", -1))
        
        for app in applications:
            app["_id"] = str(app["_id"])
            if "created_at" in app and hasattr(app["created_at"], "isoformat"):
                app["created_at"] = app["created_at"].isoformat()
            if "updated_at" in app and hasattr(app["updated_at"], "isoformat"):
                app["updated_at"] = app["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "count": len(applications),
            "applications": applications
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")

# ======================== ACCOUNTING & BOOKKEEPING APIs ========================

@router.post("/accounting-bookkeeping")
async def submit_accounting_bookkeeping(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    panNumber: str = Form(...),
    businessName: str = Form(...),
    businessType: str = Form(...),
    serviceRequired: str = Form(...),
    numberOfTransactions: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    state: str = Form(...),
    pincode: str = Form(...),
    bankStatements: Optional[UploadFile] = File(None),
    invoices: Optional[UploadFile] = File(None),
    receipts: Optional[UploadFile] = File(None),
    previousReturns: Optional[UploadFile] = File(None),
    panCard: Optional[UploadFile] = File(None)
):
    """Submit Accounting & Bookkeeping Application with file uploads"""
    try:
        db = get_database()
        collection = db["accounting_bookkeeping_applications"]
        
        application_id = generate_application_id("ACCBOOK")
        
        application_data = {
            "application_id": application_id,
            "user_id": None,
            "full_name": fullName,
            "email": email,
            "phone": phone,
            "pan_number": panNumber.upper(),
            "business_name": businessName,
            "business_type": businessType,
            "service_required": serviceRequired,
            "number_of_transactions": numberOfTransactions,
            "address": address,
            "city": city,
            "state": state,
            "pincode": pincode,
            "status": "Pending",
            "documents": {},
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # Handle file uploads
        file_mapping = {
            "bank_statements": bankStatements,
            "invoices": invoices,
            "receipts": receipts,
            "previous_returns": previousReturns,
            "pan_card": panCard
        }
        
        for doc_name, file_obj in file_mapping.items():
            if file_obj and file_obj.filename:
                file_path = save_uploaded_file(file_obj, f"accounting_bookkeeping/{application_id}")
                application_data["documents"][doc_name] = file_path
        
        result = collection.insert_one(application_data)
        application_data["_id"] = str(result.inserted_id)
        application_data["created_at"] = application_data["created_at"].isoformat()
        application_data["updated_at"] = application_data["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "message": "Accounting & bookkeeping application submitted successfully",
            "application_id": application_data["application_id"],
            "data": application_data
        }, status_code=201)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")

@router.get("/accounting-bookkeeping")
async def get_accounting_bookkeeping_applications(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's accounting & bookkeeping applications"""
    try:
        db = get_database()
        collection = db["accounting_bookkeeping_applications"]
        
        # Filter by user email
        query = {"email": current_user.get("email")}
        if status:
            query["status"] = status
        
        applications = list(collection.find(query).sort("created_at", -1))
        
        for app in applications:
            app["_id"] = str(app["_id"])
            if "created_at" in app and hasattr(app["created_at"], "isoformat"):
                app["created_at"] = app["created_at"].isoformat()
            if "updated_at" in app and hasattr(app["updated_at"], "isoformat"):
                app["updated_at"] = app["updated_at"].isoformat()
        
        return JSONResponse(content={
            "success": True,
            "count": len(applications),
            "applications": applications
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")

# ======================== COMMON APIs (All Services) ========================

@router.get("/stats")
async def get_business_services_stats():
    """Get statistics for all business service applications"""
    try:
        db = get_database()
        
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available")
        
        # Define all collections
        collections = [
            "company_registration_applications",
            "company_compliance_applications",
            "tax_audit_applications",
            "legal_advice_applications",
            "pf_services_applications",
            "tds_services_applications",
            "gst_services_applications",
            "payroll_services_applications",
            "accounting_bookkeeping_applications"
        ]
        
        total_count = 0
        pending_count = 0
        approved_count = 0
        completed_count = 0
        rejected_count = 0
        
        # Count applications from all collections
        for collection_name in collections:
            try:
                collection = db[collection_name]
                
                # Total count
                total_count += collection.count_documents({})
                
                # Status counts (case-insensitive)
                pending_count += collection.count_documents({
                    "status": {"$regex": "^pending$", "$options": "i"}
                })
                
                approved_count += collection.count_documents({
                    "status": {"$regex": "^approved$", "$options": "i"}
                })
                
                completed_count += collection.count_documents({
                    "status": {"$regex": "^completed$", "$options": "i"}
                })
                
                rejected_count += collection.count_documents({
                    "status": {"$regex": "^rejected$", "$options": "i"}
                })
            except Exception as collection_error:
                # Skip if collection doesn't exist
                print(f"Warning: Error accessing collection {collection_name}: {collection_error}")
                continue
        
        return JSONResponse(content={
            "success": True,
            "stats": {
                "total": total_count,
                "pending": pending_count,
                "approved": approved_count,
                "completed": completed_count,
                "rejected": rejected_count
            }
        })
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Stats API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

@router.get("/all-applications")
async def get_all_business_service_applications(
    service_type: str = None,
    status: str = None
):
    """Get all business service applications with optional filtering"""
    try:
        db = get_database()
        
        all_applications = []
        
        # Define all collections with their mapping to frontend service types
        collections_mapping = {
            "company_registration_applications": "Register Your New Company",
            "company_compliance_applications": "Compliance for New Company",
            "tax_audit_applications": "Tax Audit",
            "legal_advice_applications": "Legal Advice",
            "pf_services_applications": "Provident Fund Services",
            "tds_services_applications": "TDS Services",
            "gst_services_applications": "GST Services",
            "payroll_services_applications": "Payroll Services",
            "accounting_bookkeeping_applications": "Accounting & Bookkeeping"
        }
        
        # Filter collections if service_type is specified
        if service_type and service_type != "all":
            # Find matching collection
            selected_collections = {k: v for k, v in collections_mapping.items() if v == service_type}
        else:
            selected_collections = collections_mapping
        
        for collection_name, service_name in selected_collections.items():
            collection = db[collection_name]
            
            # Build query filter
            query_filter = {}
            if status and status != "all":
                # Match status (case-insensitive)
                query_filter["status"] = {"$regex": f"^{status}$", "$options": "i"}
            
            apps = list(collection.find(query_filter))
            
            for app in apps:
                app["_id"] = str(app["_id"])
                if "created_at" in app and hasattr(app["created_at"], "isoformat"):
                    app["created_at"] = app["created_at"].isoformat()
                if "updated_at" in app and hasattr(app["updated_at"], "isoformat"):
                    app["updated_at"] = app["updated_at"].isoformat()
                app["service_type"] = service_name
                all_applications.append(app)
        
        # Sort by created_at descending
        all_applications.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return JSONResponse(content={
            "success": True,
            "count": len(all_applications),
            "applications": all_applications,
            "filters": {
                "service_type": service_type or "all",
                "status": status or "all"
            }
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")

@router.put("/{application_id}/status")
async def update_application_status(
    application_id: str,
    status_update: StatusUpdate
):
    """Update application status across all business service types"""
    try:
        db = get_database()
        
        # Valid status values
        valid_statuses = ["Pending", "Approved", "Completed", "Rejected"]
        if status_update.status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        # Try to find and update the application in all collections
        collections = [
            "company_registration_applications",
            "company_compliance_applications",
            "tax_audit_applications",
            "legal_advice_applications",
            "pf_services_applications",
            "tds_services_applications",
            "gst_services_applications",
            "payroll_services_applications",
            "accounting_bookkeeping_applications"
        ]
        
        updated = False
        for collection_name in collections:
            collection = db[collection_name]
            
            # Try updating by _id
            result = collection.update_one(
                {"_id": ObjectId(application_id)},
                {
                    "$set": {
                        "status": status_update.status,
                        "updated_at": datetime.now()
                    }
                }
            )
            
            if result.modified_count > 0:
                updated = True
                break
        
        if not updated:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return JSONResponse(content={
            "success": True,
            "message": f"Status updated to {status_update.status}",
            "new_status": status_update.status
        })
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Status update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")

@router.delete("/{service_type}/{application_id}")
async def delete_application(
    service_type: str,
    application_id: str
):
    """Delete an application"""
    try:
        db = get_database()
        collection_name = f"{service_type.replace('-', '_')}_applications"
        collection = db[collection_name]
        
        result = collection.delete_one({
            "application_id": application_id,
            "user_id": None  # No authentication
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return JSONResponse(content={
            "success": True,
            "message": "Application deleted successfully"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete application: {str(e)}")
