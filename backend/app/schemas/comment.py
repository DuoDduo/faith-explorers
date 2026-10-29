from datetime import datetime

from app.schemas.common import ORMModel


class CommentUser(ORMModel):
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
