from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.core.deps import get_current_admin_user
from app.database import get_async_session
from app.models.models import Feature
from app.schemas.schemas import Feature as FeatureSchema, FeatureCreate, MessageResponse

router = APIRouter()


@router.get("/", response_model=List[FeatureSchema])
async def get_features(
    published_only: bool = True,
    session: AsyncSession = Depends(get_async_session)
):
    query = select(Feature)
    
    if published_only:
        query = query.where(Feature.published == True)
    
    query = query.order_by(Feature.order, Feature.created_at)
    
    result = await session.execute(query)
    features = result.scalars().all()
    
    return [FeatureSchema.model_validate(feature) for feature in features]


@router.post("/", response_model=FeatureSchema)
async def create_feature(
    feature_data: FeatureCreate,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Check if feature with this title already exists
    result = await session.execute(select(Feature).where(Feature.title == feature_data.title))
    existing_feature = result.scalar_one_or_none()
    
    if existing_feature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feature with this title already exists"
        )
    
    # Create feature
    db_feature = Feature(
        id=str(uuid.uuid4()),
        title=feature_data.title,
        description=feature_data.description,
        icon=feature_data.icon,
        order=feature_data.order,
        published=feature_data.published
    )
    
    session.add(db_feature)
    await session.commit()
    await session.refresh(db_feature)
    
    return FeatureSchema.model_validate(db_feature)


@router.put("/{feature_id}", response_model=FeatureSchema)
async def update_feature(
    feature_id: str,
    feature_data: FeatureCreate,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get feature
    result = await session.execute(select(Feature).where(Feature.id == feature_id))
    feature = result.scalar_one_or_none()
    
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    
    # Update fields
    update_data = feature_data.dict()
    for field, value in update_data.items():
        setattr(feature, field, value)
    
    await session.commit()
    await session.refresh(feature)
    
    return FeatureSchema.model_validate(feature)


@router.delete("/{feature_id}", response_model=MessageResponse)
async def delete_feature(
    feature_id: str,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get feature
    result = await session.execute(select(Feature).where(Feature.id == feature_id))
    feature = result.scalar_one_or_none()
    
    if not feature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    
    await session.delete(feature)
    await session.commit()
    
    return MessageResponse(message="Feature deleted successfully")
