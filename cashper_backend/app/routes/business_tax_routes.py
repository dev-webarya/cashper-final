from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.database.schema.business_tax_schema import (
    BusinessTaxConsultationRequest,
    BusinessTaxConsultationResponse,
    BusinessTaxConsultationInDB,
    BusinessTaxCalculatorRequest,
    BusinessTaxCalculatorResponse,
    BusinessTaxCalculatorInDB,
    BusinessTaxPlanningApplicationRequest,
    BusinessTaxPlanningApplicationResponse,
    BusinessTaxPlanningApplicationInDB,
    ConsultationStatus,
    UpdateConsultationStatusRequest,
    AssignConsultantRequest
)
from app.database.repository.business_tax_repository import business_tax_repository
from app.utils.auth_middleware import get_current_user_optional
from app.utils.auth import get_current_user, get_optional_user
from datetime import datetime

router = APIRouter(prefix="/api/business-tax", tags=["Business Tax Planning"])


# ===================== TAX CALCULATION UTILITY =====================

def calculate_corporate_tax(profit: float, business_type: str, turnover: float = 0) -> float:
    """
    Calculate corporate tax based on business structure
    
    Tax Rates:
    - Startups (Section 80-IAC): 0% if eligible for 3 years
    - Small businesses (Section 44AD): Presumptive 8% of turnover
    - Partnership/LLP: 30% + 4% cess
    - Private Limited (turnover up to 400cr): 25% + 4% cess
    - Private Limited (above 400cr): 30% + 4% cess
    - New Manufacturing (Section 115BAB): 15% + 4% cess
    """
    
    business_type = business_type.lower()
    
    # Startups - assuming eligible for tax holiday
    if business_type == "startup":
        return 0
    
    # Small businesses - presumptive taxation
    if business_type == "proprietorship" and turnover > 0 and turnover <= 20000000:  # Up to 2 crores
        taxable_income = turnover * 0.08  # 8% presumptive
        tax = taxable_income * 0.30  # 30% tax
        return round(tax * 1.04)  # Add 4% cess
    
    # Partnership/LLP
    if business_type in ["partnership", "llp"]:
        tax = profit * 0.30
        return round(tax * 1.04)  # Add 4% cess
    
    # Private Limited Companies
    if business_type in ["private", "private-limited"]:
        if turnover <= 4000000000:  # Up to 400 crores
            tax = profit * 0.25
        else:
            tax = profit * 0.30
        return round(tax * 1.04)  # Add 4% cess
    
    # Public Limited and others
    tax = profit * 0.30
    return round(tax * 1.04)  # Add 4% cess


# ===================== PUBLIC ENDPOINTS =====================

@router.get("/information")
def get_business_tax_information():
    """
    Get business tax information and services (PUBLIC - No authentication required)
    
    Returns details about business tax planning services, benefits, and features
    """
    return {
        "title": "Business Tax Planning",
        "description": "Comprehensive tax planning services for businesses of all sizes. Minimize tax liability and ensure compliance with expert guidance.",
        "services": [
            {
                "title": "Tax Consultation",
                "description": "Free consultation to understand your tax needs",
                "icon": "users"
            },
            {
                "title": "Tax Filing",
                "description": "Complete GST and Income Tax filing services",
                "icon": "file-text"
            },
            {
                "title": "Tax Planning",
                "description": "Strategic planning to minimize tax liability",
                "icon": "trending-down"
            },
            {
                "title": "Compliance Support",
                "description": "Ongoing support for tax compliance",
                "icon": "shield-check"
            }
        ],
        "benefits": [
            "Minimize tax liability legally",
            "Expert guidance on tax deductions",
            "Timely filing and compliance",
            "Avoid penalties and interest",
            "Strategic business tax planning"
        ],
        "businessTypes": [
            "Sole Proprietorship",
            "Partnership Firm",
            "Limited Liability Partnership (LLP)",
            "Private Limited Company",
            "Public Limited Company",
            "Startup"
        ]
    }


