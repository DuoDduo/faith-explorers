from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import DbSession
from app.models import Comment, Post
from app.schemas import CommentOut, Page, PostDetail, PostFilters, PostSummary, ViewsOut
from app.services import posts as post_service

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=Page[PostSummary])
def list_posts(
    db: DbSession,
    filters: Annotated[PostFilters, Query()],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 9,
) -> Page[PostSummary]:
    return post_service.list_published(db, filters, page, page_size)


@router.get("/{slug}", response_model=PostDetail)
def get_post(slug: str, db: DbSession) -> Post:
    return post_service.get_published(db, slug)


@router.post("/{slug}/views", response_model=ViewsOut)
def record_view(slug: str, db: DbSession) -> ViewsOut:
    # Separate from GET so client-side caching and refetching don't inflate counts.
    return ViewsOut(views=post_service.record_view(db, slug))


@router.get("/{slug}/comments", response_model=list[CommentOut])
def list_post_comments(slug: str, db: DbSession) -> list[Comment]:
    return post_service.list_comments(db, slug)
