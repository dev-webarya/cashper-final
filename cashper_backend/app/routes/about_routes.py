from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.database.schema.about_schema import (
    TestimonialRequest, TestimonialResponse, TestimonialInDB,
    AchievementRequest, AchievementResponse, AchievementInDB,
    StatRequest, StatResponse, StatInDB,
    MilestoneRequest, MilestoneResponse, MilestoneInDB
)
from app.database.repository.about_repository import about_repository
from app.utils.auth_middleware import get_current_user_optional
from datetime import datetime

router = APIRouter(prefix="/api/about", tags=["About"])


# ===================== PUBLIC ENDPOINTS (No Authentication) =====================

@router.get("/information")
def get_about_information():
    """
    Get general about information (PUBLIC - No authentication required)
    
    Returns company information, mission, vision, values
    """
    return {
        "company": {
            "name": "Cashper Financial Services",
            "founded": "2015",
            "headquarters": "Mumbai, Maharashtra, India",
            "email": "info@cashper.com",
            "phone": "6200755759 <br/> 7393080847"
        },
        "mission": "To provide accessible and affordable financial services to every Indian, empowering them to achieve their dreams.",
        "vision": "To become India's most trusted and customer-centric financial services provider.",
        "values": [
            {
                "title": "Trust",
                "description": "Building lasting relationships through transparency and integrity",
                "icon": "shield-check"
            },
            {
                "title": "Innovation",
                "description": "Leveraging technology to deliver superior financial solutions",
                "icon": "lightbulb"
            },
            {
                "title": "Customer First",
                "description": "Putting our customers at the heart of everything we do",
                "icon": "users"
            },
            {
                "title": "Excellence",
                "description": "Striving for excellence in service delivery",
                "icon": "star"
            }
        ],
        "description": "Cashper is a leading financial services provider in India, offering a comprehensive range of loan products, insurance solutions, and investment opportunities. With over 8 years of experience and 50,000+ satisfied customers, we are committed to making financial services accessible to all."
    }


@router.get("/services")
def get_about_services():
    """
    Get list of services (PUBLIC - No authentication required)
    
    Returns all services offered by the company
    """
    return {
        "services": [
            {
                "id": "loans",
                "title": "Loans",
                "description": "Personal, Home, Business loans with competitive rates",
                "icon": "banknote",
                "categories": ["Personal Loan", "Home Loan", "Business Loan", "Short Term Loan"]
            },
            {
                "id": "insurance",
                "title": "Insurance",
                "description": "Comprehensive insurance coverage for you and your family",
                "icon": "shield",
                "categories": ["Health Insurance", "Motor Insurance", "Term Insurance"]
            },
            {
                "id": "investments",
                "title": "Investments",
                "description": "Grow your wealth with smart investment options",
                "icon": "trending-up",
                "categories": ["SIP", "Mutual Funds", "Fixed Deposits"]
            },
            {
                "id": "tax-planning",
                "title": "Tax Planning",
                "description": "Expert tax planning and filing services",
                "icon": "calculator",
                "categories": ["Personal Tax", "Business Tax", "Tax Consultation"]
            }
        ]
    }


@router.get("/team")
def get_about_team():
    """
    Get team members (PUBLIC - No authentication required)
    
    Returns leadership and key team members
    """
    return {
        "leadership": [
            {
                "id": "1",
                "name": "Rajesh Kumar",
                "position": "Chief Executive Officer",
                "image": "/team/ceo.jpg",
                "bio": "20+ years of experience in financial services",
                "education": "MBA from IIM Ahmedabad",
                "experience": "20+ years"
            },
            {
                "id": "2",
                "name": "Priya Sharma",
                "position": "Chief Financial Officer",
                "image": "/team/cfo.jpg",
                "bio": "15+ years in finance and accounting",
                "education": "CA, MBA Finance",
                "experience": "15+ years"
            },
            {
                "id": "3",
                "name": "Amit Patel",
                "position": "Chief Technology Officer",
                "image": "/team/cto.jpg",
                "bio": "Expert in fintech innovation",
                "education": "B.Tech from IIT Delhi",
                "experience": "12+ years"
            },
            {
                "id": "4",
                "name": "Sneha Reddy",
                "position": "Head of Customer Success",
                "image": "/team/head-cs.jpg",
                "bio": "Passionate about customer satisfaction",
                "education": "MBA in Marketing",
                "experience": "10+ years"
            }
        ]
    }


