from app.database.db import get_database
from app.database.schema.home_schema import (
    HomeTestimonialInDB, HomeTestimonialResponse,
    BlogPostInDB, BlogPostResponse
)
from datetime import datetime
from bson import ObjectId
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class HomeRepository:
    def __init__(self):
        self.home_testimonials_collection_name = "home_testimonials"
        self.blogs_collection_name = "blogs"
        self._indexes_created = False
    
    def get_home_testimonials_collection(self):
        """Get home testimonials collection"""
        db = get_database()
        collection = db[self.home_testimonials_collection_name]
        self._ensure_indexes()
        return collection
    
    def get_blogs_collection(self):
        """Get blogs collection"""
        db = get_database()
        collection = db[self.blogs_collection_name]
        self._ensure_indexes()
        return collection
    
    def _ensure_indexes(self):
        """Create indexes if not already created"""
        if self._indexes_created:
            return
        
        try:
            db = get_database()
            
            # Home Testimonials indexes
            home_testimonials_coll = db[self.home_testimonials_collection_name]
            home_testimonials_coll.create_index("isActive")
            home_testimonials_coll.create_index("order")
            home_testimonials_coll.create_index("rating")
            
            # Blogs indexes
            blogs_coll = db[self.blogs_collection_name]
            blogs_coll.create_index("isPublished")
            blogs_coll.create_index("isFeatured")
            blogs_coll.create_index("category")
            blogs_coll.create_index("order")
            blogs_coll.create_index("createdAt")
            blogs_coll.create_index("views")
            
            self._indexes_created = True
        except Exception as e:
            logger.warning(f"Could not create indexes: {e}")

    # ===================== HOME TESTIMONIALS =====================

    def create_home_testimonial(self, testimonial: HomeTestimonialInDB) -> HomeTestimonialResponse:
        """Create a new home testimonial"""
        collection = self.get_home_testimonials_collection()
        testimonial_dict = testimonial.dict()
        
        result = collection.insert_one(testimonial_dict)
        testimonial_dict["_id"] = result.inserted_id
        
        return HomeTestimonialResponse(
            id=str(result.inserted_id),
            **testimonial_dict
        )

    def get_home_testimonial_by_id(self, testimonial_id: str) -> Optional[dict]:
        """Get a home testimonial by ID"""
        try:
            collection = self.get_home_testimonials_collection()
            testimonial = collection.find_one({"_id": ObjectId(testimonial_id)})
            return testimonial
        except Exception as e:
            logger.error(f"Error fetching home testimonial: {e}")
            return None

    def get_all_home_testimonials(self, is_active: Optional[bool] = None) -> List[dict]:
        """Get all home testimonials"""
        collection = self.get_home_testimonials_collection()
        query = {}
        
        if is_active is not None:
            query["isActive"] = is_active
        
        testimonials = list(
            collection
            .find(query)
            .sort("order", 1)
        )
        
        return testimonials

    def update_home_testimonial(self, testimonial_id: str, testimonial_data: dict) -> bool:
        """Update a home testimonial"""
        try:
            collection = self.get_home_testimonials_collection()
            testimonial_data["updatedAt"] = datetime.utcnow()
            
            result = collection.update_one(
                {"_id": ObjectId(testimonial_id)},
                {"$set": testimonial_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating home testimonial: {e}")
            return False

    def delete_home_testimonial(self, testimonial_id: str) -> bool:
        """Delete a home testimonial"""
        try:
            collection = self.get_home_testimonials_collection()
            result = collection.delete_one({"_id": ObjectId(testimonial_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting home testimonial: {e}")
            return False

    # ===================== BLOG POSTS =====================

    def create_blog_post(self, blog: BlogPostInDB) -> BlogPostResponse:
        """Create a new blog post"""
        collection = self.get_blogs_collection()
        blog_dict = blog.dict()
        
        result = collection.insert_one(blog_dict)
        blog_dict["_id"] = result.inserted_id
        
        # Format date for response
        date_str = blog_dict["createdAt"].strftime("%b %d, %Y")
        
        return BlogPostResponse(
            id=str(result.inserted_id),
            date=date_str,
            **blog_dict
        )

    def get_blog_post_by_id(self, blog_id: str) -> Optional[dict]:
        """Get a blog post by ID"""
        try:
            collection = self.get_blogs_collection()
            blog = collection.find_one({"_id": ObjectId(blog_id)})
            return blog
        except Exception as e:
            logger.error(f"Error fetching blog post: {e}")
            return None

    def get_all_blog_posts(
        self, 
        is_published: Optional[bool] = None,
        is_featured: Optional[bool] = None,
        category: Optional[str] = None
    ) -> List[dict]:
        """Get all blog posts with filters"""
        collection = self.get_blogs_collection()
        query = {}
        
        if is_published is not None:
            query["isPublished"] = is_published
        
        if is_featured is not None:
            query["isFeatured"] = is_featured
        
        if category:
            query["category"] = category
        
        blogs = list(
            collection
            .find(query)
            .sort([("order", 1), ("createdAt", -1)])
        )
        
        return blogs

    def update_blog_post(self, blog_id: str, blog_data: dict) -> bool:
        """Update a blog post"""
        try:
            collection = self.get_blogs_collection()
            blog_data["updatedAt"] = datetime.utcnow()
            
            result = collection.update_one(
                {"_id": ObjectId(blog_id)},
                {"$set": blog_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating blog post: {e}")
            return False

    def delete_blog_post(self, blog_id: str) -> bool:
        """Delete a blog post"""
        try:
            collection = self.get_blogs_collection()
            result = collection.delete_one({"_id": ObjectId(blog_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting blog post: {e}")
            return False

    def increment_blog_views(self, blog_id: str) -> bool:
        """Increment blog post view count"""
        try:
            collection = self.get_blogs_collection()
            result = collection.update_one(
                {"_id": ObjectId(blog_id)},
                {"$inc": {"views": 1}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error incrementing blog views: {e}")
            return False

    def get_featured_blogs(self, limit: int = 3) -> List[dict]:
        """Get featured blog posts"""
        collection = self.get_blogs_collection()
        blogs = list(
            collection
            .find({"isPublished": True, "isFeatured": True})
            .sort("order", 1)
            .limit(limit)
        )
        return blogs

    def get_popular_blogs(self, limit: int = 5) -> List[dict]:
        """Get most viewed blog posts"""
        collection = self.get_blogs_collection()
        blogs = list(
            collection
            .find({"isPublished": True})
            .sort("views", -1)
            .limit(limit)
        )
        return blogs


# Create singleton instance
home_repository = HomeRepository()

