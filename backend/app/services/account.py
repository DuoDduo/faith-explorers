"""Self-service account management: profile, avatar, password and account deletion."""

from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, InvalidInputError
from app.core.security import hash_password, hash_token, verify_password
from app.emails import templates
from app.emails.sender import Email
from app.models import (
    AuthorApplication,
    Bookmark,
    Comment,
    PasswordResetToken,
    Post,
    PostLike,
    Role,
    User,
    UserSession,
)
from app.schemas import ProfileUpdateIn

FORMER_MEMBER = "Former member"


def update_profile(db: Session, user: User, changes: ProfileUpdateIn) -> User:
    if changes.name is not None:
        user.name = changes.name
    if "bio" in changes.model_fields_set:
        user.bio = changes.bio or None
    db.commit()
    return user


def set_avatar(db: Session, user: User, url: str | None) -> User:
    user.avatar_url = url
    db.commit()
    return user


def _require_password(user: User, password: str, field: str) -> None:
    if not verify_password(password, user.password_hash):
        raise InvalidInputError(field, "That password isn't right")


def change_password(
    db: Session, user: User, current: str, new: str, keep_token: str
) -> Email | None:
    """Change the password and sign out every other session (keeping the current one)."""
    _require_password(user, current, "current_password")
    user.password_hash = hash_password(new)
    db.execute(
        delete(UserSession).where(
            UserSession.user_id == user.id, UserSession.token_hash != hash_token(keep_token)
        )
    )
    db.commit()
    return templates.password_changed(user.email, user.name) if user.email else None


def delete_account(db: Session, user: User, password: str) -> None:
    """Remove the member's personal data and activity.

    Articles they published stay up under "Former member" (admins can unpublish them);
    everything else they created is deleted and the account can no longer sign in.
    """
    if user.role == Role.ADMIN:
        raise ConflictError("Admins can't delete their own account. Ask another admin first.")
    _require_password(user, password, "password")

    liked = db.scalars(select(PostLike.post_id).where(PostLike.user_id == user.id)).all()
    if liked:
        db.execute(update(Post).where(Post.id.in_(liked)).values(like_count=Post.like_count - 1))
    for model in (PostLike, Bookmark, Comment, UserSession, PasswordResetToken, AuthorApplication):
        db.execute(delete(model).where(model.user_id == user.id))

    user.name = FORMER_MEMBER
    user.email = None
    user.password_hash = None
    user.avatar_url = None
    user.bio = None
    user.is_active = False
    db.commit()
