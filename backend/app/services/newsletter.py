from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Subscriber


def subscribe(db: Session, email: str) -> bool:
    """Add the address to the list. Returns False if it was already subscribed."""
    email = email.lower()
    if db.scalar(select(Subscriber.id).where(Subscriber.email == email)) is not None:
        return False
    db.add(Subscriber(email=email))
    db.commit()
    return True
