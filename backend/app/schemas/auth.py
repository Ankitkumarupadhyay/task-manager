from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "member"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
