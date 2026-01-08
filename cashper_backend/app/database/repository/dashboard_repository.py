from bson import ObjectId
from typing import List, Optional
from datetime import datetime
from app.database.db import get_database
from app.database.schema.dashboard_schema import (
    DashboardSupportInDB,
    DashboardSupportResponse,
    DocumentInDB,
    DocumentUploadResponse
)


class DashboardRepository:
    """Repository for dashboard operations - Support and Documents"""

    def __init__(self):
        self.db = None

    def get_database(self):
        """Get database instance"""
        if self.db is None:
            self.db = get_database()
        return self.db

    def get_support_collection(self):
        """Get dashboard support tickets collection"""
        db = self.get_database()
        return db["dashboard_support"]

    def get_documents_collection(self):
        """Get user documents collection"""
        db = self.get_database()
        return db["user_documents"]

    # ===================== SUPPORT OPERATIONS =====================

    def create_support_ticket(self, support_data: DashboardSupportInDB) -> DashboardSupportResponse:
        """Create a new support ticket from dashboard"""
        try:
            collection = self.get_support_collection()
            
            support_dict = support_data.dict()
            support_dict["userId"] = ObjectId(support_dict["userId"]) if isinstance(support_dict["userId"], str) else support_dict["userId"]
            
            result = collection.insert_one(support_dict)
            
            if result.inserted_id:
                created_ticket = collection.find_one({"_id": result.inserted_id})
                return DashboardSupportResponse(
                    id=str(created_ticket["_id"]),
                    userId=str(created_ticket["userId"]),
                    name=created_ticket["name"],
                    email=created_ticket["email"],
                    phone=created_ticket["phone"],
                    issue=created_ticket["issue"],
                    status=created_ticket["status"],
                    createdAt=created_ticket["createdAt"],
                    resolvedAt=created_ticket.get("resolvedAt")
                )
            else:
                raise Exception("Failed to insert support ticket")
                
        except Exception as e:
            print(f"Error creating support ticket: {str(e)}")
            raise

    def get_user_support_tickets(self, user_id: str) -> List[dict]:
        """Get all support tickets for a specific user"""
        try:
            collection = self.get_support_collection()
            tickets = list(collection.find({"userId": ObjectId(user_id)}).sort("createdAt", -1))
            return tickets
        except Exception as e:
            print(f"Error fetching support tickets: {str(e)}")
            raise

    def get_support_ticket_by_id(self, ticket_id: str) -> Optional[dict]:
        """Get a specific support ticket by ID"""
        try:
            collection = self.get_support_collection()
            ticket = collection.find_one({"_id": ObjectId(ticket_id)})
            return ticket
        except Exception as e:
            print(f"Error fetching support ticket: {str(e)}")
            return None

    def update_support_ticket_status(self, ticket_id: str, status: str) -> bool:
        """Update support ticket status"""
        try:
            collection = self.get_support_collection()
            update_data = {
                "$set": {
                    "status": status,
                    "updatedAt": datetime.utcnow()
                }
            }
            
            if status == "resolved":
                update_data["$set"]["resolvedAt"] = datetime.utcnow()
            
            result = collection.update_one(
                {"_id": ObjectId(ticket_id)},
                update_data
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating support ticket status: {str(e)}")
            return False

    # ===================== DOCUMENT OPERATIONS =====================

    def create_document(self, document_data: DocumentInDB) -> DocumentUploadResponse:
        """Create a new document record"""
        try:
            collection = self.get_documents_collection()
            
            document_dict = document_data.dict()
            document_dict["userId"] = ObjectId(document_dict["userId"]) if isinstance(document_dict["userId"], str) else document_dict["userId"]
            
            result = collection.insert_one(document_dict)
            
            if result.inserted_id:
                created_doc = collection.find_one({"_id": result.inserted_id})
                return DocumentUploadResponse(
                    id=str(created_doc["_id"]),
                    userId=str(created_doc["userId"]),
                    documentType=created_doc["documentType"],
                    fileName=created_doc["fileName"],
                    filePath=created_doc["filePath"],
                    fileUrl=created_doc["fileUrl"],
                    category=created_doc["category"],
                    fileSize=created_doc["fileSize"],
                    mimeType=created_doc["mimeType"],
                    uploadedAt=created_doc["uploadedAt"]
                )
            else:
                raise Exception("Failed to insert document")
                
        except Exception as e:
            print(f"Error creating document: {str(e)}")
            raise

    def get_user_documents(self, user_id: str) -> List[dict]:
        """Get all documents for a specific user"""
        try:
            collection = self.get_documents_collection()
            documents = list(collection.find({"userId": ObjectId(user_id)}).sort("uploadedAt", -1))
            return documents
        except Exception as e:
            print(f"Error fetching user documents: {str(e)}")
            raise

    def get_document_by_id(self, document_id: str, user_id: str) -> Optional[dict]:
        """Get a specific document by ID (with user verification)"""
        try:
            collection = self.get_documents_collection()
            document = collection.find_one({
                "_id": ObjectId(document_id),
                "userId": ObjectId(user_id)
            })
            return document
        except Exception as e:
            print(f"Error fetching document: {str(e)}")
            return None

    def delete_document(self, document_id: str, user_id: str) -> bool:
        """Delete a document (with user verification)"""
        try:
            collection = self.get_documents_collection()
            result = collection.delete_one({
                "_id": ObjectId(document_id),
                "userId": ObjectId(user_id)
            })
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting document: {str(e)}")
            return False

    def count_user_documents(self, user_id: str) -> int:
        """Count total documents for a user"""
        try:
            collection = self.get_documents_collection()
            count = collection.count_documents({"userId": ObjectId(user_id)})
            return count
        except Exception as e:
            print(f"Error counting documents: {str(e)}")
            return 0


# Create singleton instance
dashboard_repository = DashboardRepository()
