from __future__ import annotations
from typing import List, Optional, Tuple
from datetime import date, datetime, timezone
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import asc, desc, func, or_, case
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskListParams
from app.utils.pagination import get_offset


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def _base_query(self):
        return (
            self.db.query(Task)
            .options(
                selectinload(Task.assignee),
                selectinload(Task.creator),
            )
        )

    def get_by_id(self, task_id: int) -> Optional[Task]:
        return (
            self._base_query()
            .filter(Task.id == task_id)
            .first()
        )

    def get_all(self, params: TaskListParams, current_user_id: Optional[int] = None) -> Tuple[List[Task], int]:
        query = self._base_query()

        # Filtering
        if params.status:
            query = query.filter(Task.status == params.status)
        if params.priority:
            query = query.filter(Task.priority == params.priority)
        if params.assignee:
            query = query.filter(Task.assigned_to == params.assignee)
        if params.search:
            search_term = f"%{params.search}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search_term),
                    Task.description.ilike(search_term),
                )
            )

        total = query.count()

        # Sorting
        sort_column = getattr(Task, params.sort_by, Task.created_at)
        if params.sort_order == "asc":
            query = query.order_by(asc(sort_column).nulls_last())
        else:
            query = query.order_by(desc(sort_column).nulls_last())

        # Pagination
        offset = get_offset(params.page, params.limit)
        tasks = query.offset(offset).limit(params.limit).all()

        return tasks, total

    def get_recent(self, limit: int = 10) -> List[Task]:
        return (
            self._base_query()
            .order_by(desc(Task.created_at))
            .limit(limit)
            .all()
        )

    def create(self, **kwargs) -> Task:
        task = Task(**kwargs)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        # Reload with relationships
        return self.get_by_id(task.id)

    def update(self, task: Task, **kwargs) -> Task:
        for key, value in kwargs.items():
            setattr(task, key, value)
        self.db.commit()
        self.db.refresh(task)
        return self.get_by_id(task.id)

    def delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.commit()

    def get_dashboard_stats(self, user_id: int) -> dict:
        today = date.today()

        counts = (
            self.db.query(
                func.count(Task.id).label("total"),
                func.sum(case((Task.status == "pending", 1), else_=0)).label("pending"),
                func.sum(case((Task.status == "in_progress", 1), else_=0)).label("in_progress"),
                func.sum(case((Task.status == "completed", 1), else_=0)).label("completed"),
                func.sum(case((Task.status == "blocked", 1), else_=0)).label("blocked"),
            )
            .first()
        )

        overdue = (
            self.db.query(func.count(Task.id))
            .filter(Task.due_date < today, Task.status != "completed")
            .scalar()
        ) or 0

        my_tasks = (
            self.db.query(func.count(Task.id))
            .filter(Task.assigned_to == user_id)
            .scalar()
        ) or 0

        status_breakdown = (
            self.db.query(Task.status, func.count(Task.id).label("count"))
            .group_by(Task.status)
            .all()
        )

        priority_breakdown = (
            self.db.query(Task.priority, func.count(Task.id).label("count"))
            .group_by(Task.priority)
            .all()
        )

        return {
            "total": counts.total or 0,
            "pending": int(counts.pending or 0),
            "in_progress": int(counts.in_progress or 0),
            "completed": int(counts.completed or 0),
            "blocked": int(counts.blocked or 0),
            "overdue": overdue,
            "my_tasks": my_tasks,
            "status_breakdown": [{"status": s, "count": c} for s, c in status_breakdown],
            "priority_breakdown": [{"priority": p, "count": c} for p, c in priority_breakdown],
        }
