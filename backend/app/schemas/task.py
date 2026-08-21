from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, field_validator

from app.schemas.user import UserBrief

VALID_STATUSES = {"pending", "in_progress", "completed", "blocked"}
VALID_PRIORITIES = {"low", "medium", "high", "urgent"}
VALID_SORT_FIELDS = {"created_at", "updated_at", "due_date", "priority", "title"}
VALID_SORT_ORDERS = {"asc", "desc"}


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title is required")
        if len(v) > 500:
            raise ValueError("Title must be 500 characters or less")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(VALID_STATUSES)}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of: {', '.join(VALID_PRIORITIES)}")
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Title cannot be empty")
            if len(v) > 500:
                raise ValueError("Title must be 500 characters or less")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(VALID_STATUSES)}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of: {', '.join(VALID_PRIORITIES)}")
        return v


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assigned_to: Optional[int] = None
    created_by: int
    due_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    assignee: Optional[UserBrief] = None
    creator: Optional[UserBrief] = None

    model_config = {"from_attributes": True}


class TaskListParams(BaseModel):
    page: int = 1
    limit: int = 20
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[int] = None
    search: Optional[str] = None
    sort_by: str = "created_at"
    sort_order: str = "desc"

    @field_validator("page")
    @classmethod
    def validate_page(cls, v: int) -> int:
        if v < 1:
            return 1
        return v

    @field_validator("limit")
    @classmethod
    def validate_limit(cls, v: int) -> int:
        if v < 1:
            return 1
        if v > 100:
            return 100
        return v

    @field_validator("sort_by")
    @classmethod
    def validate_sort_by(cls, v: str) -> str:
        if v not in VALID_SORT_FIELDS:
            return "created_at"
        return v

    @field_validator("sort_order")
    @classmethod
    def validate_sort_order(cls, v: str) -> str:
        if v not in VALID_SORT_ORDERS:
            return "desc"
        return v


class PaginatedTasks(BaseModel):
    items: List[TaskResponse]
    page: int
    limit: int
    total: int
    total_pages: int
