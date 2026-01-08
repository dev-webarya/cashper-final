from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.database.schema.loan_management_schema import (
    LoanSummaryResponse,
    ActiveLoanResponse,
    LoanApplicationResponse,
    EMIPaymentCreate,
    EMIPaymentResponse,
    LoanDetailsResponse,
    CreateLoanRequest,
    CreateLoanResponse,
    ActiveLoanInDB,
    EMIPaymentInDB
)
from app.database.repository.loan_management_repository import loan_management_repository
from app.utils.auth_middleware import get_current_user
from bson import ObjectId
import random

router = APIRouter(prefix="/api/loan-management", tags=["Loan Management"])


# ===================== LOAN SUMMARY ENDPOINT =====================

@router.get("/summary", response_model=LoanSummaryResponse)
def get_loan_summary(current_user: dict = Depends(get_current_user)):
    """
    Get loan summary statistics for the current user
    
    Returns:
    - Total loan amount
    - Outstanding amount
    - Monthly EMI
    - Active loans count
    - Completed loans count
    """
    try:
        user_id = str(current_user["_id"])
        summary = loan_management_repository.get_loan_summary(user_id)
        return summary
        
    except Exception as e:
        print(f"Loan summary error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch loan summary. Error: {str(e)}"
        )


# ===================== ACTIVE LOANS ENDPOINTS =====================

@router.get("/loans", response_model=List[ActiveLoanResponse])
def get_active_loans(current_user: dict = Depends(get_current_user)):
    """
    Get all active loans for the current user
    
    Returns a list of active loans with:
    - Loan details
    - Outstanding amount
    - EMI information
    - Repayment progress
    - Next due date
    """
    try:
        user_id = str(current_user["_id"])
        loans = loan_management_repository.get_active_loans(user_id)
        return loans
        
    except Exception as e:
        print(f"Get active loans error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch active loans. Error: {str(e)}"
        )


@router.get("/loans/{loan_id}", response_model=LoanDetailsResponse)
def get_loan_details(
    loan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information about a specific loan
    
    Users can only view their own loans
    """
    try:
        user_id = str(current_user["_id"])
        loan = loan_management_repository.get_loan_by_id(loan_id, user_id)
        
        if not loan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found or you don't have permission to view it"
            )
        
        # Calculate progress
        progress = int((loan.get("months_completed", 0) / loan.get("tenure_months", 1)) * 100)
        
        return LoanDetailsResponse(
            id=str(loan["_id"]),
            type=loan.get("loan_type", "Unknown"),
            amount=f"₹{loan.get('loan_amount', 0):,}",
            outstanding=f"₹{loan.get('outstanding_amount', 0):,}",
            emi=f"₹{loan.get('emi_amount', 0):,}",
            interestRate=f"{loan.get('interest_rate', 0)}%",
            tenure=f"{loan.get('tenure_months', 0)} months",
            monthsCompleted=loan.get("months_completed", 0),
            nextDue=loan.get("next_due_date", datetime.now()).strftime("%b %d, %Y"),
            progress=progress,
            status=loan.get("status", "active"),
            applicationId=loan.get("application_id"),
            createdAt=loan.get("created_at", datetime.now())
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get loan details error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch loan details. Error: {str(e)}"
        )


# ===================== LOAN APPLICATIONS ENDPOINTS =====================

@router.get("/applications", response_model=List[LoanApplicationResponse])
def get_loan_applications(current_user: dict = Depends(get_current_user)):
    """
    Get recent loan applications for the current user
    
    Returns a list of loan applications sorted by date (newest first)
    Includes applications from all loan types:
    - Personal Loans
    - Home Loans
    - Business Loans
    - Short-term Loans
    """
    try:
        user_id = str(current_user["_id"])
        applications = loan_management_repository.get_loan_applications(user_id)
        return applications
        
    except Exception as e:
        print(f"Get loan applications error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch loan applications. Error: {str(e)}"
        )


# ===================== EMI PAYMENT ENDPOINTS =====================

@router.post("/pay-emi", response_model=EMIPaymentResponse, status_code=status.HTTP_201_CREATED)
def pay_emi(
    payment_request: EMIPaymentCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Process EMI payment for a loan
    
    This endpoint allows authenticated users to pay their loan EMI with:
    - Loan ID
    - Payment method (UPI, Net Banking, Card, Wallet)
    - Payment amount
    
    The payment will be recorded and loan details will be updated:
    - Outstanding amount reduced
    - Months completed incremented
    - Next due date updated
    - Loan marked as completed if fully paid
    """
    try:
        user_id = str(current_user["_id"])
        
        # Verify loan belongs to user
        loan = loan_management_repository.get_loan_by_id(payment_request.loanId, user_id)
        
        if not loan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found or you don't have permission to pay for it"
            )
        
        # Verify payment amount matches EMI amount
        if payment_request.amount != loan.get("emi_amount", 0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment amount must match EMI amount: ₹{loan.get('emi_amount', 0):,}"
            )
        
        # Generate transaction ID
        transaction_id = loan_management_repository._generate_transaction_id()
        
        # Create payment record
        payment_data = EMIPaymentInDB(
            loan_id=payment_request.loanId,
            user_id=user_id,
            amount=payment_request.amount,
            payment_method=payment_request.paymentMethod,
            transaction_id=transaction_id,
            status="completed"
        )
        
        # Process payment
        payment_response = loan_management_repository.process_emi_payment(payment_data)
        
        return payment_response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Pay EMI error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process EMI payment. Error: {str(e)}"
        )


