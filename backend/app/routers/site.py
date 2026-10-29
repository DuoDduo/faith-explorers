"""Site-wide endpoints: latest comments, contact form and newsletter sign-up."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models import Comment, CommentStatus, ContactMessage, Post, PostStatus, Subscriber
from app.schemas import CommentOut, ContactIn, MessageOut, SubscribeIn

router = APIRouter(tags=["site"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("/comments/latest", response_model=list[CommentOut])
def latest_comments(db: DbSession, limit: Annotated[int, Query(ge=1, le=20)] = 4) -> list[Comment]:
    return list(
        db.scalars(
            select(Comment)
            .join(Comment.post)
            .where(Comment.status == CommentStatus.VISIBLE, Post.status == PostStatus.PUBLISHED)
            .order_by(Comment.created_at.desc())
            .limit(limit)
            .options(joinedload(Comment.user), joinedload(Comment.post))
        )
    )


@router.post("/contact", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def submit_contact(payload: ContactIn, db: DbSession) -> MessageOut:
    db.add(ContactMessage(**payload.model_dump()))
    db.commit()
    return MessageOut(detail="Thanks for reaching out. We'll get back to you soon.")


@router.post("/newsletter/subscribe", response_model=MessageOut)
def subscribe(payload: SubscribeIn, db: DbSession, response: Response) -> MessageOut:
    email = payload.email.lower()
    # Same reply whether or not the address is already on the list, so the
    # endpoint can't be used to check who is subscribed.
    if db.scalar(select(Subscriber.id).where(Subscriber.email == email)) is None:
        db.add(Subscriber(email=email))
        db.commit()
        response.status_code = status.HTTP_201_CREATED
    return MessageOut(detail="You're subscribed. Welcome to Faith Explorers!")
