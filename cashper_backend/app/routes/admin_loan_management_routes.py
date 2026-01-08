from fastapi import APIRouter, HTTPException, status, Query, File, UploadFile
from typing import List, Optional
from datetime import datetime
from pathlib import Path
from fastapi.responses import FileResponse
from app.database.schema.admin_loan_management_schema import (
    LoanApplicationCreate,
    LoanApplicationUpdate,
    LoanApplicationResponse,
    LoanStatusUpdate,
    LoanStatistics,
    AdminLoanApplication,
    AdminLoanApplicationInDB
)
from app.database.repository.admin_loan_management_repository import admin_loan_management_repository

router = APIRouter(prefix="/admin/loan-management", tags=["Admin - Loan Management"])


# ===================== STATISTICS ENDPOINT =====================

@router.get("/statistics", response_model=LoanStatistics)
def get_loan_statistics():
    """
    Get loan application statistics for admin dashboard
    
    Returns:
    - Total applications count
    - Count by status (Pending, Under Review, Approved, Rejected, Disbursed)
    - Total loan amount
    - Average loan amount
    - Average CIBIL score
    """
    try:
        statistics = admin_loan_management_repository.get_statistics()
        return statistics
        
    except Exception as e:
        print(f"Error getting statistics: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch loan statistics: {str(e)}"
        )


# ===================== GET ALL APPLICATIONS =====================

@router.get("/applications", response_model=dict)
def get_all_loan_applications(
    status: Optional[str] = Query(None, description="Filter by status"),
    loan_type: Optional[str] = Query(None, description="Filter by loan type"),
    search: Optional[str] = Query(None, description="Search by customer name, email, phone, or purpose"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page")
):
    """
    Get all loan applications with filters and pagination
    
    Query Parameters:
    - status: Filter by status (Pending, Under Review, Approved, Rejected, Disbursed, all)
    - loan_type: Filter by loan type (Personal Loan, Home Loan, etc.)
    - search: Search in customer name, email, phone, purpose
    - page: Page number (default: 1)
    - limit: Items per page (default: 10, max: 100)
    
    Returns paginated list of loan applications
    """
    try:
        skip = (page - 1) * limit
        
        applications, total = admin_loan_management_repository.get_all_applications(
            status=status,
            loan_type=loan_type,
            search=search,
            skip=skip,
            limit=limit
        )
        
        total_pages = (total + limit - 1) // limit
        
        return {
            "applications": applications,
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": total_pages
        }
        
    except Exception as e:
        print(f"Error getting applications: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch loan applications: {str(e)}"
        )


# ===================== GET SINGLE APPLICATION =====================

@router.get("/applications/{application_id}", response_model=AdminLoanApplication)
def get_loan_application(application_id: str):
    """
    Get detailed information about a specific loan application
    
    Returns complete loan application details including:
    - Customer information
    - Loan details
    - CIBIL score
    - Documents
    - Status and dates
    """
    try:
        loan = admin_loan_management_repository.get_application_by_id(application_id)
        
        if not loan:
            raise HTTPException(
                status_code=404,
                detail="Loan application not found"
            )
        
        return admin_loan_management_repository._loan_to_response(loan)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting application: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch loan application: {str(e)}"
        )


# ===================== CREATE APPLICATION =====================

