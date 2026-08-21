from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user
from app.services.external_api_service import fetch_external_users
from app.models.user import User

router = APIRouter(prefix="/api/external", tags=["External API"])


@router.get("/users")
async def get_external_users(
    current_user: User = Depends(get_current_user),
):
    """
    Proxy endpoint to fetch user directory from JSONPlaceholder API.
    Includes in-memory caching (60s TTL), timeout handling, and error handling.
    """
    try:
        users = await fetch_external_users()
        return {"items": users, "total": len(users)}
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
