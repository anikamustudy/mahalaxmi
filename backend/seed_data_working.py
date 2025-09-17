#!/usr/bin/env python3
import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import async_session_maker, create_tables
from app.models.models import (
    User, Role, Blog, Tag, Feature, Testimonial, 
    Contact, Newsletter, MenuItem
)
from app.core.security import get_password_hash
from app.core.config import settings


async def create_admin_user(session: AsyncSession):
    """Create the first admin user"""
    print("Creating admin user...")
    
    # Check if admin user already exists
    result = await session.execute(
        select(User).where(User.email == settings.FIRST_ADMIN_EMAIL)
    )
    existing_admin = result.scalar_one_or_none()
    
    if existing_admin:
        print(f"Admin user {settings.FIRST_ADMIN_EMAIL} already exists")
        return existing_admin
    
    # Create admin user
    admin_user = User(
        id=str(uuid.uuid4()),
        email=settings.FIRST_ADMIN_EMAIL,
        name="Administrator",
        password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
        role=Role.ADMIN
    )
    
    session.add(admin_user)
    await session.commit()
    await session.refresh(admin_user)
    
    print(f"Admin user created: {settings.FIRST_ADMIN_EMAIL}")
    return admin_user


async def create_menu_items(session: AsyncSession):
    """Create default menu items"""
    print("Creating menu items...")
    
    menu_items = [
        {
            "title": "Home",
            "path": "/",
            "order": 1,
            "published": True
        },
        {
            "title": "About",
            "path": "/about",
            "order": 2,
            "published": True
        },
        {
            "title": "Blog",
            "path": "/blog",
            "order": 3,
            "published": True
        },
        {
            "title": "Contact",
            "path": "/contact",
            "order": 4,
            "published": True
        }
    ]
    
    for item_data in menu_items:
        # Check if menu item already exists
        result = await session.execute(
            select(MenuItem).where(MenuItem.title == item_data["title"])
        )
        existing_item = result.scalar_one_or_none()
        
        if not existing_item:
            menu_item = MenuItem(
                id=str(uuid.uuid4()),
                **item_data
            )
            session.add(menu_item)
    
    await session.commit()
    print("Menu items created")


async def create_tags(session: AsyncSession):
    """Create default blog tags"""
    print("Creating blog tags...")
    
    tags_data = [
        {"name": "Technology", "slug": "technology", "color": "#3B82F6"},
        {"name": "Business", "slug": "business", "color": "#10B981"},
        {"name": "Design", "slug": "design", "color": "#F59E0B"},
        {"name": "Development", "slug": "development", "color": "#8B5CF6"},
        {"name": "Marketing", "slug": "marketing", "color": "#EF4444"},
        {"name": "Tutorial", "slug": "tutorial", "color": "#06B6D4"}
    ]
    
    created_tags = []
    for tag_data in tags_data:
        # Check if tag already exists
        result = await session.execute(
            select(Tag).where(Tag.slug == tag_data["slug"])
        )
        existing_tag = result.scalar_one_or_none()
        
        if not existing_tag:
            tag = Tag(
                id=str(uuid.uuid4()),
                **tag_data
            )
            session.add(tag)
            created_tags.append(tag)
        else:
            created_tags.append(existing_tag)
    
    await session.commit()
    print("Blog tags created")
    return created_tags


async def create_features(session: AsyncSession):
    """Create default features"""
    print("Creating features...")
    
    features_data = [
        {
            "title": "Fast Performance",
            "description": "Lightning-fast website performance with optimized code and modern technologies.",
            "icon": "⚡",
            "order": 1
        },
        {
            "title": "Responsive Design",
            "description": "Beautiful and responsive design that works perfectly on all devices.",
            "icon": "📱",
            "order": 2
        },
        {
            "title": "SEO Optimized",
            "description": "Built with SEO best practices to help your website rank higher in search engines.",
            "icon": "🔍",
            "order": 3
        },
        {
            "title": "Easy to Customize",
            "description": "Highly customizable components and layouts to match your brand perfectly.",
            "icon": "🎨",
            "order": 4
        }
    ]
    
    for feature_data in features_data:
        # Check if feature already exists
        result = await session.execute(
            select(Feature).where(Feature.title == feature_data["title"])
        )
        existing_feature = result.scalar_one_or_none()
        
        if not existing_feature:
            feature = Feature(
                id=str(uuid.uuid4()),
                **feature_data
            )
            session.add(feature)
    
    await session.commit()
    print("Features created")


async def create_sample_blog(session: AsyncSession, admin_user: User, tags: list):
    """Create a sample blog post"""
    print("Creating sample blog post...")
    
    # Check if blog already exists
    result = await session.execute(
        select(Blog).where(Blog.slug == "welcome-to-mahalaxmi")
    )
    existing_blog = result.scalar_one_or_none()
    
    if not existing_blog:
        blog = Blog(
            id=str(uuid.uuid4()),
            title="Welcome to Mahalaxmi",
            content="Welcome to our new website! We're excited to share our journey with you through regular blog posts, updates, and insights. Stay tuned for more content coming soon.",
            excerpt="Welcome to our new website! We're excited to share our journey with you.",
            image="/images/blog/blog-01.jpg",
            slug="welcome-to-mahalaxmi",
            published=True,
            featured=True,
            author_id=admin_user.id
        )
        session.add(blog)
        await session.flush()
        
        # Add tags to blog
        if tags:
            blog.tags = tags[:2]  # Add first 2 tags
        
        await session.commit()
        print("Sample blog created")


async def seed_database():
    """Main function to seed the database"""
    print("Starting database seeding...")
    
    async with async_session_maker() as session:
        # Create admin user
        admin_user = await create_admin_user(session)
        
        # Create menu items
        await create_menu_items(session)
        
        # Create tags
        tags = await create_tags(session)
        
        # Create features
        await create_features(session)
        
        # Create sample blog
        await create_sample_blog(session, admin_user, tags)
    
    print("Database seeding completed!")


if __name__ == "__main__":
    asyncio.run(seed_database())