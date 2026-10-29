from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models import Role
from app.schemas.common import ORMModel


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name is required")
        return value


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserOut(ORMModel):
    id: int
    name: str
    email: str | None
    avatar_url: str | None
    bio: str | None
    role: Role


class AuthOut(BaseModel):
    user: UserOut
    token: str
    expires_at: datetime
