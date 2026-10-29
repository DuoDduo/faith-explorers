from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import DbSession
from app.models import Comment
from app.schemas import CommentOut
from app.services import comments as comment_service

router = APIRouter(prefix="/comments", tags=["comments"])


@router.get("/latest", response_model=list[CommentOut])
def latest_comments(db: DbSession, limit: Annotated[int, Query(ge=1, le=20)] = 4) -> list[Comment]:
    return comment_service.latest(db, limit)
