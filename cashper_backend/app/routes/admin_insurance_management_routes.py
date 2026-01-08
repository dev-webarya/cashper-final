"""
Admin Insurance Management Routes
Provides comprehensive insurance policy management for admin panel
"""
from fastapi import APIRouter, HTTPException, status, Query, File, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from app.database.schema.insurance_policy_schema import (
    InsurancePolicy,
    InsurancePolicyInDB,
    InsurancePolicyCreate,
    InsurancePolicyUpdate,
    PolicyStatusUpdate,
    InsurancePolicyResponse,
    InsurancePolicyListResponse,
    InsuranceStatistics,
    PolicyStatus,
    InsuranceType
)
from app.database.repository.insurance_management_repository import insurance_management_repository
from datetime import datetime
from typing import List, Optional
from pathlib import Path
import random
import mimetypes

router = APIRouter(prefix="/admin/insurance-management", tags=["Admin Insurance Management"])

# ==================== STATISTICS ENDPOINT ====================

@router.get("/statistics", response_model=InsuranceStatistics)
def get_insurance_statistics():
    """
    Get insurance management statistics for admin dashboard.
    Returns counts of policies by status and type, plus financial metrics.
    """
    try:
        stats = insurance_management_repository.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )

# ==================== TEST ENDPOINT ====================

@router.get("/test")
def test_endpoint():
    """Simple test endpoint"""
    return {"status": "ok", "message": "Test endpoint working"}

# ==================== DOCUMENT DOWNLOAD ENDPOINT ====================

@router.get("/documents/download/{policy_id}/{document_path:path}")
def download_policy_document(policy_id: str, document_path: str):
    """
    Download a document for a specific policy.
    Retrieves the document file from the uploads directory.
    Route: GET /admin/insurance-management/documents/download/{policy_id}/{document_path}
    Supports full path like: uploads/health_insurance/HI2025112103853_aadhar_Copilot.png
    Policy ID can be MongoDB ObjectId or policyId (INS001, etc)
    """
    try:
        # Decode the document path if needed (URL encoded)
        from urllib.parse import unquote
        from bson import ObjectId
        
        document_path = unquote(document_path)
        
        # Verify policy exists - try both ObjectId and policyId formats
        policy = None
        
        # First try as policyId (like INS001)
        try:
            policy = insurance_management_repository.get_policy_by_policy_id(policy_id)
        except:
            pass
        
        # If not found, try as MongoDB _id
        if not policy:
            try:
                policy = insurance_management_repository.get_policy_by_id(policy_id)
            except:
                pass
        
        # If still not found, try direct MongoDB query as fallback
        if not policy:
            try:
                collection = insurance_management_repository.get_collection()
                policy = collection.find_one({"_id": ObjectId(policy_id)})
                if policy:
                    policy["id"] = policy.get("policyId", str(policy["_id"]))
                    policy["_id"] = str(policy["_id"])
            except:
                pass
        
        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy {policy_id} not found"
            )
        
        # Verify document is associated with this policy
        docs = policy.get("documents", [])
        document_found = False
        actual_doc_path = None
        
        # Check if document is in the documents list (handle both full paths and just filenames)
        # Also handle Windows backslashes in paths
        if docs:
            # Normalize the search path
            normalized_search = document_path.replace('\\', '/')
            
            for doc in docs:
                # Normalize the stored path
                normalized_doc = doc.replace('\\', '/')
                
                if (normalized_search in normalized_doc or 
                    normalized_search == normalized_doc or 
                    normalized_doc.endswith(normalized_search) or
                    normalized_search.endswith(normalized_doc.split('/')[-1])):
                    document_found = True
                    actual_doc_path = doc  # Use the actual path from database
                    break
        
        if not document_found:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document not found for policy {policy_id}"
            )
        
        # Use the actual document path from the database
        if actual_doc_path:
            document_path = actual_doc_path
        
        # Build file path - support both relative paths from project root
        base_dir = Path("c:\\Users\\ASUS\\Desktop\\payloan\\full_proj\\cashper_backend")
        
        # Normalize the path separators
        normalized_path = document_path.replace('\\', '/')
        file_path = base_dir / normalized_path
        
        # Check if file exists
        if not file_path.exists():
            # Try from current directory
            file_path = Path(normalized_path)
        
        # Resolve to absolute path
        try:
            file_path = file_path.resolve()
        except:
            pass
        
        # Security check - ensure path is within uploads directory
        try:
            uploads_dir = base_dir / "uploads"
            if not uploads_dir.exists():
                uploads_dir = Path("uploads").resolve()
            file_path.relative_to(uploads_dir.resolve())
        except (ValueError, RuntimeError):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid file path"
            )
        
        # Check if file exists
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found: {document_path}"
            )
        
        # Get filename for download
        filename = Path(document_path).name
        
        # Return file as streaming response
        media_type, _ = mimetypes.guess_type(str(file_path))
        
        # Open file and return as streaming response
        def file_iterator(file_path, chunk_size=8192):
            with open(file_path, 'rb') as f:
                while True:
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    yield chunk
        
        return StreamingResponse(
            file_iterator(file_path),
            media_type=media_type or "application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download document: {str(e)}"
        )

