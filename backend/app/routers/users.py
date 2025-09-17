from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.deps import get_current_admin_user, get_current_active_user
from app.database import get_async_session
from app.models.models import User
from app.schemas.schemas import User as UserSchema, UserUpdate, MessageResponse

router = APIRouter()


@router.get("/", response_model=List[UserSchema])
async def get_users(
    current_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    
    return [UserSchema.model_validate(user) for user in users]


@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserSchema.model_validate(user)


@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get user
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await session.commit()
    await session.refresh(user)
    
    return UserSchema.model_validate(user)


@router.delete("/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Prevent admin from deleting themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account"
        )
    
    # Get user
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await session.delete(user)
    await session.commit()
    
    return MessageResponse(message="User deleted successfully")


@router.put("/profile", response_model=UserSchema)
async def update_own_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Update current user's profile
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    await session.commit()
    await session.refresh(current_user)
    
    return UserSchema.model_validate(current_user)