@router.get("/testimonials", response_model=List[TestimonialResponse])
def get_testimonials():
    """
    Get all active testimonials (PUBLIC - No authentication required)
    
    Returns list of customer testimonials to display on About Us page
    """
    try:
        testimonials = about_repository.get_all_testimonials(is_active=True)
        
        return [
            TestimonialResponse(
                id=str(t["_id"]),
                name=t["name"],
                position=t["position"],
                location=t["location"],
                image=t.get("image"),
                rating=t["rating"],
                text=t["text"],
                loanType=t["loanType"],
                timeframe=t["timeframe"],
                isActive=t.get("isActive", True),
                order=t.get("order", 0),
                createdAt=t["createdAt"],
                updatedAt=t.get("updatedAt")
            )
            for t in testimonials
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch testimonials. Error: {str(e)}"
        )


@router.get("/achievements", response_model=List[AchievementResponse])
def get_achievements():
    """
    Get all active achievements (PUBLIC - No authentication required)
    
    Returns list of company achievements and awards
    """
    try:
        achievements = about_repository.get_all_achievements(is_active=True)
        
        return [
            AchievementResponse(
                id=str(a["_id"]),
                title=a["title"],
                organization=a["organization"],
                year=a["year"],
                description=a["description"],
                icon=a.get("icon"),
                isActive=a.get("isActive", True),
                order=a.get("order", 0),
                createdAt=a["createdAt"],
                updatedAt=a.get("updatedAt")
            )
            for a in achievements
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch achievements. Error: {str(e)}"
        )


@router.get("/stats", response_model=List[StatResponse])
def get_stats():
    """
    Get all active stats (PUBLIC - No authentication required)
    
    Returns company statistics like customers, loans disbursed, ratings etc
    """
    try:
        stats = about_repository.get_all_stats(is_active=True)
        
        return [
            StatResponse(
                id=str(s["_id"]),
                label=s["label"],
                value=s["value"],
                icon=s.get("icon"),
                color=s.get("color"),
                isActive=s.get("isActive", True),
                order=s.get("order", 0),
                createdAt=s["createdAt"],
                updatedAt=s.get("updatedAt")
            )
            for s in stats
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stats. Error: {str(e)}"
        )


@router.get("/milestones", response_model=List[MilestoneResponse])
def get_milestones():
    """
    Get all active milestones (PUBLIC - No authentication required)
    
    Returns company timeline and milestones
    """
    try:
        milestones = about_repository.get_all_milestones(is_active=True)
        
        return [
            MilestoneResponse(
                id=str(m["_id"]),
                year=m["year"],
                title=m["title"],
                description=m["description"],
                icon=m.get("icon"),
                isActive=m.get("isActive", True),
                order=m.get("order", 0),
                createdAt=m["createdAt"],
                updatedAt=m.get("updatedAt")
            )
            for m in milestones
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch milestones. Error: {str(e)}"
        )


# ===================== ADMIN ENDPOINTS - TESTIMONIALS =====================

@router.post("/testimonials", response_model=TestimonialResponse, status_code=status.HTTP_201_CREATED)
def create_testimonial(
    testimonial: TestimonialRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Create a new testimonial (ADMIN ONLY)"""
    try:
        testimonial_in_db = TestimonialInDB(
            name=testimonial.name,
            position=testimonial.position,
            location=testimonial.location,
            image=testimonial.image,
            rating=testimonial.rating,
            text=testimonial.text,
            loanType=testimonial.loanType,
            timeframe=testimonial.timeframe,
            isActive=testimonial.isActive,
            order=testimonial.order,
            createdAt=datetime.utcnow()
        )
        
        created_testimonial = about_repository.create_testimonial(testimonial_in_db)
        return created_testimonial
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create testimonial. Error: {str(e)}"
        )


@router.get("/testimonials/all", response_model=List[TestimonialResponse])
def get_all_testimonials_admin(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: dict = Depends(get_current_user_optional)
):
    """Get all testimonials including inactive ones (ADMIN ONLY)"""
    try:
        testimonials = about_repository.get_all_testimonials(is_active=is_active)
        
        return [
            TestimonialResponse(
                id=str(t["_id"]),
                name=t["name"],
                position=t["position"],
                location=t["location"],
                image=t.get("image"),
                rating=t["rating"],
                text=t["text"],
                loanType=t["loanType"],
                timeframe=t["timeframe"],
                isActive=t.get("isActive", True),
                order=t.get("order", 0),
                createdAt=t["createdAt"],
                updatedAt=t.get("updatedAt")
            )
            for t in testimonials
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch testimonials. Error: {str(e)}"
        )


@router.get("/testimonials/{testimonial_id}", response_model=TestimonialResponse)
def get_testimonial_by_id(
    testimonial_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Get a specific testimonial by ID (ADMIN ONLY)"""
    testimonial = about_repository.get_testimonial_by_id(testimonial_id)
    
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found"
        )
    
    return TestimonialResponse(
        id=str(testimonial["_id"]),
        name=testimonial["name"],
        position=testimonial["position"],
        location=testimonial["location"],
        image=testimonial.get("image"),
        rating=testimonial["rating"],
        text=testimonial["text"],
        loanType=testimonial["loanType"],
        timeframe=testimonial["timeframe"],
        isActive=testimonial.get("isActive", True),
        order=testimonial.get("order", 0),
        createdAt=testimonial["createdAt"],
        updatedAt=testimonial.get("updatedAt")
    )


