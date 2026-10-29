from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models import Comment, CommentStatus, Post, PostStatus, Role, User


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


def add_comment(db: Session, post: Post, user: User, body: str) -> Comment:
    comment = Comment(body=body, post=post, user=user)
    db.add(comment)
    db.commit()
    return comment


def delete_comment(db: Session, comment_id: int, user: User) -> None:
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise NotFoundError("Comment")
    if comment.user_id != user.id and user.role != Role.ADMIN:
        raise PermissionDeniedError("You can only delete your own comments")
    db.delete(comment)
    db.commit()