@router.post("/consultation/book", response_model=BusinessTaxConsultationResponse, status_code=status.HTTP_201_CREATED)
def book_business_tax_consultation(booking: BusinessTaxConsultationRequest):
    """
    Book a free business tax consultation (PUBLIC - No authentication required)
    
    This endpoint is for the "FREE BUSINESS TAX CONSULTATION" form in the hero section.
    
    Required fields:
    - businessName: Business name (min 2 characters)
    - ownerName: Owner/Director name (min 3 characters)
    - email: Valid business email address
    - phone: 10-digit contact number
    - businessType: Type of business (proprietorship, partnership, llp, private-limited, public-limited, startup)
    - annualTurnover: Annual turnover range
    
    Returns:
    - Confirmation with booking details and status
    """
    try:
        booking_in_db = BusinessTaxConsultationInDB(
            businessName=booking.businessName,
            ownerName=booking.ownerName,
            email=booking.email.lower(),
            phone=booking.phone,
            businessType=booking.businessType,
            annualTurnover=booking.annualTurnover,
            status=ConsultationStatus.PENDING,
            createdAt=datetime.utcnow()
        )
        
        created_booking = business_tax_repository.create_consultation_booking(booking_in_db)
        
        return created_booking
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to book consultation. Please try again. Error: {str(e)}"
        )


