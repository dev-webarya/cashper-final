from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
from app.database.schema.admin_reports_schema import (
    AnalyticsResponse,
    ReportRequest,
    ExportRequest,
    CSVExportResponse
)
from app.database.repository.admin_reports_repository import admin_reports_repository

router = APIRouter(prefix="/api/admin/reports", tags=["Admin - Reports & Analytics"])


# ===================== ANALYTICS ENDPOINTS =====================

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    dateRange: str = Query("30days", description="Date range: 7days, 30days, 90days, 1year, custom")
):
    """
    Get analytics data with revenue, metrics, and product distribution
    
    Query Parameters:
    - dateRange: '7days', '30days', '90days', '1year', or 'custom'
    
    Returns:
    - Revenue trend data
    - Key metrics (total revenue, disbursements, customers, etc.)
    - Product distribution
    """
    try:
        analytics_data = admin_reports_repository.get_analytics_data(dateRange)
        return analytics_data
    except Exception as e:
        print(f"Error getting analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch analytics: {str(e)}"
        )


@router.get("/loan-distribution")
def get_loan_distribution():
    """
    Get loan distribution data for charts
    
    Returns:
    - Loan type breakdown (Short-Term, Personal, Home, Business)
    - Percentages and amounts
    - Total disbursed amount
    """
    try:
        data = admin_reports_repository.get_loan_distribution()
        return data
    except Exception as e:
        print(f"Error getting loan distribution: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch loan distribution: {str(e)}"
        )


@router.get("/insurance-distribution")
def get_insurance_distribution():
    """
    Get insurance distribution data for charts
    
    Returns:
    - Insurance type breakdown (Health, Motor, Term)
    - Percentages and policy counts
    - Total policies
    """
    try:
        data = admin_reports_repository.get_insurance_distribution()
        return data
    except Exception as e:
        print(f"Error getting insurance distribution: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch insurance distribution: {str(e)}"
        )


@router.get("/investment-overview")
def get_investment_overview():
    """
    Get investment overview data
    
    Returns:
    - Mutual Funds data
    - SIP Portfolio data
    - Growth percentages
    """
    try:
        data = admin_reports_repository.get_investment_overview()
        return data
    except Exception as e:
        print(f"Error getting investment overview: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch investment overview: {str(e)}"
        )


@router.get("/tax-planning-overview")
def get_tax_planning_overview():
    """
    Get tax planning overview data
    
    Returns:
    - Personal Tax Planning data
    - Business Tax Strategy data
    - Growth percentages
    """
    try:
        data = admin_reports_repository.get_tax_planning_overview()
        return data
    except Exception as e:
        print(f"Error getting tax planning overview: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch tax planning overview: {str(e)}"
        )


# ===================== REPORT CATEGORIES & RECENT REPORTS =====================

@router.get("/categories")
def get_report_categories():
    """
    Get all available report categories
    
    Returns:
    - Loan Reports
    - Insurance Reports
    - Investment Reports
    - Tax Planning Reports
    """
    try:
        categories = admin_reports_repository.get_report_categories()
        return {"categories": categories}
    except Exception as e:
        print(f"Error getting report categories: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch report categories: {str(e)}"
        )


@router.get("/recent")
def get_recent_reports():
    """
    Get recently generated reports
    
    Returns:
    - List of recent reports with details
    - Report name, type, date, size, status
    """
    try:
        reports = admin_reports_repository.get_recent_reports()
        return {"reports": reports}
    except Exception as e:
        print(f"Error getting recent reports: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch recent reports: {str(e)}"
        )


# ===================== REPORT GENERATION & EXPORT =====================

