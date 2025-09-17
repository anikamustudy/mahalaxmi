from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.core.deps import get_current_admin_user
from app.database import get_async_session
from app.models.models import Newsletter
from app.schemas.schemas import Newsletter as NewsletterSchema, NewsletterCreate, MessageResponse

router = APIRouter()


@router.post("/subscribe", response_model=MessageResponse)
async def subscribe_to_newsletter(
    newsletter_data: NewsletterCreate,
    session: AsyncSession = Depends(get_async_session)
):
    # Check if email already subscribed
    result = await session.execute(select(Newsletter).where(Newsletter.email == newsletter_data.email))
    existing_subscription = result.scalar_one_or_none()
    
    if existing_subscription:
        if existing_subscription.active:
            return MessageResponse(message="You're already subscribed to our newsletter!")
        else:
            # Reactivate subscription
            existing_subscription.active = True
            await session.commit()
            return MessageResponse(message="Welcome back! Your subscription has been reactivated.")
    
    # Create new subscription
    db_newsletter = Newsletter(
        id=str(uuid.uuid4()),
        email=newsletter_data.email,
        active=True
    )
    
    session.add(db_newsletter)
    await session.commit()
    
    return MessageResponse(message="Thank you for subscribing to our newsletter!")


@router.post("/unsubscribe", response_model=MessageResponse)
async def unsubscribe_from_newsletter(
    newsletter_data: NewsletterCreate,
    session: AsyncSession = Depends(get_async_session)
):
    # Find subscription
    result = await session.execute(select(Newsletter).where(Newsletter.email == newsletter_data.email))
    subscription = result.scalar_one_or_none()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found in our subscription list"
        )
    
    # Deactivate subscription
    subscription.active = False
    await session.commit()
    
    return MessageResponse(message="You have been unsubscribed from our newsletter.")


@router.get("/subscribers", response_model=List[NewsletterSchema])
async def get_newsletter_subscribers(
    active_only: bool = True,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    query = select(Newsletter)
    
    if active_only:
        query = query.where(Newsletter.active == True)
    
    query = query.order_by(Newsletter.created_at.desc())
    
    result = await session.execute(query)
    subscribers = result.scalars().all()
    
    return [NewsletterSchema.model_validate(subscriber) for subscriber in subscribers]


@router.delete("/subscribers/{subscriber_id}", response_model=MessageResponse)
async def delete_subscriber(
    subscriber_id: str,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get subscriber
    result = await session.execute(select(Newsletter).where(Newsletter.id == subscriber_id))
    subscriber = result.scalar_one_or_none()
    
    if not subscriber:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscriber not found"
        )
    
    await session.delete(subscriber)
    await session.commit()
    
    return MessageResponse(message="Subscriber deleted successfully")
