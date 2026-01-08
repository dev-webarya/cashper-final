#!/usr/bin/env python3
"""
DASHBOARD STATS VERIFICATION REPORT
"""
from pymongo import MongoClient
from datetime import datetime
import os

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = MongoClient(MONGO_URL)
db = client["cashper"]

print("=" * 80)
print("CASHPER DASHBOARD - REAL-TIME DATA VERIFICATION")
print("=" * 80)
print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

all_collections = sorted(db.list_collection_names())

categories = {
    "👥 Total Users": ["users"],
    "💰 Loans": [
        "admin_loan_applications",
        "personal_loan_applications",
        "home_loan_applications",
        "business_loan_applications",
        "short_term_loan_applications",
        "personal_loan_get_in_touch",
        "home_loan_get_in_touch",
        "business_loan_get_in_touch",
        "short_term_loan_get_in_touch",
    ],
    "🛡️  Insurance": [
        "health_insurance_inquiries",
        "motor_insurance_inquiries",
        "term_insurance_inquiries",
    ],
    "📊 Investments": [
        "sip_applications",
        "mutual_fund_applications",
        "investment_applications",
    ],
    "📋 Tax Planning": [
        "personal_tax_applications",
        "business_tax_applications",
        "itr_applications",
    ],
    "🛍️  Retail Services": [
        "RetailServiceApplications",
        "retail_service_applications",
    ],
}

for category, collections_list in categories.items():
    print(f"{category}")
    print("-" * 80)
    
    total = 0
    for col_name in collections_list:
        if col_name in all_collections:
            count = db[col_name].count_documents({})
            total += count
            status = "✅" if count > 0 else "⚠️ "
            print(f"  {status} {col_name:50} {count:>6}")
        else:
            print(f"  ❌ {col_name:50} NOT FOUND")
    
    print(f"  {'-' * 60}")
    print(f"  💚 TOTAL {' ' * 45} {total:>6}\n")

print("=" * 80)
print("✅ All collections checked successfully!")
print("=" * 80)
