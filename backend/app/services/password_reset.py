from datetime import timedelta

from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import InvalidInputError
from app.core.security import hash_password, hash_token, new_session_token
from app.emails import templates
from app.emails.sender import Email
from app.models import PasswordResetToken, User, UserSession
from app.models.base import utcnow

TOKEN_TTL = timedelta(hours=1)
INVALID_LINK = "This reset link is invalid or has expired. Please request a new one."


def request_reset(db: Session, email: str) -> Email | None:
    """Create a reset link if the address belongs to an active account.

    Returns the email to send, or None. Callers must respond the same way either way so
    the endpoint doesn't reveal which addresses are registered.
    """
    user = db.scalar(select(User).where(User.email == email.lower()))
    if user is None or not user.is_active or user.email is None:
        return None
    token = new_session_token()
    db.add(
        PasswordResetToken(
            token_hash=hash_token(token), user_id=user.id, expires_at=utcnow() + TOKEN_TTL
        )
    )
    db.commit()
    return templates.password_reset(user.email, user.name, token)


def reset_password(db: Session, token: str, new_password: str) -> Email:
    """Set a new password from a reset link. Signs the user out everywhere."""
    reset = db.scalar(
        select(PasswordResetToken)
        .where(
            PasswordResetToken.token_hash == hash_token(token),
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > utcnow(),
        )
        .options(joinedload(PasswordResetToken.user))
    )
    if reset is None or not reset.user.is_active:
        raise InvalidInputError("token", INVALID_LINK)

    user = reset.user
    user.password_hash = hash_password(new_password)
    now = utcnow()
    # Retire every outstanding link for this user, and every signed-in session.
    db.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None))
        .values(used_at=now)
    )
    db.execute(delete(UserSession).where(UserSession.user_id == user.id))
    db.commit()
    return templates.password_changed(user.email or "", user.name)
