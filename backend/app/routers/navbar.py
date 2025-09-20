# from typing import List, Optional
# from fastapi import APIRouter, Depends, HTTPException, status, Query
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select, update
# import uuid

# from app.core.deps import get_current_admin_user
# from app.database import get_async_session
# from app.models.models import MenuItem
# from app.schemas.schemas import MenuItem as MenuItemSchema, MenuItemCreate, MessageResponse

# router = APIRouter()


# @router.get("/menu", response_model=List[MenuItemSchema])
# async def get_menu_items(
#     session: AsyncSession = Depends(get_async_session)
# ):
#     # Get top level menu items
#     query = select(MenuItem).where(
#         MenuItem.parent_id.is_(None),
#         MenuItem.published == True
#     ).order_by(MenuItem.order)
    
#     result = await session.execute(query)
#     menu_items = result.scalars().all()
    
#     # Build response with children
#     menu_response = []
#     for item in menu_items:
#         # Get children for this menu item
#         children_query = select(MenuItem).where(
#             MenuItem.parent_id == item.id,
#             MenuItem.published == True
#         ).order_by(MenuItem.order)
        
#         children_result = await session.execute(children_query)
#         children = children_result.scalars().all()
        
#         # Create menu item schema with children
#         item_dict = {
#             "id": item.id,
#             "title": item.title,
#             "path": item.path,
#             "new_tab": item.new_tab,
#             "order": item.order,
#             "children": [
#                 {
#                     "id": child.id,
#                     "title": child.title,
#                     "path": child.path,
#                     "new_tab": child.new_tab,
#                     "order": child.order,
#                     "children": []
#                 }
#                 for child in children
#             ],
#             "created_at": item.created_at,
#             "updated_at": item.updated_at
#         }
#         menu_response.append(MenuItemSchema.model_validate(item_dict))
    
#     return menu_response


# @router.post("/menu", response_model=MenuItemSchema)
# async def create_menu_item(
#     menu_data: MenuItemCreate,
#     current_user = Depends(get_current_admin_user),
#     session: AsyncSession = Depends(get_async_session)
# ):
#     # Create menu item
#     db_menu_item = MenuItem(
#         id=str(uuid.uuid4()),
#         title=menu_data.title,
#         path=menu_data.path,
#         new_tab=menu_data.new_tab,
#         order=menu_data.order,
#         published=menu_data.published,
#         parent_id=menu_data.parent_id
#     )
    
#     session.add(db_menu_item)
#     await session.commit()
#     await session.refresh(db_menu_item)
    
#     return MenuItemSchema.model_validate(db_menu_item)


# @router.put("/menu/{item_id}", response_model=MenuItemSchema)
# async def update_menu_item(
#     item_id: str,
#     menu_data: MenuItemCreate,
#     current_user = Depends(get_current_admin_user),
#     session: AsyncSession = Depends(get_async_session)
# ):
#     # Get menu item
#     result = await session.execute(select(MenuItem).where(MenuItem.id == item_id))
#     menu_item = result.scalar_one_or_none()
    
#     if not menu_item:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Menu item not found"
#         )
    
#     # Update fields
#     update_data = menu_data.dict()
#     for field, value in update_data.items():
#         setattr(menu_item, field, value)
    
#     await session.commit()
#     await session.refresh(menu_item)
    
#     return MenuItemSchema.model_validate(menu_item)


# @router.delete("/menu/{item_id}", response_model=MessageResponse)
# async def delete_menu_item(
#     item_id: str,
#     current_user = Depends(get_current_admin_user),
#     session: AsyncSession = Depends(get_async_session)
# ):
#     # Get menu item
#     result = await session.execute(select(MenuItem).where(MenuItem.id == item_id))
#     menu_item = result.scalar_one_or_none()
    
#     if not menu_item:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Menu item not found"
#         )
    
#     await session.delete(menu_item)
#     await session.commit()
    
#     return MessageResponse(message="Menu item deleted successfully")


# @router.get("/admin/menu", response_model=List[MenuItemSchema])
# async def get_all_menu_items(
#     include_unpublished: bool = Query(False),
#     current_user = Depends(get_current_admin_user),
#     session: AsyncSession = Depends(get_async_session)
# ):
#     """Get all menu items for admin management (including unpublished)"""
#     # Get top level menu items
#     query = select(MenuItem)
    
#     if not include_unpublished:
#         query = query.where(MenuItem.published == True)
    
#     query = query.where(MenuItem.parent_id.is_(None)).order_by(MenuItem.order)
    
#     result = await session.execute(query)
#     menu_items = result.scalars().all()
    
#     # Build response with children
#     menu_response = []
#     for item in menu_items:
#         # Get children for this menu item
#         children_query = select(MenuItem)
        
#         if not include_unpublished:
#             children_query = children_query.where(MenuItem.published == True)
            
#         children_query = children_query.where(
#             MenuItem.parent_id == item.id
#         ).order_by(MenuItem.order)
        
#         children_result = await session.execute(children_query)
#         children = children_result.scalars().all()
        
