from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models import Category, Post, PostStatus
from app.schemas import CategoryOut


def _with_published_counts() -> Select[tuple[Category, int]]:
    counts = (
        select(Post.category_id, func.count(Post.id).label("post_count"))
        .where(Post.status == PostStatus.PUBLISHED)
        .group_by(Post.category_id)
        .subquery()
    )
    return select(Category, func.coalesce(counts.c.post_count, 0)).outerjoin(
        counts, counts.c.category_id == Category.id
    )


def _to_out(category: Category, post_count: int) -> CategoryOut:
    return CategoryOut(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        cover_url=category.cover_url,
        post_count=post_count,
    )


def list_categories(db: Session) -> list[CategoryOut]:
    rows = db.execute(_with_published_counts().order_by(Category.name)).all()
    return [_to_out(c, n) for c, n in rows]


def get_category(db: Session, slug: str) -> CategoryOut:
    row = db.execute(_with_published_counts().where(Category.slug == slug)).first()
    if row is None:
        raise NotFoundError("Category")
    return _to_out(*row)
