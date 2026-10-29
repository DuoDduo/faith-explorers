from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class AuthorOut(ORMModel):
    id: int
    name: str
    avatar_url: str | None
    bio: str | None


class CategoryRef(ORMModel):
    name: str
    slug: str


class CategoryOut(CategoryRef):
    id: int
    description: str | None
    cover_url: str | None
    post_count: int


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


class PostPage(BaseModel):
    items: list[PostSummary]
    total: int
    page: int
    page_size: int
    pages: int


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


class ViewsOut(BaseModel):
    views: int


class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(min_length=1, max_length=5000)


class SubscribeIn(BaseModel):
    email: EmailStr


class MessageOut(BaseModel):
    detail: str
