from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse, ActivityResponse
from app.services.comment_service import CommentService
from app.repositories.activity_repository import ActivityRepository
from app.models.user import User

router = APIRouter(tags=["Comments & Activity"])


@router.get("/api/tasks/{task_id}/comments", response_model=List[CommentResponse])
def get_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all comments for a task."""
    service = CommentService(db)
    return service.get_by_task(task_id)


@router.post("/api/tasks/{task_id}/comments", response_model=CommentResponse, status_code=201)
def add_comment(
    task_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a comment to a task."""
    service = CommentService(db)
    return service.create(task_id, data, current_user)


@router.put("/api/comments/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: int,
    data: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a comment."""
    service = CommentService(db)
    return service.update(comment_id, data, current_user)


@router.delete("/api/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a comment."""
    service = CommentService(db)
    service.delete(comment_id, current_user)


@router.get("/api/tasks/{task_id}/activity", response_model=List[ActivityResponse])
def get_activity(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get activity history for a task."""
    activity_repo = ActivityRepository(db)
    activities = activity_repo.get_by_task(task_id)
    return [ActivityResponse.model_validate(a) for a in activities]
