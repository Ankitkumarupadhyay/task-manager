from datetime import timedelta
from sqlalchemy.orm import Session
from app.core.security import verify_password, create_access_token, hash_password
from app.core.config import settings
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.utils.exceptions import UnauthorizedError, ConflictError, BadRequestError
from app.models.user import User


class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register(self, data: RegisterRequest) -> UserResponse:
        existing = self.user_repo.get_by_email(data.email)
        if existing:
            raise ConflictError("A user with this email already exists")

        valid_roles = {"admin", "manager", "member"}
        if data.role not in valid_roles:
            raise BadRequestError(f"Role must be one of: {', '.join(valid_roles)}")

        password_hash = hash_password(data.password)
        user = self.user_repo.create(
            name=data.name,
            email=data.email,
            password_hash=password_hash,
            role=data.role,
        )
        return UserResponse.model_validate(user)

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")

        token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return TokenResponse(access_token=token)

    def get_me(self, user: User) -> UserResponse:
        return UserResponse.model_validate(user)
