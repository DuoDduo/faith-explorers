from fastapi import APIRouter, BackgroundTasks, status

from app.api.deps import ClientIP, DbSession
from app.core import rate_limit
from app.core.config import settings
from app.core.rate_limit import limiter
from app.emails import sender, templates
from app.schemas import ContactIn, MessageOut
from app.services import contact as contact_service

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def submit_contact(
    payload: ContactIn, db: DbSession, ip: ClientIP, background: BackgroundTasks
) -> MessageOut:
    limiter.consume(f"contact:{ip}", rate_limit.CONTACT_PER_IP)
    contact_service.create_message(db, payload)
    if settings.contact_notify_email:
        background.add_task(
            sender.send,
            templates.contact_notification(
                settings.contact_notify_email, payload.name, payload.email, payload.message
            ),
        )
    return MessageOut(detail="Thanks for reaching out. We'll get back to you soon.")
