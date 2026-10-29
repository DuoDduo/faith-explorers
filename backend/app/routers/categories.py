from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Category, Post, PostStatus
from app.schemas import CategoryOut

router = APIRouter(prefix="/categories", tags=["categories"])

DbSession = Annotated[Session, Depends(get_db)]


def _with_counts():
    published = (
        select(Post.category_id, func.count(Post.id).label("post_count"))
        .where(Post.status == PostStatus.PUBLISHED)
        .group_by(Post.category_id)
        .subquery()
    )
    return select(Category, func.coalesce(published.c.post_count, 0)).outerjoin(
        published, published.c.category_id == Category.id
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


@router.get("", response_model=list[CategoryOut])
def list_categories(db: DbSession) -> list[CategoryOut]:
    rows = db.execute(_with_counts().order_by(Category.name)).all()
    return [_to_out(c, n) for c, n in rows]


@router.get("/{slug}", response_model=CategoryOut)
def get_category(slug: str, db: DbSession) -> CategoryOut:
    row = db.execute(_with_counts().where(Category.slug == slug)).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return _to_out(*row)
