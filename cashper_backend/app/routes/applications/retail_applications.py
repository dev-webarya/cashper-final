"""
Retail Services Application API
Handles application form submissions for all retail services
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from ...database.db import get_database
import uuid

router = APIRouter(prefix="/api/applications", tags=["Retail Services - Applications"])


# ===================== PYDANTIC MODELS =====================

class BasicInquiry(BaseModel):
    """Basic inquiry form model for most services"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    message: Optional[str] = Field(None, max_length=500)

class ITRInquiry(BaseModel):
    """ITR Filing inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    message: Optional[str] = Field(None, max_length=500)

class PANInquiry(BaseModel):
    """PAN Application inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    message: Optional[str] = Field(None, max_length=500)

class PFInquiry(BaseModel):
    """PF Withdrawal inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    message: Optional[str] = Field(None, max_length=500)

class UpdateDocumentInquiry(BaseModel):
    """Document Update inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    message: Optional[str] = Field(None, max_length=500)

class TradingDematInquiry(BaseModel):
    """Trading & Demat inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    message: Optional[str] = Field(None, max_length=500)

class BankAccountInquiry(BaseModel):
    """Bank Account inquiry form model"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    message: Optional[str] = Field(None, max_length=500)

class FinancialPlanningInquiry(BaseModel):
    """Financial Planning inquiry form model with additional fields"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    age: Optional[str] = None
    currentIncome: Optional[str] = None
    investmentGoal: Optional[str] = None


# ===================== HELPER FUNCTIONS =====================

def save_inquiry(db, service_type: str, inquiry_data: dict) -> dict:
    """
    Save inquiry to database
    
    Args:
        db: Database connection
        service_type: Type of service inquiry
        inquiry_data: Inquiry form data
        
    Returns:
        dict: Response data with inquiry ID
    """
    try:
        collection = db["RetailServiceInquiries"]
        
        # Generate unique inquiry ID
        inquiry_id = f"INQ{int(datetime.now().timestamp())}{uuid.uuid4().hex[:6].upper()}"
        
        # Prepare document
        document = {
            "inquiryId": inquiry_id,
            "serviceType": service_type,
            "name": inquiry_data.get("name"),
            "email": inquiry_data.get("email"),
            "phone": inquiry_data.get("phone"),
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
                "createdAt": document["createdAt"].isoformat()
            }
        }
        
    except Exception as e:
        print(f"[ERROR] Failed to save inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save inquiry: {str(e)}")


# ===================== ITR SERVICES =====================

@router.post("/file-itr")
async def submit_file_itr_inquiry(inquiry: ITRInquiry):
    """Submit inquiry for File ITR service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_inquiry(
            db=db,
            service_type="file-itr",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] File ITR Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/revise-itr")
async def submit_revise_itr_inquiry(inquiry: ITRInquiry):
    """Submit inquiry for Revise ITR service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_inquiry(
            db=db,
            service_type="revise-itr",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Revise ITR Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reply-itr-notice")
async def submit_reply_itr_notice_inquiry(inquiry: ITRInquiry):
    """Submit inquiry for Reply to ITR Notice service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_inquiry(
            db=db,
            service_type="reply-itr-notice",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Reply ITR Notice Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== PAN SERVICES =====================

@router.post("/apply-individual-pan")
async def submit_individual_pan_inquiry(inquiry: PANInquiry):
    """Submit inquiry for Apply Individual PAN service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_inquiry(
            db=db,
            service_type="apply-individual-pan",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Individual PAN Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/apply-huf-pan")
async def submit_huf_pan_inquiry(inquiry: PANInquiry):
    """Submit inquiry for Apply HUF PAN service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_inquiry(
            db=db,
            service_type="apply-huf-pan",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] HUF PAN Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== PF SERVICE =====================

@router.post("/withdraw-pf")
async def submit_withdraw_pf_inquiry(inquiry: PFInquiry):
    """Submit inquiry for Withdraw PF service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_inquiry(
            db=db,
            service_type="withdraw-pf",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Withdraw PF Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== DOCUMENT UPDATE SERVICE =====================

@router.post("/update-aadhaar-pan")
async def submit_update_aadhaar_pan_inquiry(inquiry: UpdateDocumentInquiry):
    """Submit inquiry for Update Aadhaar or PAN service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_inquiry(
            db=db,
            service_type="update-aadhaar-pan",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Update Aadhaar/PAN Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== TRADING & DEMAT SERVICE =====================

@router.post("/online-trading-demat")
async def submit_trading_demat_inquiry(inquiry: TradingDematInquiry):
    """Submit inquiry for Online Trading & Demat service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_inquiry(
            db=db,
            service_type="online-trading-demat",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Trading & Demat Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== BANK ACCOUNT SERVICE =====================

@router.post("/bank-account")
async def submit_bank_account_inquiry(inquiry: BankAccountInquiry):
    """Submit inquiry for Bank Account Services"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_inquiry(
            db=db,
            service_type="bank-account",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Bank Account Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== FINANCIAL PLANNING SERVICE =====================

@router.post("/financial-planning")
async def submit_financial_planning_inquiry(inquiry: FinancialPlanningInquiry):
    """Submit inquiry for Financial Planning & Advisory service"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        response = save_inquiry(
            db=db,
            service_type="financial-planning",
            inquiry_data=inquiry.dict()
        )
        
        return JSONResponse(content=response, status_code=201)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Financial Planning Inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===================== ADMIN ENDPOINTS =====================

@router.get("/admin/inquiries")
async def get_all_inquiries(
    service_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100
):
    """Get all retail service inquiries for admin"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["RetailServiceInquiries"]
        
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
                "message": inq.get("message", ""),
                "status": inq.get("status", "new"),
                "createdAt": inq.get("createdAt").isoformat() if inq.get("createdAt") else None,
                "inquiryData": inq.get("inquiryData", {})
            })
        
        return JSONResponse(content=result, status_code=200)
        
    except Exception as e:
        print(f"[ERROR] Fetching inquiries: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/inquiries/{inquiry_id}")
async def get_inquiry_by_id(inquiry_id: str):
    """Get specific inquiry by ID"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["RetailServiceInquiries"]
        
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
        print(f"[ERROR] Fetching inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/admin/inquiries/{inquiry_id}/status")
async def update_inquiry_status(inquiry_id: str, status_data: dict):
    """Update status of an inquiry"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["RetailServiceInquiries"]
        
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
                "message": "Inquiry status updated successfully",
                "status": new_status
            },
            status_code=200
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Updating inquiry status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/statistics")
async def get_inquiries_statistics():
    """Get statistics for inquiries"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["RetailServiceInquiries"]
        
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
        print(f"[ERROR] Fetching inquiry statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/admin/inquiries/{inquiry_id}")
async def delete_inquiry(inquiry_id: str):
    """Delete an inquiry"""
    try:
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        collection = db["RetailServiceInquiries"]
        
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
                "message": "Inquiry deleted successfully"
            },
            status_code=200
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"[ERROR] Deleting inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
