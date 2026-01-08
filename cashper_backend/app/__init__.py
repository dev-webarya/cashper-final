from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from contextlib import asynccontextmanager
import os
from pathlib import Path
import traceback
from app.database.db import connect_to_mongo, close_mongo_connection
from app.startup_migration import migrate_inquiry_status
from app.routes.auth_routes import router as auth_router
from app.routes.contact_routes import router as contact_router
from app.routes.about_routes import router as about_router
from app.routes.home_routes import router as home_router
from app.routes.financial_routes import router as financial_router
from app.routes.short_term_loan_routes import router as short_term_loan_router
from app.routes.personal_tax_routes import router as personal_tax_router
from app.routes.business_tax_routes import router as business_tax_router
from app.routes.mutual_funds_routes import router as mutual_funds_router
from app.routes.sip_routes import router as sip_router
from app.routes.health_insurance_routes import router as health_insurance_router
from app.routes.motor_insurance_routes import router as motor_insurance_router
from app.routes.term_insurance_routes import router as term_insurance_router
from app.routes.home_loan_routes import router as home_loan_router
from app.routes.business_loan_routes import router as business_loan_router
from app.routes.personal_loan_routes import router as personal_loan_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes.notification_routes import router as notification_router
from app.routes.settings_routes import router as settings_router
from app.routes.loan_management_routes import router as loan_management_router
from app.routes.investment_management_routes import router as investment_management_router
from app.routes.admin_routes import router as admin_router
from app.routes.admin_investment_routes import router as admin_investment_router
from app.routes.admin_insurance_management_routes import router as admin_insurance_management_router
from app.routes.admin_loan_management_routes import router as admin_loan_management_router
from app.routes.admin_reports_routes import router as admin_reports_router
from app.routes.retail_services_routes import router as retail_services_router
from app.routes.user_retail_services_routes import router as user_retail_services_router
from app.routes.business_services import router as business_services_router
from app.routes.applications.retail_applications import router as retail_applications_router
from app.routes.inquiry.corporate_inquiry import router as corporate_inquiry_router
from app.utils.file_upload import init_upload_directories


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    print("Starting up application...")
    try:
        connect_to_mongo()
        print("[+] Connected to MongoDB successfully!")
        print("Running inquiry status migration...")
        migrate_inquiry_status()
    except Exception as e:
        print(f"[ERROR] Startup error: {e}")
        import traceback
        traceback.print_exc()
    yield
    # Shutdown - graceful
    print("Shutting down application...")
    try:
        close_mongo_connection()
    except Exception as e:
        print(f"Error during shutdown: {e}")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Cashper API",
    description="Complete Backend API for Cashper - Personal Loan, Insurance & Investment Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url=None,
    openapi_url="/openapi.json",
    contact={
        "name": "Cashper Support",
        "email": "info@cashper.ai"
    },
    license_info={
        "name": "MIT"
    }
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler to catch and log all unhandled exceptions
    """
    print(f"\n{'='*60}")
    print(f"UNHANDLED EXCEPTION in {request.method} {request.url.path}")
    print(f"{'='*60}")
    print(f"Exception Type: {type(exc).__name__}")
    print(f"Exception Message: {str(exc)}")
    print(f"\nFull Traceback:")
    traceback.print_exc()
    print(f"{'='*60}\n")
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc),
            "type": type(exc).__name__
        }
    )

# Include routers
app.include_router(auth_router)  # Already has prefix="/api/auth"
app.include_router(contact_router)  # Already has prefix="/api/contact"
app.include_router(about_router)  # Already has prefix="/api/about"
app.include_router(home_router, prefix="/api")
app.include_router(financial_router)  # Routes already include /api prefix
app.include_router(short_term_loan_router)  # Already has prefix="/api/short-term-loan"
app.include_router(personal_tax_router)  # Already has prefix="/api/personal-tax"
app.include_router(business_tax_router)  # Already has prefix="/api/business-tax"
app.include_router(mutual_funds_router)  # Already has prefix="/api/mutual-funds"
app.include_router(sip_router)  # Already has prefix="/api/sip"
app.include_router(health_insurance_router, prefix="/api")  # Route prefix: /health-insurance
app.include_router(motor_insurance_router, prefix="/api")  # Route prefix: /motor-insurance
app.include_router(term_insurance_router, prefix="/api")  # Route prefix: /term-insurance
app.include_router(home_loan_router)  # Already has prefix="/api/home-loan"
app.include_router(business_loan_router)  # Already has prefix="/api/business-loan"
app.include_router(personal_loan_router)  # Already has prefix="/api/personal-loan"
app.include_router(dashboard_router)  # Already has prefix="/api/dashboard"
app.include_router(notification_router)  # Already has prefix="/api/notifications"
app.include_router(settings_router)  # Already has prefix="/api/settings"
app.include_router(loan_management_router)  # Already has prefix="/api/loan-management"
app.include_router(investment_management_router)  # Already has prefix="/api/investment-management"
app.include_router(admin_router)  # Already has prefix="/api/admin"
app.include_router(admin_investment_router)  # Already has prefix="/api/admin/investments"
app.include_router(admin_insurance_management_router, prefix="/api")  # Route prefix: /admin/insurance-management
app.include_router(admin_loan_management_router, prefix="/api")  # Route prefix: /admin/loan-management
app.include_router(admin_reports_router)  # Already has prefix="/api/admin/reports"
app.include_router(retail_services_router)  # Already has prefix="/api/retail-services"
app.include_router(user_retail_services_router)  # Already has prefix="/api/user/retail-services"
app.include_router(business_services_router)  # Already has prefix="/api/business-services"
app.include_router(retail_applications_router)  # Already has prefix="/api/applications"
app.include_router(corporate_inquiry_router)  # Already has prefix="/api/corporate-inquiry"

# Create uploads directory before mounting (if it doesn't exist)
init_upload_directories()

# Mount static files with absolute path
# Get the backend directory (parent of app/)
backend_dir = Path(__file__).parent.parent
uploads_path = backend_dir / "uploads"

print(f"[INFO] Backend directory: {backend_dir}")
print(f"[INFO] Uploads directory: {uploads_path}")
print(f"[INFO] Uploads exists: {uploads_path.exists()}")

# Mount static files (for serving uploaded files)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Also mount documents at /documents endpoint for backward compatibility
documents_path = uploads_path / "documents"
if documents_path.exists():
    app.mount("/documents", StaticFiles(directory=str(documents_path)), name="documents")


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "message": "Welcome to Cashper API",
        "status": "active",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json"
    }


@app.get("/redoc", include_in_schema=False)
async def custom_redoc():
    """Custom Redoc documentation page with proper CDN"""
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Cashper API - ReDoc</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
            }
        </style>
    </head>
    <body>
        <redoc spec-url='/openapi.json'></redoc>
        <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
    </body>
    </html>
    """)


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "cashper-backend"
    }