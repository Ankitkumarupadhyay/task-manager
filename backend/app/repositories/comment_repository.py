from typing import List, Optional
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import desc
from app.models.comment import Comment


class CommentRepository:
    def __init__(self, db: Session):
        self.db = db

    def _base_query(self):
        return self.db.query(Comment).options(selectinload(Comment.user))

    def get_by_id(self, comment_id: int) -> Optional[Comment]:
        return self._base_query().filter(Comment.id == comment_id).first()

    def get_by_task(self, task_id: int) -> List[Comment]:
        return (
            self._base_query()
            .filter(Comment.task_id == task_id)
            .order_by(desc(Comment.created_at))
            .all()
        )

    def create(self, task_id: int, user_id: int, comment: str) -> Comment:
        new_comment = Comment(task_id=task_id, user_id=user_id, comment=comment)
        self.db.add(new_comment)
        self.db.commit()
        self.db.refresh(new_comment)
        return self.get_by_id(new_comment.id)

    def update(self, comment: Comment, new_text: str) -> Comment:
        comment.comment = new_text
        self.db.commit()
        self.db.refresh(comment)
        return self.get_by_id(comment.id)

    def delete(self, comment: Comment) -> None:
        self.db.delete(comment)
        self.db.commit()
