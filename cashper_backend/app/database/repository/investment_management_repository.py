from app.database.db import get_database
from bson import ObjectId
from datetime import datetime, timedelta
import random

def get_collections():
    db = get_database()
    return db["investments"], db["investment_transactions"]

def get_portfolio_summary(user_email: str):
    """Get portfolio summary for a user"""
    try:
        investments_collection, investment_transactions_collection = get_collections()
        investments = list(investments_collection.find({"userEmail": user_email, "status": "active"}))
        
        if not investments:
            return {
                "totalInvested": 0,
                "totalCurrent": 0,
                "totalReturns": 0,
                "returnsPercentage": 0
            }
        
        total_invested = sum(inv.get("invested", 0) for inv in investments)
        total_current = sum(inv.get("current", 0) for inv in investments)
        total_returns = total_current - total_invested
        returns_percentage = (total_returns / total_invested * 100) if total_invested > 0 else 0
        
        return {
            "totalInvested": total_invested,
            "totalCurrent": total_current,
            "totalReturns": total_returns,
            "returnsPercentage": round(returns_percentage, 2)
        }
    except Exception as e:
        print(f"Error getting portfolio summary: {str(e)}")
        return None

def get_active_investments(user_email: str):
    """Get all active investments for a user"""
    try:
        investments_collection, investment_transactions_collection = get_collections()
        investments = list(investments_collection.find({"userEmail": user_email, "status": "active"}))
        
        result = []
        for inv in investments:
            result.append({
                "id": str(inv["_id"]),
                "name": inv.get("name", ""),
                "type": inv.get("type", ""),
                "invested": inv.get("invested", 0),
                "current": inv.get("current", 0),
                "returns": inv.get("returns", 0),
                "returnsType": inv.get("returnsType", "positive"),
                "sipAmount": inv.get("sipAmount", 0),
                "nextSIP": inv.get("nextSIP", ""),
                "nav": inv.get("nav", 0),
                "units": inv.get("units", 0),
                "startDate": inv.get("startDate", ""),
                "exitLoad": inv.get("exitLoad", ""),
                "riskLevel": inv.get("riskLevel", ""),
                "fundManager": inv.get("fundManager", ""),
                "aum": inv.get("aum", "")
            })
        
        return result
    except Exception as e:
        print(f"Error getting active investments: {str(e)}")
        return None

def get_investment_details(investment_id: str, user_email: str):
    """Get details of a specific investment"""
    try:
        investments_collection, investment_transactions_collection = get_collections()
        investment = investments_collection.find_one({
            "_id": ObjectId(investment_id),
            "userEmail": user_email
        })
        
        if not investment:
            return None
        
        return {
            "id": str(investment["_id"]),
            "name": investment.get("name", ""),
            "type": investment.get("type", ""),
            "invested": investment.get("invested", 0),
            "current": investment.get("current", 0),
            "returns": investment.get("returns", 0),
            "returnsType": investment.get("returnsType", "positive"),
            "sipAmount": investment.get("sipAmount", 0),
            "nextSIP": investment.get("nextSIP", ""),
            "nav": investment.get("nav", 0),
            "units": investment.get("units", 0),
            "startDate": investment.get("startDate", ""),
            "exitLoad": investment.get("exitLoad", ""),
            "riskLevel": investment.get("riskLevel", ""),
            "fundManager": investment.get("fundManager", ""),
            "aum": investment.get("aum", "")
        }
    except Exception as e:
        print(f"Error getting investment details: {str(e)}")
        return None

def process_invest_more(investment_id: str, amount: float, user_email: str):
    """Process additional investment in an existing fund"""
    try:
        investments_collection, investment_transactions_collection = get_collections()
        investment = investments_collection.find_one({
            "_id": ObjectId(investment_id),
            "userEmail": user_email
        })
        
        if not investment:
            return None
        
        # Calculate new units based on current NAV
        new_units = amount / investment.get("nav", 1)
        
        # Update investment
        new_invested = investment.get("invested", 0) + amount
        new_units_total = investment.get("units", 0) + new_units
        # Assume current value increases by the invested amount (will be updated by market)
        new_current = investment.get("current", 0) + amount
        new_returns = ((new_current - new_invested) / new_invested * 100) if new_invested > 0 else 0
        
        investments_collection.update_one(
            {"_id": ObjectId(investment_id)},
            {
                "$set": {
                    "invested": new_invested,
                    "units": round(new_units_total, 2),
                    "current": new_current,
                    "returns": round(new_returns, 2),
                    "returnsType": "positive" if new_returns >= 0 else "negative"
                }
            }
        )
        
        # Create transaction record
        transaction_id = str(ObjectId())
        transaction = {
            "_id": ObjectId(transaction_id),
            "userEmail": user_email,
            "type": "Lumpsum Investment",
            "fund": investment.get("name", ""),
            "amount": amount,
            "date": datetime.now().strftime("%b %d, %Y"),
            "status": "completed",
            "investmentId": str(investment_id),
            "createdAt": datetime.now()
        }
        investment_transactions_collection.insert_one(transaction)
        
        return {
            "success": True,
            "message": f"Investment successful! ₹{amount:,.0f} added to {investment.get('name', '')}",
            "transactionId": transaction_id
        }
    except Exception as e:
        print(f"Error processing invest more: {str(e)}")
        return None

