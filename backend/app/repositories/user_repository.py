from __future__ import annotations
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_all(self, skip: int = 0, limit: int = 50, search: Optional[str] = None) -> tuple[List[User], int]:
        query = self.db.query(User)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (User.name.ilike(search_term)) | (User.email.ilike(search_term))
            )
        total = query.count()
        users = query.order_by(User.name).offset(skip).limit(limit).all()
        return users, total

    def create(self, name: str, email: str, password_hash: str, role: str = "member", avatar_url: Optional[str] = None) -> User:
        user = User(
            name=name,
            email=email,
            password_hash=password_hash,
            role=role,
            avatar_url=avatar_url,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            if value is not None:
                setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()
