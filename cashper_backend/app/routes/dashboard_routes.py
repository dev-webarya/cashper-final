from fastapi import APIRouter, HTTPException, status, Depends, File, UploadFile, Form
from typing import List, Dict, Any
from app.database.schema.dashboard_schema import (
    DashboardSupportRequest,
    DashboardSupportResponse,
    DashboardSupportInDB,
    DocumentUploadResponse,
    UserDocumentListResponse,
    DeleteDocumentResponse
)
from app.database.repository.dashboard_repository import dashboard_repository
from app.utils.auth_middleware import get_current_user
from app.utils.file_upload import save_upload_file
from datetime import datetime
from bson import ObjectId
import os

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


# ===================== DASHBOARD STATS & USER INFO ENDPOINTS =====================

# Stats endpoint removed - no longer needed in UI

@router.get("/user-info", response_model=Dict[str, Any])
def get_user_quick_info(current_user: dict = Depends(get_current_user)):
    """
    Get quick user information for dashboard header
    
    Returns:
    - User name
    - Email
    - Profile image
    - Account creation date
    - Last login
    """
    try:
        user_id = str(current_user["_id"])
        
        from app.database.db import get_database
        db = get_database()
        
        # Get full user details
        user = db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "id": str(user["_id"]),
            "name": user.get("name", "User"),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "profileImage": user.get("profileImage", ""),
            "initials": user.get("name", "U")[0].upper() if user.get("name") else "U",
            "createdAt": user.get("createdAt", datetime.utcnow()),
            "lastLogin": user.get("lastLogin", datetime.utcnow()),
            "isVerified": user.get("isVerified", False),
            "role": user.get("role", "user")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"User info error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user information. Error: {str(e)}"
        )


@router.get("/user", response_model=Dict[str, Any])
def get_dashboard_user(current_user: dict = Depends(get_current_user)):
    """Alias endpoint for /user-info for backward compatibility"""
    return get_user_quick_info(current_user)


@router.get("/financial-summary", response_model=Dict[str, Any])
def get_financial_summary(current_user: dict = Depends(get_current_user)):
    """
    Get financial summary for the current user
    
    Returns:
    - Total amount borrowed
    - Total amount invested
    - Total insurance coverage
    - Monthly expenses
    - Credit score
    """
    try:
        user_id = str(current_user["_id"])
        
        from app.database.db import get_database
        db = get_database()
        
        # Calculate total loans
        total_borrowed = 0
        personal_loans = db.personal_loans.find({"userId": user_id})
        for loan in personal_loans:
            total_borrowed += float(loan.get("loanAmount", 0))
        
        # Calculate total investments
        total_invested = 0
        sip_investments = db.sip_inquiries.find({"userId": user_id})
        for inv in sip_investments:
            total_invested += float(inv.get("monthlyInvestment", 0)) * 12
        
        # Calculate total insurance coverage
        total_insurance = 0
        health_insurance = db.health_insurance_inquiries.count_documents({"userId": user_id})
        motor_insurance = db.motor_insurance_inquiries.count_documents({"userId": user_id})
        term_insurance = db.term_insurance_inquiries.count_documents({"userId": user_id})
        total_insurance = health_insurance * 1000000 + motor_insurance * 800000 + term_insurance * 5000000
        
        # Estimated monthly expenses (based on loan EMIs)
        monthly_expenses = total_borrowed * 0.02  # Approximate 2% monthly EMI
        
        # Mock credit score (in real app, fetch from credit bureau)
        credit_score = 750
        
        return {
            "totalBorrowed": total_borrowed,
            "totalInvested": total_invested,
            "totalInsurance": total_insurance,
            "monthlyExpenses": monthly_expenses,
            "creditScore": credit_score,
            "financialHealth": "Good" if credit_score > 700 else "Fair" if credit_score > 600 else "Poor"
        }
        
    except Exception as e:
        print(f"Financial summary error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch financial summary. Error: {str(e)}"
        )


# ===================== CONTACT SUPPORT ENDPOINTS =====================

@router.post("/support", response_model=DashboardSupportResponse, status_code=status.HTTP_201_CREATED)
def submit_support_request(
    support_request: DashboardSupportRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit a support request from dashboard (Authenticated users only)
    
    This endpoint allows authenticated users to submit support requests with:
    - Name (auto-filled from profile)
    - Email (auto-filled from profile)
    - Phone number (auto-filled from profile)
    - Issue description (10-500 characters)
    
    All fields are validated before submission.
    """
    try:
        user_id = str(current_user["_id"])
        
        # Create support ticket in database
        support_in_db = DashboardSupportInDB(
            userId=user_id,
            name=support_request.name,
            email=support_request.email.lower(),
            phone=support_request.phone,
            issue=support_request.issue,
            status="pending",
            createdAt=datetime.utcnow()
        )
        
        created_ticket = dashboard_repository.create_support_ticket(support_in_db)
        
        return created_ticket
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit support request. Please try again. Error: {str(e)}"
        )


@router.get("/support", response_model=List[DashboardSupportResponse])
def get_my_support_tickets(
    current_user: dict = Depends(get_current_user)
):
    """
    Get all support tickets for the current authenticated user
    
    Returns a list of support tickets sorted by creation date (newest first)
    """
    try:
        user_id = str(current_user["_id"])
        tickets = dashboard_repository.get_user_support_tickets(user_id)
        
        ticket_list = []
        for ticket in tickets:
            try:
                ticket_list.append(DashboardSupportResponse(
                    id=str(ticket["_id"]),
                    userId=str(ticket["userId"]),
                    name=ticket.get("name", ""),
                    email=ticket.get("email", ""),
                    phone=ticket.get("phone", ""),
                    issue=ticket.get("issue", ""),
                    status=ticket.get("status", "pending"),
                    createdAt=ticket.get("createdAt", datetime.utcnow()),
                    resolvedAt=ticket.get("resolvedAt")
                ))
            except Exception as ticket_error:
                print(f"Error processing ticket {ticket.get('_id')}: {str(ticket_error)}")
                continue
        
        return ticket_list
        
    except Exception as e:
        print(f"Get support tickets error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch support tickets. Error: {str(e)}"
        )


@router.get("/support/{ticket_id}", response_model=DashboardSupportResponse)
def get_support_ticket_details(
    ticket_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get details of a specific support ticket
    
    Users can only view their own support tickets
    """
    try:
        user_id = str(current_user["_id"])
        ticket = dashboard_repository.get_support_ticket_by_id(ticket_id)
        
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Support ticket not found"
            )
        
        # Verify the ticket belongs to the current user
        if str(ticket["userId"]) != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this ticket"
            )
        
        return DashboardSupportResponse(
            id=str(ticket["_id"]),
            userId=str(ticket["userId"]),
            name=ticket["name"],
            email=ticket["email"],
            phone=ticket["phone"],
            issue=ticket["issue"],
            status=ticket["status"],
            createdAt=ticket["createdAt"],
            resolvedAt=ticket.get("resolvedAt")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch support ticket details. Error: {str(e)}"
        )


# ===================== MY DOCUMENTS ENDPOINTS =====================

