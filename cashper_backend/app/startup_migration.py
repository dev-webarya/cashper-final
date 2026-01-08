#!/usr/bin/env python3
"""
Startup migration script to ensure all inquiry records have a status field
This runs every time the server starts to fill in missing status fields
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.db import get_database
from datetime import datetime

def migrate_inquiry_status():
    """
    Migrate all inquiry collections to ensure they have status field
    Called on application startup
    """
    try:
        db = get_database()
        if db is None:
            print("Database not available for migration")
            return
        
        # List of all inquiry collections
        inquiry_collections = [
            "short_term_loan_get_in_touch",
            "personal_loan_get_in_touch",
            "business_loan_get_in_touch",
            "home_loan_get_in_touch",
            "term_insurance_inquiries",
            "motor_insurance_inquiries",
            "health_insurance_inquiries",
            "sip_inquiries",
            "mutual_funds_inquiries",
            "short_term_get_in_touch"
        ]
        
        for collection_name in inquiry_collections:
            try:
                collection = db[collection_name]
                
                # Check if collection has documents
                doc_count = collection.count_documents({})
                if doc_count == 0:
                    continue
                
                # Update all documents without status field
                result = collection.update_many(
                    {"status": {"$exists": False}},
                    {
                        "$set": {
                            "status": "pending",
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                
                if result.modified_count > 0:
                    print(f"✓ {collection_name}: Updated {result.modified_count} documents with status=pending")
                
                # Log status distribution
                total = collection.count_documents({})
                pending = collection.count_documents({"status": "pending"})
                confirmed = collection.count_documents({"status": "confirmed"})
                completed = collection.count_documents({"status": "completed"})
                cancelled = collection.count_documents({"status": "cancelled"})
                
                if total > 0:
                    print(f"  {collection_name}: Total={total}, Pending={pending}, Confirmed={confirmed}, Completed={completed}, Cancelled={cancelled}")
                    
            except Exception as e:
                # Collection might not exist, which is fine
                pass
                
        print("\n[OK] Inquiry status migration complete")
        
    except Exception as e:
        print(f"[ERROR] Migration error: {e}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(migrate_inquiry_status())