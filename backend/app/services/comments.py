from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Comment, CommentStatus, Post, PostStatus


def latest(db: Session, limit: int) -> list[Comment]:
    return list(
        db.scalars(
            select(Comment)
            .join(Comment.post)
            .where(Comment.status == CommentStatus.VISIBLE, Post.status == PostStatus.PUBLISHED)
            .order_by(Comment.created_at.desc())
            .limit(limit)
            .options(joinedload(Comment.user), joinedload(Comment.post))
        )
    )
