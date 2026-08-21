from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserBrief


class CommentCreate(BaseModel):
    comment: str

    class Config:
        json_schema_extra = {"example": {"comment": "This task needs more clarification."}}


class CommentUpdate(BaseModel):
    comment: str


class CommentResponse(BaseModel):
    id: int
    task_id: int
    comment: str
    created_at: datetime
    updated_at: datetime
    user: Optional[UserBrief] = None

    model_config = {"from_attributes": True}


class ActivityResponse(BaseModel):
    id: int
    task_id: int
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime
    user: Optional[UserBrief] = None

    model_config = {"from_attributes": True}
