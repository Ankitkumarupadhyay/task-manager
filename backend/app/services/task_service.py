from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.task_repository import TaskRepository
from app.repositories.user_repository import UserRepository
from app.repositories.activity_repository import ActivityRepository
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListParams, PaginatedTasks
from app.utils.exceptions import NotFoundError, ForbiddenError, BadRequestError
from app.utils.pagination import paginate
from app.models.user import User


class TaskService:
    def __init__(self, db: Session):
        self.repo = TaskRepository(db)
        self.user_repo = UserRepository(db)
        self.activity_repo = ActivityRepository(db)

    def get_all(self, params: TaskListParams) -> PaginatedTasks:
        tasks, total = self.repo.get_all(params)
        return PaginatedTasks(
            items=[TaskResponse.model_validate(t) for t in tasks],
            **paginate(total, params.page, params.limit),
        )

    def get_by_id(self, task_id: int) -> TaskResponse:
        task = self.repo.get_by_id(task_id)
        if not task:
            raise NotFoundError(f"Task with ID {task_id} not found")
        return TaskResponse.model_validate(task)

    def create(self, data: TaskCreate, current_user: User) -> TaskResponse:
        if data.assigned_to:
            assignee = self.user_repo.get_by_id(data.assigned_to)
            if not assignee:
                raise BadRequestError(f"Assignee with ID {data.assigned_to} does not exist")

        task = self.repo.create(
            title=data.title,
            description=data.description,
            status=data.status,
            priority=data.priority,
            assigned_to=data.assigned_to,
            created_by=current_user.id,
            due_date=data.due_date,
        )

        self.activity_repo.log(
            task_id=task.id,
            user_id=current_user.id,
            action="task_created",
            new_value=data.title,
        )

        if data.assigned_to:
            assignee = self.user_repo.get_by_id(data.assigned_to)
            self.activity_repo.log(
                task_id=task.id,
                user_id=current_user.id,
                action="task_assigned",
                new_value=assignee.name if assignee else str(data.assigned_to),
            )

        return TaskResponse.model_validate(task)

    def update(self, task_id: int, data: TaskUpdate, current_user: User) -> TaskResponse:
        task = self.repo.get_by_id(task_id)
        if not task:
            raise NotFoundError(f"Task with ID {task_id} not found")

        # Members can only update their own tasks
        if current_user.role == "member" and task.assigned_to != current_user.id:
            raise ForbiddenError("You can only update tasks assigned to you")

        update_data = {}
        changes = []

        if data.title is not None and data.title != task.title:
            update_data["title"] = data.title
            changes.append(("task_updated", None, f"Title changed to '{data.title}'"))

        if data.description is not None and data.description != task.description:
            update_data["description"] = data.description
            changes.append(("task_updated", None, "Description updated"))

        if data.status is not None and data.status != task.status:
            changes.append(("status_changed", task.status, data.status))
            update_data["status"] = data.status

        if data.priority is not None and data.priority != task.priority:
            changes.append(("priority_changed", task.priority, data.priority))
            update_data["priority"] = data.priority

        if data.assigned_to is not None and data.assigned_to != task.assigned_to:
            if data.assigned_to:
                assignee = self.user_repo.get_by_id(data.assigned_to)
                if not assignee:
                    raise BadRequestError(f"Assignee with ID {data.assigned_to} does not exist")
                changes.append(("task_assigned", None, assignee.name))
            update_data["assigned_to"] = data.assigned_to

        if data.due_date is not None and data.due_date != task.due_date:
            changes.append(("due_date_changed", str(task.due_date) if task.due_date else None, str(data.due_date)))
            update_data["due_date"] = data.due_date

        if update_data:
            task = self.repo.update(task, **update_data)
            for action, old_val, new_val in changes:
                self.activity_repo.log(
                    task_id=task.id,
                    user_id=current_user.id,
                    action=action,
                    old_value=old_val,
                    new_value=new_val,
                )

        return TaskResponse.model_validate(task)

    def delete(self, task_id: int, current_user: User) -> None:
        task = self.repo.get_by_id(task_id)
        if not task:
            raise NotFoundError(f"Task with ID {task_id} not found")

        if current_user.role == "member":
            raise ForbiddenError("Members cannot delete tasks")

        self.repo.delete(task)