@router.post("/applications", response_model=LoanApplicationResponse, status_code=201)
def create_loan_application(application: LoanApplicationCreate):
    """
    Create a new loan application (for testing/seeding)
    
    This endpoint allows creating sample loan applications for testing the admin panel.
    
    Required fields:
    - customer: Customer name
    - email: Customer email
    - phone: Customer phone number
    - type: Loan type (Personal Loan, Home Loan, Business Loan, etc.)
    - amount: Loan amount
    - tenure: Loan tenure in months
    - interestRate: Interest rate percentage
    - purpose: Loan purpose
    - income: Monthly income
    - cibilScore: CIBIL score (300-900)
    - documents: List of document filenames
    """
    try:
        # Create application data
        application_data = AdminLoanApplicationInDB(
            customer=application.customer,
            email=application.email,
            phone=application.phone,
            type=application.type.value,
            amount=application.amount,
            tenure=application.tenure,
            interestRate=application.interestRate,
            purpose=application.purpose,
            income=application.income,
            cibilScore=application.cibilScore,
            documents=application.documents,
            status="Pending"
        )
        
        # Create in database
        application_id = admin_loan_management_repository.create_application(application_data)
        
        # Get created application
        created_loan = admin_loan_management_repository.get_application_by_id(application_id)
        
        if not created_loan:
            raise Exception("Failed to retrieve created application")
        
        response_loan = admin_loan_management_repository._loan_to_response(created_loan)
        
        return LoanApplicationResponse(
            id=response_loan.id,
            customer=response_loan.customer,
            email=response_loan.email,
            phone=response_loan.phone,
            type=response_loan.type,
            amount=response_loan.amount,
            status=response_loan.status,
            appliedDate=response_loan.appliedDate,
            tenure=response_loan.tenure,
            interestRate=response_loan.interestRate,
            purpose=response_loan.purpose,
            income=response_loan.income,
            cibilScore=response_loan.cibilScore,
            documents=response_loan.documents,
            message=f"Loan application created successfully for {application.customer}"
        )
        
    except Exception as e:
        print(f"Error creating application: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create loan application: {str(e)}"
        )


# ===================== UPDATE APPLICATION =====================

@router.patch("/applications/{application_id}", response_model=AdminLoanApplication)
def update_loan_application(
    application_id: str,
    update_data: LoanApplicationUpdate
):
    """
    Update loan application details
    
    Allows partial updates of loan application information.
    Only provided fields will be updated.
    """
    try:
        # Check if application exists
        existing = admin_loan_management_repository.get_application_by_id(application_id)
        
        if not existing:
            raise HTTPException(
                status_code=404,
                detail="Loan application not found"
            )
        
        # Prepare update data
        update_dict = update_data.dict(exclude_unset=True)
        
        if not update_dict:
            raise HTTPException(
                status_code=400,
                detail="No fields provided for update"
            )
        
        # Convert enum to value if present
        if "type" in update_dict and hasattr(update_dict["type"], "value"):
            update_dict["type"] = update_dict["type"].value
        
        # Update in database
        success = admin_loan_management_repository.update_application(application_id, update_dict)
        
        if not success:
            raise Exception("No changes were made")
        
        # Get updated application
        updated_loan = admin_loan_management_repository.get_application_by_id(application_id)
        
        return admin_loan_management_repository._loan_to_response(updated_loan)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating application: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update loan application: {str(e)}"
        )


# ===================== UPDATE STATUS =====================

@router.patch("/applications/{application_id}/status")
def update_loan_status(
    application_id: str,
    status_update: LoanStatusUpdate
):
    """
    Update loan application status
    
    Allowed statuses:
    - Pending
    - Under Review
    - Approved
    - Rejected (requires rejectionReason)
    - Disbursed
    
    When rejecting, rejectionReason must be provided.
    """
    try:
        # Check if application exists
        existing = admin_loan_management_repository.get_application_by_id(application_id)
        
        if not existing:
            raise HTTPException(
                status_code=404,
                detail="Loan application not found"
            )
        
        # Validate rejection reason
        if status_update.status.value == "Rejected" and not status_update.rejectionReason:
            raise HTTPException(
                status_code=400,
                detail="Rejection reason is required when rejecting an application"
            )
        
        # Update status
        success = admin_loan_management_repository.update_status(
            application_id,
            status_update.status.value,
            status_update.rejectionReason
        )
        
        if not success:
            raise Exception("Failed to update status")
        
        return {
            "message": f"Loan application status updated to {status_update.status.value}",
            "success": True,
            "applicationId": application_id,
            "newStatus": status_update.status.value
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update loan status: {str(e)}"
        )


# ===================== DELETE APPLICATION =====================

