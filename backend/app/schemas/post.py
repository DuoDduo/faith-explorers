from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.schemas.category import CategoryRef
from app.schemas.common import ORMModel
from app.schemas.user import AuthorOut

PostSort = Literal["recent", "popular"]


class TagOut(ORMModel):
    name: str
    slug: str


class PostSummary(ORMModel):
    id: int
    slug: str
    title: str
    excerpt: str
    cover_url: str | None
    featured: bool
    read_time: int
    views: int
    published_at: datetime | None
    author: AuthorOut
    category: CategoryRef
    tags: list[TagOut]


class PostDetail(PostSummary):
    body: str


class PostFilters(BaseModel):
    category: str | None = None
    tag: str | None = None
    q: str | None = None
    featured: bool | None = None
    sort: PostSort = "recent"


class ViewsOut(BaseModel):
    views: int
