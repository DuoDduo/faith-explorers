from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models import Post, PostStatus, User
from app.schemas import AuthorProfile


def get_author(db: Session, user_id: int) -> AuthorProfile:
    """Public profile of someone with published articles. Readers have no public page."""
    row = db.execute(
        select(User, func.count(Post.id))
        .join(Post, Post.author_id == User.id)
        .where(User.id == user_id, User.is_active, Post.status == PostStatus.PUBLISHED)
        .group_by(User.id)
    ).first()
    if row is None:
        raise NotFoundError("Author")
    user, post_count = row
    return AuthorProfile(
        id=user.id,
        name=user.name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        post_count=post_count,
    )
