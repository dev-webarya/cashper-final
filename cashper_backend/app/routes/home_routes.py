from fastapi import APIRouter, HTTPException, status, Depends, Query, UploadFile, File
from typing import List, Optional
from app.database.schema.home_schema import (
    HomeTestimonialRequest, HomeTestimonialResponse, HomeTestimonialInDB,
    BlogPostRequest, BlogPostResponse, BlogPostInDB
)
from app.database.repository.home_repository import home_repository
from app.utils.auth_middleware import get_current_user_optional
from app.utils.file_upload import save_upload_file, delete_file, replace_file
from datetime import datetime

router = APIRouter(prefix="/home", tags=["Home Content"])

# ===================== PUBLIC ENDPOINTS (No Authentication) =====================

@router.get("/testimonials", response_model=List[HomeTestimonialResponse])
def get_home_testimonials():
    """
    Get all active homepage testimonials (PUBLIC - No authentication required)
    
    Returns list of customer testimonials to display on homepage
    """
    try:
        testimonials = home_repository.get_all_home_testimonials(is_active=True)
        
        return [
            HomeTestimonialResponse(
                id=str(t["_id"]),
                name=t["name"],
                role=t["role"],
                image=t.get("image"),
                rating=t["rating"],
                text=t["text"],
                location=t["location"],
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


@router.get("/blogs", response_model=List[BlogPostResponse])
def get_blog_posts(
    category: Optional[str] = Query(None, description="Filter by category"),
    featured: Optional[bool] = Query(None, description="Filter featured posts")
):
    """
    Get all published blog posts (PUBLIC - No authentication required)
    
    Optional filters:
    - category: Filter by blog category
    - featured: Get only featured posts
    """
    try:
        blogs = home_repository.get_all_blog_posts(
            is_published=True,
            is_featured=featured,
            category=category
        )

        return [
            BlogPostResponse(
                id=str(b["_id"]),
                title=b["title"],
                excerpt=b["excerpt"],
                content=b.get("content"),
                image=b.get("image"),
                category=b["category"],
                readTime=b["readTime"],
                date=b["createdAt"].strftime("%b %d, %Y"),
                author=b["author"],
                color=b.get("color"),
                bgColor=b.get("bgColor"),
                textColor=b.get("textColor"),
                tags=b.get("tags", []),
                isPublished=b.get("isPublished", True),
                isFeatured=b.get("isFeatured", False),
                order=b.get("order", 0),
                views=b.get("views", 0),
                createdAt=b["createdAt"],
                updatedAt=b.get("updatedAt")
            )
            for b in blogs
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch blog posts. Error: {str(e)}"
        )

@router.get("/blogs/{blog_id}", response_model=BlogPostResponse)
def get_blog_post_by_id(blog_id: str):
    """
    Get a specific blog post by ID (PUBLIC - No authentication required)
    Also increments view count
    """
    blog = home_repository.get_blog_post_by_id(blog_id)
    
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )
    
    # Increment view count
    home_repository.increment_blog_views(blog_id)
    
    return BlogPostResponse(
        id=str(blog["_id"]),
        title=blog["title"],
        excerpt=blog["excerpt"],
        content=blog.get("content"),
        image=blog.get("image"),
        category=blog["category"],
        readTime=blog["readTime"],
        date=blog["createdAt"].strftime("%b %d, %Y"),
        author=blog["author"],
        color=blog.get("color"),
        bgColor=blog.get("bgColor"),
        textColor=blog.get("textColor"),
        tags=blog.get("tags", []),
        isPublished=blog.get("isPublished", True),
        isFeatured=blog.get("isFeatured", False),
        order=blog.get("order", 0),
        views=blog.get("views", 0),
        createdAt=blog["createdAt"],
        updatedAt=blog.get("updatedAt")
    )

@router.get("/blogs/featured/list", response_model=List[BlogPostResponse])
def get_featured_blogs(limit: int = Query(3, ge=1, le=10)):
    """
    Get featured blog posts (PUBLIC - No authentication required)
    """
    try:
        blogs = home_repository.get_featured_blogs(limit=limit)
        
        return [
            BlogPostResponse(
                id=str(b["_id"]),
                title=b["title"],
                excerpt=b["excerpt"],
                content=b.get("content"),
                image=b.get("image"),
                category=b["category"],
                readTime=b["readTime"],
                date=b["createdAt"].strftime("%b %d, %Y"),
                author=b["author"],
                color=b.get("color"),
                bgColor=b.get("bgColor"),
                textColor=b.get("textColor"),
                tags=b.get("tags", []),
                isPublished=b.get("isPublished", True),
                isFeatured=b.get("isFeatured", False),
                order=b.get("order", 0),
                views=b.get("views", 0),
                createdAt=b["createdAt"],
                updatedAt=b.get("updatedAt")
            )
            for b in blogs
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch featured blogs. Error: {str(e)}"
        )

@router.get("/blogs/popular/list", response_model=List[BlogPostResponse])
def get_popular_blogs(limit: int = Query(5, ge=1, le=10)):
    """
    Get most popular (most viewed) blog posts (PUBLIC - No authentication required)
    """
    try:
        blogs = home_repository.get_popular_blogs(limit=limit)
        
        return [
            BlogPostResponse(
                id=str(b["_id"]),
                title=b["title"],
                excerpt=b["excerpt"],
                content=b.get("content"),
                image=b.get("image"),
                category=b["category"],
                readTime=b["readTime"],
                date=b["createdAt"].strftime("%b %d, %Y"),
                author=b["author"],
                color=b.get("color"),
                bgColor=b.get("bgColor"),
                textColor=b.get("textColor"),
                tags=b.get("tags", []),
                isPublished=b.get("isPublished", True),
                isFeatured=b.get("isFeatured", False),
                order=b.get("order", 0),
                views=b.get("views", 0),
                createdAt=b["createdAt"],
                updatedAt=b.get("updatedAt")
            )
            for b in blogs
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch popular blogs. Error: {str(e)}"
        )

# ===================== IMAGE UPLOAD ENDPOINTS (ADMIN ONLY) =====================

@router.post("/upload/testimonial-image")
async def upload_testimonial_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Upload testimonial image (ADMIN ONLY)
    
    Returns the image path that can be used in testimonial creation/update
    """
    try:
        # Save the file
        file_path = await save_upload_file(file, upload_type="testimonial")
        
        return {
            "success": True,
            "message": "Image uploaded successfully",
            "image_path": file_path,
            "file_name": file.filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.post("/upload/blog-image")
async def upload_blog_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Upload blog post image (ADMIN ONLY)
    
    Returns the image path that can be used in blog creation/update
    """
    try:
        # Save the file
        file_path = await save_upload_file(file, upload_type="blog")
        
        return {
            "success": True,
            "message": "Image uploaded successfully",
            "image_path": file_path,
            "file_name": file.filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.delete("/delete/image")
async def delete_uploaded_image(
    image_path: str = Query(..., description="Path to image to delete"),
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Delete uploaded image (ADMIN ONLY)
    
    Use this to remove old images when updating testimonials/blogs
    """
    try:
        success = delete_file(image_path)
        
        if success:
            return {
                "success": True,
                "message": "Image deleted successfully"
            }
        else:
            return {
                "success": False,
                "message": "Image not found or already deleted"
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {str(e)}"
        )


# ===================== ADMIN ENDPOINTS - HOME TESTIMONIALS =====================

@router.post("/testimonials", response_model=HomeTestimonialResponse, status_code=status.HTTP_201_CREATED)
def create_home_testimonial(
    testimonial: HomeTestimonialRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Create a new homepage testimonial (ADMIN ONLY)"""
    try:
        testimonial_in_db = HomeTestimonialInDB(
            name=testimonial.name,
            role=testimonial.role,
            image=testimonial.image,
            rating=testimonial.rating,
            text=testimonial.text,
            location=testimonial.location,
            isActive=testimonial.isActive,
            order=testimonial.order,
            createdAt=datetime.utcnow()
        )
        
        created_testimonial = home_repository.create_home_testimonial(testimonial_in_db)
        return created_testimonial
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create testimonial. Error: {str(e)}"
        )


@router.get("/testimonials/all", response_model=List[HomeTestimonialResponse])
def get_all_home_testimonials_admin(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: dict = Depends(get_current_user_optional)
):
    """Get all homepage testimonials including inactive (ADMIN ONLY)"""
    try:
        testimonials = home_repository.get_all_home_testimonials(is_active=is_active)
        
        return [
            HomeTestimonialResponse(
                id=str(t["_id"]),
                name=t["name"],
                role=t["role"],
                image=t.get("image"),
                rating=t["rating"],
                text=t["text"],
                location=t["location"],
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


@router.put("/testimonials/{testimonial_id}", response_model=HomeTestimonialResponse)
def update_home_testimonial(
    testimonial_id: str,
    testimonial: HomeTestimonialRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Update a homepage testimonial (ADMIN ONLY)"""
    existing_testimonial = home_repository.get_home_testimonial_by_id(testimonial_id)
    
    if not existing_testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found"
        )
    
    testimonial_data = testimonial.dict()
    success = home_repository.update_home_testimonial(testimonial_id, testimonial_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update testimonial"
        )
    
    updated_testimonial = home_repository.get_home_testimonial_by_id(testimonial_id)
    
    return HomeTestimonialResponse(
        id=str(updated_testimonial["_id"]),
        name=updated_testimonial["name"],
        role=updated_testimonial["role"],
        image=updated_testimonial.get("image"),
        rating=updated_testimonial["rating"],
        text=updated_testimonial["text"],
        location=updated_testimonial["location"],
        isActive=updated_testimonial.get("isActive", True),
        order=updated_testimonial.get("order", 0),
        createdAt=updated_testimonial["createdAt"],
        updatedAt=updated_testimonial.get("updatedAt")
    )

@router.delete("/testimonials/{testimonial_id}", status_code=status.HTTP_200_OK)
def delete_home_testimonial(
    testimonial_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Delete a homepage testimonial (ADMIN ONLY)"""
    testimonial = home_repository.get_home_testimonial_by_id(testimonial_id)
    
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found"
        )
    
    # Delete associated image if it exists and is stored locally
    if testimonial.get("image") and testimonial["image"].startswith("/uploads/"):
        delete_file(testimonial["image"])
    
    success = home_repository.delete_home_testimonial(testimonial_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete testimonial"
        )
    
    return {"message": "Testimonial deleted successfully"}

# ===================== ADMIN ENDPOINTS - BLOG POSTS =====================

@router.post("/blogs", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
def create_blog_post(
    blog: BlogPostRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Create a new blog post (ADMIN ONLY)"""
    try:
        blog_in_db = BlogPostInDB(
            title=blog.title,
            excerpt=blog.excerpt,
            content=blog.content,
            image=blog.image,
            category=blog.category,
            readTime=blog.readTime,
            author=blog.author,
            color=blog.color,
            bgColor=blog.bgColor,
            textColor=blog.textColor,
            tags=blog.tags or [],
            isPublished=blog.isPublished,
            isFeatured=blog.isFeatured,
            order=blog.order,
            views=0,
            createdAt=datetime.utcnow()
        )
        
        created_blog = home_repository.create_blog_post(blog_in_db)
        return created_blog
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create blog post. Error: {str(e)}"
        )

@router.get("/blogs/all/admin", response_model=List[BlogPostResponse])
def get_all_blog_posts_admin(
    is_published: Optional[bool] = Query(None, description="Filter by published status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    current_user: dict = Depends(get_current_user_optional)
):
    """Get all blog posts including unpublished (ADMIN ONLY)"""
    try:
        blogs = home_repository.get_all_blog_posts(
            is_published=is_published,
            category=category
        )
        
        return [
            BlogPostResponse(
                id=str(b["_id"]),
                title=b["title"],
                excerpt=b["excerpt"],
                content=b.get("content"),
                image=b.get("image"),
                category=b["category"],
                readTime=b["readTime"],
                date=b["createdAt"].strftime("%b %d, %Y"),
                author=b["author"],
                color=b.get("color"),
                bgColor=b.get("bgColor"),
                textColor=b.get("textColor"),
                tags=b.get("tags", []),
                isPublished=b.get("isPublished", True),
                isFeatured=b.get("isFeatured", False),
                order=b.get("order", 0),
                views=b.get("views", 0),
                createdAt=b["createdAt"],
                updatedAt=b.get("updatedAt")
            )
            for b in blogs
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch blog posts. Error: {str(e)}"
        )

@router.put("/blogs/{blog_id}", response_model=BlogPostResponse)
def update_blog_post(
    blog_id: str,
    blog: BlogPostRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """Update a blog post (ADMIN ONLY)"""
    existing_blog = home_repository.get_blog_post_by_id(blog_id)
    
    if not existing_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )
    
    blog_data = blog.dict()
    success = home_repository.update_blog_post(blog_id, blog_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update blog post"
        )
    
    updated_blog = home_repository.get_blog_post_by_id(blog_id)
    
    return BlogPostResponse(
        id=str(updated_blog["_id"]),
        title=updated_blog["title"],
        excerpt=updated_blog["excerpt"],
        content=updated_blog.get("content"),
        image=updated_blog.get("image"),
        category=updated_blog["category"],
        readTime=updated_blog["readTime"],
        date=updated_blog["createdAt"].strftime("%b %d, %Y"),
        author=updated_blog["author"],
        color=updated_blog.get("color"),
        bgColor=updated_blog.get("bgColor"),
        textColor=updated_blog.get("textColor"),
        tags=updated_blog.get("tags", []),
        isPublished=updated_blog.get("isPublished", True),
        isFeatured=updated_blog.get("isFeatured", False),
        order=updated_blog.get("order", 0),
        views=updated_blog.get("views", 0),
        createdAt=updated_blog["createdAt"],
        updatedAt=updated_blog.get("updatedAt")
    )

@router.delete("/blogs/{blog_id}", status_code=status.HTTP_200_OK)
def delete_blog_post(
    blog_id: str,
    current_user: dict = Depends(get_current_user_optional)
):
    """Delete a blog post (ADMIN ONLY)"""
    blog = home_repository.get_blog_post_by_id(blog_id)
    
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )
    
    # Delete associated image if it exists and is stored locally
    if blog.get("image") and blog["image"].startswith("/uploads/"):
        delete_file(blog["image"])
    
    success = home_repository.delete_blog_post(blog_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete blog post"
        )
    return {"message": "Blog post deleted successfully"}