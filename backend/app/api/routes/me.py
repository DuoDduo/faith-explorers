from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import CurrentUser, DbSession
from app.schemas import Page, PostSummary
from app.services import engagement as engagement_service

router = APIRouter(prefix="/me", tags=["me"])


@router.get("/bookmarks", response_model=Page[PostSummary])
def my_bookmarks(
    user: CurrentUser,
    db: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 9,
) -> Page[PostSummary]:
    return engagement_service.list_bookmarks(db, user, page, page_size)