@router.post("/documents/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    documentType: str = Form("General Document"),
    category: str = Form("general"),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a document to user's document storage (Authenticated users only)
    
    Supports the following file types:
    - PDF (.pdf)
    - Images (.png, .jpg, .jpeg)
    - Documents (.doc, .docx)
    
    Maximum file size: 10MB
    
    Parameters:
    - file: The file to upload (required)
    - documentType: Type of document (default: "General Document")
    - category: Category of document (default: "general")
    """
    try:
        user_id = str(current_user["_id"])
        
        # Validate file type
        allowed_extensions = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx']
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Validate file size (10MB max)
        file.file.seek(0, 2)  # Seek to end of file
        file_size = file.file.tell()  # Get current position (file size)
        file.file.seek(0)  # Reset file pointer to beginning
        
        max_file_size = 10 * 1024 * 1024  # 10MB in bytes
        if file_size > max_file_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 10MB limit"
            )
        
        # Save the uploaded document
        try:
            file_path = await save_upload_file(file, "document")
            # file_path returns something like /uploads/documents/xxxxx.pdf
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to upload file: {str(e)}"
            )
        
        # Create file URL (file_path already includes /uploads/)
        file_url = file_path
        
        # Get MIME type
        mime_types = {
            '.pdf': 'application/pdf',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
        mime_type = mime_types.get(file_extension, 'application/octet-stream')
        
        # Create document record
        from app.database.schema.dashboard_schema import DocumentInDB
        document_data = DocumentInDB(
            userId=user_id,
            documentType=documentType,
            fileName=file.filename,
            filePath=file_path,
            fileUrl=file_url,
            category=category,
            fileSize=file_size,
            mimeType=mime_type,
            uploadedAt=datetime.utcnow()
        )
        
        created_document = dashboard_repository.create_document(document_data)
        
        return created_document
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Document upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )


@router.get("/documents", response_model=UserDocumentListResponse)
def get_my_documents(
    current_user: dict = Depends(get_current_user)
):
    """
    Get all documents uploaded by the current authenticated user
    
    Returns a list of documents sorted by upload date (newest first)
    """
    try:
        user_id = str(current_user["_id"])
        documents = dashboard_repository.get_user_documents(user_id)
        total = dashboard_repository.count_user_documents(user_id)
        
        document_list = []
        for doc in documents:
            try:
                document_list.append(DocumentUploadResponse(
                    id=str(doc["_id"]),
                    userId=str(doc["userId"]),
                    documentType=doc.get("documentType", "Unknown"),
                    fileName=doc.get("fileName", "Unknown"),
                    filePath=doc.get("filePath", ""),
                    fileUrl=doc.get("fileUrl", ""),
                    category=doc.get("category", "general"),
                    fileSize=doc.get("fileSize", 0),
                    mimeType=doc.get("mimeType", "application/octet-stream"),
                    uploadedAt=doc.get("uploadedAt", datetime.utcnow())
                ))
            except Exception as doc_error:
                print(f"Error processing document {doc.get('_id')}: {str(doc_error)}")
                continue
        
        return UserDocumentListResponse(
            documents=document_list,
            total=total
        )
        
    except Exception as e:
        print(f"Get documents error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch documents. Error: {str(e)}"
        )


@router.get("/documents/{document_id}", response_model=DocumentUploadResponse)
def get_document_details(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get details of a specific document
    
    Users can only view their own documents
    """
    try:
        user_id = str(current_user["_id"])
        document = dashboard_repository.get_document_by_id(document_id, user_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or you don't have permission to view it"
            )
        
        return DocumentUploadResponse(
            id=str(document["_id"]),
            userId=str(document["userId"]),
            documentType=document["documentType"],
            fileName=document["fileName"],
            filePath=document["filePath"],
            fileUrl=document["fileUrl"],
            category=document["category"],
            fileSize=document["fileSize"],
            mimeType=document["mimeType"],
            uploadedAt=document["uploadedAt"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch document details. Error: {str(e)}"
        )


@router.delete("/documents/{document_id}", response_model=DeleteDocumentResponse)
def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a document
    
    Users can only delete their own documents
    This is a permanent deletion and cannot be undone
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get document first to verify ownership and get file path
        document = dashboard_repository.get_document_by_id(document_id, user_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or you don't have permission to delete it"
            )
        
        # Delete from database
        success = dashboard_repository.delete_document(document_id, user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete document from database"
            )
        
        # Try to delete the physical file
        try:
            file_path = document["filePath"]
            full_path = os.path.join("uploads", file_path)
            if os.path.exists(full_path):
                os.remove(full_path)
        except Exception as e:
            print(f"Warning: Failed to delete physical file: {str(e)}")
            # Continue even if physical file deletion fails
        
        return DeleteDocumentResponse(
            message="Document deleted successfully",
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document. Error: {str(e)}"
        )


# ===================== INSURANCE MANAGEMENT ENDPOINTS =====================

@router.get("/insurance", response_model=Dict[str, Any])
def get_user_insurance_overview(current_user: dict = Depends(get_current_user)):
    """
    Get comprehensive insurance overview for the current user
    
    Returns:
    - All insurance applications (real form submissions)
    - Summary statistics
    - Recent insurance activities
    """
    
    def map_status(db_status):
        """Map database status to filter-friendly status"""
        status_lower = (db_status or "pending").lower()
        
        # Map various status values to standard ones
        if status_lower in ["submitted", "under review", "under_review", "processing"]:
            return "Pending"
        elif status_lower in ["approved", "active", "accepted"]:
            return "Active"
        elif status_lower in ["rejected", "declined", "denied"]:
            return "Cancelled"
        elif status_lower in ["expired"]:
            return "Expired"
        elif status_lower in ["expiring", "expiring soon", "expiring_soon"]:
            return "Expiring Soon"
        else:
            return "Pending"
    
    try:
        user_id = str(current_user["_id"])
        from app.database.db import get_database
        db = get_database()
        
        # Get all policies from applications (real form submissions)
        policies = []
        
        # Health Insurance Applications - REAL DATA
        health_apps = db.health_insurance_applications.find({"userId": user_id}).sort("createdAt", -1)
        health_count = 0
        for app in health_apps:
            health_count += 1
            created_date = app.get("createdAt", datetime.utcnow())
            
            policies.append({
                "id": str(app["_id"]),
                "type": "Health Insurance",
                "provider": app.get("insuranceProvider", "Star Health"),
                "policyNumber": app.get("applicationNumber", f"HI{str(app['_id'])[-11:]}"),
                "premium": f"₹{app.get('monthlyPremium', 0)}" if app.get('monthlyPremium') else "₹0",
                "coverage": f"₹{app.get('sumInsured', 0)}" if app.get('sumInsured') else "N/A",
                "status": map_status(app.get("status", "submitted")),
                "appliedDate": created_date.strftime("%b %d, %Y"),
                "familyMembers": app.get("numberOfMembers", 1),
                "coverageAmount": app.get("coverageAmount", app.get("sumInsured", "N/A")),
                "name": app.get("name", ""),
                "email": app.get("email", ""),
                "phone": app.get("phone", ""),
                "age": app.get("age", ""),
                "gender": app.get("gender", ""),
                "renewalDate": created_date.strftime("%b %d, %Y") if created_date else "N/A",
                "daysToRenewal": 365
            })
        
        # Motor Insurance Applications - REAL DATA
        motor_apps = db.motor_insurance_applications.find({"userId": user_id}).sort("createdAt", -1)
        motor_count = 0
        for app in motor_apps:
            motor_count += 1
            created_date = app.get("createdAt", datetime.utcnow())
            
            policies.append({
                "id": str(app["_id"]),
                "type": "Motor Insurance",
                "provider": app.get("insuranceProvider", "ICICI Lombard"),
                "policyNumber": app.get("applicationNumber", f"MI{str(app['_id'])[-11:]}"),
                "premium": f"₹{app.get('monthlyPremium', 0)}" if app.get('monthlyPremium') else "₹0",
                "coverage": f"₹{app.get('sumInsured', 0)}" if app.get('sumInsured') else "N/A",
                "status": map_status(app.get("status", "submitted")),
                "appliedDate": created_date.strftime("%b %d, %Y"),
                "vehicleNumber": app.get("vehicleNumber", "N/A"),
                "vehicleType": app.get("vehicleType", "Car"),
                "name": app.get("name", ""),
                "email": app.get("email", ""),
                "phone": app.get("phone", ""),
                "renewalDate": created_date.strftime("%b %d, %Y") if created_date else "N/A",
                "daysToRenewal": 365
            })
        
        # Term Insurance Applications - REAL DATA
        term_apps = db.term_insurance_applications.find({"userId": user_id}).sort("createdAt", -1)
        term_count = 0
        for app in term_apps:
            term_count += 1
            created_date = app.get("createdAt", datetime.utcnow())
            
            policies.append({
                "id": str(app["_id"]),
                "type": "Term Insurance",
                "provider": app.get("insuranceProvider", "LIC"),
                "policyNumber": app.get("applicationNumber", f"TI{str(app['_id'])[-11:]}"),
                "premium": f"₹{app.get('monthlyPremium', 0)}" if app.get('monthlyPremium') else "₹0",
                "coverage": f"₹{app.get('sumInsured', 0)}" if app.get('sumInsured') else "N/A",
                "status": map_status(app.get("status", "submitted")),
                "appliedDate": created_date.strftime("%b %d, %Y"),
                "coverageAmount": app.get("coverageAmount", app.get("sumInsured", "N/A")),
                "term": app.get("policyTerm", "20 years"),
                "name": app.get("name", ""),
                "email": app.get("email", ""),
                "phone": app.get("phone", ""),
                "age": app.get("age", ""),
                "gender": app.get("gender", ""),
                "renewalDate": created_date.strftime("%b %d, %Y") if created_date else "N/A",
                "daysToRenewal": 365
            })
        
        total_policies = len(policies)
        active_count = sum(1 for p in policies if p.get("status") == "Active")
        
        # Calculate total coverage and premium
        total_coverage = 0
        total_premium = 0
        for policy in policies:
            # Parse coverage
            coverage_str = policy.get("coverage", "0").replace("₹", "").replace(",", "")
            try:
                total_coverage += int(coverage_str) if coverage_str.isdigit() else 0
            except:
                pass
            
            # Parse premium
            premium_str = policy.get("premium", "0").replace("₹", "").replace(",", "")
            try:
                total_premium += int(premium_str) if premium_str.isdigit() else 0
            except:
                pass
        
        return {
            "summary": {
                "activePolicies": active_count,
                "totalCoverage": total_coverage,
                "annualPremium": total_premium,
                "healthInsurance": health_count,
                "motorInsurance": motor_count,
                "termInsurance": term_count
            },
            "policies": policies,
            "totalPolicies": total_policies
        }
        
    except Exception as e:
        print(f"Insurance overview error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch insurance overview. Error: {str(e)}"
        )


@router.get("/insurance/summary", response_model=Dict[str, Any])
def get_insurance_summary(current_user: dict = Depends(get_current_user)):
    """
    Get insurance summary for the current user
    
    Returns:
    - Active policies count
    - Total coverage amount
    - Annual premium
    - Health, Motor, Term insurance counts
    """
    try:
        user_id = str(current_user["_id"])
        from app.database.db import get_database
        db = get_database()
        
        # Count different insurance types
        health_insurance = db.health_insurance_inquiries.count_documents({"userId": user_id})
        motor_insurance = db.motor_insurance_inquiries.count_documents({"userId": user_id})
        term_insurance = db.term_insurance_inquiries.count_documents({"userId": user_id})
        
        total_policies = health_insurance + motor_insurance + term_insurance
        
        # Calculate estimated coverage and premium
        total_coverage = health_insurance * 1000000 + motor_insurance * 800000 + term_insurance * 5000000
        annual_premium = health_insurance * 15000 + motor_insurance * 12000 + term_insurance * 25000
        
        return {
            "activePolicies": total_policies,
            "totalCoverage": total_coverage,
            "annualPremium": annual_premium,
            "healthInsurance": health_insurance,
            "motorInsurance": motor_insurance,
            "termInsurance": term_insurance
        }
        
    except Exception as e:
        print(f"Insurance summary error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch insurance summary. Error: {str(e)}"
        )


@router.get("/insurance/policies", response_model=List[Dict[str, Any]])
def get_insurance_policies(current_user: dict = Depends(get_current_user)):
    """
    Get all insurance policies for the current user
    
    Returns list of policies with:
    - Policy details
    - Provider information
    - Coverage and premium
    - Renewal dates
    """
    try:
        user_id = str(current_user["_id"])
        from app.database.db import get_database
        db = get_database()
        
        policies = []
        
        # Health Insurance Policies
        health_policies = db.health_insurance_inquiries.find({"userId": user_id}).sort("createdAt", -1)
        for policy in health_policies:
            created_date = policy.get("createdAt", datetime.utcnow())
            renewal_date = datetime(created_date.year + 1, created_date.month, created_date.day)
            days_to_renewal = (renewal_date - datetime.utcnow()).days
            
            policies.append({
                "id": str(policy["_id"]),
                "type": "Health Insurance",
                "provider": "Star Health",
                "policyNumber": f"SH{str(policy['_id'])[-9:]}",
                "premium": "₹15,000/year",
                "coverage": "₹10,00,000",
                "status": "expiring" if days_to_renewal <= 30 else "active",
                "renewalDate": renewal_date.strftime("%b %d, %Y"),
                "daysToRenewal": max(0, days_to_renewal),
                "appliedDate": created_date.strftime("%b %d, %Y"),
                "familyMembers": policy.get("numberOfMembers", 1),
                "coverageAmount": policy.get("coverageAmount", "10 Lakhs")
            })
        
        # Motor Insurance Policies
        motor_policies = db.motor_insurance_inquiries.find({"userId": user_id}).sort("createdAt", -1)
        for policy in motor_policies:
            created_date = policy.get("createdAt", datetime.utcnow())
            renewal_date = datetime(created_date.year + 1, created_date.month, created_date.day)
            days_to_renewal = (renewal_date - datetime.utcnow()).days
            
            policies.append({
                "id": str(policy["_id"]),
                "type": "Motor Insurance",
                "provider": "ICICI Lombard",
                "policyNumber": f"IL{str(policy['_id'])[-9:]}",
                "premium": "₹12,000/year",
                "coverage": "₹8,00,000",
                "status": "expiring" if days_to_renewal <= 30 else "active",
                "renewalDate": renewal_date.strftime("%b %d, %Y"),
                "daysToRenewal": max(0, days_to_renewal),
                "appliedDate": created_date.strftime("%b %d, %Y"),
                "vehicleNumber": policy.get("vehicleNumber", "N/A"),
                "vehicleType": policy.get("vehicleType", "Car")
            })
        
        # Term Insurance Policies
        term_policies = db.term_insurance_inquiries.find({"userId": user_id}).sort("createdAt", -1)
        for policy in term_policies:
            created_date = policy.get("createdAt", datetime.utcnow())
            renewal_date = datetime(created_date.year + 1, created_date.month, created_date.day)
            days_to_renewal = (renewal_date - datetime.utcnow()).days
            
            policies.append({
                "id": str(policy["_id"]),
                "type": "Term Insurance",
                "provider": "LIC",
                "policyNumber": f"LIC{str(policy['_id'])[-9:]}",
                "premium": "₹25,000/year",
                "coverage": "₹50,00,000",
                "status": "expiring" if days_to_renewal <= 30 else "active",
                "renewalDate": renewal_date.strftime("%b %d, %Y"),
                "daysToRenewal": max(0, days_to_renewal),
                "appliedDate": created_date.strftime("%b %d, %Y"),
                "coverageAmount": policy.get("coverageAmount", "50 Lakhs"),
                "term": policy.get("policyTerm", "20 years")
            })
        
        return policies
        
    except Exception as e:
        print(f"Insurance policies error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch insurance policies. Error: {str(e)}"
        )


@router.get("/insurance/applications", response_model=List[Dict[str, Any]])
def get_insurance_applications(current_user: dict = Depends(get_current_user)):
    """
    Get all insurance applications (full forms) submitted by the current user
    
    Returns list of applications from:
    - Health Insurance applications
    - Motor Insurance applications
    - Term Insurance applications
    """
    try:
        user_id = str(current_user["_id"])
        from app.database.db import get_database
        db = get_database()
        
        applications = []
        
        # Health Insurance Applications
        health_apps = db.health_insurance_applications.find({"userId": user_id}).sort("createdAt", -1)
        for app in health_apps:
            applications.append({
                "id": str(app["_id"]),
                "type": "Health Insurance",
                "applicationNumber": app.get("applicationNumber", "N/A"),
                "name": app.get("name", ""),
                "email": app.get("email", ""),
                "phone": app.get("phone", ""),
                "age": app.get("age", ""),
                "gender": app.get("gender", ""),
                "familySize": app.get("familySize", ""),
                "coverageAmount": app.get("coverageAmount", ""),
                "policyType": app.get("policyType", ""),
                "address": app.get("address", ""),
                "city": app.get("city", ""),
                "state": app.get("state", ""),
                "pincode": app.get("pincode", ""),
                "status": app.get("status", "pending"),
                "createdAt": app.get("createdAt", datetime.utcnow()).strftime("%b %d, %Y"),
                "documents": {
                    "aadhar": "✓" if app.get("aadhar") else "✗",
                    "pan": "✓" if app.get("pan") else "✗",
                    "photo": "✓" if app.get("photo") else "✗",
                    "medicalReports": "✓" if app.get("medicalReports") else "✗",
                    "addressProof": "✓" if app.get("addressProof") else "✗"
                }
            })
        
        # Motor Insurance Applications
        motor_apps = db.motor_insurance_applications.find({"userId": user_id}).sort("createdAt", -1)
        for app in motor_apps:
            applications.append({
                "id": str(app["_id"]),
                "type": "Motor Insurance",
                "applicationNumber": app.get("applicationNumber", "N/A"),
                "name": app.get("name", ""),
                "email": app.get("email", ""),
                "phone": app.get("phone", ""),
                "vehicleType": app.get("vehicleType", ""),
                "vehicleNumber": app.get("vehicleNumber", ""),
                "registrationYear": app.get("registrationYear", ""),
                "address": app.get("address", ""),
                "city": app.get("city", ""),
                "state": app.get("state", ""),
                "status": app.get("status", "pending"),
                "createdAt": app.get("createdAt", datetime.utcnow()).strftime("%b %d, %Y"),
                "documents": {
                    "aadhar": "✓" if app.get("aadhar") else "✗",
                    "pan": "✓" if app.get("pan") else "✗",
                    "drivingLicense": "✓" if app.get("drivingLicense") else "✗",
                    "vehicleRc": "✓" if app.get("vehicleRc") else "✗",
                    "photo": "✓" if app.get("photo") else "✗"
                }
            })
        
        # Term Insurance Applications
        term_apps = db.term_insurance_applications.find({"userId": user_id}).sort("createdAt", -1)
        for app in term_apps:
            applications.append({
                "id": str(app["_id"]),
                "type": "Term Insurance",
                "applicationNumber": app.get("applicationNumber", "N/A"),
                "name": app.get("name", ""),
                "email": app.get("email", ""),
                "phone": app.get("phone", ""),
                "age": app.get("age", ""),
                "gender": app.get("gender", ""),
                "coverageAmount": app.get("coverageAmount", ""),
                "policyTerm": app.get("policyTerm", ""),
                "address": app.get("address", ""),
                "city": app.get("city", ""),
                "state": app.get("state", ""),
                "status": app.get("status", "pending"),
                "createdAt": app.get("createdAt", datetime.utcnow()).strftime("%b %d, %Y"),
                "documents": {
                    "aadhar": "✓" if app.get("aadhar") else "✗",
                    "pan": "✓" if app.get("pan") else "✗",
                    "photo": "✓" if app.get("photo") else "✗",
                    "medicalReports": "✓" if app.get("medicalReports") else "✗",
                    "addressProof": "✓" if app.get("addressProof") else "✗"
                }
            })
        
        # Sort all applications by creation date (newest first)
        applications.sort(key=lambda x: x["createdAt"], reverse=True)
        
        return applications
        
    except Exception as e:
        print(f"Insurance applications error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch insurance applications. Error: {str(e)}"
        )


@router.get("/insurance/claims", response_model=List[Dict[str, Any]])
def get_insurance_claims(current_user: dict = Depends(get_current_user)):
    """
    Get insurance claim history for the current user
    
    Returns list of claims with status
    """
    try:
        user_id = str(current_user["_id"])
        from app.database.db import get_database
        db = get_database()
        
        # Check if claims collection exists
        claims_collection = db.get_collection("insurance_claims")
        
        # Get claims for this user
        claims = list(claims_collection.find({"userId": ObjectId(user_id)}).sort("claimDate", -1).limit(10))
        
        claim_list = []
        for claim in claims:
            claim_list.append({
                "id": str(claim["_id"]),
                "type": claim.get("insuranceType", "Health Insurance"),
                "claim": f"₹{claim.get('claimAmount', 0):,}",
                "date": claim.get("claimDate", datetime.utcnow()).strftime("%b %d, %Y"),
                "status": claim.get("status", "pending")
            })
        
        # If no claims found, return demo data
        if not claim_list:
            return []
        
        return claim_list
        
    except Exception as e:
        print(f"Insurance claims error: {str(e)}")
        # Return empty list instead of error for better UX
        return []


# ===================== USER APPLICATIONS ENDPOINTS =====================

@router.get("/applications", response_model=Dict[str, Any])
def get_user_applications(current_user: dict = Depends(get_current_user)):
    """
    Get all applications submitted by the current user across all categories
    
    Returns:
    - Loan applications (Personal, Home, Business, Short-term)
    - Insurance inquiries (Health, Motor, Term)
    - Investment applications (Mutual Funds, SIP)
    - Tax Planning applications
    
    Each application includes:
    - Application ID
    - Type/Category
    - Amount (if applicable)
    - Status
    - Applied date
    - Last updated date
    """
    try:
        user_id = str(current_user["_id"])
        from app.database.db import get_database
        db = get_database()
        
        applications = []
        
        # ===== LOAN APPLICATIONS =====
        # Personal Loans
        personal_loans = db.personal_loans.find({"userId": user_id}).sort("createdAt", -1)
        for loan in personal_loans:
            applications.append({
                "id": str(loan["_id"]),
                "category": "Loan",
                "type": "Personal Loan",
                "amount": loan.get("loanAmount", 0),
                "status": loan.get("status", "Pending"),
                "appliedDate": loan.get("createdAt", datetime.utcnow()).strftime("%d %b %Y"),
                "lastUpdated": loan.get("updatedAt", loan.get("createdAt", datetime.utcnow())).strftime("%d %b %Y"),
                "icon": "💰",
                "statusColor": "green" if loan.get("status") == "Approved" else "orange" if loan.get("status") == "Under Review" else "red"
            })
        
        # Home Loans
        home_loans = db.home_loans.find({"userId": user_id}).sort("createdAt", -1) if "home_loans" in db.list_collection_names() else []
        for loan in home_loans:
            applications.append({
                "id": str(loan["_id"]),
                "category": "Loan",
                "type": "Home Loan",
                "amount": loan.get("loanAmount", 0),
                "status": loan.get("status", "Pending"),
                "appliedDate": loan.get("createdAt", datetime.utcnow()).strftime("%d %b %Y"),
                "lastUpdated": loan.get("updatedAt", loan.get("createdAt", datetime.utcnow())).strftime("%d %b %Y"),
                "icon": "🏠",
                "statusColor": "green" if loan.get("status") == "Approved" else "orange" if loan.get("status") == "Under Review" else "red"
            })
        
        # Business Loans
        business_loans = db.business_loans.find({"userId": user_id}).sort("createdAt", -1) if "business_loans" in db.list_collection_names() else []
        for loan in business_loans:
            applications.append({
                "id": str(loan["_id"]),
                "category": "Loan",
                "type": "Business Loan",
                "amount": loan.get("loanAmount", 0),
                "status": loan.get("status", "Pending"),
                "appliedDate": loan.get("createdAt", datetime.utcnow()).strftime("%d %b %Y"),
                "lastUpdated": loan.get("updatedAt", loan.get("createdAt", datetime.utcnow())).strftime("%d %b %Y"),
                "icon": "🏢",
                "statusColor": "green" if loan.get("status") == "Approved" else "orange" if loan.get("status") == "Under Review" else "red"
            })
        
        # Short-term Loans
        short_term_loans = db.short_term_loans.find({"userId": user_id}).sort("createdAt", -1) if "short_term_loans" in db.list_collection_names() else []
        for loan in short_term_loans:
            applications.append({
                "id": str(loan["_id"]),
                "category": "Loan",
                "type": "Short-term Loan",
                "amount": loan.get("loanAmount", 0),
                "status": loan.get("status", "Pending"),
                "appliedDate": loan.get("createdAt", datetime.utcnow()).strftime("%d %b %Y"),
                "lastUpdated": loan.get("updatedAt", loan.get("createdAt", datetime.utcnow())).strftime("%d %b %Y"),
                "icon": "⚡",
                "statusColor": "green" if loan.get("status") == "Approved" else "orange" if loan.get("status") == "Under Review" else "red"
            })
        
        # ===== INSURANCE APPLICATIONS =====
        # Health Insurance
        health_insurance = db.health_insurance_inquiries.find({"userId": user_id}).sort("createdAt", -1)
        for inquiry in health_insurance:
            applications.append({
                "id": str(inquiry["_id"]),
                "category": "Insurance",
                "type": "Health Insurance",
                "amount": inquiry.get("coverageAmount", "N/A"),
                "status": inquiry.get("status", "Pending"),
                "appliedDate": inquiry.get("createdAt", datetime.utcnow()).strftime("%d %b %Y"),
                "lastUpdated": inquiry.get("updatedAt", inquiry.get("createdAt", datetime.utcnow())).strftime("%d %b %Y"),
                "icon": "🏥",
                "statusColor": "green" if inquiry.get("status") == "Approved" else "orange" if inquiry.get("status") == "Under Review" else "red"
            })
        
        # Motor Insurance
        motor_insurance = db.motor_insurance_inquiries.find({"userId": user_id}).sort("createdAt", -1)
        for inquiry in motor_insurance:
            applications.append({
                "id": str(inquiry["_id"]),
                "category": "Insurance",
                "type": "Motor Insurance",
                "amount": inquiry.get("coverageAmount", "N/A"),
                "status": inquiry.get("status", "Pending"),
                "appliedDate": inquiry.get("createdAt", datetime.utcnow()).strftime("%d %b %Y"),
                "lastUpdated": inquiry.get("updatedAt", inquiry.get("createdAt", datetime.utcnow())).strftime("%d %b %Y"),
                "icon": "🚗",
                "statusColor": "green" if inquiry.get("status") == "Approved" else "orange" if inquiry.get("status") == "Under Review" else "red"
            })
        
        # Term Insurance
        term_insurance = db.term_insurance_inquiries.find({"userId": user_id}).sort("createdAt", -1)
        for inquiry in term_insurance:
            applications.append({
                "id": str(inquiry["_id"]),
                "category": "Insurance",
                "type": "Term Insurance",
                "amount": inquiry.get("coverageAmount", "N/A"),
                "status": inquiry.get("status", "Pending"),
                "appliedDate": inquiry.get("createdAt", datetime.utcnow()).strftime("%d %b %Y"),
                "lastUpdated": inquiry.get("updatedAt", inquiry.get("createdAt", datetime.utcnow())).strftime("%d %b %Y"),
                "icon": "📋",
                "statusColor": "green" if inquiry.get("status") == "Approved" else "orange" if inquiry.get("status") == "Under Review" else "red"
            })
        
        # ===== INVESTMENT APPLICATIONS =====
        # Mutual Funds
        mutual_funds = db.mutual_fund_inquiries.find({"userId": user_id}).sort("createdAt", -1)
        for investment in mutual_funds:
            applications.append({
                "id": str(investment["_id"]),
                "category": "Investment",
                "type": "Mutual Funds",
                "amount": investment.get("investmentAmount", 0),
                "status": investment.get("status", "Pending"),
                "appliedDate": investment.get("createdAt", datetime.utcnow()).strftime("%d %b %Y"),
                "lastUpdated": investment.get("updatedAt", investment.get("createdAt", datetime.utcnow())).strftime("%d %b %Y"),
                "icon": "📊",
                "statusColor": "green" if investment.get("status") == "Approved" else "orange" if investment.get("status") == "Under Review" else "red"
            })
        
        # SIP (Systematic Investment Plan)
        sip_investments = db.sip_inquiries.find({"userId": user_id}).sort("createdAt", -1)
        for investment in sip_investments:
            applications.append({
                "id": str(investment["_id"]),
                "category": "Investment",
                "type": "SIP",
                "amount": investment.get("monthlyInvestment", 0),
                "status": investment.get("status", "Pending"),
                "appliedDate": investment.get("createdAt", datetime.utcnow()).strftime("%d %b %Y"),
                "lastUpdated": investment.get("updatedAt", investment.get("createdAt", datetime.utcnow())).strftime("%d %b %Y"),
                "icon": "📈",
                "statusColor": "green" if investment.get("status") == "Approved" else "orange" if investment.get("status") == "Under Review" else "red"
            })
        
        # ===== TAX PLANNING APPLICATIONS =====
        # Personal Tax Planning
        personal_tax = db.personal_tax_inquiries.find({"userId": user_id}).sort("createdAt", -1) if "personal_tax_inquiries" in db.list_collection_names() else []
        for inquiry in personal_tax:
            applications.append({
                "id": str(inquiry["_id"]),
                "category": "Tax Planning",
                "type": "Personal Tax Planning",
                "amount": inquiry.get("income", "N/A"),
                "status": inquiry.get("status", "Pending"),
                "appliedDate": inquiry.get("createdAt", datetime.utcnow()).strftime("%d %b %Y"),
                "lastUpdated": inquiry.get("updatedAt", inquiry.get("createdAt", datetime.utcnow())).strftime("%d %b %Y"),
                "icon": "💼",
                "statusColor": "green" if inquiry.get("status") == "Approved" else "orange" if inquiry.get("status") == "Under Review" else "red"
            })
        
        # Business Tax Planning
        business_tax = db.business_tax_inquiries.find({"userId": user_id}).sort("createdAt", -1) if "business_tax_inquiries" in db.list_collection_names() else []
        for inquiry in business_tax:
            applications.append({
                "id": str(inquiry["_id"]),
                "category": "Tax Planning",
                "type": "Business Tax Planning",
                "amount": inquiry.get("businessIncome", "N/A"),
                "status": inquiry.get("status", "Pending"),
                "appliedDate": inquiry.get("createdAt", datetime.utcnow()).strftime("%d %b %Y"),
                "lastUpdated": inquiry.get("updatedAt", inquiry.get("createdAt", datetime.utcnow())).strftime("%d %b %Y"),
                "icon": "🏢",
                "statusColor": "green" if inquiry.get("status") == "Approved" else "orange" if inquiry.get("status") == "Under Review" else "red"
            })
        
        # Sort by applied date (newest first)
        applications.sort(key=lambda x: datetime.strptime(x["appliedDate"], "%d %b %Y"), reverse=True)
        
        # Group by category for summary
        category_summary = {
            "Loan": len([a for a in applications if a["category"] == "Loan"]),
            "Insurance": len([a for a in applications if a["category"] == "Insurance"]),
            "Investment": len([a for a in applications if a["category"] == "Investment"]),
            "Tax Planning": len([a for a in applications if a["category"] == "Tax Planning"])
        }
        
        return {
            "applications": applications,
            "total": len(applications),
            "categorySummary": category_summary
        }
        
    except Exception as e:
        print(f"User applications error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user applications. Error: {str(e)}"
        )


# ===================== FINANCIAL GROWTH TREND API =====================

@router.get("/financial-growth-trend", response_model=Dict[str, Any])
def get_financial_growth_trend(
    period: str = "6months",  # Options: 3months, 6months, 12months, all
    current_user: dict = Depends(get_current_user)
):
    """
    Get financial growth trend data for loans, investments, and insurance over time
    
    Parameters:
    - period: Time period for data aggregation (3months, 6months, 12months, all)
    
    Returns:
    - Time-series data with monthly aggregation
    - Separate values for loans, investments, and insurance
    - Total growth percentage
    """
    try:
        user_id = str(current_user["_id"])
        
        from app.database.db import get_database
        from datetime import datetime, timedelta
        from collections import defaultdict
        import calendar
        
        db = get_database()
        
        # Calculate date range based on period
        end_date = datetime.utcnow()
        if period == "3months":
            start_date = end_date - timedelta(days=90)
            months_count = 3
        elif period == "6months":
            start_date = end_date - timedelta(days=180)
            months_count = 6
        elif period == "12months":
            start_date = end_date - timedelta(days=365)
            months_count = 12
        else:  # all
            start_date = datetime(2020, 1, 1)  # Far back date
            months_count = 24  # Up to 2 years
        
        # Initialize monthly data structure
        monthly_data = defaultdict(lambda: {"loans": 0, "investments": 0, "insurance": 0})
        
        # Helper function to get month key
        def get_month_key(date_obj):
            if isinstance(date_obj, str):
                try:
                    date_obj = datetime.strptime(date_obj, "%Y-%m-%d")
                except:
                    try:
                        date_obj = datetime.strptime(date_obj.split("T")[0], "%Y-%m-%d")
                    except:
                        return None
            return date_obj.strftime("%b")
        
        # Aggregate loans data
        loans_cursor = db.personal_loans.find({
            "userId": user_id,
            "createdAt": {"$gte": start_date}
        })
        
        for loan in loans_cursor:
            month_key = get_month_key(loan.get("createdAt"))
            if month_key:
                amount = float(loan.get("loanAmount", 0))
                monthly_data[month_key]["loans"] += amount
        
        # Aggregate home loans
        home_loans_cursor = db.home_loans.find({
            "userId": user_id,
            "createdAt": {"$gte": start_date}
        })
        
        for loan in home_loans_cursor:
            month_key = get_month_key(loan.get("createdAt"))
            if month_key:
                amount = float(loan.get("loanAmount", 0))
                monthly_data[month_key]["loans"] += amount
        
        # Aggregate business loans
        business_loans_cursor = db.business_loans.find({
            "userId": user_id,
            "createdAt": {"$gte": start_date}
        })
        
        for loan in business_loans_cursor:
            month_key = get_month_key(loan.get("createdAt"))
            if month_key:
                amount = float(loan.get("loanAmount", 0))
                monthly_data[month_key]["loans"] += amount
        
        # Aggregate short-term loans
        short_term_cursor = db.short_term_loans.find({
            "userId": user_id,
            "createdAt": {"$gte": start_date}
        })
        
        for loan in short_term_cursor:
            month_key = get_month_key(loan.get("createdAt"))
            if month_key:
                amount = float(loan.get("loanAmount", 0))
                monthly_data[month_key]["loans"] += amount
        
        # Aggregate investments (mutual funds)
        mf_cursor = db.mutual_fund_inquiries.find({
            "userId": user_id,
            "createdAt": {"$gte": start_date}
        })
        
        for mf in mf_cursor:
            month_key = get_month_key(mf.get("createdAt"))
            if month_key:
                amount = float(mf.get("investmentAmount", 0))
                monthly_data[month_key]["investments"] += amount
        
        # Aggregate SIP investments
        sip_cursor = db.sip_inquiries.find({
            "userId": user_id,
            "createdAt": {"$gte": start_date}
        })
        
        for sip in sip_cursor:
            month_key = get_month_key(sip.get("createdAt"))
            if month_key:
                amount = float(sip.get("monthlyInvestment", 0)) * 12  # Annualize
                monthly_data[month_key]["investments"] += amount
        
        # Aggregate insurance policies
        health_cursor = db.health_insurance_inquiries.find({
            "userId": user_id,
            "createdAt": {"$gte": start_date}
        })
        
        for policy in health_cursor:
            month_key = get_month_key(policy.get("createdAt"))
            if month_key:
                amount = float(policy.get("coverageAmount", 0))
                monthly_data[month_key]["insurance"] += amount
        
        # Motor insurance
        motor_cursor = db.motor_insurance_inquiries.find({
            "userId": user_id,
            "createdAt": {"$gte": start_date}
        })
        
        for policy in motor_cursor:
            month_key = get_month_key(policy.get("createdAt"))
            if month_key:
                amount = float(policy.get("vehicleValue", 0))
                monthly_data[month_key]["insurance"] += amount
        
        # Term insurance
        term_cursor = db.term_insurance_inquiries.find({
            "userId": user_id,
            "createdAt": {"$gte": start_date}
        })
        
        for policy in term_cursor:
            month_key = get_month_key(policy.get("createdAt"))
            if month_key:
                amount = float(policy.get("coverageAmount", 0))
                monthly_data[month_key]["insurance"] += amount
        
        # Generate month labels for the period
        month_labels = []
        current = end_date
        for i in range(months_count):
            month_labels.insert(0, current.strftime("%b"))
            # Move to previous month
            if current.month == 1:
                current = current.replace(year=current.year - 1, month=12)
            else:
                current = current.replace(month=current.month - 1)
        
        # Format data for frontend chart
        chart_data = []
        for month in month_labels:
            chart_data.append({
                "month": month,
                "loans": int(monthly_data[month]["loans"]),
                "investments": int(monthly_data[month]["investments"]),
                "insurance": int(monthly_data[month]["insurance"])
            })
        
        # Calculate totals and growth
        total_loans = sum(d["loans"] for d in chart_data)
        total_investments = sum(d["investments"] for d in chart_data)
        total_insurance = sum(d["insurance"] for d in chart_data)
        grand_total = total_loans + total_investments + total_insurance
        
        # Calculate growth percentage (comparing last month vs first month)
        if len(chart_data) >= 2:
            first_month_total = chart_data[0]["loans"] + chart_data[0]["investments"] + chart_data[0]["insurance"]
            last_month_total = chart_data[-1]["loans"] + chart_data[-1]["investments"] + chart_data[-1]["insurance"]
            
            if first_month_total > 0:
                growth_percentage = ((last_month_total - first_month_total) / first_month_total) * 100
            else:
                growth_percentage = 0 if last_month_total == 0 else 100
        else:
            growth_percentage = 0
        
        return {
            "chartData": chart_data,
            "summary": {
                "totalLoans": total_loans,
                "totalInvestments": total_investments,
                "totalInsurance": total_insurance,
                "grandTotal": grand_total,
                "growthPercentage": round(growth_percentage, 2)
            },
            "period": period
        }
        
    except Exception as e:
        print(f"Financial growth trend error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch financial growth trend. Error: {str(e)}"
        )


# ===================== APPLICATION STATUS OVERVIEW API =====================

@router.get("/application-status-overview", response_model=Dict[str, Any])
def get_application_status_overview(current_user: dict = Depends(get_current_user)):
    """
    Get application status overview aggregating all applications across services
    
    Returns:
    - Status distribution (Approved, Pending, Under Review, Rejected)
    - Count per status
    - Breakdown by service type
    """
    try:
        user_id = str(current_user["_id"])
        
        from app.database.db import get_database
        db = get_database()
        
        # Initialize status counters
        status_counts = {
            "Approved": 0,
            "Pending": 0,
            "Under Review": 0,
            "Rejected": 0
        }
        
        # Initialize service breakdown
        service_breakdown = {
            "loans": {"Approved": 0, "Pending": 0, "Under Review": 0, "Rejected": 0},
            "investments": {"Approved": 0, "Pending": 0, "Under Review": 0, "Rejected": 0},
            "insurance": {"Approved": 0, "Pending": 0, "Under Review": 0, "Rejected": 0}
        }
        
        # Count personal loans
        for status_key in status_counts.keys():
            count = db.personal_loans.count_documents({
                "userId": user_id,
                "status": status_key
            })
            status_counts[status_key] += count
            service_breakdown["loans"][status_key] += count
        
        # Count home loans
        for status_key in status_counts.keys():
            count = db.home_loans.count_documents({
                "userId": user_id,
                "status": status_key
            })
            status_counts[status_key] += count
            service_breakdown["loans"][status_key] += count
        
        # Count business loans
        for status_key in status_counts.keys():
            count = db.business_loans.count_documents({
                "userId": user_id,
                "status": status_key
            })
            status_counts[status_key] += count
            service_breakdown["loans"][status_key] += count
        
        # Count short-term loans
        for status_key in status_counts.keys():
            count = db.short_term_loans.count_documents({
                "userId": user_id,
                "status": status_key
            })
            status_counts[status_key] += count
            service_breakdown["loans"][status_key] += count
        
        # Count mutual fund applications
        for status_key in status_counts.keys():
            count = db.mutual_fund_inquiries.count_documents({
                "userId": user_id,
                "status": status_key
            })
            status_counts[status_key] += count
            service_breakdown["investments"][status_key] += count
        
        # Count SIP applications
        for status_key in status_counts.keys():
            count = db.sip_inquiries.count_documents({
                "userId": user_id,
                "status": status_key
            })
            status_counts[status_key] += count
            service_breakdown["investments"][status_key] += count
        
        # Count health insurance
        for status_key in status_counts.keys():
            count = db.health_insurance_inquiries.count_documents({
                "userId": user_id,
                "status": status_key
            })
            status_counts[status_key] += count
            service_breakdown["insurance"][status_key] += count
        
        # Count motor insurance
        for status_key in status_counts.keys():
            count = db.motor_insurance_inquiries.count_documents({
                "userId": user_id,
                "status": status_key
            })
            status_counts[status_key] += count
            service_breakdown["insurance"][status_key] += count
        
        # Count term insurance
        for status_key in status_counts.keys():
            count = db.term_insurance_inquiries.count_documents({
                "userId": user_id,
                "status": status_key
            })
            status_counts[status_key] += count
            service_breakdown["insurance"][status_key] += count
        
        # Format data for frontend chart
        chart_data = [
            {
                "status": "Approved",
                "count": status_counts["Approved"],
                "fill": "#10b981"  # Green
            },
            {
                "status": "Pending",
                "count": status_counts["Pending"],
                "fill": "#f59e0b"  # Amber
            },
            {
                "status": "Under Review",
                "count": status_counts["Under Review"],
                "fill": "#3b82f6"  # Blue
            },
            {
                "status": "Rejected",
                "count": status_counts["Rejected"],
                "fill": "#ef4444"  # Red
            }
        ]
        
        # Calculate totals
        total_applications = sum(status_counts.values())
        
        # Calculate percentages
        percentages = {}
        for status, count in status_counts.items():
            percentages[status] = round((count / total_applications * 100), 2) if total_applications > 0 else 0
        
        return {
            "chartData": chart_data,
            "statusCounts": status_counts,
            "serviceBreakdown": service_breakdown,
            "totalApplications": total_applications,
            "percentages": percentages
        }
        
    except Exception as e:
        print(f"Application status overview error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch application status overview. Error: {str(e)}"
        )


# ===================== RECENT ACTIVITIES API =====================

@router.get("/recent-activities", response_model=Dict[str, Any])
def get_recent_activities(
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """
    Get recent activities for the current user across all services
    
    Parameters:
    - limit: Maximum number of activities to return (default: 10)
    
    Returns:
    - List of recent activities with type, title, amount, date, status
    """
    try:
        user_id = str(current_user["_id"])
        
        from app.database.db import get_database
        from datetime import datetime, timedelta
        
        db = get_database()
        activities = []
        
        # Helper function to format time difference
        def get_time_ago(date_obj):
            if isinstance(date_obj, str):
                try:
                    date_obj = datetime.strptime(date_obj, "%Y-%m-%d")
                except:
                    try:
                        date_obj = datetime.strptime(date_obj.split("T")[0], "%Y-%m-%d")
                    except:
                        return "Recently"
            
            now = datetime.utcnow()
            diff = now - date_obj
            
            if diff.days == 0:
                hours = diff.seconds // 3600
                if hours == 0:
                    minutes = diff.seconds // 60
                    return f"{minutes} minutes ago" if minutes > 1 else "Just now"
                return f"{hours} hours ago" if hours > 1 else "1 hour ago"
            elif diff.days == 1:
                return "1 day ago"
            elif diff.days < 7:
                return f"{diff.days} days ago"
            elif diff.days < 30:
                weeks = diff.days // 7
                return f"{weeks} weeks ago" if weeks > 1 else "1 week ago"
            elif diff.days < 365:
                months = diff.days // 30
                return f"{months} months ago" if months > 1 else "1 month ago"
            else:
                years = diff.days // 365
                return f"{years} years ago" if years > 1 else "1 year ago"
        
        # Fetch personal loans
        personal_loans = list(db.personal_loans.find(
            {"userId": user_id}
        ).sort("createdAt", -1).limit(5))
        
        for loan in personal_loans:
            activities.append({
                "id": str(loan["_id"]),
                "type": "loan",
                "category": "Personal Loan",
                "title": f"Personal Loan Application",
                "description": f"Applied for ₹{loan.get('loanAmount', 0):,}",
                "amount": f"₹{loan.get('loanAmount', 0):,}",
                "date": get_time_ago(loan.get("createdAt")),
                "timestamp": loan.get("createdAt"),
                "status": loan.get("status", "Pending").lower().replace(" ", "_"),
                "statusLabel": loan.get("status", "Pending")
            })
        
        # Fetch home loans
        home_loans = list(db.home_loans.find(
            {"userId": user_id}
        ).sort("createdAt", -1).limit(3))
        
        for loan in home_loans:
            activities.append({
                "id": str(loan["_id"]),
                "type": "loan",
                "category": "Home Loan",
                "title": f"Home Loan Application",
                "description": f"Applied for ₹{loan.get('loanAmount', 0):,}",
                "amount": f"₹{loan.get('loanAmount', 0):,}",
                "date": get_time_ago(loan.get("createdAt")),
                "timestamp": loan.get("createdAt"),
                "status": loan.get("status", "Pending").lower().replace(" ", "_"),
                "statusLabel": loan.get("status", "Pending")
            })
        
        # Fetch business loans
        business_loans = list(db.business_loans.find(
            {"userId": user_id}
        ).sort("createdAt", -1).limit(3))
        
        for loan in business_loans:
            activities.append({
                "id": str(loan["_id"]),
                "type": "loan",
                "category": "Business Loan",
                "title": f"Business Loan Application",
                "description": f"Applied for ₹{loan.get('loanAmount', 0):,}",
                "amount": f"₹{loan.get('loanAmount', 0):,}",
                "date": get_time_ago(loan.get("createdAt")),
                "timestamp": loan.get("createdAt"),
                "status": loan.get("status", "Pending").lower().replace(" ", "_"),
                "statusLabel": loan.get("status", "Pending")
            })
        
        # Fetch short-term loans
        short_term_loans = list(db.short_term_loans.find(
            {"userId": user_id}
        ).sort("createdAt", -1).limit(3))
        
        for loan in short_term_loans:
            activities.append({
                "id": str(loan["_id"]),
                "type": "loan",
                "category": "Short Term Loan",
                "title": f"Short Term Loan Application",
                "description": f"Applied for ₹{loan.get('loanAmount', 0):,}",
                "amount": f"₹{loan.get('loanAmount', 0):,}",
                "date": get_time_ago(loan.get("createdAt")),
                "timestamp": loan.get("createdAt"),
                "status": loan.get("status", "Pending").lower().replace(" ", "_"),
                "statusLabel": loan.get("status", "Pending")
            })
        
        # Fetch mutual fund investments
        mutual_funds = list(db.mutual_fund_inquiries.find(
            {"userId": user_id}
        ).sort("createdAt", -1).limit(5))
        
        for mf in mutual_funds:
            activities.append({
                "id": str(mf["_id"]),
                "type": "investment",
                "category": "Mutual Fund",
                "title": f"Mutual Fund Investment",
                "description": f"Invested ₹{mf.get('investmentAmount', 0):,}",
                "amount": f"₹{mf.get('investmentAmount', 0):,}",
                "date": get_time_ago(mf.get("createdAt")),
                "timestamp": mf.get("createdAt"),
                "status": mf.get("status", "Pending").lower().replace(" ", "_"),
                "statusLabel": mf.get("status", "Pending")
            })
        
        # Fetch SIP investments
        sip_investments = list(db.sip_inquiries.find(
            {"userId": user_id}
        ).sort("createdAt", -1).limit(5))
        
        for sip in sip_investments:
            activities.append({
                "id": str(sip["_id"]),
                "type": "investment",
                "category": "SIP",
                "title": f"SIP Investment",
                "description": f"Monthly SIP of ₹{sip.get('monthlyInvestment', 0):,}",
                "amount": f"₹{sip.get('monthlyInvestment', 0):,}/month",
                "date": get_time_ago(sip.get("createdAt")),
                "timestamp": sip.get("createdAt"),
                "status": sip.get("status", "Pending").lower().replace(" ", "_"),
                "statusLabel": sip.get("status", "Pending")
            })
        
        # Fetch health insurance
        health_insurance = list(db.health_insurance_inquiries.find(
            {"userId": user_id}
        ).sort("createdAt", -1).limit(5))
        
        for policy in health_insurance:
            activities.append({
                "id": str(policy["_id"]),
                "type": "insurance",
                "category": "Health Insurance",
                "title": f"Health Insurance Application",
                "description": f"Coverage of ₹{policy.get('coverageAmount', 0):,}",
                "amount": f"₹{policy.get('coverageAmount', 0):,}",
                "date": get_time_ago(policy.get("createdAt")),
                "timestamp": policy.get("createdAt"),
                "status": policy.get("status", "Pending").lower().replace(" ", "_"),
                "statusLabel": policy.get("status", "Pending")
            })
        
        # Fetch motor insurance
        motor_insurance = list(db.motor_insurance_inquiries.find(
            {"userId": user_id}
        ).sort("createdAt", -1).limit(5))
        
        for policy in motor_insurance:
            activities.append({
                "id": str(policy["_id"]),
                "type": "insurance",
                "category": "Motor Insurance",
                "title": f"Motor Insurance Application",
                "description": f"Vehicle value ₹{policy.get('vehicleValue', 0):,}",
                "amount": f"₹{policy.get('vehicleValue', 0):,}",
                "date": get_time_ago(policy.get("createdAt")),
                "timestamp": policy.get("createdAt"),
                "status": policy.get("status", "Pending").lower().replace(" ", "_"),
                "statusLabel": policy.get("status", "Pending")
            })
        
        # Fetch term insurance
        term_insurance = list(db.term_insurance_inquiries.find(
            {"userId": user_id}
        ).sort("createdAt", -1).limit(5))
        
        for policy in term_insurance:
            activities.append({
                "id": str(policy["_id"]),
                "type": "insurance",
                "category": "Term Insurance",
                "title": f"Term Insurance Application",
                "description": f"Coverage of ₹{policy.get('coverageAmount', 0):,}",
                "amount": f"₹{policy.get('coverageAmount', 0):,}",
                "date": get_time_ago(policy.get("createdAt")),
                "timestamp": policy.get("createdAt"),
                "status": policy.get("status", "Pending").lower().replace(" ", "_"),
                "statusLabel": policy.get("status", "Pending")
            })
        
        # Fetch uploaded documents
        documents = list(db.user_documents.find(
            {"userId": user_id}
        ).sort("uploadedAt", -1).limit(5))
        
        for doc in documents:
            activities.append({
                "id": str(doc["_id"]),
                "type": "document",
                "category": "Document",
                "title": f"Document Uploaded",
                "description": doc.get("documentType", "Document"),
                "amount": "N/A",
                "date": get_time_ago(doc.get("uploadedAt")),
                "timestamp": doc.get("uploadedAt"),
                "status": "success",
                "statusLabel": "Uploaded"
            })
        
        # Sort all activities by timestamp (most recent first)
        activities.sort(key=lambda x: x.get("timestamp") or datetime.min, reverse=True)
        
        # Limit to requested number
        activities = activities[:limit]
        
        return {
            "activities": activities,
            "total": len(activities)
        }
        
    except Exception as e:
        print(f"Recent activities error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch recent activities. Error: {str(e)}"
        )
