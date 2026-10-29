from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.api.deps import ClientIP, DbSession
from app.core import rate_limit
from app.core.rate_limit import limiter
from app.emails import sender
from app.schemas import MessageOut, SubscribeIn, TokenIn
from app.services import newsletter as newsletter_service

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/subscribe", response_model=MessageOut, status_code=202)
def subscribe(
    payload: SubscribeIn, db: DbSession, ip: ClientIP, background: BackgroundTasks
) -> MessageOut:
    limiter.consume(f"newsletter:{ip}", rate_limit.NEWSLETTER_PER_IP)
    confirmation = newsletter_service.subscribe(db, payload.email)
    if confirmation is not None:
        background.add_task(sender.send, confirmation)
    # Same reply whether or not the address is already on the list, so the
    # endpoint can't be used to check who is subscribed.
    return MessageOut(detail="Almost there! Check your inbox for a link to confirm.")


@router.post("/confirm", response_model=MessageOut)
def confirm(payload: TokenIn, db: DbSession) -> MessageOut:
    if not newsletter_service.confirm(db, payload.token):
        raise HTTPException(status_code=404, detail="This confirmation link isn't valid.")
    return MessageOut(detail="You're subscribed. Welcome to Faith Explorers!")


@router.post("/unsubscribe", response_model=MessageOut)
def unsubscribe(payload: TokenIn, db: DbSession) -> MessageOut:
    # Succeeds even for unknown tokens: the reader's goal (not being emailed) is met.
    newsletter_service.unsubscribe(db, payload.token)
    return MessageOut(detail="You've been unsubscribed. We're sorry to see you go.")
