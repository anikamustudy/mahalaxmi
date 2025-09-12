from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.core.deps import get_current_admin_user
from app.database import get_async_session
from app.models.models import Contact, ContactStatus
from app.schemas.schemas import Contact as ContactSchema, ContactCreate, MessageResponse

router = APIRouter()


@router.post("/", response_model=MessageResponse)
async def submit_contact_form(
    contact_data: ContactCreate,
    session: AsyncSession = Depends(get_async_session)
):
    # Create contact submission
    db_contact = Contact(
        id=str(uuid.uuid4()),
        name=contact_data.name,
        email=contact_data.email,
        subject=contact_data.subject,
        message=contact_data.message,
        status=ContactStatus.UNREAD
    )
    
    session.add(db_contact)
    await session.commit()
    
    return MessageResponse(message="Thank you for your message! We'll get back to you soon.")


@router.get("/", response_model=List[ContactSchema])
async def get_contacts(
    status_filter: str = None,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    query = select(Contact)
    
    if status_filter:
        try:
            status_enum = ContactStatus(status_filter.upper())
            query = query.where(Contact.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status filter"
            )
    
    query = query.order_by(Contact.created_at.desc())
    
    result = await session.execute(query)
    contacts = result.scalars().all()
    
    return [ContactSchema.from_orm(contact) for contact in contacts]


@router.put("/{contact_id}/status", response_model=ContactSchema)
async def update_contact_status(
    contact_id: str,
    new_status: str,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get contact
    result = await session.execute(select(Contact).where(Contact.id == contact_id))
    contact = result.scalar_one_or_none()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Validate and set status
    try:
        status_enum = ContactStatus(new_status.upper())
        contact.status = status_enum
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status value"
        )
    
    await session.commit()
    await session.refresh(contact)
    
    return ContactSchema.from_orm(contact)


@router.delete("/{contact_id}", response_model=MessageResponse)
async def delete_contact(
    contact_id: str,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get contact
    result = await session.execute(select(Contact).where(Contact.id == contact_id))
    contact = result.scalar_one_or_none()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    await session.delete(contact)
    await session.commit()
    
    return MessageResponse(message="Contact deleted successfully")
