from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, DbSession, OptionalUser
from app.models import Comment, Post
from app.schemas import (
    CommentIn,
    CommentOut,
    EngagementOut,
    Page,
    PostDetail,
    PostFilters,
    PostSummary,
    ViewsOut,
)
from app.services import comments as comment_service
from app.services import engagement as engagement_service
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


@router.post("/{slug}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def add_comment(slug: str, payload: CommentIn, user: CurrentUser, db: DbSession) -> Comment:
    post = post_service.get_published(db, slug)
    return comment_service.add_comment(db, post, user, payload.body)


@router.get("/{slug}/engagement", response_model=EngagementOut)
def get_engagement(slug: str, user: OptionalUser, db: DbSession) -> EngagementOut:
    """Like count, plus whether the signed-in user (if any) liked or saved the post."""
    return engagement_service.engagement(db, post_service.get_published(db, slug), user)


@router.put("/{slug}/like", response_model=EngagementOut)
def like_post(slug: str, user: CurrentUser, db: DbSession) -> EngagementOut:
    return engagement_service.like(db, post_service.get_published(db, slug), user)


@router.delete("/{slug}/like", response_model=EngagementOut)
def unlike_post(slug: str, user: CurrentUser, db: DbSession) -> EngagementOut:
    return engagement_service.unlike(db, post_service.get_published(db, slug), user)


@router.put("/{slug}/bookmark", response_model=EngagementOut)
def bookmark_post(slug: str, user: CurrentUser, db: DbSession) -> EngagementOut:
    return engagement_service.bookmark(db, post_service.get_published(db, slug), user)


@router.delete("/{slug}/bookmark", response_model=EngagementOut)
def unbookmark_post(slug: str, user: CurrentUser, db: DbSession) -> EngagementOut:
    return engagement_service.unbookmark(db, post_service.get_published(db, slug), user)
