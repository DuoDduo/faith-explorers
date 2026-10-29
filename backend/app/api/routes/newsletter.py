from fastapi import APIRouter, Response, status

from app.api.deps import ClientIP, DbSession
from app.core import rate_limit
from app.core.rate_limit import limiter
from app.schemas import MessageOut, SubscribeIn
from app.services import newsletter as newsletter_service

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("/subscribe", response_model=MessageOut)
def subscribe(payload: SubscribeIn, db: DbSession, response: Response, ip: ClientIP) -> MessageOut:
    limiter.consume(f"newsletter:{ip}", rate_limit.NEWSLETTER_PER_IP)
    # Same reply whether or not the address is already on the list, so the
    # endpoint can't be used to check who is subscribed.
    if newsletter_service.subscribe(db, payload.email):
        response.status_code = status.HTTP_201_CREATED
    return MessageOut(detail="You're subscribed. Welcome to Faith Explorers!")
