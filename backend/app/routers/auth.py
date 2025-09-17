from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.deps import get_current_active_user, get_current_admin_user
from app.database import get_async_session
from app.models.models import User, Role
from app.schemas.schemas import (
    Token, User as UserSchema, UserCreate, UserLogin, MessageResponse
)

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_async_session)
):
    # Check if user already exists
    result = await session.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        name=user_data.name,
        password=hashed_password,
        role=user_data.role
    )
    
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=db_user.id, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserSchema.model_validate(db_user)
    )


@router.post("/login", response_model=Token)
async def login(
    user_data: UserLogin,
    session: AsyncSession = Depends(get_async_session)
):
    # Get user from database
    result = await session.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserSchema.model_validate(user)
    )


@router.post("/admin/login", response_model=Token)
async def admin_login(
    user_data: UserLogin,
    session: AsyncSession = Depends(get_async_session)
):
    # Get user from database
    result = await session.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is admin
    if user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserSchema.model_validate(user)
    )


@router.get("/me", response_model=UserSchema)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    return UserSchema.model_validate(current_user)


@router.post("/logout", response_model=MessageResponse)
async def logout():
    # Since we're using stateless JWT tokens, logout is handled on the frontend
    # by simply removing the token from storage
    return MessageResponse(message="Successfully logged out")


@router.post("/admin/create-user", response_model=UserSchema)
async def create_user_by_admin(
    user_data: UserCreate,
    current_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Check if user already exists
    result = await session.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        name=user_data.name,
        password=hashed_password,
        role=user_data.role
    )
    
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    
    return UserSchema.model_validate(db_user)