# ==================== POLICY CRUD ENDPOINTS ====================

@router.post("/policies", response_model=InsurancePolicyResponse, status_code=status.HTTP_201_CREATED)
def create_policy(policy: InsurancePolicyCreate):
    """
    Create a new insurance policy.
    Generates a unique policy ID and stores in database.
    """
    try:
        # Generate unique policy ID
        policy_count = insurance_management_repository.get_policy_count()
        policy_id = f"INS{str(policy_count + 1).zfill(3)}"
        
        # Create policy in database
        policy_data = InsurancePolicyInDB(
            policyId=policy_id,
            customer=policy.customer,
            email=policy.email,
            phone=policy.phone,
            type=policy.type.value,
            premium=policy.premium,
            coverage=policy.coverage,
            status=policy.status.value,
            startDate=policy.startDate,
            endDate=policy.endDate,
            nominee=policy.nominee,
            documents=policy.documents
        )
        
        db_id = insurance_management_repository.create_policy(policy_data)
        
        # Prepare response
        response = InsurancePolicyResponse(
            id=policy_id,
            customer=policy.customer,
            email=policy.email,
            phone=policy.phone,
            type=policy.type.value,
            premium=policy.premium,
            coverage=policy.coverage,
            status=policy.status.value,
            startDate=policy.startDate,
            endDate=policy.endDate,
            nominee=policy.nominee,
            documents=policy.documents,
            message=f"Policy {policy_id} created successfully"
        )
        
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create policy: {str(e)}"
        )

@router.get("/policies", response_model=InsurancePolicyListResponse)
def get_all_policies(
    type: Optional[str] = Query(None, description="Filter by insurance type"),
    status: Optional[str] = Query(None, description="Filter by policy status"),
    search: Optional[str] = Query(None, description="Search by customer, email, phone, or policy ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return")
):
    """
    Get all insurance policies with optional filtering and search.
    Supports pagination and filtering by type, status, and search term.
    """
    try:
        result = insurance_management_repository.get_filtered_policies(
            policy_type=type,
            status=status,
            search_term=search,
            skip=skip,
            limit=limit
        )
        
        return InsurancePolicyListResponse(
            total=result["total"],
            policies=result["policies"],
            page=skip // limit + 1,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch policies: {str(e)}"
        )

@router.get("/policies/{policy_id}", response_model=dict)
def get_policy_by_id(policy_id: str):
    """
    Get a specific policy by ID.
    Accepts both MongoDB ObjectId and Policy ID (e.g., INS001).
    """
    try:
        # Try to get by policy ID first
        policy = insurance_management_repository.get_policy_by_policy_id(policy_id)
        
        # If not found, try MongoDB ObjectId
        if not policy:
            policy = insurance_management_repository.get_policy_by_id(policy_id)
        
        if not policy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy {policy_id} not found"
            )
        
        return policy
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch policy: {str(e)}"
        )

