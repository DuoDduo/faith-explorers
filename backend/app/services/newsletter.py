"""Newsletter sign-up with double opt-in: nobody is emailed until they confirm."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_token, new_session_token
from app.emails import templates
from app.emails.sender import Email
from app.models import Subscriber
from app.models.base import utcnow


def subscribe(db: Session, email: str) -> Email | None:
    """Start (or restart) a subscription. Returns the confirmation email to send, if any."""
    email = email.lower()
    subscriber = db.scalar(select(Subscriber).where(Subscriber.email == email))
    if subscriber is not None and subscriber.confirmed_at is not None:
        return None  # already subscribed; nothing to confirm
    if subscriber is None:
        subscriber = Subscriber(email=email)
        db.add(subscriber)
    token = new_session_token()
    subscriber.confirm_token_hash = hash_token(token)
    db.commit()
    return templates.newsletter_confirm(email, token)


def confirm(db: Session, token: str) -> bool:
    subscriber = db.scalar(
        select(Subscriber).where(Subscriber.confirm_token_hash == hash_token(token))
    )
    if subscriber is None:
        return False
    subscriber.confirmed_at = subscriber.confirmed_at or utcnow()
    subscriber.confirm_token_hash = None
    db.commit()
    return True


def unsubscribe(db: Session, token: str) -> bool:
    subscriber = db.scalar(select(Subscriber).where(Subscriber.unsubscribe_token == token))
    if subscriber is None:
        return False
    db.delete(subscriber)
    db.commit()
    return True
