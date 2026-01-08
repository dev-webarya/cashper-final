from app.database.db import get_database
from app.database.schema.about_schema import (
    TestimonialInDB, TestimonialResponse,
    AchievementInDB, AchievementResponse,
    StatInDB, StatResponse,
    MilestoneInDB, MilestoneResponse
)
from datetime import datetime
from bson import ObjectId
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class AboutRepository:
    def __init__(self):
        self.testimonials_collection_name = "testimonials"
        self.achievements_collection_name = "achievements"
        self.stats_collection_name = "stats"
        self.milestones_collection_name = "milestones"
        self._indexes_created = False
    
    def get_testimonials_collection(self):
        """Get testimonials collection"""
        db = get_database()
        collection = db[self.testimonials_collection_name]
        self._ensure_indexes()
        return collection
    
    def get_achievements_collection(self):
        """Get achievements collection"""
        db = get_database()
        collection = db[self.achievements_collection_name]
        self._ensure_indexes()
        return collection
    
    def get_stats_collection(self):
        """Get stats collection"""
        db = get_database()
        collection = db[self.stats_collection_name]
        self._ensure_indexes()
        return collection
    
    def get_milestones_collection(self):
        """Get milestones collection"""
        db = get_database()
        collection = db[self.milestones_collection_name]
        self._ensure_indexes()
        return collection
    
    def _ensure_indexes(self):
        """Create indexes if not already created"""
        if self._indexes_created:
            return
        
        try:
            db = get_database()
            
            # Testimonials indexes
            testimonials_coll = db[self.testimonials_collection_name]
            testimonials_coll.create_index("isActive")
            testimonials_coll.create_index("order")
            testimonials_coll.create_index("rating")
            
            # Achievements indexes
            achievements_coll = db[self.achievements_collection_name]
            achievements_coll.create_index("isActive")
            achievements_coll.create_index("order")
            achievements_coll.create_index("year")
            
            # Stats indexes
            stats_coll = db[self.stats_collection_name]
            stats_coll.create_index("isActive")
            stats_coll.create_index("order")
            
            # Milestones indexes
            milestones_coll = db[self.milestones_collection_name]
            milestones_coll.create_index("isActive")
            milestones_coll.create_index("order")
            milestones_coll.create_index("year")
            
            self._indexes_created = True
        except Exception as e:
            logger.warning(f"Could not create indexes: {e}")

    # ===================== TESTIMONIALS =====================

    def create_testimonial(self, testimonial: TestimonialInDB) -> TestimonialResponse:
        """Create a new testimonial"""
        collection = self.get_testimonials_collection()
        testimonial_dict = testimonial.dict()
        
        result = collection.insert_one(testimonial_dict)
        testimonial_dict["_id"] = result.inserted_id
        
        return TestimonialResponse(
            id=str(result.inserted_id),
            **testimonial_dict
        )

    def get_testimonial_by_id(self, testimonial_id: str) -> Optional[dict]:
        """Get a testimonial by ID"""
        try:
            collection = self.get_testimonials_collection()
            testimonial = collection.find_one({"_id": ObjectId(testimonial_id)})
            return testimonial
        except Exception as e:
            logger.error(f"Error fetching testimonial: {e}")
            return None

    def get_all_testimonials(self, is_active: Optional[bool] = None) -> List[dict]:
        """Get all testimonials"""
        collection = self.get_testimonials_collection()
        query = {}
        
        if is_active is not None:
            query["isActive"] = is_active
        
        testimonials = list(
            collection
            .find(query)
            .sort("order", 1)
        )
        
        return testimonials

    def update_testimonial(self, testimonial_id: str, testimonial_data: dict) -> bool:
        """Update a testimonial"""
        try:
            collection = self.get_testimonials_collection()
            testimonial_data["updatedAt"] = datetime.utcnow()
            
            result = collection.update_one(
                {"_id": ObjectId(testimonial_id)},
                {"$set": testimonial_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating testimonial: {e}")
            return False

    def delete_testimonial(self, testimonial_id: str) -> bool:
        """Delete a testimonial"""
        try:
            collection = self.get_testimonials_collection()
            result = collection.delete_one({"_id": ObjectId(testimonial_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting testimonial: {e}")
            return False

    def update_testimonial_order(self, testimonial_id: str, new_order: int) -> bool:
        """Update testimonial order"""
        try:
            collection = self.get_testimonials_collection()
            result = collection.update_one(
                {"_id": ObjectId(testimonial_id)},
                {
                    "$set": {
                        "order": new_order,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating testimonial order: {e}")
            return False

    # ===================== ACHIEVEMENTS =====================

    def create_achievement(self, achievement: AchievementInDB) -> AchievementResponse:
        """Create a new achievement"""
        collection = self.get_achievements_collection()
        achievement_dict = achievement.dict()
        
        result = collection.insert_one(achievement_dict)
        achievement_dict["_id"] = result.inserted_id
        
        return AchievementResponse(
            id=str(result.inserted_id),
            **achievement_dict
        )

    def get_achievement_by_id(self, achievement_id: str) -> Optional[dict]:
        """Get an achievement by ID"""
        try:
            collection = self.get_achievements_collection()
            achievement = collection.find_one({"_id": ObjectId(achievement_id)})
            return achievement
        except Exception as e:
            logger.error(f"Error fetching achievement: {e}")
            return None

    def get_all_achievements(self, is_active: Optional[bool] = None) -> List[dict]:
        """Get all achievements"""
        collection = self.get_achievements_collection()
        query = {}
        
        if is_active is not None:
            query["isActive"] = is_active
        
        achievements = list(
            collection
            .find(query)
            .sort("order", 1)
        )
        
        return achievements

    def update_achievement(self, achievement_id: str, achievement_data: dict) -> bool:
        """Update an achievement"""
        try:
            collection = self.get_achievements_collection()
            achievement_data["updatedAt"] = datetime.utcnow()
            
            result = collection.update_one(
                {"_id": ObjectId(achievement_id)},
                {"$set": achievement_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating achievement: {e}")
            return False

    def delete_achievement(self, achievement_id: str) -> bool:
        """Delete an achievement"""
        try:
            collection = self.get_achievements_collection()
            result = collection.delete_one({"_id": ObjectId(achievement_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting achievement: {e}")
            return False

    # ===================== STATS =====================

    def create_stat(self, stat: StatInDB) -> StatResponse:
        """Create a new stat"""
        collection = self.get_stats_collection()
        stat_dict = stat.dict()
        
        result = collection.insert_one(stat_dict)
        stat_dict["_id"] = result.inserted_id
        
        return StatResponse(
            id=str(result.inserted_id),
            **stat_dict
        )

    def get_stat_by_id(self, stat_id: str) -> Optional[dict]:
        """Get a stat by ID"""
        try:
            collection = self.get_stats_collection()
            stat = collection.find_one({"_id": ObjectId(stat_id)})
            return stat
        except Exception as e:
            logger.error(f"Error fetching stat: {e}")
            return None

    def get_all_stats(self, is_active: Optional[bool] = None) -> List[dict]:
        """Get all stats"""
        collection = self.get_stats_collection()
        query = {}
        
        if is_active is not None:
            query["isActive"] = is_active
        
        stats = list(
            collection
            .find(query)
            .sort("order", 1)
        )
        
        return stats

    def update_stat(self, stat_id: str, stat_data: dict) -> bool:
        """Update a stat"""
        try:
            collection = self.get_stats_collection()
            stat_data["updatedAt"] = datetime.utcnow()
            
            result = collection.update_one(
                {"_id": ObjectId(stat_id)},
                {"$set": stat_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating stat: {e}")
            return False

    def delete_stat(self, stat_id: str) -> bool:
        """Delete a stat"""
        try:
            collection = self.get_stats_collection()
            result = collection.delete_one({"_id": ObjectId(stat_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting stat: {e}")
            return False

    # ===================== MILESTONES =====================

    def create_milestone(self, milestone: MilestoneInDB) -> MilestoneResponse:
        """Create a new milestone"""
        collection = self.get_milestones_collection()
        milestone_dict = milestone.dict()
        
        result = collection.insert_one(milestone_dict)
        milestone_dict["_id"] = result.inserted_id
        
        return MilestoneResponse(
            id=str(result.inserted_id),
            **milestone_dict
        )

    def get_milestone_by_id(self, milestone_id: str) -> Optional[dict]:
        """Get a milestone by ID"""
        try:
            collection = self.get_milestones_collection()
            milestone = collection.find_one({"_id": ObjectId(milestone_id)})
            return milestone
        except Exception as e:
            logger.error(f"Error fetching milestone: {e}")
            return None

    def get_all_milestones(self, is_active: Optional[bool] = None) -> List[dict]:
        """Get all milestones"""
        collection = self.get_milestones_collection()
        query = {}
        
        if is_active is not None:
            query["isActive"] = is_active
        
        milestones = list(
            collection
            .find(query)
            .sort("order", 1)
        )
        
        return milestones

    def update_milestone(self, milestone_id: str, milestone_data: dict) -> bool:
        """Update a milestone"""
        try:
            collection = self.get_milestones_collection()
            milestone_data["updatedAt"] = datetime.utcnow()
            
            result = collection.update_one(
                {"_id": ObjectId(milestone_id)},
                {"$set": milestone_data}
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating milestone: {e}")
            return False

    def delete_milestone(self, milestone_id: str) -> bool:
        """Delete a milestone"""
        try:
            collection = self.get_milestones_collection()
            result = collection.delete_one({"_id": ObjectId(milestone_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting milestone: {e}")
            return False

    # ===================== LEADERSHIP =====================

# Create singleton instance
about_repository = AboutRepository()

