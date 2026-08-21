from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.core.security import hash_password
from app.utils.exceptions import NotFoundError, ConflictError
from app.utils.pagination import paginate, get_offset


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def get_all(self, page: int = 1, limit: int = 50, search: Optional[str] = None) -> dict:
        skip = get_offset(page, limit)
        users, total = self.repo.get_all(skip=skip, limit=limit, search=search)
        return {
            "items": [UserResponse.model_validate(u) for u in users],
            **paginate(total, page, limit),
        }

    def get_by_id(self, user_id: int) -> UserResponse:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError(f"User with ID {user_id} not found")
        return UserResponse.model_validate(user)

    def create(self, data: UserCreate) -> UserResponse:
        existing = self.repo.get_by_email(data.email)
        if existing:
            raise ConflictError("A user with this email already exists")

        password_hash = hash_password(data.password)
        user = self.repo.create(
            name=data.name,
            email=data.email,
            password_hash=password_hash,
            role=data.role,
            avatar_url=data.avatar_url,
        )
        return UserResponse.model_validate(user)

    def update(self, user_id: int, data: UserUpdate) -> UserResponse:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError(f"User with ID {user_id} not found")

        update_data = {}
        if data.name is not None:
            update_data["name"] = data.name
        if data.email is not None:
            existing = self.repo.get_by_email(data.email)
            if existing and existing.id != user_id:
                raise ConflictError("Email is already in use")
            update_data["email"] = data.email
        if data.role is not None:
            update_data["role"] = data.role
        if data.avatar_url is not None:
            update_data["avatar_url"] = data.avatar_url
        if data.password is not None:
            update_data["password_hash"] = hash_password(data.password)

        updated = self.repo.update(user, **update_data)
        return UserResponse.model_validate(updated)

    def delete(self, user_id: int) -> None:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError(f"User with ID {user_id} not found")
        self.repo.delete(user)
