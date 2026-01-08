from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class DateRange(str, Enum):
    """Enum for date range"""
    seven_days = "7days"
    thirty_days = "30days"
    ninety_days = "90days"
    one_year = "1year"
    custom = "custom"


class ReportType(str, Enum):
    """Enum for report types"""
    loan_report = "Loan Report"
    insurance_report = "Insurance Report"
    investment_report = "Investment Report"
    tax_report = "Tax Report"


class MetricsData(BaseModel):
    """Model for metrics data"""
    totalRevenue: str
    totalDisbursements: str
    activeCustomers: str
    avgTicketSize: str
    revenueChange: str
    disbursementChange: str
    customerChange: str
    ticketChange: str


class RevenueDataPoint(BaseModel):
    """Model for revenue data point"""
    month: str
    value: float
    label: str


class ProductData(BaseModel):
    """Model for product distribution data"""
    name: str
    value: float
    color: str
    percentage: str


class ReportData(BaseModel):
    """Model for complete report data for a date range"""
    revenue: List[RevenueDataPoint]
    metrics: MetricsData
    products: List[ProductData]


class AnalyticsResponse(BaseModel):
    """Model for analytics response with all data by date range"""
    dateRange: str
    data: ReportData
    generatedAt: datetime = Field(default_factory=datetime.now)


class ReportCategory(BaseModel):
    """Model for report category"""
    name: str
    icon: str
    gradient: str
    reports: List[str]


class RecentReport(BaseModel):
    """Model for recently generated reports"""
    id: int
    name: str
    type: str
    date: str
    size: str
    status: str
    downloadUrl: Optional[str] = None


class ReportMetadata(BaseModel):
    """Metadata for generated reports"""
    id: str
    name: str
    type: str
    dateRange: str
    format: str
    generatedAt: datetime
    generatedBy: str
    size: str
    status: str = "Completed"
    downloadUrl: Optional[str] = None


class ReportRequest(BaseModel):
    """Model for report generation request"""
    reportName: str
    dateRange: str = "30days"
    format: str = "pdf"  # pdf, csv, excel


class ReportFilter(BaseModel):
    """Model for filtering reports"""
    dateRange: str = "30days"
    type: Optional[str] = None
    status: Optional[str] = None


class LoanDistribution(BaseModel):
    """Loan distribution data"""
    type: str
    percentage: float
    amount: str
    color: str


class InsuranceDistribution(BaseModel):
    """Insurance distribution data"""
    type: str
    count: int
    percentage: float
    color: str


class InvestmentOverview(BaseModel):
    """Investment overview data"""
    name: str
    value: str
    growth: str
    color: str


class TaxPlanningOverview(BaseModel):
    """Tax planning overview data"""
    name: str
    value: str
    growth: str
    color: str


class DistributionChartData(BaseModel):
    """Model for distribution chart data"""
    loans: List[LoanDistribution]
    insurance: List[InsuranceDistribution]


class ExportRequest(BaseModel):
    """Model for export request"""
    format: str = "csv"  # csv, pdf, excel
    dateRange: str = "30days"
    includeCharts: bool = True


class CSVExportResponse(BaseModel):
    """Model for CSV export response"""
    content: str
    filename: str
    contentType: str = "text/csv"


class GeneratedReportInDB(BaseModel):
    """Database model for generated reports"""
    name: str
    type: str
    dateRange: str
    format: str
    filePath: str
    fileSize: int
    generatedBy: str
    generatedAt: datetime = Field(default_factory=datetime.now)
    status: str = "Completed"
    metadata: Optional[Dict[str, Any]] = None