#         # Create menu item schema with children
#         item_dict = {
#             "id": item.id,
#             "title": item.title,
#             "path": item.path,
#             "new_tab": item.new_tab,
#             "order": item.order,
#             "published": item.published,
#             "parent_id": item.parent_id,
#             "children": [
#                 {
#                     "id": child.id,
#                     "title": child.title,
#                     "path": child.path,
#                     "new_tab": child.new_tab,
#                     "order": child.order,
#                     "published": child.published,
#                     "parent_id": child.parent_id,
#                     "children": [],
#                     "created_at": child.created_at,
#                     "updated_at": child.updated_at
#                 }
#                 for child in children
#             ],
#             "created_at": item.created_at,
#             "updated_at": item.updated_at
#         }
#         menu_response.append(MenuItemSchema.model_validate(item_dict))
    
#     return menu_response


# @router.post("/admin/menu/reorder", response_model=MessageResponse)
# async def reorder_menu_items(
#     item_orders: List[dict],  # [{'id': 'uuid', 'order': 1, 'parent_id': 'uuid'}]
#     current_user = Depends(get_current_admin_user),
#     session: AsyncSession = Depends(get_async_session)
# ):
#     """Bulk update menu item orders and hierarchy"""
#     try:
#         for item_data in item_orders:
#             await session.execute(
#                 update(MenuItem)
#                 .where(MenuItem.id == item_data['id'])
#                 .values(
#                     order=item_data.get('order', 0),
#                     parent_id=item_data.get('parent_id')
#                 )
#             )
        
#         await session.commit()
#         return MessageResponse(message="Menu items reordered successfully")
        
#     except Exception as e:
#         await session.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to reorder menu items: {str(e)}"
#         )


# @router.post("/admin/menu/bulk-action", response_model=MessageResponse)
# async def bulk_menu_action(
#     item_ids: List[str],
#     action: str,  # 'publish', 'unpublish', 'delete'
#     current_user = Depends(get_current_admin_user),
#     session: AsyncSession = Depends(get_async_session)
# ):
#     """Perform bulk actions on menu items"""
#     if action not in ['publish', 'unpublish', 'delete']:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Invalid action. Must be 'publish', 'unpublish', or 'delete'"
#         )
    
#     try:
#         if action == 'delete':
#             # Delete items and their children
#             for item_id in item_ids:
#                 # Delete children first
#                 await session.execute(
#                     select(MenuItem).where(MenuItem.parent_id == item_id)
#                 )
#                 children_result = await session.execute(
#                     select(MenuItem).where(MenuItem.parent_id == item_id)
#                 )
#                 children = children_result.scalars().all()
#                 for child in children:
#                     await session.delete(child)
                
#                 # Delete parent
#                 result = await session.execute(
#                     select(MenuItem).where(MenuItem.id == item_id)
#                 )
#                 item = result.scalar_one_or_none()
#                 if item:
#                     await session.delete(item)
#         else:
#             # Update published status
#             published = action == 'publish'
#             await session.execute(
#                 update(MenuItem)
#                 .where(MenuItem.id.in_(item_ids))
#                 .values(published=published)
#             )
        
#         await session.commit()
#         return MessageResponse(message=f"Bulk {action} completed successfully")
        
#     except Exception as e:
#         await session.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Bulk action failed: {str(e)}"
#         )


from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import uuid

from app.core.deps import get_current_admin_user
from app.database import get_async_session
from app.models.models import MenuItem
from app.schemas.schemas import MenuItem as MenuItemSchema, MenuItemCreate, MessageResponse

router = APIRouter()

# Note: CORS middleware should be in main.py
# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

@router.get("/menu", response_model=List[MenuItemSchema])
async def get_menu_items(
    session: AsyncSession = Depends(get_async_session)
):
    query = select(MenuItem).where(
        MenuItem.parent_id.is_(None),
        MenuItem.published == True
    ).order_by(MenuItem.order)
    
    result = await session.execute(query)
    menu_items = result.scalars().all()
    
    menu_response = []
    for item in menu_items:
        children_query = select(MenuItem).where(
            MenuItem.parent_id == item.id,
            MenuItem.published == True
        ).order_by(MenuItem.order)
        children_result = await session.execute(children_query)
        children = children_result.scalars().all()
        
        item_dict = {
            "id": str(item.id),
            "title": item.title,
            "path": item.path,
            "new_tab": item.new_tab,
            "order": item.order,
            "children": [
                {
                    "id": str(child.id),
                    "title": child.title,
                    "path": child.path,
                    "new_tab": child.new_tab,
                    "order": child.order,
                    "children": []
                }
                for child in children
            ],
            "created_at": item.created_at.isoformat(),
            "updated_at": item.updated_at.isoformat()
        }
        menu_response.append(MenuItemSchema.model_validate(item_dict))
    
    return menu_response

# Include other routes (POST, PUT, DELETE, etc.) as previously provided...
# (Omitted for brevity but can be added back as needed)