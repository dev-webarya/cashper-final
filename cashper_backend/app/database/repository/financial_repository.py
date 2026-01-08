from datetime import datetime, timezone
from bson import ObjectId
from typing import List, Optional, Dict, Any
from app.database.db import get_database

# ===================== FINANCIAL SERVICES REPOSITORY =====================

def create_financial_service(service_data: dict) -> dict:
    """Create a new financial service"""
    db = get_database()
    collection = db["financial_services"]
    
    # Check if service with same category already exists
    existing = collection.find_one({"category": service_data["category"]})
    if existing:
        raise ValueError(f"Service with category '{service_data['category']}' already exists")
    
    service_data["createdAt"] = datetime.now(timezone.utc)
    service_data["updatedAt"] = None
    
    result = collection.insert_one(service_data)
    service_data["_id"] = result.inserted_id
    
    return service_data

def get_all_financial_services(active_only: bool = True, skip: int = 0, limit: int = 100) -> List[dict]:
    """Get all financial services with pagination"""
    db = get_database()
    collection = db["financial_services"]
    
    query = {"isActive": True} if active_only else {}
    
    cursor = collection.find(query).sort("order", 1).skip(skip).limit(limit)
    services = list(cursor)
    
    # Convert ObjectId to string
    for service in services:
        service["id"] = str(service["_id"])
        del service["_id"]
    
    return services

def get_financial_service_by_id(service_id: str) -> Optional[dict]:
    """Get a specific financial service by ID"""
    db = get_database()
    collection = db["financial_services"]
    
    if not ObjectId.is_valid(service_id):
        return None
    
    service = collection.find_one({"_id": ObjectId(service_id)})
    
    if service:
        service["id"] = str(service["_id"])
        del service["_id"]
    
    return service

def get_financial_service_by_category(category: str) -> Optional[dict]:
    """Get a specific financial service by category"""
    db = get_database()
    collection = db["financial_services"]
    
    service = collection.find_one({"category": category})
    
    if service:
        service["id"] = str(service["_id"])
        del service["_id"]
    
    return service

def update_financial_service(service_id: str, update_data: dict) -> Optional[dict]:
    """Update a financial service"""
    db = get_database()
    collection = db["financial_services"]
    
    if not ObjectId.is_valid(service_id):
        return None
    
    # Add updated timestamp
    update_data["updatedAt"] = datetime.now(timezone.utc)
    
    result = collection.find_one_and_update(
        {"_id": ObjectId(service_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if result:
        result["id"] = str(result["_id"])
        del result["_id"]
    
    return result

def delete_financial_service(service_id: str) -> bool:
    """Delete a financial service"""
    db = get_database()
    collection = db["financial_services"]
    
    if not ObjectId.is_valid(service_id):
        return False
    
    result = collection.delete_one({"_id": ObjectId(service_id)})
    return result.deleted_count > 0

# ===================== FINANCIAL PRODUCTS REPOSITORY =====================

def create_financial_product(product_data: dict) -> dict:
    """Create a new financial product"""
    db = get_database()
    collection = db["financial_products"]
    
    product_data["createdAt"] = datetime.now(timezone.utc)
    product_data["updatedAt"] = None
    product_data["views"] = 0
    
    result = collection.insert_one(product_data)
    product_data["_id"] = result.inserted_id
    
    return product_data

def get_all_financial_products(
    active_only: bool = True,
    product_type: Optional[str] = None,
    featured_only: bool = False,
    skip: int = 0,
    limit: int = 100
) -> List[dict]:
    """Get all financial products with filters and pagination"""
    db = get_database()
    collection = db["financial_products"]
    
    query = {}
    
    if active_only:
        query["isActive"] = True
    
    if product_type:
        query["type"] = product_type.lower()
    
    if featured_only:
        query["isFeatured"] = True
    
    cursor = collection.find(query).sort("order", 1).skip(skip).limit(limit)
    products = list(cursor)
    
    # Convert ObjectId to string
    for product in products:
        product["id"] = str(product["_id"])
        del product["_id"]
    
    return products

def get_financial_product_by_id(product_id: str) -> Optional[dict]:
    """Get a specific financial product by ID"""
    db = get_database()
    collection = db["financial_products"]
    
    if not ObjectId.is_valid(product_id):
        return None
    
    product = collection.find_one({"_id": ObjectId(product_id)})
    
    if product:
        product["id"] = str(product["_id"])
        del product["_id"]
    
    return product

def get_financial_products_by_type(product_type: str, active_only: bool = True) -> List[dict]:
    """Get financial products by type"""
    db = get_database()
    collection = db["financial_products"]
    
    query = {"type": product_type.lower()}
    if active_only:
        query["isActive"] = True
    
    cursor = collection.find(query).sort("order", 1)
    products = list(cursor)
    
    # Convert ObjectId to string
    for product in products:
        product["id"] = str(product["_id"])
        del product["_id"]
    
    return products

def update_financial_product(product_id: str, update_data: dict) -> Optional[dict]:
    """Update a financial product"""
    db = get_database()
    collection = db["financial_products"]
    
    if not ObjectId.is_valid(product_id):
        return None
    
    # Add updated timestamp
    update_data["updatedAt"] = datetime.now(timezone.utc)
    
    result = collection.find_one_and_update(
        {"_id": ObjectId(product_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if result:
        result["id"] = str(result["_id"])
        del result["_id"]
    
    return result

def delete_financial_product(product_id: str) -> bool:
    """Delete a financial product"""
    db = get_database()
    collection = db["financial_products"]
    
    if not ObjectId.is_valid(product_id):
        return False
    
    result = collection.delete_one({"_id": ObjectId(product_id)})
    return result.deleted_count > 0

def increment_product_views(product_id: str) -> bool:
    """Increment views count for a product"""
    db = get_database()
    collection = db["financial_products"]
    
    if not ObjectId.is_valid(product_id):
        return False
    
    result = collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$inc": {"views": 1}}
    )
    
    return result.modified_count > 0

# ===================== STATISTICS =====================

def get_financial_services_count(active_only: bool = True) -> int:
    """Get total count of financial services"""
    db = get_database()
    collection = db["financial_services"]
    
    query = {"isActive": True} if active_only else {}
    return collection.count_documents(query)

def get_financial_products_count(active_only: bool = True, product_type: Optional[str] = None) -> int:
    """Get total count of financial products"""
    db = get_database()
    collection = db["financial_products"]
    
    query = {}
    if active_only:
        query["isActive"] = True
    if product_type:
        query["type"] = product_type.lower()
    
    return collection.count_documents(query)

def get_products_by_type_stats() -> Dict[str, int]:
    """Get count of products grouped by type"""
    db = get_database()
    collection = db["financial_products"]
    
    pipeline = [
        {"$match": {"isActive": True}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}}
    ]
    
    result = list(collection.aggregate(pipeline))
    
    stats = {item["_id"]: item["count"] for item in result}
    return stats
