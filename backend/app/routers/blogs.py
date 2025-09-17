from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
import uuid

from app.core.deps import get_current_admin_user, get_current_active_user, get_optional_current_user
from app.database import get_async_session
from app.models.models import Blog, User, Tag, Comment
from app.schemas.schemas import (
    Blog as BlogSchema, BlogCreate, BlogUpdate, BlogList, BlogsResponse,
    Comment as CommentSchema, CommentCreate, MessageResponse
)

router = APIRouter()


@router.get("/", response_model=BlogsResponse)
async def get_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    published: Optional[bool] = Query(True),
    tag: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_async_session)
):
    # Build query
    query = select(Blog).options(
        selectinload(Blog.author),
        selectinload(Blog.tags)
    )
    
    # Apply filters
    filters = []
    if published is not None:
        filters.append(Blog.published == published)
    if featured is not None:
        filters.append(Blog.featured == featured)
    if search:
        filters.append(
            or_(
                Blog.title.ilike(f"%{search}%"),
                Blog.excerpt.ilike(f"%{search}%"),
                Blog.content.ilike(f"%{search}%")
            )
        )
    if tag:
        query = query.join(Blog.tags).where(Tag.slug == tag)
    
    if filters:
        query = query.where(and_(*filters))
    
    # Get total count
    count_query = select(func.count(Blog.id))
    if filters:
        count_query = count_query.where(and_(*filters))
    if tag:
        count_query = count_query.join(Blog.tags).where(Tag.slug == tag)
    
    total_result = await session.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    query = query.order_by(Blog.publish_date.desc()).offset(skip).limit(limit)
    
    result = await session.execute(query)
    blogs = result.scalars().all()
    
    return BlogsResponse(
        blogs=[BlogList.model_validate(blog) for blog in blogs],
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/featured", response_model=List[BlogList])
async def get_featured_blogs(
    limit: int = Query(3, ge=1, le=10),
    session: AsyncSession = Depends(get_async_session)
):
    query = select(Blog).options(
        selectinload(Blog.author),
        selectinload(Blog.tags)
    ).where(
        and_(Blog.published == True, Blog.featured == True)
    ).order_by(Blog.publish_date.desc()).limit(limit)
    
    result = await session.execute(query)
    blogs = result.scalars().all()
    
    return [BlogList.model_validate(blog) for blog in blogs]


@router.get("/{slug}", response_model=BlogSchema)
async def get_blog_by_slug(
    slug: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = select(Blog).options(
        selectinload(Blog.author),
        selectinload(Blog.tags),
        selectinload(Blog.comments)
    ).where(Blog.slug == slug)
    
    result = await session.execute(query)
    blog = result.scalar_one_or_none()
    
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )
    
    # Check if user can view unpublished blog
    if not blog.published:
        if not current_user or current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blog not found"
            )
    
    # Increment views
    blog.views += 1
    await session.commit()
    
    return BlogSchema.model_validate(blog)


@router.post("/", response_model=BlogSchema)
async def create_blog(
    blog_data: BlogCreate,
    current_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Check if slug already exists
    result = await session.execute(select(Blog).where(Blog.slug == blog_data.slug))
    existing_blog = result.scalar_one_or_none()
    
    if existing_blog:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blog with this slug already exists"
        )
    
    # Create blog
    db_blog = Blog(
        id=str(uuid.uuid4()),
        title=blog_data.title,
        content=blog_data.content,
        excerpt=blog_data.excerpt,
        image=blog_data.image,
        slug=blog_data.slug,
        published=blog_data.published,
        featured=blog_data.featured,
        author_id=current_user.id
    )
    
    session.add(db_blog)
    await session.flush()
    
    # Add tags if provided
    if blog_data.tag_ids:
        tag_result = await session.execute(select(Tag).where(Tag.id.in_(blog_data.tag_ids)))
        tags = tag_result.scalars().all()
        db_blog.tags = tags
    
    await session.commit()
    await session.refresh(db_blog)
    
    # Load relationships
    result = await session.execute(
        select(Blog).options(
            selectinload(Blog.author),
            selectinload(Blog.tags)
        ).where(Blog.id == db_blog.id)
    )
    blog = result.scalar_one()
    
    return BlogSchema.model_validate(blog)


@router.put("/{blog_id}", response_model=BlogSchema)
async def update_blog(
    blog_id: str,
    blog_data: BlogUpdate,
    current_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get blog
    result = await session.execute(select(Blog).where(Blog.id == blog_id))
    blog = result.scalar_one_or_none()
    
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )
    
    # Update fields
    update_data = blog_data.dict(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)
    
    for field, value in update_data.items():
        setattr(blog, field, value)
    
    # Update tags if provided
    if tag_ids is not None:
        tag_result = await session.execute(select(Tag).where(Tag.id.in_(tag_ids)))
        tags = tag_result.scalars().all()
        blog.tags = tags
    
    await session.commit()
    await session.refresh(blog)
    
    # Load relationships
    result = await session.execute(
        select(Blog).options(
            selectinload(Blog.author),
            selectinload(Blog.tags)
        ).where(Blog.id == blog.id)
    )
    updated_blog = result.scalar_one()
    
    return BlogSchema.model_validate(updated_blog)


@router.delete("/{blog_id}", response_model=MessageResponse)
async def delete_blog(
    blog_id: str,
    current_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get blog
    result = await session.execute(select(Blog).where(Blog.id == blog_id))
    blog = result.scalar_one_or_none()
    
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )
    
    await session.delete(blog)
    await session.commit()
    
    return MessageResponse(message="Blog deleted successfully")


# Comments endpoints
@router.get("/{blog_id}/comments", response_model=List[CommentSchema])
async def get_blog_comments(
    blog_id: str,
    approved_only: bool = Query(True),
    session: AsyncSession = Depends(get_async_session)
):
    query = select(Comment).where(Comment.blog_id == blog_id)
    
    if approved_only:
        query = query.where(Comment.approved == True)
    
    query = query.order_by(Comment.created_at.desc())
    
    result = await session.execute(query)
    comments = result.scalars().all()
    
    return [CommentSchema.model_validate(comment) for comment in comments]


@router.post("/{blog_id}/comments", response_model=CommentSchema)
async def create_comment(
    blog_id: str,
    comment_data: CommentCreate,
    session: AsyncSession = Depends(get_async_session)
):
    # Check if blog exists
    result = await session.execute(select(Blog).where(Blog.id == blog_id))
    blog = result.scalar_one_or_none()
    
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found"
        )
    
    # Create comment
    db_comment = Comment(
        id=str(uuid.uuid4()),
        content=comment_data.content,
        author_name=comment_data.author_name,
        author_email=comment_data.author_email,
        blog_id=blog_id,
        approved=False  # Comments need approval by default
    )
    
    session.add(db_comment)
    await session.commit()
    await session.refresh(db_comment)
    
    return CommentSchema.model_validate(db_comment)


@router.put("/comments/{comment_id}/approve", response_model=CommentSchema)
async def approve_comment(
    comment_id: str,
    current_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get comment
    result = await session.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    comment.approved = True
    await session.commit()
    await session.refresh(comment)
    
    return CommentSchema.model_validate(comment)


@router.delete("/comments/{comment_id}", response_model=MessageResponse)
async def delete_comment(
    comment_id: str,
    current_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get comment
    result = await session.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    await session.delete(comment)
    await session.commit()
    
    return MessageResponse(message="Comment deleted successfully")
