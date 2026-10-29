from fastapi import APIRouter, status

from app.api.deps import DbSession
from app.schemas import ContactIn, MessageOut
from app.services import contact as contact_service

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def submit_contact(payload: ContactIn, db: DbSession) -> MessageOut:
    contact_service.create_message(db, payload)
    return MessageOut(detail="Thanks for reaching out. We'll get back to you soon.")
