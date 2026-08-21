from sqlalchemy.orm import Session
from app.repositories.task_repository import TaskRepository
from app.schemas.dashboard import DashboardResponse, DashboardSummary, StatusBreakdownItem, PriorityBreakdownItem
from app.schemas.task import TaskResponse
from app.models.user import User


class DashboardService:
    def __init__(self, db: Session):
        self.repo = TaskRepository(db)

    def get_dashboard(self, current_user: User) -> DashboardResponse:
        stats = self.repo.get_dashboard_stats(user_id=current_user.id)
        recent_tasks = self.repo.get_recent(limit=10)

        return DashboardResponse(
            summary=DashboardSummary(
                total=stats["total"],
                pending=stats["pending"],
                in_progress=stats["in_progress"],
                completed=stats["completed"],
                blocked=stats["blocked"],
                overdue=stats["overdue"],
                my_tasks=stats["my_tasks"],
            ),
            status_breakdown=[
                StatusBreakdownItem(status=item["status"], count=item["count"])
                for item in stats["status_breakdown"]
            ],
            priority_breakdown=[
                PriorityBreakdownItem(priority=item["priority"], count=item["count"])
                for item in stats["priority_breakdown"]
            ],
            recent_tasks=[TaskResponse.model_validate(t) for t in recent_tasks],
        )
