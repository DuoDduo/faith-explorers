import math
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select, update
from sqlalchemy.orm import Session, joinedload, selectinload

from app.db import get_db
from app.models import Category, Comment, CommentStatus, Post, PostStatus, Tag
from app.schemas import CommentOut, PostDetail, PostPage, ViewsOut

router = APIRouter(prefix="/posts", tags=["posts"])

DbSession = Annotated[Session, Depends(get_db)]


def _published():
    return select(Post).where(Post.status == PostStatus.PUBLISHED)


def _get_published(db: Session, slug: str) -> Post:
    post = db.scalar(
        _published()
        .where(Post.slug == slug)
        .options(joinedload(Post.author), joinedload(Post.category), selectinload(Post.tags))
    )
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.get("", response_model=PostPage)
def list_posts(
    db: DbSession,
    category: str | None = None,
    tag: str | None = None,
    q: Annotated[str | None, Query(max_length=100)] = None,
    featured: bool | None = None,
    sort: Literal["recent", "popular"] = "recent",
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 9,
) -> PostPage:
    stmt = _published()
    if category:
        stmt = stmt.join(Post.category).where(Category.slug == category)
    if tag:
        stmt = stmt.where(Post.tags.any(Tag.slug == tag))
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(or_(Post.title.ilike(pattern), Post.excerpt.ilike(pattern)))
    if featured is not None:
        stmt = stmt.where(Post.featured == featured)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    order = (
        (Post.views.desc(), Post.published_at.desc())
        if sort == "popular"
        else (Post.published_at.desc(), Post.id.desc())
    )
    items = db.scalars(
        stmt.order_by(*order)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .options(joinedload(Post.author), joinedload(Post.category), selectinload(Post.tags))
    ).all()

    return PostPage(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, math.ceil(total / page_size)),
    )


@router.get("/{slug}", response_model=PostDetail)
def get_post(slug: str, db: DbSession) -> Post:
    return _get_published(db, slug)


@router.post("/{slug}/views", response_model=ViewsOut)
def record_view(slug: str, db: DbSession) -> ViewsOut:
    # Kept separate from GET so caching/refetching on the client doesn't inflate counts.
    views = db.scalar(
        update(Post)
        .where(Post.slug == slug, Post.status == PostStatus.PUBLISHED)
        .values(views=Post.views + 1)
        .returning(Post.views)
    )
    if views is None:
        raise HTTPException(status_code=404, detail="Post not found")
    db.commit()
    return ViewsOut(views=views)


@router.get("/{slug}/comments", response_model=list[CommentOut])
def list_post_comments(slug: str, db: DbSession) -> list[Comment]:
    post = _get_published(db, slug)
    return list(
        db.scalars(
            select(Comment)
            .where(Comment.post_id == post.id, Comment.status == CommentStatus.VISIBLE)
            .order_by(Comment.created_at.asc())
            .options(joinedload(Comment.user), joinedload(Comment.post))
        )
    )
