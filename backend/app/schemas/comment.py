from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import ORMModel


class CommentUser(ORMModel):
    id: int
    name: str
    avatar_url: str | None


class CommentPost(ORMModel):
    slug: str
    title: str


class CommentOut(ORMModel):
    id: int
    body: str
    created_at: datetime
    user: CommentUser
    post: CommentPost


class CommentIn(BaseModel):
    body: str = Field(min_length=1, max_length=2000)

    @field_validator("body")
    @classmethod
    def strip_body(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Comment can't be empty")
        return value