@router.put("/policies/{policy_id}", response_model=dict)
def update_policy(policy_id: str, policy_update: InsurancePolicyUpdate):
    """
    Update policy details.
    Allows partial updates - only provided fields will be updated.
    """
    try:
        # Convert Pydantic model to dict and remove None values
        update_data = policy_update.dict(exclude_none=True)
        
        # Convert enum values to strings
        if "type" in update_data and isinstance(update_data["type"], InsuranceType):
            update_data["type"] = update_data["type"].value
        if "status" in update_data and isinstance(update_data["status"], PolicyStatus):
            update_data["status"] = update_data["status"].value
        
        # Update in database
        success = insurance_management_repository.update_policy(policy_id, update_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy {policy_id} not found or no changes made"
            )
        
        # Fetch updated policy
        updated_policy = insurance_management_repository.get_policy_by_policy_id(policy_id)
        if not updated_policy:
            updated_policy = insurance_management_repository.get_policy_by_id(policy_id)
        
        return {
            "message": f"Policy {policy_id} updated successfully",
            "policy": updated_policy
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update policy: {str(e)}"
        )

@router.patch("/policies/{policy_id}/status", response_model=dict)
def update_policy_status(policy_id: str, status_update: PolicyStatusUpdate):
    """
    Update only the status of a policy.
    Used for quick status changes (Approve/Reject/Expire actions).
    """
    try:
        success = insurance_management_repository.update_policy_status(
            policy_id,
            status_update.status.value,
            status_update.remarks
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy {policy_id} not found"
            )
        
        return {
            "message": f"Policy status updated to {status_update.status.value}",
            "policyId": policy_id,
            "newStatus": status_update.status.value
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update policy status: {str(e)}"
        )

@router.delete("/policies/{policy_id}", response_model=dict)
def delete_policy(policy_id: str):
    """
    Delete a policy.
    Permanently removes the policy from the database.
    """
    try:
        success = insurance_management_repository.delete_policy(policy_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Policy {policy_id} not found"
            )
        
        return {
            "message": f"Policy {policy_id} deleted successfully",
            "policyId": policy_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete policy: {str(e)}"
        )

# ==================== FILTER ENDPOINTS ====================

@router.get("/policies/type/{insurance_type}", response_model=List[dict])
def get_policies_by_type(
    insurance_type: InsuranceType,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get policies filtered by insurance type.
    """
    try:
        policies = insurance_management_repository.get_policies_by_type(
            insurance_type.value,
            skip,
            limit
        )
        return policies
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch policies: {str(e)}"
        )

@router.get("/policies/status/{policy_status}", response_model=List[dict])
def get_policies_by_status(
    policy_status: PolicyStatus,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get policies filtered by status.
    """
    try:
        policies = insurance_management_repository.get_policies_by_status(
            policy_status.value,
            skip,
            limit
        )
        return policies
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch policies: {str(e)}"
        )

@router.get("/policies/expiring/soon", response_model=List[dict])
def get_expiring_policies(
    days: int = Query(30, ge=1, le=365, description="Number of days to look ahead"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get policies expiring within the specified number of days.
    Useful for renewal notifications.
    """
    try:
        policies = insurance_management_repository.get_policies_expiring_soon(
            days,
            skip,
            limit
        )
        return policies
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch expiring policies: {str(e)}"
        )

# ==================== SEARCH ENDPOINT ====================

@router.get("/policies/search/{search_term}", response_model=List[dict])
def search_policies(
    search_term: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Search policies by customer name, email, phone, or policy ID.
    """
    try:
        policies = insurance_management_repository.search_policies(
            search_term,
            skip,
            limit
        )
        return policies
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search policies: {str(e)}"
        )

# ==================== BULK OPERATIONS ====================

@router.patch("/policies/bulk/status", response_model=dict)
def bulk_update_status(policy_ids: List[str], status: PolicyStatus):
    """
    Bulk update status for multiple policies.
    Useful for batch approval/rejection operations.
    """
    try:
        modified_count = insurance_management_repository.bulk_update_status(
            policy_ids,
            status.value
        )
        
        return {
            "message": f"Successfully updated {modified_count} policies",
            "modifiedCount": modified_count,
            "newStatus": status.value
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk update policies: {str(e)}"
        )

# ==================== EXPORT ENDPOINT ====================

@router.get("/policies/export/csv", response_model=dict)
def export_policies_csv(
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """
    Export policies to CSV format.
    Returns policy data that can be converted to CSV on frontend.
    """
    try:
        result = insurance_management_repository.get_filtered_policies(
            policy_type=type,
            status=status,
            skip=0,
            limit=10000  # Get all for export
        )
        
        return {
            "message": "Policies fetched for export",
            "count": result["total"],
            "policies": result["policies"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export policies: {str(e)}"
        )
