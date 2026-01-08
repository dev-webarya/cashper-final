from pydantic import BaseModel, Field, validator, HttpUrl
from typing import Optional
from datetime import datetime

# ===================== HOME TESTIMONIAL SCHEMAS =====================

class HomeTestimonialRequest(BaseModel):
    """Schema for homepage testimonial creation/update request"""
    name: str = Field(..., min_length=3, max_length=100)
    role: str = Field(..., min_length=2, max_length=100)
    image: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    text: str = Field(..., min_length=20, max_length=1000)
    location: str = Field(..., min_length=2, max_length=100)
    isActive: bool = True
    order: int = Field(default=0, ge=0)

    @validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class HomeTestimonialResponse(BaseModel):
    """Schema for homepage testimonial response"""
    id: str
    name: str
    role: str
    image: Optional[str]
    rating: int
    text: str
    location: str
    isActive: bool
    order: int
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True

class HomeTestimonialInDB(BaseModel):
    """Schema for homepage testimonial stored in database"""
    name: str
    role: str
    image: Optional[str]
    rating: int
    text: str
    location: str
    isActive: bool = True
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None

# ===================== BLOG POST SCHEMAS =====================

class BlogPostRequest(BaseModel):
    """Schema for blog post creation/update request"""
    title: str = Field(..., min_length=10, max_length=200)
    excerpt: str = Field(..., min_length=20, max_length=500)
    content: Optional[str] = Field(None, max_length=50000)  # Full blog content
    image: Optional[str] = None
    category: str = Field(..., min_length=3, max_length=100)
    readTime: str = Field(..., min_length=3, max_length=50)  # e.g., "5 min read"
    author: str = Field(..., min_length=3, max_length=100)
    color: Optional[str] = Field(None, max_length=50)  # e.g., "from-blue-500 to-blue-600"
    bgColor: Optional[str] = Field(None, max_length=50)  # e.g., "bg-blue-50"
    textColor: Optional[str] = Field(None, max_length=50)  # e.g., "text-blue-600"
    tags: Optional[list] = Field(default_factory=list)  # Array of tags
    isPublished: bool = True
    isFeatured: bool = False
    order: int = Field(default=0, ge=0)

    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

    @validator('excerpt')
    def validate_excerpt(cls, v):
        if not v.strip():
            raise ValueError('Excerpt cannot be empty')
        return v.strip()

class BlogPostResponse(BaseModel):
    """Schema for blog post response"""
    id: str
    title: str
    excerpt: str
    content: Optional[str]
    image: Optional[str]
    category: str
    readTime: str
    date: str  # Formatted date string
    author: str
    color: Optional[str]
    bgColor: Optional[str]
    textColor: Optional[str]
    tags: list
    isPublished: bool
    isFeatured: bool
    order: int
    views: int
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True

class BlogPostInDB(BaseModel):
    """Schema for blog post stored in database"""
    title: str
    excerpt: str
    content: Optional[str]
    image: Optional[str]
    category: str
    readTime: str
    author: str
    color: Optional[str]
    bgColor: Optional[str]
    textColor: Optional[str]
    tags: list = Field(default_factory=list)
    isPublished: bool = True
    isFeatured: bool = False
    order: int = 0
    views: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None

class BlogPostUpdateViews(BaseModel):
    """Schema for incrementing blog post views"""
    views: int
