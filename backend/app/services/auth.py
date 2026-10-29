from datetime import datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.exceptions import ConflictError
from app.core.security import hash_password, hash_token, new_session_token, verify_password
from app.models import Role, User, UserSession
from app.models.base import utcnow
from app.schemas import RegisterIn


def _find_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower()))


def register(db: Session, payload: RegisterIn) -> User:
    """Add the user without committing; create_session commits both together."""
    if _find_by_email(db, payload.email) is not None:
        raise ConflictError("An account with this email already exists")
    user = User(
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=Role.READER,
    )
    db.add(user)
    db.flush()
    return user


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = _find_by_email(db, email)
    password_hash = user.password_hash if user and user.is_active else None
    if not verify_password(password, password_hash):
        return None
    return user


def create_session(db: Session, user: User) -> tuple[str, datetime]:
    token = new_session_token()
    expires_at = utcnow() + timedelta(days=settings.session_ttl_days)
    db.add(UserSession(token_hash=hash_token(token), user_id=user.id, expires_at=expires_at))
    db.commit()
    return token, expires_at


def user_for_token(db: Session, token: str) -> User | None:
    session = db.scalar(
        select(UserSession)
        .where(UserSession.token_hash == hash_token(token), UserSession.expires_at > utcnow())
        .options(joinedload(UserSession.user))
    )
    if session is None or not session.user.is_active:
        return None
    return session.user


def revoke_session(db: Session, token: str) -> None:
    db.execute(delete(UserSession).where(UserSession.token_hash == hash_token(token)))
    db.commit()
