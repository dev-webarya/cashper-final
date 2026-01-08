from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Response Models
class InvestmentItem(BaseModel):
    id: str
    name: str
    type: str  # Mutual Fund or SIP
    invested: float
    current: float
    returns: float
    returnsType: str  # positive or negative
    sipAmount: float
    nextSIP: str
    nav: float
    units: float
    startDate: str
    exitLoad: str
    riskLevel: str  # High, Moderate, Low
    fundManager: str
    aum: str

class PortfolioSummaryResponse(BaseModel):
    totalInvested: float
    totalCurrent: float
    totalReturns: float
    returnsPercentage: float

class InvestmentsResponse(BaseModel):
    success: bool
    data: List[InvestmentItem]

class Transaction(BaseModel):
    id: str
    type: str  # SIP Investment, Redemption, Lumpsum Investment
    fund: str
    amount: float
    date: str
    status: str  # completed, pending

class TransactionsResponse(BaseModel):
    success: bool
    data: List[Transaction]

# Request Models
class InvestMoreRequest(BaseModel):
    investmentId: str
    amount: float = Field(..., gt=0, description="Investment amount must be greater than 0")

class RedeemRequest(BaseModel):
    investmentId: str
    amount: float = Field(..., gt=0, description="Redemption amount must be greater than 0")

class InvestMoreResponse(BaseModel):
    success: bool
    message: str
    transactionId: Optional[str] = None

class RedeemResponse(BaseModel):
    success: bool
    message: str
    transactionId: Optional[str] = None
    exitLoadApplicable: bool
    processingDays: str

class InvestmentDetailsResponse(BaseModel):
    success: bool
    data: InvestmentItem