@router.put("/testimonials/{testimonial_id}", response_model=TestimonialResponse)
def update_testimonial(
    testimonial_id: str,
    testimonial: TestimonialRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Update a testimonial (ADMIN ONLY)"""
    existing_testimonial = about_repository.get_testimonial_by_id(testimonial_id)
    
    if not existing_testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found"
        )
    
    testimonial_data = testimonial.dict()
    success = about_repository.update_testimonial(testimonial_id, testimonial_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update testimonial"
        )
    
    # Fetch and return updated testimonial
    updated_testimonial = about_repository.get_testimonial_by_id(testimonial_id)
    
    return TestimonialResponse(
        id=str(updated_testimonial["_id"]),
        name=updated_testimonial["name"],
        position=updated_testimonial["position"],
        location=updated_testimonial["location"],
        image=updated_testimonial.get("image"),
        rating=updated_testimonial["rating"],
        text=updated_testimonial["text"],
        loanType=updated_testimonial["loanType"],
        timeframe=updated_testimonial["timeframe"],
        isActive=updated_testimonial.get("isActive", True),
        order=updated_testimonial.get("order", 0),
        createdAt=updated_testimonial["createdAt"],
        updatedAt=updated_testimonial.get("updatedAt")
    )


@router.delete("/testimonials/{testimonial_id}", status_code=status.HTTP_200_OK)
def delete_testimonial(
    testimonial_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Delete a testimonial (ADMIN ONLY)"""
    testimonial = about_repository.get_testimonial_by_id(testimonial_id)
    
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found"
        )
    
    success = about_repository.delete_testimonial(testimonial_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete testimonial"
        )
    
    return {"message": "Testimonial deleted successfully"}


@router.patch("/testimonials/{testimonial_id}/order", status_code=status.HTTP_200_OK)
def update_testimonial_order(
    testimonial_id: str,
    order: int = Query(..., ge=0, description="New order position"),
    current_user: dict = Depends(get_current_user_optional)
):
    """Update testimonial display order (ADMIN ONLY)"""
    testimonial = about_repository.get_testimonial_by_id(testimonial_id)
    
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found"
        )
    
    success = about_repository.update_testimonial_order(testimonial_id, order)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update testimonial order"
        )
    
    return {"message": "Testimonial order updated successfully", "order": order}


# ===================== ADMIN ENDPOINTS - ACHIEVEMENTS =====================

@router.post("/achievements", response_model=AchievementResponse, status_code=status.HTTP_201_CREATED)
def create_achievement(
    achievement: AchievementRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Create a new achievement (ADMIN ONLY)"""
    try:
        achievement_in_db = AchievementInDB(
            title=achievement.title,
            organization=achievement.organization,
            year=achievement.year,
            description=achievement.description,
            icon=achievement.icon,
            isActive=achievement.isActive,
            order=achievement.order,
            createdAt=datetime.utcnow()
        )
        
        created_achievement = about_repository.create_achievement(achievement_in_db)
        return created_achievement
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create achievement. Error: {str(e)}"
        )


@router.get("/achievements/all", response_model=List[AchievementResponse])
def get_all_achievements_admin(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: dict = Depends(get_current_user_optional)
):
    """Get all achievements including inactive ones (ADMIN ONLY)"""
    try:
        achievements = about_repository.get_all_achievements(is_active=is_active)
        
        return [
            AchievementResponse(
                id=str(a["_id"]),
                title=a["title"],
                organization=a["organization"],
                year=a["year"],
                description=a["description"],
                icon=a.get("icon"),
                isActive=a.get("isActive", True),
                order=a.get("order", 0),
                createdAt=a["createdAt"],
                updatedAt=a.get("updatedAt")
            )
            for a in achievements
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch achievements. Error: {str(e)}"
        )


@router.put("/achievements/{achievement_id}", response_model=AchievementResponse)
def update_achievement(
    achievement_id: str,
    achievement: AchievementRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Update an achievement (ADMIN ONLY)"""
    existing_achievement = about_repository.get_achievement_by_id(achievement_id)
    
    if not existing_achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found"
        )
    
    achievement_data = achievement.dict()
    success = about_repository.update_achievement(achievement_id, achievement_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update achievement"
        )
    
    updated_achievement = about_repository.get_achievement_by_id(achievement_id)
    
    return AchievementResponse(
        id=str(updated_achievement["_id"]),
        title=updated_achievement["title"],
        organization=updated_achievement["organization"],
        year=updated_achievement["year"],
        description=updated_achievement["description"],
        icon=updated_achievement.get("icon"),
        isActive=updated_achievement.get("isActive", True),
        order=updated_achievement.get("order", 0),
        createdAt=updated_achievement["createdAt"],
        updatedAt=updated_achievement.get("updatedAt")
    )


