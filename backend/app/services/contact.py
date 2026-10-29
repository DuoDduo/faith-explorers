from sqlalchemy.orm import Session

from app.models import ContactMessage
from app.schemas import ContactIn


def create_message(db: Session, payload: ContactIn) -> ContactMessage:
    message = ContactMessage(**payload.model_dump())
    db.add(message)
    db.commit()
    return message
