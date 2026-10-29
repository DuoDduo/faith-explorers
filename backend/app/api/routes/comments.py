from typing import Annotated

from fastapi import APIRouter, Query, Response, status

from app.api.deps import CurrentUser, DbSession
from app.models import Comment
from app.schemas import CommentOut
from app.services import comments as comment_service

router = APIRouter(prefix="/comments", tags=["comments"])


@router.get("/latest", response_model=list[CommentOut])
def latest_comments(db: DbSession, limit: Annotated[int, Query(ge=1, le=20)] = 4) -> list[Comment]:
    return comment_service.latest(db, limit)


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, user: CurrentUser, db: DbSession) -> Response:
    comment_service.delete_comment(db, comment_id, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
