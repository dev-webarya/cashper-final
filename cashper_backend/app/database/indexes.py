from app.database.db import get_database
from pymongo import ASCENDING

def ensure_indexes():
    """
    Ensure all necessary indexes exist in the database.
    This should be called on application startup.
    """
    try:
        db = get_database()
        print("[+] Checking database indexes...")

        # List of collections and fields to index
        indexes_to_create = {
            "users": ["email"],
            "personal_loans": ["userId"],
            "personal_loan_applications": ["userId", "status"],
            "sip_inquiries": ["userId"],
            "health_insurance_inquiries": ["userId"],
            "motor_insurance_inquiries": ["userId"],
            "term_insurance_inquiries": ["userId"],
            "health_insurance_applications": ["userId"],
            "motor_insurance_applications": ["userId"],
            "term_insurance_applications": ["userId"],
            "documents": ["userId", "category"],
            "support_tickets": ["userId", "status"],
            "notifications": ["userId", "isRead"]
        }

        for collection_name, fields in indexes_to_create.items():
            collection = db[collection_name]
            
            # Create compound index if multiple fields, else single
            if len(fields) > 1:
                # Compound index example: [("userId", ASCENDING), ("status", ASCENDING)]
                index_model = [(field, ASCENDING) for field in fields]
                collection.create_index(index_model)
                print(f"    - Ensured compound index on {collection_name}: {fields}")
            else:
                # Single field index
                for field in fields:
                    collection.create_index([(field, ASCENDING)])
                    print(f"    - Ensured index on {collection_name}: {field}")

        print("[+] All database indexes verified/created successfully.")

    except Exception as e:
        print(f"[ERROR] Failed to create indexes: {e}")
