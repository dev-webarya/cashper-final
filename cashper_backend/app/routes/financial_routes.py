from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from app.database.schema.financial_schema import (
    FinancialServiceRequest,
    FinancialServiceResponse,
    FinancialProductRequest,
    FinancialProductResponse
)
from app.database.repository import financial_repository
from app.config import DISABLE_AUTH_FOR_TESTING

router = APIRouter()

# ===================== DASHBOARD AND PRODUCTS OVERVIEW =====================

@router.get("/api/financial/dashboard", tags=["Financial Overview"])
def get_financial_dashboard():
    """
    Get financial dashboard overview
    
    Returns summary of all financial services and quick stats
    """
    return {
        "services": {
            "loans": {
                "title": "Loans",
                "description": "Get instant loans with competitive interest rates",
                "icon": "banknote",
                "count": 4,
                "popular": ["Personal Loan", "Home Loan", "Business Loan"]
            },
            "insurance": {
                "title": "Insurance",
                "description": "Comprehensive insurance coverage",
                "icon": "shield",
                "count": 3,
                "popular": ["Health Insurance", "Motor Insurance", "Term Insurance"]
            },
            "investments": {
                "title": "Investments",
                "description": "Grow your wealth with smart investments",
                "icon": "trending-up",
                "count": 2,
                "popular": ["SIP", "Mutual Funds"]
            },
            "tax": {
                "title": "Tax Services",
                "description": "Expert tax planning and filing",
                "icon": "calculator",
                "count": 2,
                "popular": ["Personal Tax", "Business Tax"]
            }
        },
        "stats": {
            "customersServed": "50,000+",
            "loansDisbursed": "₹500+ Cr",
            "satisfactionRate": "98%",
            "partneredBanks": "25+"
        }
    }


@router.get("/api/financial/products", tags=["Financial Overview"])
def get_financial_products_overview():
    """
    Get all financial products overview
    
    Returns categorized list of all financial products
    """
    return {
        "categories": [
            {
                "id": "loans",
                "name": "Loans",
                "icon": "banknote",
                "products": [
                    {
                        "id": "personal-loan",
                        "name": "Personal Loan",
                        "description": "Quick personal loans up to ₹50 Lakhs",
                        "interestRate": "10.5% p.a. onwards",
                        "tenure": "Up to 5 years",
                        "processingTime": "24-48 hours"
                    },
                    {
                        "id": "home-loan",
                        "name": "Home Loan",
                        "description": "Finance your dream home",
                        "interestRate": "8.5% p.a. onwards",
                        "tenure": "Up to 30 years",
                        "processingTime": "48-72 hours"
                    },
                    {
                        "id": "business-loan",
                        "name": "Business Loan",
                        "description": "Fuel your business growth",
                        "interestRate": "9.5% p.a. onwards",
                        "tenure": "Up to 7 years",
                        "processingTime": "48 hours"
                    },
                    {
                        "id": "short-term-loan",
                        "name": "Short Term Loan",
                        "description": "Quick short term financing",
                        "interestRate": "12% p.a. onwards",
                        "tenure": "3-12 months",
                        "processingTime": "24 hours"
                    }
                ]
            },
            {
                "id": "insurance",
                "name": "Insurance",
                "icon": "shield",
                "products": [
                    {
                        "id": "health-insurance",
                        "name": "Health Insurance",
                        "description": "Comprehensive health coverage",
                        "coverage": "Up to ₹50 Lakhs",
                        "premium": "Starts at ₹500/month"
                    },
                    {
                        "id": "motor-insurance",
                        "name": "Motor Insurance",
                        "description": "Complete vehicle protection",
                        "coverage": "Comprehensive & Third Party",
                        "premium": "Starts at ₹2,500/year"
                    },
                    {
                        "id": "term-insurance",
                        "name": "Term Insurance",
                        "description": "Life cover for your family",
                        "coverage": "Up to ₹1 Crore",
                        "premium": "Starts at ₹500/month"
                    }
                ]
            },
            {
                "id": "investments",
                "name": "Investments",
                "icon": "trending-up",
                "products": [
                    {
                        "id": "sip",
                        "name": "Systematic Investment Plan (SIP)",
                        "description": "Invest regularly, grow steadily",
                        "minInvestment": "₹500/month",
                        "expectedReturn": "12-15% p.a."
                    },
                    {
                        "id": "mutual-funds",
                        "name": "Mutual Funds",
                        "description": "Diversified investment portfolios",
                        "minInvestment": "₹5,000",
                        "expectedReturn": "10-14% p.a."
                    }
                ]
            },
            {
                "id": "tax-services",
                "name": "Tax Services",
                "icon": "calculator",
                "products": [
                    {
                        "id": "personal-tax",
                        "name": "Personal Tax Planning",
                        "description": "Save tax legally",
                        "consultationFee": "Free"
                    },
                    {
                        "id": "business-tax",
                        "name": "Business Tax Services",
                        "description": "Complete tax compliance",
                        "consultationFee": "Free"
                    }
                ]
            }
        ]
    }