def process_redemption(investment_id: str, amount: float, user_email: str):
    """Process redemption request"""
    try:
        investments_collection, investment_transactions_collection = get_collections()
        investment = investments_collection.find_one({
            "_id": ObjectId(investment_id),
            "userEmail": user_email
        })
        
        if not investment:
            return None
        
        current_value = investment.get("current", 0)
        if amount > current_value:
            return {
                "success": False,
                "message": f"Redemption amount cannot exceed current value of ₹{current_value:,.0f}"
            }
        
        # Calculate units to redeem
        nav = investment.get("nav", 1)
        units_to_redeem = amount / nav
        
        # Update investment
        new_current = current_value - amount
        new_units = investment.get("units", 0) - units_to_redeem
        invested = investment.get("invested", 0)
        # Proportionally reduce invested amount
        new_invested = invested * (new_current / current_value) if current_value > 0 else 0
        
        new_returns = ((new_current - new_invested) / new_invested * 100) if new_invested > 0 else 0
        
        update_data = {
            "current": new_current,
            "units": round(new_units, 2),
            "invested": new_invested,
            "returns": round(new_returns, 2),
            "returnsType": "positive" if new_returns >= 0 else "negative"
        }
        
        # If fully redeemed, mark as inactive
        if new_current <= 0:
            update_data["status"] = "redeemed"
        
        investments_collection.update_one(
            {"_id": ObjectId(investment_id)},
            {"$set": update_data}
        )
        
        # Create transaction record
        transaction_id = str(ObjectId())
        transaction = {
            "_id": ObjectId(transaction_id),
            "userEmail": user_email,
            "type": "Redemption",
            "fund": investment.get("name", ""),
            "amount": amount,
            "date": datetime.now().strftime("%b %d, %Y"),
            "status": "completed",
            "investmentId": str(investment_id),
            "createdAt": datetime.now()
        }
        investment_transactions_collection.insert_one(transaction)
        
        exit_load_applicable = investment.get("exitLoad", "Nil") != "Nil"
        
        return {
            "success": True,
            "message": f"Redemption request submitted! ₹{amount:,.0f} will be credited in 2-3 business days",
            "transactionId": transaction_id,
            "exitLoadApplicable": exit_load_applicable,
            "processingDays": "2-3 business days"
        }
    except Exception as e:
        print(f"Error processing redemption: {str(e)}")
        return None

def get_recent_transactions(user_email: str, limit: int = 10):
    """Get recent investment transactions"""
    try:
        investments_collection, investment_transactions_collection = get_collections()
        transactions = list(
            investment_transactions_collection.find({"userEmail": user_email})
            .sort("createdAt", -1)
            .limit(limit)
        )
        
        result = []
        for txn in transactions:
            result.append({
                "id": str(txn["_id"]),
                "type": txn.get("type", ""),
                "fund": txn.get("fund", ""),
                "amount": txn.get("amount", 0),
                "date": txn.get("date", ""),
                "status": txn.get("status", "pending")
            })
        
        return result
    except Exception as e:
        print(f"Error getting transactions: {str(e)}")
        return None

def export_transactions(user_email: str):
    """Export all transactions for a user"""
    try:
        investments_collection, investment_transactions_collection = get_collections()
        transactions = list(
            investment_transactions_collection.find({"userEmail": user_email})
            .sort("createdAt", -1)
        )
        
        result = []
        for txn in transactions:
            result.append({
                "id": str(txn["_id"]),
                "type": txn.get("type", ""),
                "fund": txn.get("fund", ""),
                "amount": txn.get("amount", 0),
                "date": txn.get("date", ""),
                "status": txn.get("status", "pending"),
                "createdAt": txn.get("createdAt", "").isoformat() if isinstance(txn.get("createdAt"), datetime) else ""
            })
        
        return result
    except Exception as e:
        print(f"Error exporting transactions: {str(e)}")
        return None