@router.get("/payment-history/{loan_id}", response_model=List[Dict[str, Any]])
def get_payment_history(
    loan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get payment history for a specific loan
    
    Returns list of all EMI payments made for the loan
    """
    try:
        user_id = str(current_user["_id"])
        
        # Verify loan belongs to user
        loan = loan_management_repository.get_loan_by_id(loan_id, user_id)
        
        if not loan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found or you don't have permission to view it"
            )
        
        payments = loan_management_repository.get_payment_history(loan_id, user_id)
        
        payment_list = []
        for payment in payments:
            payment_list.append({
                "id": str(payment["_id"]),
                "amount": payment.get("amount", 0),
                "paymentMethod": payment.get("payment_method", "Unknown"),
                "paymentDate": payment.get("payment_date", datetime.now()).strftime("%b %d, %Y"),
                "transactionId": payment.get("transaction_id", ""),
                "status": payment.get("status", "completed")
            })
        
        return payment_list
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get payment history error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch payment history. Error: {str(e)}"
        )


# ===================== LOAN STATEMENT ENDPOINT =====================

@router.get("/statement/{loan_id}")
def download_loan_statement(
    loan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get loan statement with payment history
    
    Returns complete loan statement including:
    - Loan details
    - Payment history
    - Outstanding amount
    - Interest details
    """
    try:
        user_id = str(current_user["_id"])
        
        # Verify loan belongs to user
        loan = loan_management_repository.get_loan_by_id(loan_id, user_id)
        
        if not loan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found or you don't have permission to view it"
            )
        
        # Get payment history
        payments = loan_management_repository.get_payment_history(loan_id, user_id)
        
        payment_list = []
        for payment in payments:
            payment_list.append({
                "date": payment.get("payment_date", datetime.now()).strftime("%b %d, %Y"),
                "amount": payment.get("amount", 0),
                "method": payment.get("payment_method", "Unknown"),
                "transactionId": payment.get("transaction_id", ""),
                "status": payment.get("status", "completed")
            })
        
        return {
            "loanId": str(loan["_id"]),
            "loanType": loan.get("loan_type", "Unknown"),
            "totalAmount": loan.get("loan_amount", 0),
            "outstanding": loan.get("outstanding_amount", 0),
            "emiAmount": loan.get("emi_amount", 0),
            "interestRate": loan.get("interest_rate", 0),
            "tenure": loan.get("tenure_months", 0),
            "monthsCompleted": loan.get("months_completed", 0),
            "nextDueDate": loan.get("next_due_date", datetime.now()).strftime("%b %d, %Y"),
            "applicationId": loan.get("application_id", ""),
            "payments": payment_list
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Download statement error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate loan statement. Error: {str(e)}"
        )


# ===================== CREATE LOAN ENDPOINT (FOR TESTING/SEEDING) =====================

@router.post("/create-loan", response_model=CreateLoanResponse, status_code=status.HTTP_201_CREATED)
def create_loan(
    loan_request: CreateLoanRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new active loan (for testing/seeding purposes)
    
    This endpoint allows users to create sample loans for testing the loan management features.
    
    Parameters:
    - loanType: Type of loan (Personal Loan, Home Loan, Business Loan)
    - loanAmount: Total loan amount
    - interestRate: Annual interest rate (%)
    - tenureMonths: Loan tenure in months
    
    The system will automatically calculate:
    - Monthly EMI
    - Outstanding amount (initially same as loan amount)
    - Next due date (30 days from now)
    - Application ID
    """
    try:
        user_id = str(current_user["_id"])
        
        # Calculate EMI using reducing balance method
        principal = loan_request.loanAmount
        rate_per_month = loan_request.interestRate / 12 / 100
        tenure = loan_request.tenureMonths
        
        if rate_per_month > 0:
            emi = int((principal * rate_per_month * ((1 + rate_per_month) ** tenure)) / 
                     (((1 + rate_per_month) ** tenure) - 1))
        else:
            emi = int(principal / tenure)
        
        # Generate application ID
        app_id = loan_management_repository._generate_application_id(loan_request.loanType)
        
        # Create loan data
        loan_data = ActiveLoanInDB(
            user_id=user_id,
            loan_type=loan_request.loanType,
            loan_amount=loan_request.loanAmount,
            outstanding_amount=loan_request.loanAmount,
            emi_amount=emi,
            next_due_date=datetime.now() + timedelta(days=30),
            status="active",
            interest_rate=loan_request.interestRate,
            tenure_months=loan_request.tenureMonths,
            months_completed=0,
            application_id=app_id
        )
        
        # Create loan
        created_loan = loan_management_repository.create_loan(loan_data)
        
        return CreateLoanResponse(
            id=created_loan.id,
            message=f"Loan created successfully! Application ID: {app_id}",
            loanDetails=created_loan
        )
        
    except Exception as e:
        print(f"Create loan error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create loan. Error: {str(e)}"
        )


# ===================== DELETE LOAN ENDPOINT (FOR TESTING) =====================

@router.delete("/loans/{loan_id}")
def delete_loan(
    loan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a loan (for testing purposes)
    
    This endpoint allows users to delete their test loans.
    Users can only delete their own loans.
    """
    try:
        user_id = str(current_user["_id"])
        
        # Verify loan exists and belongs to user
        loan = loan_management_repository.get_loan_by_id(loan_id, user_id)
        
        if not loan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found or you don't have permission to delete it"
            )
        
        # Delete loan
        success = loan_management_repository.delete_loan(loan_id, user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete loan"
            )
        
        return {
            "message": "Loan deleted successfully",
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete loan error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete loan. Error: {str(e)}"
        )
