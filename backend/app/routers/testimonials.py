from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.core.deps import get_current_admin_user
from app.database import get_async_session
from app.models.models import Testimonial
from app.schemas.schemas import Testimonial as TestimonialSchema, TestimonialCreate, MessageResponse

router = APIRouter()


@router.get("/", response_model=List[TestimonialSchema])
async def get_testimonials(
    published_only: bool = True,
    featured_only: bool = False,
    session: AsyncSession = Depends(get_async_session)
):
    query = select(Testimonial)
    
    if published_only:
        query = query.where(Testimonial.published == True)
    
    if featured_only:
        query = query.where(Testimonial.featured == True)
    
    query = query.order_by(Testimonial.order, Testimonial.created_at)
    
    result = await session.execute(query)
    testimonials = result.scalars().all()
    
    return [TestimonialSchema.model_validate(testimonial) for testimonial in testimonials]


@router.post("/", response_model=TestimonialSchema)
async def create_testimonial(
    testimonial_data: TestimonialCreate,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Check if testimonial with this name already exists
    result = await session.execute(select(Testimonial).where(Testimonial.name == testimonial_data.name))
    existing_testimonial = result.scalar_one_or_none()
    
    if existing_testimonial:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Testimonial with this name already exists"
        )
    
    # Create testimonial
    db_testimonial = Testimonial(
        id=str(uuid.uuid4()),
        name=testimonial_data.name,
        designation=testimonial_data.designation,
        company=testimonial_data.company,
        image=testimonial_data.image,
        content=testimonial_data.content,
        rating=testimonial_data.rating,
        featured=testimonial_data.featured,
        published=testimonial_data.published,
        order=testimonial_data.order
    )
    
    session.add(db_testimonial)
    await session.commit()
    await session.refresh(db_testimonial)
    
    return TestimonialSchema.model_validate(db_testimonial)


@router.put("/{testimonial_id}", response_model=TestimonialSchema)
async def update_testimonial(
    testimonial_id: str,
    testimonial_data: TestimonialCreate,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get testimonial
    result = await session.execute(select(Testimonial).where(Testimonial.id == testimonial_id))
    testimonial = result.scalar_one_or_none()
    
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found"
        )
    
    # Update fields
    update_data = testimonial_data.dict()
    for field, value in update_data.items():
        setattr(testimonial, field, value)
    
    await session.commit()
    await session.refresh(testimonial)
    
    return TestimonialSchema.model_validate(testimonial)


@router.delete("/{testimonial_id}", response_model=MessageResponse)
async def delete_testimonial(
    testimonial_id: str,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get testimonial
    result = await session.execute(select(Testimonial).where(Testimonial.id == testimonial_id))
    testimonial = result.scalar_one_or_none()
    
    if not testimonial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Testimonial not found"
        )
    
    await session.delete(testimonial)
    await session.commit()
    
    return MessageResponse(message="Testimonial deleted successfully")
