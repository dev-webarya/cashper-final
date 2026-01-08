from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.database.schema.personal_tax_schema import (
    TaxConsultationBookingRequest,
    TaxConsultationBookingResponse,
    TaxConsultationBookingInDB,
    TaxCalculatorRequest,
    TaxCalculatorResponse,
    TaxCalculatorInDB,
    PersonalTaxPlanningApplicationRequest,
    PersonalTaxPlanningApplicationResponse,
    PersonalTaxPlanningApplicationInDB,
    ConsultationStatus,
    UpdateConsultationStatusRequest,
    AssignConsultantRequest
)
from app.database.repository.personal_tax_repository import personal_tax_repository
from app.utils.auth_middleware import get_current_user_optional
from app.utils.auth import get_current_user, get_optional_user
from datetime import datetime
import math

router = APIRouter(prefix="/api/personal-tax", tags=["Personal Tax Planning"])


# ===================== TAX CALCULATION UTILITY =====================

def calculate_income_tax(income: float) -> float:
    """Calculate income tax based on new tax regime slabs with standard deduction"""
    standard_deduction = 50000
    taxable_income = max(0, income - standard_deduction)
    tax = 0

    if taxable_income <= 250000:
        tax = 0
    elif taxable_income <= 500000:
        tax = (taxable_income - 250000) * 0.05
    elif taxable_income <= 750000:
        tax = 12500 + (taxable_income - 500000) * 0.10
    elif taxable_income <= 1000000:
        tax = 12500 + 25000 + (taxable_income - 750000) * 0.15
    elif taxable_income <= 1250000:
        tax = 12500 + 25000 + 37500 + (taxable_income - 1000000) * 0.20
    elif taxable_income <= 1500000:
        tax = 12500 + 25000 + 37500 + 50000 + (taxable_income - 1250000) * 0.25
    else:
        tax = 12500 + 25000 + 37500 + 50000 + 62500 + (taxable_income - 1500000) * 0.30

    # Add 4% cess
    tax = tax * 1.04

    return round(tax)


# ===================== PUBLIC ENDPOINTS =====================

@router.post("/consultation/book", response_model=TaxConsultationBookingResponse, status_code=status.HTTP_201_CREATED)
def book_tax_consultation(booking: TaxConsultationBookingRequest):
    """
    Book a free tax consultation (PUBLIC - No authentication required)
    
    This endpoint is for the "BOOK FREE TAX CONSULTATION" form in the hero section.
    
    Required fields:
    - name: Full name (min 3 characters)
    - email: Valid email address
    - phone: 10-digit phone number
    - income: Annual income range (below-5, 5-10, 10-20, 20-50, above-50)
    - taxRegime: Current tax regime (old, new, not-sure)
    
    Returns:
    - Confirmation with booking details and status
    """
    try:
        booking_in_db = TaxConsultationBookingInDB(
            name=booking.name,
            email=booking.email.lower(),
            phone=booking.phone,
            income=booking.income.value,
            taxRegime=booking.taxRegime.value,
            status=ConsultationStatus.PENDING,
            createdAt=datetime.utcnow()
        )
        
        created_booking = personal_tax_repository.create_consultation_booking(booking_in_db)
        
        return created_booking
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to book consultation. Please try again. Error: {str(e)}"
        )