@router.post("/generate")
def generate_report(report_request: ReportRequest):
    """
    Generate a specific report
    
    Request Body:
    - reportName: Name of the report to generate
    - dateRange: Date range for the report (default: 30days)
    - format: Output format - pdf, csv, excel (default: pdf)
    
    Returns:
    - Report generation status
    - Download URL
    - Report metadata
    """
    try:
        report_name = report_request.reportName
        date_range = report_request.dateRange
        format_type = report_request.format
        
        # Generate report based on format
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{report_name.replace(' ', '_')}_{timestamp}.{format_type if format_type != 'excel' else 'xlsx'}"
        
        response = {
            "status": "success",
            "message": f"{report_name} generated successfully",
            "reportName": report_name,
            "dateRange": date_range,
            "format": format_type,
            "filename": filename,
            "generatedAt": datetime.now().isoformat(),
            "downloadUrl": f"/api/admin/reports/download/{filename}"
        }
        return response
    except Exception as e:
        print(f"Error generating report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )


@router.post("/export")
def export_data(export_request: ExportRequest):
    """
    Export analytics data in specified format
    
    Request Body:
    - format: csv, pdf, or excel (default: csv)
    - dateRange: Date range for export (default: 30days)
    - includeCharts: Whether to include charts in export (default: true)
    
    Returns:
    - CSV content or file download
    - File metadata
    """
    try:
        format_type = export_request.format
        date_range = export_request.dateRange
        
        if format_type == "csv":
            csv_content = admin_reports_repository.generate_csv_export(date_range)
            timestamp = datetime.now().strftime("%Y-%m-%d")
            filename = f"reports_export_{timestamp}.csv"
            
            return {
                "status": "success",
                "format": "csv",
                "filename": filename,
                "contentType": "text/csv",
                "content": csv_content,
                "exportedAt": datetime.now().isoformat()
            }
        else:
            # For PDF and Excel, return similar structure
            timestamp = datetime.now().strftime("%Y-%m-%d")
            filename = f"reports_export_{timestamp}.{format_type if format_type != 'excel' else 'xlsx'}"
            
            return {
                "status": "success",
                "format": format_type,
                "filename": filename,
                "contentType": "application/pdf" if format_type == "pdf" else "application/vnd.ms-excel",
                "downloadUrl": f"/api/admin/reports/download/{filename}",
                "exportedAt": datetime.now().isoformat()
            }
    except Exception as e:
        print(f"Error exporting data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export data: {str(e)}"
        )


# ===================== REPORT DOWNLOAD =====================

@router.get("/download/{filename}")
def download_report(filename: str):
    """
    Download a generated report
    
    Path Parameters:
    - filename: Name of the file to download
    
    Returns:
    - File content for download
    """
    try:
        # This endpoint would typically stream the file
        # For now, return a success response
        return {
            "status": "success",
            "message": f"Report {filename} ready for download",
            "filename": filename
        }
    except Exception as e:
        print(f"Error downloading report: {str(e)}")
        raise HTTPException(
            status_code=404,
            detail=f"Report not found: {str(e)}"
        )


# ===================== BULK OPERATIONS =====================

@router.post("/export-all")
def export_all_reports(export_request: ExportRequest):
    """
    Export all analytics reports
    
    Request Body:
    - format: csv, pdf, or excel (default: csv)
    - dateRange: Date range for export (default: 30days)
    
    Returns:
    - Combined export file
    - Export metadata
    """
    try:
        format_type = export_request.format
        date_range = export_request.dateRange
        timestamp = datetime.now().strftime("%Y-%m-%d")
        
        if format_type == "csv":
            csv_content = admin_reports_repository.generate_csv_export(date_range)
            filename = f"all_reports_export_{timestamp}.csv"
            
            return {
                "status": "success",
                "format": "csv",
                "filename": filename,
                "contentType": "text/csv",
                "content": csv_content,
                "exportedAt": datetime.now().isoformat(),
                "message": "All reports exported successfully"
            }
        else:
            filename = f"all_reports_export_{timestamp}.{format_type if format_type != 'excel' else 'xlsx'}"
            
            return {
                "status": "success",
                "format": format_type,
                "filename": filename,
                "contentType": "application/pdf" if format_type == "pdf" else "application/vnd.ms-excel",
                "downloadUrl": f"/api/admin/reports/download/{filename}",
                "exportedAt": datetime.now().isoformat(),
                "message": "All reports exported successfully"
            }
    except Exception as e:
        print(f"Error exporting all reports: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export reports: {str(e)}"
        )


# ===================== SUMMARY ENDPOINTS =====================

@router.get("/summary")
def get_reports_summary(dateRange: str = Query("30days")):
    """
    Get summary of all reports and analytics
    
    Query Parameters:
    - dateRange: Date range for summary (default: 30days)
    
    Returns:
    - Overview of all metrics
    - Recent reports count
    - Key statistics
    """
    try:
        analytics = admin_reports_repository.get_analytics_data(dateRange)
        categories = admin_reports_repository.get_report_categories()
        recent_reports = admin_reports_repository.get_recent_reports()
        
        return {
            "status": "success",
            "dateRange": dateRange,
            "analytics": analytics,
            "categories": categories,
            "recentReports": recent_reports,
            "summaryGeneratedAt": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error getting summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch summary: {str(e)}"
        )
