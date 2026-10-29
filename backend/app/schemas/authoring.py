from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.models import ApplicationStatus, PostStatus
from app.schemas.common import ORMModel
from app.schemas.post import PostDetail, PostSummary

MAX_TAGS = 8


class ApplicationIn(BaseModel):
    motivation: str = Field(min_length=30, max_length=2000)

    @field_validator("motivation")
    @classmethod
    def strip(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 30:
            raise ValueError("Tell us a little more (at least 30 characters)")
        return value


class ApplicationOut(ORMModel):
    id: int
    status: ApplicationStatus
    motivation: str
    created_at: datetime
    reviewed_at: datetime | None
    review_note: str | None


class PostWriteIn(BaseModel):
    """Fields an author edits. Status changes go through /submit, not here."""

    title: str = Field(min_length=3, max_length=200)
    excerpt: str = Field(min_length=10, max_length=500)
    body: str = Field(min_length=1, max_length=100_000)
    category: str = Field(description="Category slug")
    tags: list[str] = Field(default_factory=list, max_length=MAX_TAGS)
    cover_url: str | None = None

    @field_validator("title", "excerpt", "body")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("tags")
    @classmethod
    def clean_tags(cls, tags: list[str]) -> list[str]:
        cleaned: list[str] = []
        for tag in tags:
            tag = tag.strip().lstrip("#").strip()
            if not tag:
                continue
            if len(tag) > 40:
                raise ValueError("Tags can be up to 40 characters")
            if tag.lower() not in (t.lower() for t in cleaned):
                cleaned.append(tag)
        return cleaned

    @field_validator("cover_url")
    @classmethod
    def local_media_only(cls, value: str | None) -> str | None:
        if value and not value.startswith("/media/"):
            raise ValueError("Upload the cover image first")
        return value or None


class MyPostSummary(PostSummary):
    status: PostStatus
    updated_at: datetime


class MyPostDetail(PostDetail):
    status: PostStatus
    updated_at: datetime


class UploadOut(BaseModel):
    url: str