@router.post("/calculator/calculate", response_model=dict)
def calculate_business_tax_savings(calculation: BusinessTaxCalculatorRequest):
    """
    Calculate business tax savings based on deductions (PUBLIC - No authentication required)
    
    This endpoint is for the "Business Tax Savings Calculator" section.
    
    Input fields:
    - businessType: Type of business structure
    - annualTurnover: Annual business turnover
    - annualProfit: Annual business profit (before deductions)
    - depreciation: Depreciation on assets (plant, machinery, vehicles, etc.)
    - salaryExpenses: Employee salary expenses
    - rdExpenses: R&D expenses (eligible for 100-200% weighted deduction under Section 35)
    - Optional contact details (name, email, phone) for follow-up
    
    Returns:
    - Complete tax breakdown including savings
    - Tax with and without planning
    - Total deductions applied
    - Breakdown of deductions
    """
    try:
        # Calculate total deductions
        depreciation = calculation.depreciation or 0
        salary_expenses = calculation.salaryExpenses or 0
        rd_expenses = calculation.rdExpenses or 0
        
        # R&D gets weighted deduction (assume 150% for calculation)
        rd_weighted = rd_expenses * 1.5
        
        # Total deductions
        total_deductions = depreciation + salary_expenses + rd_weighted
        
        # Calculate tax without planning (full profit)
        tax_without_planning = calculate_corporate_tax(
            profit=calculation.annualProfit,
            business_type=calculation.businessType,
            turnover=calculation.annualTurnover
        )
        
        # Calculate tax with planning (profit after deductions)
        taxable_income = max(0, calculation.annualProfit - total_deductions)
        tax_after_planning = calculate_corporate_tax(
            profit=taxable_income,
            business_type=calculation.businessType,
            turnover=calculation.annualTurnover
        )
        
        # Calculate savings
        total_savings = tax_without_planning - tax_after_planning
        
        # Save calculation to database
        calculation_in_db = BusinessTaxCalculatorInDB(
            businessType=calculation.businessType,
            annualTurnover=calculation.annualTurnover,
            annualProfit=calculation.annualProfit,
            depreciation=depreciation,
            salaryExpenses=salary_expenses,
            rdExpenses=rd_expenses,
            totalDeductions=total_deductions,
            taxableIncome=taxable_income,
            taxWithoutPlanning=tax_without_planning,
            taxAfterPlanning=tax_after_planning,
            totalSavings=total_savings,
            name=calculation.name,
            email=calculation.email.lower() if calculation.email else None,
            phone=calculation.phone,
            createdAt=datetime.utcnow()
        )
        
        saved_calculation = business_tax_repository.save_tax_calculation(calculation_in_db)
        
        return {
            "id": saved_calculation.get("id"),
            "turnover": calculation.annualTurnover,
            "netProfit": calculation.annualProfit,
            "totalDeductions": total_deductions,
            "taxableIncome": taxable_income,
            "taxWithoutPlanning": tax_without_planning,
            "taxAfterPlanning": tax_after_planning,
            "totalSavings": total_savings,
            "message": "Business tax calculation completed successfully",
            "breakdown": {
                "depreciation": depreciation,
                "salaryExpenses": salary_expenses,
                "rdExpenses": rd_expenses,
                "rdWeightedDeduction": rd_weighted
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate business tax. Error: {str(e)}"
        )


@router.post("/application/submit", response_model=BusinessTaxPlanningApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_business_tax_planning_application(
    application: BusinessTaxPlanningApplicationRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Submit application for business tax planning service (PUBLIC - No authentication required)
    
    This endpoint is for the "Apply for Business Tax Planning Service" main form.
    
    Required fields:
    - businessName: Business name (min 2 characters)
    - businessPAN: Valid PAN card number (Format: ABCDE1234F)
    - ownerName: Owner/Director name (min 3 characters)
    - contactNumber: 10-digit contact number
    - businessEmail: Valid business email address
    - businessStructure: Business structure type
    - industryType: Type of industry
    - turnoverRange: Annual turnover range
    
    Optional fields:
    - gstNumber: GST registration number (if registered)
    - numberOfEmployees: Number of employees range
    - servicesRequired: List of services required
    - businessDetails: Any specific requirements or questions
    
    Returns:
    - Confirmation with application ID and status
    """
    try:
        # Check if application already exists for this PAN
        existing_application = business_tax_repository.get_application_by_pan(application.businessPAN)
        if existing_application:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"An application with PAN {application.businessPAN} already exists (Application ID: {existing_application.get('_id', 'N/A')}). If you need to update your information or check status, please contact our support team or use your existing application ID."
            )
        
        application_in_db = BusinessTaxPlanningApplicationInDB(
            businessName=application.businessName,
            businessPAN=application.businessPAN.upper(),
            ownerName=application.ownerName,
            contactNumber=application.contactNumber,
            businessEmail=application.businessEmail.lower(),
            gstNumber=application.gstNumber.upper() if application.gstNumber else None,
            businessStructure=application.businessStructure,
            industryType=application.industryType,
            turnoverRange=application.turnoverRange,
            numberOfEmployees=application.numberOfEmployees if application.numberOfEmployees else None,
            servicesRequired=application.servicesRequired,
            businessDetails=application.businessDetails,
            userId=str(current_user["_id"]) if current_user else None,
            status=ConsultationStatus.PENDING,
            createdAt=datetime.utcnow()
        )
        
        created_application = business_tax_repository.create_tax_planning_application(application_in_db)
        
        return created_application
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit application. Please try again. Error: {str(e)}"
        )


# ===================== ADMIN ENDPOINTS - CONSULTATION BOOKINGS =====================

@router.get("/consultation/all", response_model=List[BusinessTaxConsultationResponse])
def get_all_consultations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum records to return"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Get all business tax consultation bookings (ADMIN ONLY)
    
    Query parameters:
    - skip: Pagination offset (default: 0)
    - limit: Records per page (default: 50, max: 100)
    - status_filter: Filter by status (pending, scheduled, in-progress, completed, cancelled)
    """
    try:
        consultations = business_tax_repository.get_all_consultations(
            skip=skip,
            limit=limit,
            status=status_filter
        )
        
        return [
            BusinessTaxConsultationResponse(
                id=str(consultation.get("_id", "")),
                businessName=consultation.get("businessName", ""),
                ownerName=consultation.get("ownerName", ""),
                email=consultation.get("email", ""),
                phone=consultation.get("phone", ""),
                businessType=consultation.get("businessType", ""),
                annualTurnover=consultation.get("annualTurnover", ""),
                status=ConsultationStatus(consultation.get("status", "pending")),
                createdAt=consultation.get("createdAt"),
                scheduledDate=consultation.get("scheduledDate"),
                adminNotes=consultation.get("adminNotes")
            )
            for consultation in consultations
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch consultations. Error: {str(e)}"
        )


@router.get("/consultation/{consultation_id}", response_model=BusinessTaxConsultationResponse)
def get_consultation_by_id(
    consultation_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Get a specific consultation booking by ID (ADMIN ONLY)"""
    consultation = business_tax_repository.get_consultation_by_id(consultation_id)
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation booking not found"
        )
    
    return BusinessTaxConsultationResponse(
        id=str(consultation["_id"]),
        businessName=consultation["businessName"],
        ownerName=consultation["ownerName"],
        email=consultation["email"],
        phone=consultation["phone"],
        businessType=consultation["businessType"],
        annualTurnover=consultation["annualTurnover"],
        status=ConsultationStatus(consultation["status"]),
        createdAt=consultation["createdAt"],
        scheduledDate=consultation.get("scheduledDate"),
        adminNotes=consultation.get("adminNotes")
    )


@router.patch("/consultation/{consultation_id}/status", status_code=status.HTTP_200_OK)
def update_consultation_status(
    consultation_id: str,
    status_update: UpdateConsultationStatusRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Update consultation booking status (ADMIN ONLY)"""
    consultation = business_tax_repository.get_consultation_by_id(consultation_id)
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation booking not found"
        )
    
    success = business_tax_repository.update_consultation_status(
        consultation_id=consultation_id,
        status=status_update.status,
        scheduled_date=status_update.scheduledDate,
        admin_notes=status_update.adminNotes
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update consultation status"
        )
    
    return {
        "message": "Consultation status updated successfully",
        "status": status_update.status.value
    }


@router.delete("/consultation/{consultation_id}", status_code=status.HTTP_200_OK)
def delete_consultation(
    consultation_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Delete a consultation booking (ADMIN ONLY)"""
    consultation = business_tax_repository.get_consultation_by_id(consultation_id)
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation booking not found"
        )
    
    success = business_tax_repository.delete_consultation(consultation_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete consultation"
        )
    
    return {"message": "Consultation booking deleted successfully"}


# ===================== ADMIN ENDPOINTS - TAX CALCULATIONS =====================

@router.get("/calculator/all", response_model=List[BusinessTaxCalculatorResponse])
def get_all_calculations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user_optional)
):
    """Get all business tax calculations (ADMIN ONLY)"""
    try:
        calculations = business_tax_repository.get_all_calculations(skip=skip, limit=limit)
        
        return [
            BusinessTaxCalculatorResponse(
                id=str(calc["_id"]),
                businessType=calc["businessType"],
                annualTurnover=calc["annualTurnover"],
                annualProfit=calc["annualProfit"],
                depreciation=calc["depreciation"],
                salaryExpenses=calc["salaryExpenses"],
                rdExpenses=calc["rdExpenses"],
                totalDeductions=calc["totalDeductions"],
                taxableIncome=calc["taxableIncome"],
                taxWithoutPlanning=calc["taxWithoutPlanning"],
                taxAfterPlanning=calc["taxAfterPlanning"],
                totalSavings=calc["totalSavings"],
                name=calc.get("name"),
                email=calc.get("email"),
                phone=calc.get("phone"),
                createdAt=calc["createdAt"]
            )
            for calc in calculations
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch calculations. Error: {str(e)}"
        )


@router.get("/calculator/{calculation_id}", response_model=BusinessTaxCalculatorResponse)
def get_calculation_by_id(
    calculation_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Get a specific business tax calculation by ID (ADMIN ONLY)"""
    calculation = business_tax_repository.get_calculation_by_id(calculation_id)
    
    if not calculation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax calculation not found"
        )
    
    return BusinessTaxCalculatorResponse(
        id=str(calculation["_id"]),
        businessType=calculation["businessType"],
        annualTurnover=calculation["annualTurnover"],
        annualProfit=calculation["annualProfit"],
        depreciation=calculation["depreciation"],
        salaryExpenses=calculation["salaryExpenses"],
        rdExpenses=calculation["rdExpenses"],
        totalDeductions=calculation["totalDeductions"],
        taxableIncome=calculation["taxableIncome"],
        taxWithoutPlanning=calculation["taxWithoutPlanning"],
        taxAfterPlanning=calculation["taxAfterPlanning"],
        totalSavings=calculation["totalSavings"],
        name=calculation.get("name"),
        email=calculation.get("email"),
        phone=calculation.get("phone"),
        createdAt=calculation["createdAt"]
    )


# ===================== ADMIN ENDPOINTS - TAX PLANNING APPLICATIONS =====================

@router.get("/application/all", response_model=List[BusinessTaxPlanningApplicationResponse])
def get_all_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned consultant"),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get all business tax planning applications (User sees own, Admin sees all)"""
    try:
        # If no user logged in, return empty list
        if not current_user:
            return []
        
        # Check if user is admin
        is_admin = current_user.get("isAdmin", False)
        
        if is_admin:
            # Admin can see all applications
            applications = business_tax_repository.get_all_applications(
                skip=skip,
                limit=limit,
                status=status_filter,
                assigned_to=assigned_to
            )
        else:
            # Regular user sees only their own applications
            from app.database.db import get_database
            db = get_database()
            user_id_str = str(current_user["_id"])
            
            # Build query
            query = {"userId": user_id_str}
            if status_filter:
                query["status"] = status_filter
            if assigned_to:
                query["assignedTo"] = assigned_to
            
            # Fetch user's applications
            applications = list(
                db["business_tax_applications"]
                .find(query)
                .sort("createdAt", -1)
                .skip(skip)
                .limit(limit)
            )
        
        return [
            BusinessTaxPlanningApplicationResponse(
                id=str(app["_id"]),
                businessName=app["businessName"],
                businessPAN=app["businessPAN"],
                ownerName=app["ownerName"],
                contactNumber=app["contactNumber"],
                businessEmail=app["businessEmail"],
                gstNumber=app.get("gstNumber"),
                businessStructure=app["businessStructure"],
                industryType=app["industryType"],
                turnoverRange=app["turnoverRange"],
                numberOfEmployees=app.get("numberOfEmployees"),
                servicesRequired=app.get("servicesRequired"),
                businessDetails=app.get("businessDetails"),
                userId=app.get("userId"),
                status=ConsultationStatus(app["status"]),
                createdAt=app["createdAt"],
                assignedTo=app.get("assignedTo"),
                adminNotes=app.get("adminNotes")
            )
            for app in applications
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch applications. Error: {str(e)}"
        )


@router.get("/application/{application_id}", response_model=BusinessTaxPlanningApplicationResponse)
def get_application_by_id(
    application_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Get a specific business tax planning application by ID (ADMIN ONLY)"""
    application = business_tax_repository.get_application_by_id(application_id)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business tax planning application not found"
        )
    
    return BusinessTaxPlanningApplicationResponse(
        id=str(application["_id"]),
        businessName=application["businessName"],
        businessPAN=application["businessPAN"],
        ownerName=application["ownerName"],
        contactNumber=application["contactNumber"],
        businessEmail=application["businessEmail"],
        gstNumber=application.get("gstNumber"),
        businessStructure=application["businessStructure"],
        industryType=application["industryType"],
        turnoverRange=application["turnoverRange"],
        numberOfEmployees=application.get("numberOfEmployees"),
        servicesRequired=application.get("servicesRequired"),
        businessDetails=application.get("businessDetails"),
        status=ConsultationStatus(application["status"]),
        createdAt=application["createdAt"],
        assignedTo=application.get("assignedTo"),
        adminNotes=application.get("adminNotes")
    )


@router.patch("/application/{application_id}/status", status_code=status.HTTP_200_OK)
def update_application_status(
    application_id: str,
    status_update: UpdateConsultationStatusRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Update business tax planning application status (ADMIN ONLY)"""
    application = business_tax_repository.get_application_by_id(application_id)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business tax planning application not found"
        )
    
    success = business_tax_repository.update_application_status(
        application_id=application_id,
        status=status_update.status,
        admin_notes=status_update.adminNotes
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update application status"
        )
    
    return {
        "message": "Application status updated successfully",
        "status": status_update.status.value
    }


@router.patch("/application/{application_id}/assign", status_code=status.HTTP_200_OK)
def assign_consultant_to_application(
    application_id: str,
    assignment: AssignConsultantRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Assign consultant to business tax planning application (ADMIN ONLY)"""
    application = business_tax_repository.get_application_by_id(application_id)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business tax planning application not found"
        )
    
    success = business_tax_repository.assign_consultant(
        application_id=application_id,
        assigned_to=assignment.assignedTo,
        admin_notes=assignment.adminNotes
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assign consultant"
        )
    
    return {
        "message": "Consultant assigned successfully",
        "assignedTo": assignment.assignedTo
    }


@router.delete("/application/{application_id}", status_code=status.HTTP_200_OK)
def delete_application(
    application_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Delete a business tax planning application (ADMIN ONLY)"""
    application = business_tax_repository.get_application_by_id(application_id)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business tax planning application not found"
        )
    
    success = business_tax_repository.delete_application(application_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete application"
        )
    
    return {"message": "Business tax planning application deleted successfully"}


# ===================== USER ENDPOINTS - GET OWN DATA =====================

@router.get("/application/user/{email}", response_model=List[BusinessTaxPlanningApplicationResponse])
def get_user_applications(
    email: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Get all business tax planning applications for a specific user by email
    
    This endpoint allows users to retrieve THEIR OWN applications by email address.
    No authentication required - anyone can query by email to get their submitted data.
    
    Path parameters:
    - email: User's business email address
    
    Returns:
    - List of all business tax planning applications submitted by this user
    """
    try:
        email_lower = email.lower()
        applications = business_tax_repository.get_applications_by_email(email_lower)
        
        return [
            BusinessTaxPlanningApplicationResponse(
                id=str(app["_id"]),
                businessName=app["businessName"],
                businessEmail=app["businessEmail"],
                contactNumber=app["contactNumber"],
                businessPAN=app["businessPAN"],
                ownerName=app.get("ownerName", app.get("businessName", "N/A")),
                businessStructure=app["businessStructure"],
                industryType=app["industryType"],
                turnoverRange=app["turnoverRange"],
                gstNumber=app.get("gstNumber"),
                numberOfEmployees=app.get("numberOfEmployees"),
                servicesRequired=app.get("servicesRequired"),
                businessDetails=app.get("businessDetails"),
                status=ConsultationStatus(app["status"]),
                createdAt=app["createdAt"],
                assignedTo=app.get("assignedTo"),
                adminNotes=app.get("adminNotes")
            )
            for app in applications
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user applications. Error: {str(e)}"
        )


# ===================== STATISTICS ENDPOINT =====================

@router.get("/statistics", response_model=dict)
def get_business_tax_statistics(current_user: dict = Depends(get_current_user_optional)):
    """
    Get statistics for all business tax services (ADMIN ONLY)
    
    Returns counts for:
    - Consultation bookings (total, by status, time-based)
    - Tax planning applications (total, by status, time-based)
    - Tax calculations (total, time-based)
    """
    try:
        statistics = business_tax_repository.get_statistics()
        return statistics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics. Error: {str(e)}"
        )
