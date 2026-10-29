from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Query, Response, UploadFile, status
from fastapi.concurrency import run_in_threadpool

from app.api.deps import CurrentUser, DbSession, SessionToken
from app.core import rate_limit
from app.core.rate_limit import limiter
from app.emails import sender
from app.models import User
from app.schemas import (
    AccountDeleteIn,
    Page,
    PasswordChangeIn,
    PostSummary,
    ProfileUpdateIn,
    UserOut,
)
from app.services import account as account_service
from app.services import engagement as engagement_service
from app.services import uploads as upload_service

router = APIRouter(prefix="/me", tags=["me"])

AVATAR_SIZE = 400


@router.get("/bookmarks", response_model=Page[PostSummary])
def my_bookmarks(
    user: CurrentUser,
    db: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 9,
) -> Page[PostSummary]:
    return engagement_service.list_bookmarks(db, user, page, page_size)


@router.patch("/profile", response_model=UserOut)
def update_profile(payload: ProfileUpdateIn, user: CurrentUser, db: DbSession) -> User:
    return account_service.update_profile(db, user, payload)


@router.put("/avatar", response_model=UserOut)
async def upload_avatar(file: UploadFile, user: CurrentUser, db: DbSession) -> User:
    limiter.consume(f"upload:{user.id}", rate_limit.UPLOADS_PER_USER)
    data = await file.read(upload_service.MAX_BYTES + 1)
    url = await run_in_threadpool(upload_service.save_image, data, square=AVATAR_SIZE)
    return account_service.set_avatar(db, user, url)


@router.delete("/avatar", response_model=UserOut)
def remove_avatar(user: CurrentUser, db: DbSession) -> User:
    return account_service.set_avatar(db, user, None)


@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: PasswordChangeIn,
    user: CurrentUser,
    token: SessionToken,
    db: DbSession,
    background: BackgroundTasks,
) -> Response:
    limiter.consume(f"password:{user.id}", rate_limit.LOGIN_FAILURES_PER_EMAIL)
    notice = account_service.change_password(
        db, user, payload.current_password, payload.new_password, keep_token=token
    )
    if notice is not None:
        background.add_task(sender.send, notice)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(payload: AccountDeleteIn, user: CurrentUser, db: DbSession) -> Response:
    limiter.consume(f"password:{user.id}", rate_limit.LOGIN_FAILURES_PER_EMAIL)
    account_service.delete_account(db, user, payload.password)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
