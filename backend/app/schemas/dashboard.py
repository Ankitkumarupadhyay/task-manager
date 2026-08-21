from typing import List, Optional
from pydantic import BaseModel
from app.schemas.task import TaskResponse


class DashboardSummary(BaseModel):
    total: int
    pending: int
    in_progress: int
    completed: int
    blocked: int
    overdue: int
    my_tasks: int


class StatusBreakdownItem(BaseModel):
    status: str
    count: int


class PriorityBreakdownItem(BaseModel):
    priority: str
    count: int


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    status_breakdown: List[StatusBreakdownItem]
    priority_breakdown: List[PriorityBreakdownItem]
    recent_tasks: List[TaskResponse]
