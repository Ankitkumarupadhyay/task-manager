from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_admin_user
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.services.user_service import UserService
from app.models.user import User

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("")
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all users with optional search and pagination."""
    service = UserService(db)
    return service.get_all(page=page, limit=limit, search=search)


@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """Create a new user. Admin only."""
    service = UserService(db)
    return service.create(data)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user by ID."""
    service = UserService(db)
    return service.get_by_id(user_id)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a user. Admins can update anyone; users can update themselves."""
    if current_user.role != "admin" and current_user.id != user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="You can only update your own profile")
    service = UserService(db)
    return service.update(user_id, data)


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    """Delete a user. Admin only."""
    service = UserService(db)
    service.delete(user_id)