@router.delete("/achievements/{achievement_id}", status_code=status.HTTP_200_OK)
def delete_achievement(
    achievement_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Delete an achievement (ADMIN ONLY)"""
    achievement = about_repository.get_achievement_by_id(achievement_id)
    
    if not achievement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Achievement not found"
        )
    
    success = about_repository.delete_achievement(achievement_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete achievement"
        )
    
    return {"message": "Achievement deleted successfully"}


# ===================== ADMIN ENDPOINTS - STATS =====================

@router.post("/stats", response_model=StatResponse, status_code=status.HTTP_201_CREATED)
def create_stat(
    stat: StatRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Create a new stat (ADMIN ONLY)"""
    try:
        stat_in_db = StatInDB(
            label=stat.label,
            value=stat.value,
            icon=stat.icon,
            color=stat.color,
            isActive=stat.isActive,
            order=stat.order,
            createdAt=datetime.utcnow()
        )
        
        created_stat = about_repository.create_stat(stat_in_db)
        return created_stat
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create stat. Error: {str(e)}"
        )


@router.put("/stats/{stat_id}", response_model=StatResponse)
def update_stat(
    stat_id: str,
    stat: StatRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Update a stat (ADMIN ONLY)"""
    existing_stat = about_repository.get_stat_by_id(stat_id)
    
    if not existing_stat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stat not found"
        )
    
    stat_data = stat.dict()
    success = about_repository.update_stat(stat_id, stat_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update stat"
        )
    
    updated_stat = about_repository.get_stat_by_id(stat_id)
    
    return StatResponse(
        id=str(updated_stat["_id"]),
        label=updated_stat["label"],
        value=updated_stat["value"],
        icon=updated_stat.get("icon"),
        color=updated_stat.get("color"),
        isActive=updated_stat.get("isActive", True),
        order=updated_stat.get("order", 0),
        createdAt=updated_stat["createdAt"],
        updatedAt=updated_stat.get("updatedAt")
    )


@router.delete("/stats/{stat_id}", status_code=status.HTTP_200_OK)
def delete_stat(
    stat_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Delete a stat (ADMIN ONLY)"""
    stat = about_repository.get_stat_by_id(stat_id)
    
    if not stat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stat not found"
        )
    
    success = about_repository.delete_stat(stat_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete stat"
        )
    
    return {"message": "Stat deleted successfully"}


# ===================== ADMIN ENDPOINTS - MILESTONES =====================

@router.post("/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
def create_milestone(
    milestone: MilestoneRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Create a new milestone (ADMIN ONLY)"""
    try:
        milestone_in_db = MilestoneInDB(
            year=milestone.year,
            title=milestone.title,
            description=milestone.description,
            icon=milestone.icon,
            isActive=milestone.isActive,
            order=milestone.order,
            createdAt=datetime.utcnow()
        )
        
        created_milestone = about_repository.create_milestone(milestone_in_db)
        return created_milestone
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create milestone. Error: {str(e)}"
        )


@router.put("/milestones/{milestone_id}", response_model=MilestoneResponse)
def update_milestone(
    milestone_id: str,
    milestone: MilestoneRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Update a milestone (ADMIN ONLY)"""
    existing_milestone = about_repository.get_milestone_by_id(milestone_id)
    
    if not existing_milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    milestone_data = milestone.dict()
    success = about_repository.update_milestone(milestone_id, milestone_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update milestone"
        )
    
    updated_milestone = about_repository.get_milestone_by_id(milestone_id)
    
    return MilestoneResponse(
        id=str(updated_milestone["_id"]),
        year=updated_milestone["year"],
        title=updated_milestone["title"],
        description=updated_milestone["description"],
        icon=updated_milestone.get("icon"),
        isActive=updated_milestone.get("isActive", True),
        order=updated_milestone.get("order", 0),
        createdAt=updated_milestone["createdAt"],
        updatedAt=updated_milestone.get("updatedAt")
    )


@router.delete("/milestones/{milestone_id}", status_code=status.HTTP_200_OK)
def delete_milestone(
    milestone_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Delete a milestone (ADMIN ONLY)"""
    milestone = about_repository.get_milestone_by_id(milestone_id)
    
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found"
        )
    
    success = about_repository.delete_milestone(milestone_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete milestone"
        )
    
    return {"message": "Milestone deleted successfully"}

