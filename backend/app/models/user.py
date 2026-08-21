from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, DateTime, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    member = "member"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        SAEnum("admin", "manager", "member", name="userrole"),
        nullable=False,
        default="member",
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    assigned_tasks: Mapped[List["Task"]] = relationship(
        "Task", foreign_keys="Task.assigned_to", back_populates="assignee"
    )
    created_tasks: Mapped[List["Task"]] = relationship(
        "Task", foreign_keys="Task.created_by", back_populates="creator"
    )
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="user")
    activities: Mapped[List["TaskActivity"]] = relationship("TaskActivity", back_populates="user")
