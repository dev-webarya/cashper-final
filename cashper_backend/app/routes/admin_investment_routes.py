from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.database.db import get_database
from app.routes.auth_routes import get_current_user

router = APIRouter(prefix="/api/admin/investments", tags=["Admin Investment Management"])

# Helper function to verify admin
def verify_admin(current_user: dict):
    if not current_user.get("isAdmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

def find_user_by_id(db, user_id):
    """Find user by ID"""
    try:
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return db["users"].find_one({"_id": user_id})
    except:
        return None

# Pydantic Models
class InvestmentStats(BaseModel):
    totalAUM: str
    activeInvestors: int
    totalInvestments: int
    avgReturn: str

class InvestmentResponse(BaseModel):
    id: str
    customer: str
    email: str
    phone: str
    type: str
    fundName: str
    amount: str
    totalInvested: str
    returns: str
    status: str
    startDate: str
    tenure: str
    documents: List[str]

class SIPPlanResponse(BaseModel):
    id: str
    name: str
    customers: int
    totalValue: str
    avgReturn: str
    minInvestment: str
    tenure: str
    riskLevel: str
    status: str
    lastUpdated: str

class UpdateStatusRequest(BaseModel):
    status: str = Field(..., description="New status: Active, Pending, Completed, Cancelled")


# ==================== ADMIN INVESTMENT MANAGEMENT APIs ====================

@router.get("/stats", response_model=InvestmentStats)
def get_investment_stats():
    """Get investment statistics for admin dashboard - No auth required"""
    try:
        db = get_database()
        
        # Get ONLY application collections (NOT the investments collection)
        sip_applications = db["sip_applications"]
        mutual_fund_applications = db["mutual_fund_applications"]
        
        # Count total applications ONLY
        total_sip = sip_applications.count_documents({})
        total_mutual_funds = mutual_fund_applications.count_documents({})
        total_applications = total_sip + total_mutual_funds
        
        # Count ONLY applications with 'Active' status
        active_sip = sip_applications.count_documents({"status": "Active"})
        active_mutual_funds = mutual_fund_applications.count_documents({"status": "Active"})
        active_investors = active_sip + active_mutual_funds
        
        # Calculate total AUM from applications
        total_aum = 0
        
        # Add SIP AUM
        for sip in sip_applications.find():
            monthly = float(sip.get("sipAmount", 0))
            tenure = int(sip.get("tenure", 1))
            total_aum += monthly * 12 * tenure
        
        # Add Mutual Fund AUM
        for mf in mutual_fund_applications.find():
            if mf.get("investmentType") == "sip":
                monthly = float(mf.get("sipAmount", 0))
                tenure = int(mf.get("tenure", 1))
                total_aum += monthly * 12 * tenure
            else:
                total_aum += float(mf.get("investmentAmount", 0))
        
        # Format AUM
        if total_aum >= 10000000:  # Crore
            aum_str = f"₹{total_aum/10000000:.1f}Cr"
        elif total_aum >= 100000:  # Lakh
            aum_str = f"₹{total_aum/100000:.1f}L"
        else:
            aum_str = f"₹{total_aum:,.0f}"
        
        # Calculate average return (basic calculation)
        avg_return = 10.0  # Default return
        
        return {
            "totalAUM": aum_str,
            "activeInvestors": active_investors,
            "totalInvestments": total_applications,
            "avgReturn": f"+{avg_return:.1f}%"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch investment stats: {str(e)}"
        )


@router.get("/all", response_model=dict)
def get_all_investments(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=10000),
    status_filter: Optional[str] = Query(None),
    type_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get all investments (Mutual Funds and SIP) with pagination and filters"""
    verify_admin(current_user)
    
    try:
        db = get_database()
        investments_collection = db["investments"]
        sip_applications = db["sip_applications"]
        mutual_fund_applications = db["mutual_fund_applications"]
        users_collection = db["users"]
        
        all_investments = []
        
        # Get investments from investments collection
        for inv in investments_collection.find():
            user_email = inv.get("userEmail")
            user = users_collection.find_one({"email": user_email})
            
            investment_type = inv.get("type", "Mutual Funds")
            
            # Apply type filter
            if type_filter and type_filter != "all" and investment_type != type_filter:
                continue
            
            # Apply status filter
            inv_status = inv.get("status", "active").capitalize()
            if status_filter and status_filter != "all" and inv_status.lower() != status_filter.lower():
                continue
            
            # Apply search filter
            if search:
                search_lower = search.lower()
                if not (
                    search_lower in (user.get("fullName", "") if user else "").lower() or
                    search_lower in user_email.lower() or
                    search_lower in inv.get("name", "").lower()
                ):
                    continue
            
            invested = float(inv.get("invested", 0))
            current = float(inv.get("current", 0))
            returns_pct = ((current - invested) / invested * 100) if invested > 0 else 0
            
            all_investments.append({
                "id": str(inv["_id"]),
                "customer": user.get("fullName", "Unknown") if user else "Unknown",
                "email": user_email,
                "phone": user.get("phone", "N/A") if user else "N/A",
                "type": investment_type,
                "fundName": inv.get("name", "Unknown Fund"),
                "amount": f"₹{invested:,.0f}" if investment_type == "Mutual Funds" else f"₹{inv.get('sipAmount', 0):,.0f}/mo",
                "totalInvested": f"₹{invested:,.0f}",
                "returns": f"{'+' if returns_pct >= 0 else ''}{returns_pct:.1f}%",
                "status": inv_status,
                "startDate": inv.get("startDate", datetime.now().strftime("%Y-%m-%d")),
                "tenure": inv.get("tenure", "N/A"),
                "documents": inv.get("documents", [])
            })
        
        # Get SIP applications
        for sip in sip_applications.find():
            user_id = sip.get("userId")
            user = find_user_by_id(db, user_id)
            
            # Apply type filter
            if type_filter and type_filter != "all" and type_filter != "SIP":
                continue
            
            # Apply status filter
            sip_status = sip.get("status", "Pending").capitalize()
            if status_filter and status_filter != "all" and sip_status.lower() != status_filter.lower():
                continue
            
            # Apply search filter
            if search:
                search_lower = search.lower()
                if not (
                    search_lower in (user.get("fullName", "") if user else "").lower() or
                    search_lower in (user.get("email", "") if user else "").lower() or
                    search_lower in sip.get("fundName", "").lower()
                ):
                    continue
            
            monthly_investment = float(sip.get("monthlyInvestment", 0))
            duration_months = 12
            if "investmentDuration" in sip:
                duration_str = sip["investmentDuration"]
                if "month" in duration_str.lower():
                    duration_months = int(''.join(filter(str.isdigit, duration_str)) or "12")
            
            total_invested = monthly_investment * duration_months
            
            all_investments.append({
                "id": str(sip["_id"]),
                "customer": user.get("fullName", "Unknown") if user else "Unknown",
                "email": user.get("email", "N/A") if user else "N/A",
                "phone": user.get("phone", "N/A") if user else "N/A",
                "type": "SIP",
                "fundName": sip.get("fundName", "Equity Fund"),
                "amount": f"₹{monthly_investment:,.0f}/mo",
                "totalInvested": f"₹{total_invested:,.0f}",
                "returns": "+12.5%",
                "status": sip_status,
                "startDate": sip.get("createdAt", datetime.now()).strftime("%Y-%m-%d") if isinstance(sip.get("createdAt"), datetime) else datetime.now().strftime("%Y-%m-%d"),
                "tenure": sip.get("investmentDuration", "12 months"),
                "documents": sip.get("documents", [])
            })
        
        # Get Mutual Fund applications
        for mf in mutual_fund_applications.find():
            user_id = mf.get("userId")
            user = find_user_by_id(db, user_id)
            
            # Apply type filter
            if type_filter and type_filter != "all" and type_filter != "Mutual Funds":
                continue
            
            # Apply status filter
            mf_status = mf.get("status", "Pending").capitalize()
            if status_filter and status_filter != "all" and mf_status.lower() != status_filter.lower():
                continue
            
            # Apply search filter
            if search:
                search_lower = search.lower()
                if not (
                    search_lower in (user.get("fullName", "") if user else "").lower() or
                    search_lower in (user.get("email", "") if user else "").lower() or
                    search_lower in mf.get("fundName", "").lower()
                ):
                    continue
            
            investment_amount = float(mf.get("investmentAmount", 0))
            
            all_investments.append({
                "id": str(mf["_id"]),
                "customer": user.get("fullName", "Unknown") if user else "Unknown",
                "email": user.get("email", "N/A") if user else "N/A",
                "phone": user.get("phone", "N/A") if user else "N/A",
                "type": "Mutual Funds",
                "fundName": mf.get("fundName", "Equity Growth Fund"),
                "amount": f"₹{investment_amount:,.0f}",
                "totalInvested": f"₹{investment_amount:,.0f}",
                "returns": "+10.5%",
                "status": mf_status,
                "startDate": mf.get("createdAt", datetime.now()).strftime("%Y-%m-%d") if isinstance(mf.get("createdAt"), datetime) else datetime.now().strftime("%Y-%m-%d"),
                "tenure": mf.get("investmentDuration", "3 Years"),
                "documents": mf.get("documents", [])
            })
        
        # Sort by date (newest first)
        all_investments.sort(key=lambda x: x["startDate"], reverse=True)
        
        # Pagination
        total = len(all_investments)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        return {
            "success": True,
            "investments": all_investments[start_idx:end_idx],
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": (total + limit - 1) // limit if total > 0 else 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch investments: {str(e)}"
        )


@router.get("/sip-plans", response_model=dict)
def get_sip_plans(current_user: dict = Depends(get_current_user)):
    """Get SIP plan statistics"""
    verify_admin(current_user)
    
    try:
        db = get_database()
        sip_applications = db["sip_applications"]
        
        # Define standard SIP plans
        standard_plans = [
            {
                "id": "SIP001",
                "name": "Equity Growth Fund",
                "minInvestment": "₹500",
                "tenure": "3-5 Years",
                "riskLevel": "High",
                "status": "Active",
                "lastUpdated": datetime.now().strftime("%Y-%m-%d")
            },
            {
                "id": "SIP002",
                "name": "Balanced Advantage Fund",
                "minInvestment": "₹1000",
                "tenure": "3-5 Years",
                "riskLevel": "Moderate",
                "status": "Active",
                "lastUpdated": datetime.now().strftime("%Y-%m-%d")
            },
            {
                "id": "SIP003",
                "name": "Debt Fund",
                "minInvestment": "₹1000",
                "tenure": "2-4 Years",
                "riskLevel": "Low",
                "status": "Active",
                "lastUpdated": datetime.now().strftime("%Y-%m-%d")
            },
            {
                "id": "SIP004",
                "name": "Tax Saver Fund",
                "minInvestment": "₹500",
                "tenure": "3 Years",
                "riskLevel": "Moderate",
                "status": "Active",
                "lastUpdated": datetime.now().strftime("%Y-%m-%d")
            },
            {
                "id": "SIP005",
                "name": "Mid Cap Fund",
                "minInvestment": "₹500",
                "tenure": "5-7 Years",
                "riskLevel": "High",
                "status": "Active",
                "lastUpdated": datetime.now().strftime("%Y-%m-%d")
            },
            {
                "id": "SIP006",
                "name": "Large Cap Fund",
                "minInvestment": "₹1000",
                "tenure": "3-5 Years",
                "riskLevel": "Moderate",
                "status": "Active",
                "lastUpdated": datetime.now().strftime("%Y-%m-%d")
            },
            {
                "id": "SIP007",
                "name": "Small Cap Fund",
                "minInvestment": "₹500",
                "tenure": "7-10 Years",
                "riskLevel": "Very High",
                "status": "Active",
                "lastUpdated": datetime.now().strftime("%Y-%m-%d")
            },
            {
                "id": "SIP008",
                "name": "Liquid Fund",
                "minInvestment": "₹500",
                "tenure": "1-3 Years",
                "riskLevel": "Low",
                "status": "Active",
                "lastUpdated": datetime.now().strftime("%Y-%m-%d")
            }
        ]
        
        # Calculate statistics for each plan from actual applications
        plan_stats = {}
        for sip in sip_applications.find():
            fund_name = sip.get("fundName", "Equity Growth Fund")
            if fund_name not in plan_stats:
                plan_stats[fund_name] = {
                    "customers": 0,
                    "totalValue": 0
                }
            
            plan_stats[fund_name]["customers"] += 1
            monthly = float(sip.get("monthlyInvestment", 0))
            duration_months = 12
            if "investmentDuration" in sip:
                duration_str = sip["investmentDuration"]
                if "month" in duration_str.lower():
                    duration_months = int(''.join(filter(str.isdigit, duration_str)) or "12")
            plan_stats[fund_name]["totalValue"] += monthly * duration_months
        
        # Merge statistics with standard plans
        plans_response = []
        for plan in standard_plans:
            fund_name = plan["name"]
            stats = plan_stats.get(fund_name, {"customers": 0, "totalValue": 0})
            
            total_value = stats["totalValue"]
            if total_value >= 10000000:  # Crore
                value_str = f"₹{total_value/10000000:.1f}Cr"
            elif total_value >= 100000:  # Lakh
                value_str = f"₹{total_value/100000:.1f}L"
            else:
                value_str = f"₹{total_value:,.0f}"
            
            # Calculate avg return based on risk level
            risk_to_return = {
                "Low": "+6.8%",
                "Moderate": "+11.2%",
                "High": "+14.5%",
                "Very High": "+18.5%"
            }
            
            plans_response.append({
                "id": plan["id"],
                "name": plan["name"],
                "customers": stats["customers"],
                "totalValue": value_str,
                "avgReturn": risk_to_return.get(plan["riskLevel"], "+12.5%"),
                "minInvestment": plan["minInvestment"],
                "tenure": plan["tenure"],
                "riskLevel": plan["riskLevel"],
                "status": plan["status"],
                "lastUpdated": plan["lastUpdated"]
            })
        
        return {
            "success": True,
            "plans": plans_response
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch SIP plans: {str(e)}"
        )


@router.get("/{investment_id}", response_model=dict)
def get_investment_details(
    investment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get details of a specific investment"""
    verify_admin(current_user)
    
    try:
        db = get_database()
        
        # Try to find in investments collection
        investment = db["investments"].find_one({"_id": ObjectId(investment_id)})
        if investment:
            user = db["users"].find_one({"email": investment.get("userEmail")})
            invested = float(investment.get("invested", 0))
            current = float(investment.get("current", 0))
            returns_pct = ((current - invested) / invested * 100) if invested > 0 else 0
            
            return {
                "success": True,
                "investment": {
                    "id": str(investment["_id"]),
                    "customer": user.get("fullName", "Unknown") if user else "Unknown",
                    "email": investment.get("userEmail"),
                    "phone": user.get("phone", "N/A") if user else "N/A",
                    "type": investment.get("type", "Mutual Funds"),
                    "fundName": investment.get("name", "Unknown Fund"),
                    "amount": f"₹{invested:,.0f}",
                    "totalInvested": f"₹{invested:,.0f}",
                    "currentValue": f"₹{current:,.0f}",
                    "returns": f"{'+' if returns_pct >= 0 else ''}{returns_pct:.1f}%",
                    "status": investment.get("status", "active").capitalize(),
                    "startDate": investment.get("startDate"),
                    "tenure": investment.get("tenure", "N/A"),
                    "documents": ["pan_card.pdf", "bank_statement.pdf"]
                }
            }
        
        # Try SIP applications
        sip = db["sip_applications"].find_one({"_id": ObjectId(investment_id)})
        if sip:
            user = find_user_by_id(db, sip.get("userId"))
            monthly = float(sip.get("monthlyInvestment", 0))
            
            return {
                "success": True,
                "investment": {
                    "id": str(sip["_id"]),
                    "customer": user.get("fullName", "Unknown") if user else "Unknown",
                    "email": user.get("email", "N/A") if user else "N/A",
                    "phone": user.get("phone", "N/A") if user else "N/A",
                    "type": "SIP",
                    "fundName": sip.get("fundName", "Equity Fund"),
                    "amount": f"₹{monthly:,.0f}/mo",
                    "totalInvested": f"₹{monthly * 12:,.0f}",
                    "returns": "+12.5%",
                    "status": sip.get("status", "Pending").capitalize(),
                    "startDate": sip.get("createdAt", datetime.now()).strftime("%Y-%m-%d") if isinstance(sip.get("createdAt"), datetime) else datetime.now().strftime("%Y-%m-%d"),
                    "tenure": sip.get("investmentDuration", "12 months"),
                    "documents": ["pan_card.pdf", "aadhaar.pdf"]
                }
            }
        
        # Try Mutual Fund applications
        mf = db["mutual_fund_applications"].find_one({"_id": ObjectId(investment_id)})
        if mf:
            user = find_user_by_id(db, mf.get("userId"))
            amount = float(mf.get("investmentAmount", 0))
            
            return {
                "success": True,
                "investment": {
                    "id": str(mf["_id"]),
                    "customer": user.get("fullName", "Unknown") if user else "Unknown",
                    "email": user.get("email", "N/A") if user else "N/A",
                    "phone": user.get("phone", "N/A") if user else "N/A",
                    "type": "Mutual Funds",
                    "fundName": mf.get("fundName", "Equity Growth Fund"),
                    "amount": f"₹{amount:,.0f}",
                    "totalInvested": f"₹{amount:,.0f}",
                    "returns": "+10.5%",
                    "status": mf.get("status", "Pending").capitalize(),
                    "startDate": mf.get("createdAt", datetime.now()).strftime("%Y-%m-%d") if isinstance(mf.get("createdAt"), datetime) else datetime.now().strftime("%Y-%m-%d"),
                    "tenure": mf.get("investmentDuration", "3 Years"),
                    "documents": ["pan_card.pdf", "bank_statement.pdf"]
                }
            }
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch investment details: {str(e)}"
        )