@router.delete("/applications/{application_id}")
def delete_loan_application(application_id: str):
    """
    Delete a loan application
    
    Permanently removes the loan application from the system.
    This action cannot be undone.
    """
    try:
        # Check if application exists
        existing = admin_loan_management_repository.get_application_by_id(application_id)
        
        if not existing:
            raise HTTPException(
                status_code=404,
                detail="Loan application not found"
            )
        
        # Delete application
        success = admin_loan_management_repository.delete_application(application_id)
        
        if not success:
            raise Exception("Failed to delete application")
        
        return {
            "message": "Loan application deleted successfully",
            "success": True,
            "deletedId": application_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting application: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete loan application: {str(e)}"
        )


# ===================== BULK DELETE =====================

@router.post("/applications/bulk-delete")
def bulk_delete_applications(application_ids: List[str]):
    """
    Delete multiple loan applications
    
    Accepts a list of application IDs and deletes them all.
    Returns the count of successfully deleted applications.
    """
    try:
        if not application_ids:
            raise HTTPException(
                status_code=400,
                detail="No application IDs provided"
            )
        
        deleted_count = admin_loan_management_repository.bulk_delete(application_ids)
        
        return {
            "message": f"Successfully deleted {deleted_count} application(s)",
            "success": True,
            "deletedCount": deleted_count,
            "requestedCount": len(application_ids)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error bulk deleting: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete applications: {str(e)}"
        )


# ===================== EXPORT TO CSV =====================

@router.get("/applications/export/csv")
def export_applications_csv(
    status: Optional[str] = Query(None, description="Filter by status"),
    loan_type: Optional[str] = Query(None, description="Filter by loan type")
):
    """
    Export loan applications to CSV format
    
    Returns CSV data with all loan applications matching the filters
    """
    try:
        applications, _ = admin_loan_management_repository.get_all_applications(
            status=status,
            loan_type=loan_type,
            skip=0,
            limit=10000  # Get all for export
        )
        
        # Create CSV content
        csv_lines = [
            "ID,Customer,Email,Phone,Type,Amount,Status,Applied Date,Tenure,Interest Rate,Purpose,Income,CIBIL Score"
        ]
        
        for app in applications:
            csv_lines.append(
                f'"{app.id}","{app.customer}","{app.email}","{app.phone}","{app.type}",'
                f'"{app.amount}","{app.status}","{app.appliedDate}","{app.tenure}",'
                f'"{app.interestRate}","{app.purpose}","{app.income}",{app.cibilScore}'
            )
        
        csv_content = "\n".join(csv_lines)
        
        return {
            "csvData": csv_content,
            "filename": f"loan_applications_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            "recordCount": len(applications)
        }
        
    except Exception as e:
        print(f"Error exporting CSV: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export data: {str(e)}"
        )


# ===================== DOWNLOAD DOCUMENT =====================

@router.get("/download-document/{file_path:path}")
def download_document(file_path: str):
    """
    Download a document file
    
    Path Parameters:
    - file_path: The file path (can include subdirectories)
    
    Returns:
        File content for download
    """
    try:
        # Construct the full file path from uploads directory
        full_path = Path("uploads") / file_path
        
        # Security check: ensure the file is within uploads directory
        try:
            full_path = full_path.resolve()
            uploads_dir = Path("uploads").resolve()
            
            # Ensure the file is within the uploads directory
            if not str(full_path).startswith(str(uploads_dir)):
                raise HTTPException(
                    status_code=403,
                    detail="Access denied: Invalid file path"
                )
        except Exception as e:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        
        # Check if file exists
        if not full_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Document not found: {file_path}"
            )
        
        # Check if it's a file (not a directory)
        if not full_path.is_file():
            raise HTTPException(
                status_code=400,
                detail="Path is not a file"
            )
        
        # Return file for download
        return FileResponse(
            path=full_path,
            filename=full_path.name,
            media_type="application/octet-stream"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error downloading document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download document: {str(e)}"
        )