# ===================== FINANCIAL SERVICES ROUTES =====================

@router.get("/api/financial-services", response_model=List[FinancialServiceResponse], tags=["Financial Services"])
def get_all_services(
    active_only: bool = Query(True, description="Get only active services"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of records to return")
):
    """
    Get all financial services
    
    - **active_only**: Filter to get only active services (default: True)
    - **skip**: Number of records to skip for pagination
    - **limit**: Maximum number of records to return
    """
    try:
        services = financial_repository.get_all_financial_services(
            active_only=active_only,
            skip=skip,
            limit=limit
        )
        return services
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching financial services: {str(e)}"
        )

@router.get("/api/financial-services/{service_id}", response_model=FinancialServiceResponse, tags=["Financial Services"])
def get_service_by_id(service_id: str):
    """
    Get a specific financial service by ID
    
    - **service_id**: The ID of the service to retrieve
    """
    try:
        service = financial_repository.get_financial_service_by_id(service_id)
        
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Service with ID {service_id} not found"
            )
        
        return service
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching service: {str(e)}"
        )

@router.get("/api/financial-services/category/{category}", response_model=FinancialServiceResponse, tags=["Financial Services"])
def get_service_by_category(category: str):
    """
    Get a specific financial service by category
    
    - **category**: The category name (e.g., "Loans", "Insurance")
    """
    try:
        service = financial_repository.get_financial_service_by_category(category)
        
        if not service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Service with category '{category}' not found"
            )
        
        return service
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching service: {str(e)}"
        )

@router.post("/api/financial-services", response_model=FinancialServiceResponse, status_code=status.HTTP_201_CREATED, tags=["Financial Services"])
def create_service(service: FinancialServiceRequest):
    """
    Create a new financial service (Admin only)
    
    Requires authentication. Only accessible to admin users.
    """
    try:
        service_data = service.dict()
        # Convert ServiceItem objects to dicts
        service_data["items"] = [item.dict() for item in service.items]
        
        created_service = financial_repository.create_financial_service(service_data)
        
        # Convert _id to id for response
        created_service["id"] = str(created_service["_id"])
        del created_service["_id"]
        
        return created_service
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating service: {str(e)}"
        )

@router.put("/api/financial-services/{service_id}", response_model=FinancialServiceResponse, tags=["Financial Services"])
def update_service(service_id: str, service: FinancialServiceRequest):
    """
    Update a financial service (Admin only)
    
    Requires authentication. Only accessible to admin users.
    """
    try:
        service_data = service.dict()
        # Convert ServiceItem objects to dicts
        service_data["items"] = [item.dict() for item in service.items]
        
        updated_service = financial_repository.update_financial_service(service_id, service_data)
        
        if not updated_service:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Service with ID {service_id} not found"
            )
        
        return updated_service
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating service: {str(e)}"
        )

@router.delete("/api/financial-services/{service_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Financial Services"])
def delete_service(service_id: str):
    """
    Delete a financial service (Admin only)
    
    Requires authentication. Only accessible to admin users.
    """
    try:
        deleted = financial_repository.delete_financial_service(service_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Service with ID {service_id} not found"
            )
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting service: {str(e)}"
        )

# ===================== FINANCIAL PRODUCTS ROUTES =====================

