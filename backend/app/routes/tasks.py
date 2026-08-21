from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.task import TaskCreate, TaskUpdate, TaskListParams, PaginatedTasks, TaskResponse
from app.services.task_service import TaskService
from app.models.user import User

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=PaginatedTasks)
def list_tasks(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assignee: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List tasks with filtering, searching, sorting, and pagination."""
    params = TaskListParams(
        page=page,
        limit=limit,
        status=status,
        priority=priority,
        assignee=assignee,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    service = TaskService(db)
    return service.get_all(params)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a task by ID."""
    service = TaskService(db)
    return service.get_by_id(task_id)


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new task."""
    service = TaskService(db)
    return service.create(data, current_user)


@router.put("/{task_id}", response_model=TaskResponse)
@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a task (supports full PUT or partial PATCH updates)."""
    service = TaskService(db)
    return service.update(task_id, data, current_user)


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a task. Admins and managers only."""
    service = TaskService(db)
    service.delete(task_id, current_user)
