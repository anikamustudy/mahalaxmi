from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, Float, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


# Enums
class Role(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class ContactStatus(str, enum.Enum):
    UNREAD = "UNREAD"
    READ = "READ"
    REPLIED = "REPLIED"
    ARCHIVED = "ARCHIVED"


# Association table for many-to-many relationship between Blog and Tag
blog_tags = Table(
    'blog_tags',
    Base.metadata,
    Column('blog_id', String, ForeignKey('blogs.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', String, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    password = Column(String, nullable=False)
    role = Column(Enum(Role), default=Role.USER)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    blogs = relationship("Blog", back_populates="author", cascade="all, delete-orphan")


class Blog(Base):
    __tablename__ = "blogs"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(String, nullable=False)
    image = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    published = Column(Boolean, default=False)
    featured = Column(Boolean, default=False)
    views = Column(Integer, default=0)
    publish_date = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Foreign keys
    author_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    
    # Relationships
    author = relationship("User", back_populates="blogs")
    tags = relationship("Tag", secondary=blog_tags, back_populates="blogs")
    comments = relationship("Comment", back_populates="blog", cascade="all, delete-orphan")


class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    color = Column(String, default="#3B82F6")
    
    # Relationships
    blogs = relationship("Blog", secondary=blog_tags, back_populates="tags")


class Feature(Base):
    __tablename__ = "features"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String, nullable=False)
    order = Column(Integer, default=0)
    published = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Testimonial(Base):
    __tablename__ = "testimonials"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    designation = Column(String, nullable=False)
    company = Column(String, nullable=True)
    image = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    featured = Column(Boolean, default=False)
    published = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Brand(Base):
    __tablename__ = "brands"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    logo = Column(String, nullable=False)
    website = Column(String, nullable=True)
    order = Column(Integer, default=0)
    published = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    status = Column(Enum(ContactStatus), default=ContactStatus.UNREAD)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Newsletter(Base):
    __tablename__ = "newsletters"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PricingPlan(Base):
    __tablename__ = "pricing_plans"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    price = Column(Float, nullable=False)
    period = Column(String, nullable=False)  # monthly, yearly
    description = Column(String, nullable=True)
    features = Column(Text, nullable=False)  # JSON string of features
    popular = Column(Boolean, default=False)
    published = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class SiteSettings(Base):
    __tablename__ = "site_settings"
    
    id = Column(String, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text, nullable=False)
    type = Column(String, default="string")  # string, number, boolean, json
    description = Column(String, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(String, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author_name = Column(String, nullable=False)
    author_email = Column(String, nullable=False)
    approved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Foreign keys
    blog_id = Column(String, ForeignKey("blogs.id", ondelete="CASCADE"))
    
    # Relationships
    blog = relationship("Blog", back_populates="comments")


class MenuItem(Base):
    __tablename__ = "menu_items"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    path = Column(String, nullable=True)
    new_tab = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    published = Column(Boolean, default=True)
    parent_id = Column(String, ForeignKey("menu_items.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Self-referential relationship for submenus
    children = relationship("MenuItem", backref="parent", remote_side=[id])
