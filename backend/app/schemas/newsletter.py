from pydantic import BaseModel, EmailStr, Field


class SubscribeIn(BaseModel):
    email: EmailStr


class TokenIn(BaseModel):
    token: str = Field(min_length=10, max_length=200)
