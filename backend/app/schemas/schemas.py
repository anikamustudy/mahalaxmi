from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enums
class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class ContactStatus(str, Enum):
    UNREAD = "UNREAD"
    READ = "READ"
    REPLIED = "REPLIED"
    ARCHIVED = "ARCHIVED"


# Base schemas
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: Role = Role.USER


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: User


# Blog schemas
class TagBase(BaseModel):
    name: str
    slug: str
    color: str = "#3B82F6"


class TagCreate(TagBase):
    pass


class Tag(TagBase):
    id: str
    
    model_config = {"from_attributes": True}


class BlogBase(BaseModel):
    title: str
    content: str
    excerpt: str
    image: str
    slug: str
    published: bool = False
    featured: bool = False


class BlogCreate(BlogBase):
    tag_ids: Optional[List[str]] = []


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    image: Optional[str] = None
    slug: Optional[str] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None
    tag_ids: Optional[List[str]] = None


class Blog(BlogBase):
    id: str
    views: int = 0
    publish_date: datetime
    created_at: datetime
    updated_at: datetime
    author: User
    tags: List[Tag] = []
    
    model_config = {"from_attributes": True}


class BlogList(BaseModel):
    id: str
    title: str
    excerpt: str
    image: str
    slug: str
    published: bool
    featured: bool
    views: int
    publish_date: datetime
    author: User
    tags: List[Tag] = []
    
    model_config = {"from_attributes": True}


# Comment schemas
class CommentBase(BaseModel):
    content: str
    author_name: str
    author_email: EmailStr


class CommentCreate(CommentBase):
    pass


class Comment(CommentBase):
    id: str
    approved: bool = False
    created_at: datetime
    updated_at: datetime
    blog_id: str
    
    model_config = {"from_attributes": True}


# Feature schemas
class FeatureBase(BaseModel):
    title: str
    description: str
    icon: str
    order: int = 0
    published: bool = True


class FeatureCreate(FeatureBase):
    pass


class Feature(FeatureBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# Testimonial schemas
class TestimonialBase(BaseModel):
    name: str
    designation: str
    company: Optional[str] = None
    image: str
    content: str
    rating: int = 5
    featured: bool = False
    published: bool = True
    order: int = 0


class TestimonialCreate(TestimonialBase):
    pass


class Testimonial(TestimonialBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# Contact schemas
class ContactBase(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str


class ContactCreate(ContactBase):
    pass


class Contact(ContactBase):
    id: str
    status: ContactStatus = ContactStatus.UNREAD
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# Newsletter schemas
class NewsletterBase(BaseModel):
    email: EmailStr


class NewsletterCreate(NewsletterBase):
    pass


class Newsletter(NewsletterBase):
    id: str
    active: bool = True
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# Menu Item schemas
class MenuItemBase(BaseModel):
    title: str
    path: Optional[str] = None
    new_tab: bool = False
    order: int = 0
    published: bool = True
    parent_id: Optional[str] = None


class MenuItemCreate(MenuItemBase):
    pass


class MenuItem(MenuItemBase):
    id: str
    children: List['MenuItem'] = []
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# Update forward reference
MenuItem.model_rebuild()


# Response schemas
class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str


class PaginationParams(BaseModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(10, ge=1, le=100)


class BlogsResponse(BaseModel):
    blogs: List[BlogList]
    total: int
    skip: int
    limit: int
