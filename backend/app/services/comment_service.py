from typing import List
from sqlalchemy.orm import Session
from app.repositories.comment_repository import CommentRepository
from app.repositories.task_repository import TaskRepository
from app.repositories.activity_repository import ActivityRepository
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from app.utils.exceptions import NotFoundError, ForbiddenError
from app.models.user import User


class CommentService:
    def __init__(self, db: Session):
        self.repo = CommentRepository(db)
        self.task_repo = TaskRepository(db)
        self.activity_repo = ActivityRepository(db)

    def get_by_task(self, task_id: int) -> List[CommentResponse]:
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise NotFoundError(f"Task with ID {task_id} not found")
        comments = self.repo.get_by_task(task_id)
        return [CommentResponse.model_validate(c) for c in comments]

    def create(self, task_id: int, data: CommentCreate, current_user: User) -> CommentResponse:
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise NotFoundError(f"Task with ID {task_id} not found")

        comment = self.repo.create(task_id=task_id, user_id=current_user.id, comment=data.comment)

        self.activity_repo.log(
            task_id=task_id,
            user_id=current_user.id,
            action="comment_added",
            new_value=data.comment[:100] + ("..." if len(data.comment) > 100 else ""),
        )

        return CommentResponse.model_validate(comment)

    def update(self, comment_id: int, data: CommentUpdate, current_user: User) -> CommentResponse:
        comment = self.repo.get_by_id(comment_id)
        if not comment:
            raise NotFoundError(f"Comment with ID {comment_id} not found")

        if comment.user_id != current_user.id and current_user.role not in ["admin", "manager"]:
            raise ForbiddenError("You can only edit your own comments")

        updated = self.repo.update(comment, data.comment)
        return CommentResponse.model_validate(updated)

    def delete(self, comment_id: int, current_user: User) -> None:
        comment = self.repo.get_by_id(comment_id)
        if not comment:
            raise NotFoundError(f"Comment with ID {comment_id} not found")

        if comment.user_id != current_user.id and current_user.role not in ["admin", "manager"]:
            raise ForbiddenError("You can only delete your own comments")

        self.repo.delete(comment)