@router.post("/calculator/calculate", response_model=dict)
def calculate_tax_savings(calculation: TaxCalculatorRequest):
    """
    Calculate tax savings based on deductions (PUBLIC - No authentication required)
    
    This endpoint is for the "Get Expert Tax Planning Consultation" tax calculator section.
    
    Input fields:
    - grossIncome: Annual gross income
    - section80C: Investments under 80C (max 1.5L)
    - section80D: Health insurance premium (max 50K)
    - nps80CCD1B: Additional NPS deduction (max 50K)
    - homeLoanInterest: Home loan interest (max 2L)
    - Optional contact details (name, email, phone) for follow-up
    
    Returns:
    - Complete tax breakdown including savings
    - Tax with and without planning
    - Total deductions applied
    """
    try:
        # Calculate total deductions (with limits) - Handle None values
        total_80c = min(calculation.section80C or 0, 150000)
        total_80d = min(calculation.section80D or 0, 50000)
        total_nps = min(calculation.nps80CCD1B or 0, 50000)
        total_home_loan = min(calculation.homeLoanInterest or 0, 200000)
        total_deductions = total_80c + total_80d + total_nps + total_home_loan

        # Calculate tax without planning
        tax_without_planning = calculate_income_tax(calculation.grossIncome)

        # Calculate tax with planning
        taxable_income = max(0, calculation.grossIncome - total_deductions)
        tax_after_planning = calculate_income_tax(taxable_income)

        # Calculate savings
        total_savings = tax_without_planning - tax_after_planning

        # Save calculation to database
        calculation_in_db = TaxCalculatorInDB(
            grossIncome=calculation.grossIncome,
            section80C=calculation.section80C or 0,
            section80D=calculation.section80D or 0,
            nps80CCD1B=calculation.nps80CCD1B or 0,
            homeLoanInterest=calculation.homeLoanInterest or 0,
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
        
        saved_calculation = personal_tax_repository.save_tax_calculation(calculation_in_db)

        return {
            "id": saved_calculation.id,
            "grossIncome": calculation.grossIncome,
            "totalDeductions": total_deductions,
            "taxableIncome": taxable_income,
            "taxWithoutPlanning": tax_without_planning,
            "taxAfterPlanning": tax_after_planning,
            "totalSavings": total_savings,
            "message": "Tax calculation completed successfully",
            "breakdown": {
                "section80C": total_80c,
                "section80D": total_80d,
                "nps80CCD1B": total_nps,
                "homeLoanInterest": total_home_loan
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate tax. Error: {str(e)}"
        )


@router.post("/application/submit", response_model=PersonalTaxPlanningApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_tax_planning_application(
    application: PersonalTaxPlanningApplicationRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Submit application for personal tax planning service (PUBLIC - No authentication required)
    
    This endpoint is for the "Apply for Personal Tax Planning Service" main form.
    
    Required fields:
    - fullName: Full name (min 3 characters)
    - emailAddress: Valid email address
    - phoneNumber: 10-digit phone number
    - panNumber: Valid PAN card number (Format: ABCDE1234F)
    - annualIncome: Income range
    - employmentType: Type of employment (salaried, self-employed, freelancer, business, retired)
    
    Optional fields:
    - preferredTaxRegime: Old/New/Not Sure
    - additionalInfo: Any specific requirements or questions
    
    Returns:
    - Confirmation with application ID and status
    """
    try:
        # Check if application already exists for this PAN
        existing_application = personal_tax_repository.get_application_by_pan(application.panNumber)
        if existing_application:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"An application with PAN {application.panNumber} already exists (Application ID: {existing_application.get('_id', 'N/A')}). If you need to update your information or check status, please contact our support team or use your existing application ID."
            )
        
        application_in_db = PersonalTaxPlanningApplicationInDB(
            fullName=application.fullName,
            emailAddress=application.emailAddress.lower(),
            phoneNumber=application.phoneNumber,
            panNumber=application.panNumber,
            annualIncome=application.annualIncome.value,
            employmentType=application.employmentType.value,
            preferredTaxRegime=application.preferredTaxRegime.value if application.preferredTaxRegime else None,
            additionalInfo=application.additionalInfo,
            userId=str(current_user["_id"]) if current_user else None,
            status=ConsultationStatus.PENDING,
            createdAt=datetime.utcnow()
        )
        
        created_application = personal_tax_repository.create_tax_planning_application(application_in_db)
        
        return created_application
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit application. Please try again. Error: {str(e)}"
        )


# ===================== ADMIN ENDPOINTS - CONSULTATION BOOKINGS =====================

@router.get("/consultation/all", response_model=List[TaxConsultationBookingResponse])
def get_all_consultations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum records to return"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Get all tax consultation bookings (ADMIN ONLY)
    
    Query parameters:
    - skip: Pagination offset (default: 0)
    - limit: Records per page (default: 50, max: 100)
    - status_filter: Filter by status (pending, scheduled, completed, cancelled)
    """
    try:
        consultations = personal_tax_repository.get_all_consultations(
            skip=skip,
            limit=limit,
            status=status_filter
        )
        
        return [
            TaxConsultationBookingResponse(
                id=str(consultation.get("_id", "")),
                name=consultation.get("name", ""),
                email=consultation.get("email", ""),
                phone=consultation.get("phone", ""),
                income=consultation.get("income", ""),
                taxRegime=consultation.get("taxRegime", "new"),
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


@router.get("/consultation/{consultation_id}", response_model=TaxConsultationBookingResponse)
def get_consultation_by_id(
    consultation_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Get a specific consultation booking by ID (ADMIN ONLY)"""
    consultation = personal_tax_repository.get_consultation_by_id(consultation_id)
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation booking not found"
        )
    
    return TaxConsultationBookingResponse(
        id=str(consultation["_id"]),
        name=consultation["name"],
        email=consultation["email"],
        phone=consultation["phone"],
        income=consultation["income"],
        taxRegime=consultation["taxRegime"],
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
    consultation = personal_tax_repository.get_consultation_by_id(consultation_id)
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation booking not found"
        )
    
    success = personal_tax_repository.update_consultation_status(
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
    consultation = personal_tax_repository.get_consultation_by_id(consultation_id)
    
    if not consultation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation booking not found"
        )
    
    success = personal_tax_repository.delete_consultation(consultation_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete consultation"
        )
    
    return {"message": "Consultation booking deleted successfully"}


# ===================== ADMIN ENDPOINTS - TAX CALCULATIONS =====================

@router.get("/calculator/all", response_model=List[TaxCalculatorResponse])
def get_all_calculations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user_optional)
):
    """Get all tax calculations (ADMIN ONLY)"""
    try:
        calculations = personal_tax_repository.get_all_calculations(skip=skip, limit=limit)
        
        return [
            TaxCalculatorResponse(
                id=str(calc["_id"]),
                grossIncome=calc["grossIncome"],
                section80C=calc["section80C"],
                section80D=calc["section80D"],
                nps80CCD1B=calc["nps80CCD1B"],
                homeLoanInterest=calc["homeLoanInterest"],
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


@router.get("/calculator/{calculation_id}", response_model=TaxCalculatorResponse)
def get_calculation_by_id(
    calculation_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Get a specific tax calculation by ID (ADMIN ONLY)"""
    calculation = personal_tax_repository.get_calculation_by_id(calculation_id)
    
    if not calculation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax calculation not found"
        )
    
    return TaxCalculatorResponse(
        id=str(calculation["_id"]),
        grossIncome=calculation["grossIncome"],
        section80C=calculation["section80C"],
        section80D=calculation["section80D"],
        nps80CCD1B=calculation["nps80CCD1B"],
        homeLoanInterest=calculation["homeLoanInterest"],
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

@router.get("/application/all", response_model=List[PersonalTaxPlanningApplicationResponse])
def get_all_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned consultant"),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get all tax planning applications (User sees own, Admin sees all)"""
    try:
        # If no user logged in, return empty list
        if not current_user:
            return []
        
        # Check if user is admin
        is_admin = current_user.get("isAdmin", False)
        
        if is_admin:
            # Admin can see all applications
            applications = personal_tax_repository.get_all_applications(
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
                db["tax_planning_applications"]
                .find(query)
                .sort("createdAt", -1)
                .skip(skip)
                .limit(limit)
            )
        
        return [
            PersonalTaxPlanningApplicationResponse(
                id=str(app["_id"]),
                fullName=app["fullName"],
                emailAddress=app["emailAddress"],
                phoneNumber=app["phoneNumber"],
                panNumber=app["panNumber"],
                annualIncome=app["annualIncome"],
                employmentType=app["employmentType"],
                preferredTaxRegime=app.get("preferredTaxRegime"),
                additionalInfo=app.get("additionalInfo"),
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


@router.get("/application/{application_id}", response_model=PersonalTaxPlanningApplicationResponse)
def get_application_by_id(
    application_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Get a specific tax planning application by ID (ADMIN ONLY)"""
    application = personal_tax_repository.get_application_by_id(application_id)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax planning application not found"
        )
    
    return PersonalTaxPlanningApplicationResponse(
        id=str(application["_id"]),
        fullName=application["fullName"],
        emailAddress=application["emailAddress"],
        phoneNumber=application["phoneNumber"],
        panNumber=application["panNumber"],
        annualIncome=application["annualIncome"],
        employmentType=application["employmentType"],
        preferredTaxRegime=application.get("preferredTaxRegime"),
        additionalInfo=application.get("additionalInfo"),
        userId=application.get("userId"),
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
    """Update tax planning application status (ADMIN ONLY)"""
    application = personal_tax_repository.get_application_by_id(application_id)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax planning application not found"
        )
    
    success = personal_tax_repository.update_application_status(
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
    """Assign consultant to tax planning application (ADMIN ONLY)"""
    application = personal_tax_repository.get_application_by_id(application_id)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax planning application not found"
        )
    
    success = personal_tax_repository.assign_consultant(
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
    """Delete a tax planning application (ADMIN ONLY)"""
    application = personal_tax_repository.get_application_by_id(application_id)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax planning application not found"
        )
    
    success = personal_tax_repository.delete_application(application_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete application"
        )
    
    return {"message": "Tax planning application deleted successfully"}


# ===================== USER ENDPOINTS - GET OWN DATA =====================

@router.get("/application/user/{email}", response_model=List[PersonalTaxPlanningApplicationResponse])
def get_user_applications(
    email: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Get all tax planning applications for a specific user by email
    
    This endpoint allows users to retrieve THEIR OWN applications by email address.
    No authentication required - anyone can query by email to get their submitted data.
    
    Path parameters:
    - email: User's email address
    
    Returns:
    - List of all tax planning applications submitted by this user
    """
    try:
        email_lower = email.lower()
        applications = personal_tax_repository.get_applications_by_email(email_lower)
        
        return [
            PersonalTaxPlanningApplicationResponse(
                id=str(app["_id"]),
                fullName=app["fullName"],
                emailAddress=app["emailAddress"],
                phoneNumber=app["phoneNumber"],
                panNumber=app["panNumber"],
                annualIncome=app["annualIncome"],
                employmentType=app["employmentType"],
                preferredTaxRegime=app.get("preferredTaxRegime"),
                additionalInfo=app.get("additionalInfo"),
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
            detail=f"Failed to fetch user applications. Error: {str(e)}"
        )


# ===================== STATISTICS ENDPOINT =====================

@router.get("/statistics", response_model=dict)
def get_personal_tax_statistics(current_user: dict = Depends(get_current_user_optional)):
    """
    Get statistics for all personal tax services (ADMIN ONLY)
    
    Returns counts for:
    - Consultation bookings (total, by status, time-based)
    - Tax planning applications (total, by status, time-based)
    - Tax calculations (total, time-based)
    """
    try:
        statistics = personal_tax_repository.get_statistics()
        return statistics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics. Error: {str(e)}"
        )
