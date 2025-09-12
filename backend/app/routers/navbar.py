from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.core.deps import get_current_admin_user
from app.database import get_async_session
from app.models.models import MenuItem
from app.schemas.schemas import MenuItem as MenuItemSchema, MenuItemCreate, MessageResponse

router = APIRouter()


@router.get("/menu", response_model=List[MenuItemSchema])
async def get_menu_items(
    session: AsyncSession = Depends(get_async_session)
):
    # Get top level menu items and their children
    query = select(MenuItem).where(
        MenuItem.parent_id.is_(None),
        MenuItem.published == True
    ).order_by(MenuItem.order)
    
    result = await session.execute(query)
    menu_items = result.scalars().all()
    
    # Load children for each parent
    for item in menu_items:
        children_query = select(MenuItem).where(
            MenuItem.parent_id == item.id,
            MenuItem.published == True
        ).order_by(MenuItem.order)
        
        children_result = await session.execute(children_query)
        item.children = list(children_result.scalars().all())
    
    return [MenuItemSchema.from_orm(item) for item in menu_items]


@router.post("/menu", response_model=MenuItemSchema)
async def create_menu_item(
    menu_data: MenuItemCreate,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Create menu item
    db_menu_item = MenuItem(
        id=str(uuid.uuid4()),
        title=menu_data.title,
        path=menu_data.path,
        new_tab=menu_data.new_tab,
        order=menu_data.order,
        published=menu_data.published,
        parent_id=menu_data.parent_id
    )
    
    session.add(db_menu_item)
    await session.commit()
    await session.refresh(db_menu_item)
    
    return MenuItemSchema.from_orm(db_menu_item)


@router.put("/menu/{item_id}", response_model=MenuItemSchema)
async def update_menu_item(
    item_id: str,
    menu_data: MenuItemCreate,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get menu item
    result = await session.execute(select(MenuItem).where(MenuItem.id == item_id))
    menu_item = result.scalar_one_or_none()
    
    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    # Update fields
    update_data = menu_data.dict()
    for field, value in update_data.items():
        setattr(menu_item, field, value)
    
    await session.commit()
    await session.refresh(menu_item)
    
    return MenuItemSchema.from_orm(menu_item)


@router.delete("/menu/{item_id}", response_model=MessageResponse)
async def delete_menu_item(
    item_id: str,
    current_user = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Get menu item
    result = await session.execute(select(MenuItem).where(MenuItem.id == item_id))
    menu_item = result.scalar_one_or_none()
    
    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    await session.delete(menu_item)
    await session.commit()
    
    return MessageResponse(message="Menu item deleted successfully")
