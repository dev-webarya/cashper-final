from fastapi import APIRouter, Depends, HTTPException, status
from app.database.schema.investment_management_schema import (
    PortfolioSummaryResponse,
    InvestmentsResponse,
    InvestmentDetailsResponse,
    InvestMoreRequest,
    InvestMoreResponse,
    RedeemRequest,
    RedeemResponse,
    TransactionsResponse
)
from app.database.repository import investment_management_repository
from app.database.db import get_database
from app.routes.auth_routes import get_current_user

router = APIRouter(prefix="/api/investment-management", tags=["Investment Management"])

@router.get("/admin/summary")
async def get_admin_summary():
    """Get admin dashboard summary for mutual funds and SIPs"""
    try:
        db = get_database()
        
        # Get data from investments collection
        investments = list(db["investments"].find({"status": "active"}))
        
        # Calculate totals
        total_aum = sum(inv.get("current", 0) for inv in investments)
        total_invested = sum(inv.get("invested", 0) for inv in investments)
        total_returns = sum(inv.get("current", 0) - inv.get("invested", 0) for inv in investments)
        
        # Calculate average return percentage
        avg_return_pct = 0
        if total_invested > 0:
            avg_return_pct = (total_returns / total_invested) * 100
        
        # Count applications
        mf_apps = db["mutual_fund_applications"].count_documents({"status": "submitted"})
        sip_apps = db["sip_applications"].count_documents({"status": "submitted"})
        
        # Get unique investors from investments
        unique_emails = set()
        for inv in investments:
            email = inv.get("userEmail", "")
            if email:
                unique_emails.add(email)
        
        return {
            "totalAUM": f"₹{total_aum:,.0f}",
            "activeInvestors": len(unique_emails),
            "totalInvestments": mf_apps + sip_apps,
            "avgReturn": f"+{avg_return_pct:.1f}%",
            "success": True
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch summary: {str(e)}"
        )
async def get_investment_summary(current_user: dict = Depends(get_current_user)):
    """Get investment summary (alias for portfolio summary)"""
    return await get_portfolio_summary(current_user)

@router.get("/portfolio", response_model=PortfolioSummaryResponse)
async def get_portfolio(current_user: dict = Depends(get_current_user)):
    """Get portfolio details (alias for portfolio summary)"""
    return await get_portfolio_summary(current_user)

@router.get("/performance")
async def get_investment_performance(current_user: dict = Depends(get_current_user)):
    """Get investment performance metrics"""
    user_email = current_user.get("email")
    
    try:
        # Get portfolio summary for performance calculation
        summary = investment_management_repository.get_portfolio_summary(user_email)
        
        if summary is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch performance data"
            )
        
        # Calculate performance metrics
        total_invested = summary.get("totalInvested", 0)
        current_value = summary.get("currentValue", 0)
        total_returns = summary.get("totalReturns", 0)
        returns_percentage = summary.get("returnsPercentage", 0)
        
        return {
            "success": True,
            "totalInvested": total_invested,
            "currentValue": current_value,
            "totalReturns": total_returns,
            "returnsPercentage": returns_percentage,
            "performance": "Good" if returns_percentage > 10 else "Fair" if returns_percentage > 5 else "Average",
            "monthlyGrowth": round(returns_percentage / 12, 2),
            "yearlyProjection": round(current_value * (1 + returns_percentage/100), 2)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch performance data: {str(e)}"
        )

@router.get("/portfolio/summary", response_model=PortfolioSummaryResponse)
async def get_portfolio_summary(current_user: dict = Depends(get_current_user)):
    """Get portfolio summary including total invested, current value, and returns"""
    user_email = current_user.get("email")
    
    summary = investment_management_repository.get_portfolio_summary(user_email)
    if summary is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch portfolio summary"
        )
    
    return summary

@router.get("/investments", response_model=InvestmentsResponse)
async def get_investments(current_user: dict = Depends(get_current_user)):
    """Get all active investments for the user"""
    user_email = current_user.get("email")
    
    investments = investment_management_repository.get_active_investments(user_email)
    if investments is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch investments"
        )
    
    return {"success": True, "data": investments}

@router.get("/investments/{investment_id}", response_model=InvestmentDetailsResponse)
async def get_investment_details(
    investment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get details of a specific investment"""
    user_email = current_user.get("email")
    
    investment = investment_management_repository.get_investment_details(investment_id, user_email)
    if not investment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
    
    return {"success": True, "data": investment}

@router.post("/invest-more", response_model=InvestMoreResponse)
async def invest_more(
    request: InvestMoreRequest,
    current_user: dict = Depends(get_current_user)
):
    """Add more investment to an existing fund"""
    user_email = current_user.get("email")
    
    # Validate amount
    if request.amount < 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum investment amount is ₹500"
        )
    
    if request.amount > 10000000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum investment amount is ₹1,00,00,000"
        )
    
    result = investment_management_repository.process_invest_more(
        request.investmentId,
        request.amount,
        user_email
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found or failed to process"
        )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to process investment")
        )
    
    return result

@router.post("/redeem", response_model=RedeemResponse)
async def redeem_investment(
    request: RedeemRequest,
    current_user: dict = Depends(get_current_user)
):
    """Process redemption request for an investment"""
    user_email = current_user.get("email")
    
    result = investment_management_repository.process_redemption(
        request.investmentId,
        request.amount,
        user_email
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found or failed to process"
        )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to process redemption")
        )
    
    return result

@router.get("/transactions", response_model=TransactionsResponse)
async def get_transactions(current_user: dict = Depends(get_current_user)):
    """Get recent investment transactions"""
    user_email = current_user.get("email")
    
    transactions = investment_management_repository.get_recent_transactions(user_email)
    if transactions is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch transactions"
        )
    
    return {"success": True, "data": transactions}

@router.get("/transactions/export")
async def export_transactions(current_user: dict = Depends(get_current_user)):
    """Export all transactions for download"""
    user_email = current_user.get("email")
    
    transactions = investment_management_repository.export_transactions(user_email)
    if transactions is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export transactions"
        )
    
    return {"success": True, "data": transactions, "message": "Transactions exported successfully"}
