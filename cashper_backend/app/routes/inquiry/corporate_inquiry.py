"""
Corporate/Business Services Inquiry API
Handles hero section form submissions for all business services
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from ...database.db import get_database
import uuid

router = APIRouter(prefix="/api/corporate-inquiry", tags=["Corporate Services - Inquiry Forms"])


# ===================== PYDANTIC MODELS =====================

class BasicCorporateInquiry(BaseModel):
    """Basic corporate inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    companyName: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=500)

class RegisterCompanyInquiry(BaseModel):
    """Register New Company inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    companyName: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=500)

class ComplianceInquiry(BaseModel):
    """Compliance for New Company inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    companyName: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=500)

class TaxAuditInquiry(BaseModel):
    """Tax Audit inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    companyName: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=500)

class LegalAdviceInquiry(BaseModel):
    """Legal Advice inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    companyName: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=500)

class ProvidentFundInquiry(BaseModel):
    """Provident Fund Services inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    companyName: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=500)

class TDSInquiry(BaseModel):
    """TDS-Related Services inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    companyName: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=500)

class GSTInquiry(BaseModel):
    """GST-Related Services inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    companyName: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=500)

class PayrollInquiry(BaseModel):
    """Payroll Services inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    companyName: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=500)

class AccountingInquiry(BaseModel):
    """Accounting & Bookkeeping inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    companyName: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=500)


# ===================== HELPER FUNCTIONS =====================

def save_corporate_inquiry(db, service_type: str, inquiry_data: dict) -> dict:
    """
    Save corporate inquiry to database
    
    Args:
        db: Database connection
        service_type: Type of service inquiry
        inquiry_data: Inquiry form data
        
    Returns:
        dict: Response data with inquiry ID
    """
    try:
        collection = db["CorporateServiceInquiries"]
        
        # Generate unique inquiry ID
        inquiry_id = f"CORP{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}"
        
        # Prepare document
        document = {
            "inquiryId": inquiry_id,
            "serviceType": service_type,
            "name": inquiry_data.get("name"),
            "email": inquiry_data.get("email"),
            "phone": inquiry_data.get("phone"),
            "companyName": inquiry_data.get("companyName", ""),
            "message": inquiry_data.get("message", ""),
            "status": "new",
            "inquiryData": inquiry_data,
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        # Insert into database
        result = collection.insert_one(document)
        
        return {
            "success": True,
            "message": f"Thank you! We've received your inquiry for {service_type}. Our team will contact you shortly.",
            "inquiryId": inquiry_id,
            "status": "new",
            "data": {
                "id": str(result.inserted_id),
                "inquiryId": inquiry_id,
                "serviceType": service_type,
                "name": inquiry_data.get("name"),
                "email": inquiry_data.get("email"),
                "phone": inquiry_data.get("phone"),
                "companyName": inquiry_data.get("companyName", ""),
                "createdAt": document["createdAt"].isoformat()
            }
        }
        
    except Exception as e:
        print(f"[ERROR] Failed to save corporate inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save inquiry: {str(e)}")


# ===================== BUSINESS SERVICE ENDPOINTS =====================

@router.post("/register-company")
async def submit_register_company_inquiry(inquiry: RegisterCompanyInquiry):
    """Submit inquiry for Register New Company service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_corporate_inquiry(
            db=db,
            service_type="register-company",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Register Company Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compliance-new-company")
async def submit_compliance_inquiry(inquiry: ComplianceInquiry):
    """Submit inquiry for Compliance for New Company service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_corporate_inquiry(
            db=db,
            service_type="compliance-new-company",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Compliance Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tax-audit")
async def submit_tax_audit_inquiry(inquiry: TaxAuditInquiry):
    """Submit inquiry for Tax Audit service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_corporate_inquiry(
            db=db,
            service_type="tax-audit",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Tax Audit Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/legal-advice")
async def submit_legal_advice_inquiry(inquiry: LegalAdviceInquiry):
    """Submit inquiry for Legal Advice service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_corporate_inquiry(
            db=db,
            service_type="legal-advice",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Legal Advice Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/provident-fund")
async def submit_provident_fund_inquiry(inquiry: ProvidentFundInquiry):
    """Submit inquiry for Provident Fund Services"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_corporate_inquiry(
            db=db,
            service_type="provident-fund",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Provident Fund Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tds-services")
async def submit_tds_inquiry(inquiry: TDSInquiry):
    """Submit inquiry for TDS-Related Services"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_corporate_inquiry(
            db=db,
            service_type="tds-services",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] TDS Services Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/gst-services")
async def submit_gst_inquiry(inquiry: GSTInquiry):
    """Submit inquiry for GST-Related Services"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_corporate_inquiry(
            db=db,
            service_type="gst-services",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] GST Services Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/payroll-services")
async def submit_payroll_inquiry(inquiry: PayrollInquiry):
    """Submit inquiry for Payroll Services"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_corporate_inquiry(
            db=db,
            service_type="payroll-services",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Payroll Services Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/accounting-bookkeeping")
async def submit_accounting_inquiry(inquiry: AccountingInquiry):
    """Submit inquiry for Accounting & Bookkeeping services"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_corporate_inquiry(
            db=db,
            service_type="accounting-bookkeeping",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Accounting & Bookkeeping Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== ADMIN ENDPOINTS =====================

@router.get("/admin/inquiries")
async def get_all_corporate_inquiries(
    service_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100
):
    """Get all corporate service inquiries for admin"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["CorporateServiceInquiries"]
        
        # Build query
        query = {}
        if service_type:
            query["serviceType"] = service_type
        if status:
            query["status"] = status.lower()
        
        # Fetch inquiries
        inquiries = list(collection.find(query).sort("createdAt", -1).limit(limit))
        
        # Transform data
        result = []
        for inq in inquiries:
            result.append({
                "id": str(inq.get("_id")),
                "inquiryId": inq.get("inquiryId", "N/A"),
                "serviceType": inq.get("serviceType", "N/A"),
                "name": inq.get("name", "N/A"),
                "email": inq.get("email", "N/A"),
                "phone": inq.get("phone", "N/A"),
                "companyName": inq.get("companyName", ""),
                "message": inq.get("message", ""),
                "status": inq.get("status", "new"),
                "createdAt": inq.get("createdAt").isoformat() if inq.get("createdAt") else None,
                "inquiryData": inq.get("inquiryData", {})
            })
        
        return JSONResponse(content=result, status_code=200)
        
    except Exception as e:
        print(f"[ERROR] Fetching corporate inquiries: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/inquiries/{inquiry_id}")
async def get_corporate_inquiry_by_id(inquiry_id: str):
    """Get specific corporate inquiry by ID"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["CorporateServiceInquiries"]
        
        # Try to find by MongoDB _id first
        try:
            inquiry = collection.find_one({"_id": ObjectId(inquiry_id)})
        except:
            # If ObjectId fails, try to find by inquiryId field
            inquiry = collection.find_one({"inquiryId": inquiry_id})
        
        if not inquiry:
            raise HTTPException(status_code=404, detail="Inquiry not found")
        
        # Transform data
        result = {
            "id": str(inquiry.get("_id")),
            "inquiryId": inquiry.get("inquiryId", "N/A"),
            "serviceType": inquiry.get("serviceType", "N/A"),
            "name": inquiry.get("name", "N/A"),
            "email": inquiry.get("email", "N/A"),
            "phone": inquiry.get("phone", "N/A"),
            "companyName": inquiry.get("companyName", ""),
            "message": inquiry.get("message", ""),
            "status": inquiry.get("status", "new"),
            "createdAt": inquiry.get("createdAt").isoformat() if inquiry.get("createdAt") else None,
            "updatedAt": inquiry.get("updatedAt").isoformat() if inquiry.get("updatedAt") else None,
            "inquiryData": inquiry.get("inquiryData", {})
        }
        
        return JSONResponse(content=result, status_code=200)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Fetching corporate inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/admin/inquiries/{inquiry_id}/status")
async def update_corporate_inquiry_status(inquiry_id: str, status_data: dict):
    """Update status of a corporate inquiry"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["CorporateServiceInquiries"]
        
        new_status = status_data.get("status", "").lower()
        if new_status not in ["new", "contacted", "in-progress", "converted", "closed"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        # Try to update by MongoDB _id first
        try:
            result = collection.update_one(
                {"_id": ObjectId(inquiry_id)},
                {
                    "$set": {
                        "status": new_status,
                        "updatedAt": datetime.now()
                    }
                }
            )
        except:
            # If ObjectId fails, try to update by inquiryId field
            result = collection.update_one(
                {"inquiryId": inquiry_id},
                {
                    "$set": {
                        "status": new_status,
                        "updatedAt": datetime.now()
                    }
                }
            )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Inquiry not found or status unchanged")
        
        return JSONResponse(
            content={
                "success": True,
                "message": "Corporate inquiry status updated successfully",
                "status": new_status
            },
            status_code=200
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Updating corporate inquiry status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/statistics")
async def get_corporate_inquiries_statistics():
    """Get statistics for corporate inquiries"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["CorporateServiceInquiries"]
        
        # Get counts
        total = collection.count_documents({})
        new = collection.count_documents({"status": "new"})
        contacted = collection.count_documents({"status": "contacted"})
        in_progress = collection.count_documents({"status": "in-progress"})
        converted = collection.count_documents({"status": "converted"})
        closed = collection.count_documents({"status": "closed"})
        
        # Get counts by service type
        service_types = collection.distinct("serviceType")
        by_service = {}
        for service in service_types:
            by_service[service] = collection.count_documents({"serviceType": service})
        
        return JSONResponse(
            content={
                "total": total,
                "new": new,
                "contacted": contacted,
                "inProgress": in_progress,
                "converted": converted,
                "closed": closed,
                "byService": by_service
            },
            status_code=200
        )
        
    except Exception as e:
        print(f"[ERROR] Fetching corporate inquiry statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/admin/inquiries/{inquiry_id}")
async def delete_corporate_inquiry(inquiry_id: str):
    """Delete a corporate inquiry"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["CorporateServiceInquiries"]
        
        # Try to delete by MongoDB _id first
        try:
            result = collection.delete_one({"_id": ObjectId(inquiry_id)})
        except:
            # If ObjectId fails, try to delete by inquiryId field
            result = collection.delete_one({"inquiryId": inquiry_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Inquiry not found")
        
        return JSONResponse(
            content={
                "success": True,
                "message": "Corporate inquiry deleted successfully"
            },
            status_code=200
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Deleting corporate inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