@router.get("/api/financial-products", response_model=List[FinancialProductResponse], tags=["Financial Products"])
def get_all_products(
    active_only: bool = Query(True, description="Get only active products"),
    product_type: Optional[str] = Query(None, description="Filter by product type (loan, insurance, investment, tax)"),
    featured_only: bool = Query(False, description="Get only featured products"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of records to return")
):
    """
    Get all financial products with optional filters
    
    - **active_only**: Filter to get only active products (default: True)
    - **product_type**: Filter by product type (loan, insurance, investment, tax)
    - **featured_only**: Get only featured products
    - **skip**: Number of records to skip for pagination
    - **limit**: Maximum number of records to return
    """
    try:
        products = financial_repository.get_all_financial_products(
            active_only=active_only,
            product_type=product_type,
            featured_only=featured_only,
            skip=skip,
            limit=limit
        )
        return products
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching financial products: {str(e)}"
        )

@router.get("/api/financial-products/{product_id}", response_model=FinancialProductResponse, tags=["Financial Products"])
def get_product_by_id(product_id: str):
    """
    Get a specific financial product by ID
    
    - **product_id**: The ID of the product to retrieve
    """
    try:
        product = financial_repository.get_financial_product_by_id(product_id)
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching product: {str(e)}"
        )

@router.get("/api/financial-products/type/{product_type}", response_model=List[FinancialProductResponse], tags=["Financial Products"])
def get_products_by_type(
    product_type: str,
    active_only: bool = Query(True, description="Get only active products")
):
    """
    Get financial products by type
    
    - **product_type**: The type of products to retrieve (loan, insurance, investment, tax)
    - **active_only**: Filter to get only active products
    """
    try:
        products = financial_repository.get_financial_products_by_type(
            product_type=product_type,
            active_only=active_only
        )
        return products
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching products: {str(e)}"
        )

@router.post("/api/financial-products", response_model=FinancialProductResponse, status_code=status.HTTP_201_CREATED, tags=["Financial Products"])
def create_product(product: FinancialProductRequest):
    """
    Create a new financial product (Admin only)
    
    Requires authentication. Only accessible to admin users.
    """
    try:
        product_data = product.dict()
        created_product = financial_repository.create_financial_product(product_data)
        
        # Convert _id to id for response
        created_product["id"] = str(created_product["_id"])
        del created_product["_id"]
        
        return created_product
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating product: {str(e)}"
        )

@router.put("/api/financial-products/{product_id}", response_model=FinancialProductResponse, tags=["Financial Products"])
def update_product(product_id: str, product: FinancialProductRequest):
    """
    Update a financial product (Admin only)
    
    Requires authentication. Only accessible to admin users.
    """
    try:
        product_data = product.dict()
        updated_product = financial_repository.update_financial_product(product_id, product_data)
        
        if not updated_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        
        return updated_product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating product: {str(e)}"
        )

@router.delete("/api/financial-products/{product_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Financial Products"])
def delete_product(product_id: str):
    """
    Delete a financial product (Admin only)
    
    Requires authentication. Only accessible to admin users.
    """
    try:
        deleted = financial_repository.delete_financial_product(product_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting product: {str(e)}"
        )

@router.post("/api/financial-products/{product_id}/view", tags=["Financial Products"])
def increment_product_views(product_id: str):
    """
    Increment the view count for a product
    
    - **product_id**: The ID of the product to increment views
    """
    try:
        success = financial_repository.increment_product_views(product_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        
        return {"message": "Views incremented successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error incrementing views: {str(e)}"
        )

# ===================== STATISTICS ROUTES =====================

@router.get("/api/financial-stats", tags=["Statistics"])
def get_financial_statistics():
    
    """
    Get statistics about financial services and products
    
    Returns counts and breakdowns of services and products
    """
    try:
        services_count = financial_repository.get_financial_services_count()
        products_count = financial_repository.get_financial_products_count()
        products_by_type = financial_repository.get_products_by_type_stats()
        
        return {
            "services": {
                "total": services_count
            },
            "products": {
                "total": products_count,
                "by_type": products_by_type
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching statistics: {str(e)}"
        )