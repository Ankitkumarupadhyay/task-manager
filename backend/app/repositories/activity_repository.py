from typing import List, Optional
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import desc
from app.models.activity import TaskActivity


class ActivityRepository:
    def __init__(self, db: Session):
        self.db = db

    def _base_query(self):
        return self.db.query(TaskActivity).options(selectinload(TaskActivity.user))

    def get_by_task(self, task_id: int) -> List[TaskActivity]:
        return (
            self._base_query()
            .filter(TaskActivity.task_id == task_id)
            .order_by(desc(TaskActivity.created_at))
            .all()
        )

    def log(
        self,
        task_id: int,
        user_id: int,
        action: str,
        old_value: Optional[str] = None,
        new_value: Optional[str] = None,
    ) -> TaskActivity:
        activity = TaskActivity(
            task_id=task_id,
            user_id=user_id,
            action=action,
            old_value=old_value,
            new_value=new_value,
        )
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return self.get_by_id(activity.id)

    def get_by_id(self, activity_id: int) -> Optional[TaskActivity]:
        return self._base_query().filter(TaskActivity.id == activity_id).first()