@router.put("/{investment_id}/status", response_model=dict)
def update_investment_status(
    investment_id: str,
    request: UpdateStatusRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update investment status (Active, Pending, Completed, Cancelled)"""
    verify_admin(current_user)
    
    allowed_statuses = ["Active", "Pending", "Completed", "Cancelled"]
    if request.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Allowed values: {', '.join(allowed_statuses)}"
        )
    
    try:
        db = get_database()
        
        # Try to update in investments collection
        result = db["investments"].update_one(
            {"_id": ObjectId(investment_id)},
            {"$set": {"status": request.status.lower()}}
        )
        if result.modified_count > 0:
            return {
                "success": True,
                "message": f"Investment status updated to {request.status}"
            }
        
        # Try SIP applications
        result = db["sip_applications"].update_one(
            {"_id": ObjectId(investment_id)},
            {"$set": {"status": request.status}}
        )
        if result.modified_count > 0:
            return {
                "success": True,
                "message": f"SIP status updated to {request.status}"
            }
        
        # Try Mutual Fund applications
        result = db["mutual_fund_applications"].update_one(
            {"_id": ObjectId(investment_id)},
            {"$set": {"status": request.status}}
        )
        if result.modified_count > 0:
            return {
                "success": True,
                "message": f"Mutual Fund status updated to {request.status}"
            }
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update investment status: {str(e)}"
        )


@router.get("/{investment_id}/documents", response_model=dict)
def get_investment_documents(
    investment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get documents for a specific investment from mutual funds or SIP applications"""
    verify_admin(current_user)
    
    try:
        from bson import ObjectId
        db = get_database()
        
        # Try to find in mutual_fund_applications
        app_id = None
        try:
            app_id = ObjectId(investment_id)
        except:
            pass
        
        documents = []
        
        # Search in mutual_fund_applications
        if app_id:
            mf_app = db["mutual_fund_applications"].find_one({"_id": app_id})
            if mf_app and "documents" in mf_app:
                docs = mf_app.get("documents", [])
                if docs:
                    for doc in docs:
                        if isinstance(doc, dict):
                            documents.append({
                                "id": doc.get("_id", f"doc_{len(documents)}"),
                                "name": doc.get("name", doc.get("filename", "Document")),
                                "filename": doc.get("filename", doc.get("name", "document")),
                                "uploadedAt": doc.get("uploadedAt", datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                                "size": doc.get("size", "N/A")
                            })
                        else:
                            # If doc is just a string (filename)
                            documents.append({
                                "id": f"doc_{len(documents)}",
                                "name": doc,
                                "filename": doc,
                                "uploadedAt": datetime.now().strftime("%Y-%m-%d"),
                                "size": "N/A"
                            })
            
            # If not found in mutual_fund_applications, search in sip_applications
            if not mf_app:
                sip_app = db["sip_applications"].find_one({"_id": app_id})
                if sip_app and "documents" in sip_app:
                    docs = sip_app.get("documents", [])
                    if docs:
                        for doc in docs:
                            if isinstance(doc, dict):
                                documents.append({
                                    "id": doc.get("_id", f"doc_{len(documents)}"),
                                    "name": doc.get("name", doc.get("filename", "Document")),
                                    "filename": doc.get("filename", doc.get("name", "document")),
                                    "uploadedAt": doc.get("uploadedAt", datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                                    "size": doc.get("size", "N/A")
                                })
                            else:
                                # If doc is just a string (filename)
                                documents.append({
                                    "id": f"doc_{len(documents)}",
                                    "name": doc,
                                    "filename": doc,
                                    "uploadedAt": datetime.now().strftime("%Y-%m-%d"),
                                    "size": "N/A"
                                })
        
        return {
            "success": True,
            "documents": documents
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch documents: {str(e)}"
        )
