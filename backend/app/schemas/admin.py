from datetime import datetime

from pydantic import BaseModel, Field

from app.models import CommentStatus, Role
from app.schemas.authoring import ApplicationOut
from app.schemas.comment import CommentOut
from app.schemas.common import ORMModel


class AdminOverview(BaseModel):
    pending_applications: int
    pending_posts: int
    unhandled_messages: int
    published_posts: int
    users: int
    comments: int


class UserRef(ORMModel):
    id: int
    name: str
    email: str | None


class AdminApplicationOut(ApplicationOut):
    user: UserRef


class ReviewIn(BaseModel):
    note: str | None = Field(default=None, max_length=1000)


class FeatureIn(BaseModel):
    featured: bool


class AdminCommentOut(CommentOut):
    status: CommentStatus


class CommentStatusIn(BaseModel):
    status: CommentStatus


class ContactMessageOut(ORMModel):
    id: int
    name: str
    email: str
    message: str
    handled: bool
    created_at: datetime


class HandledIn(BaseModel):
    handled: bool


class AdminUserOut(ORMModel):
    id: int
    name: str
    email: str | None
    role: Role
    is_active: bool
    created_at: datetime


class UserUpdateIn(BaseModel):
    role: Role | None = None
    is_active: bool | None = None
