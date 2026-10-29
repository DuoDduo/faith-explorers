import math

from sqlalchemy import Select, func, or_, select, update
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.exceptions import NotFoundError
from app.models import Category, Comment, CommentStatus, Post, PostStatus, Tag
from app.schemas import Page, PostFilters, PostSummary

_SUMMARY_OPTIONS = (joinedload(Post.author), joinedload(Post.category), selectinload(Post.tags))


def _published() -> Select[tuple[Post]]:
    return select(Post).where(Post.status == PostStatus.PUBLISHED)


def list_published(
    db: Session, filters: PostFilters, page: int, page_size: int
) -> Page[PostSummary]:
    stmt = _published()
    if filters.category:
        stmt = stmt.join(Post.category).where(Category.slug == filters.category)
    if filters.tag:
        stmt = stmt.where(Post.tags.any(Tag.slug == filters.tag))
    if filters.q:
        pattern = f"%{filters.q}%"
        stmt = stmt.where(or_(Post.title.ilike(pattern), Post.excerpt.ilike(pattern)))
    if filters.featured is not None:
        stmt = stmt.where(Post.featured == filters.featured)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    order = (
        (Post.views.desc(), Post.published_at.desc())
        if filters.sort == "popular"
        else (Post.published_at.desc(), Post.id.desc())
    )
    items = db.scalars(
        stmt.order_by(*order)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .options(*_SUMMARY_OPTIONS)
    ).all()

    return Page[PostSummary](
        items=[PostSummary.model_validate(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, math.ceil(total / page_size)),
    )


def get_published(db: Session, slug: str) -> Post:
    post = db.scalar(_published().where(Post.slug == slug).options(*_SUMMARY_OPTIONS))
    if post is None:
        raise NotFoundError("Post")
    return post


def record_view(db: Session, slug: str) -> int:
    views = db.scalar(
        update(Post)
        .where(Post.slug == slug, Post.status == PostStatus.PUBLISHED)
        .values(views=Post.views + 1)
        .returning(Post.views)
    )
    if views is None:
        raise NotFoundError("Post")
    db.commit()
    return views


def list_comments(db: Session, slug: str) -> list[Comment]:
    post = get_published(db, slug)
    return list(
        db.scalars(
            select(Comment)
            .where(Comment.post_id == post.id, Comment.status == CommentStatus.VISIBLE)
            .order_by(Comment.created_at.asc())
            .options(joinedload(Comment.user), joinedload(Comment.post))
        )
    )
