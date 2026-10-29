from typing import Annotated

from fastapi import APIRouter, Query, Response, UploadFile, status
from fastapi.concurrency import run_in_threadpool

from app.api.deps import CurrentUser, CurrentWriter, DbSession
from app.models import AuthorApplication, Post
from app.schemas import (
    ApplicationIn,
    ApplicationOut,
    MyPostDetail,
    MyPostSummary,
    Page,
    PostWriteIn,
    UploadOut,
)
from app.services import authoring
from app.services import uploads as upload_service

router = APIRouter(tags=["authoring"])


@router.post(
    "/author-applications", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED
)
def apply_to_write(payload: ApplicationIn, user: CurrentUser, db: DbSession) -> AuthorApplication:
    return authoring.apply(db, user, payload)


@router.get("/me/author-application", response_model=ApplicationOut | None)
def my_application(user: CurrentUser, db: DbSession) -> AuthorApplication | None:
    return authoring.latest_application(db, user)


@router.get("/me/posts", response_model=Page[MyPostSummary])
def my_posts(
    user: CurrentWriter,
    db: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 20,
) -> Page[MyPostSummary]:
    return authoring.list_my_posts(db, user, page, page_size)


@router.post("/me/posts", response_model=MyPostDetail, status_code=status.HTTP_201_CREATED)
def create_post(payload: PostWriteIn, user: CurrentWriter, db: DbSession) -> Post:
    return authoring.create_post(db, user, payload)


@router.get("/me/posts/{post_id}", response_model=MyPostDetail)
def get_post(post_id: int, user: CurrentWriter, db: DbSession) -> Post:
    return authoring.get_my_post(db, user, post_id)


@router.put("/me/posts/{post_id}", response_model=MyPostDetail)
def update_post(post_id: int, payload: PostWriteIn, user: CurrentWriter, db: DbSession) -> Post:
    return authoring.update_post(db, user, post_id, payload)


@router.post("/me/posts/{post_id}/submit", response_model=MyPostDetail)
def submit_post(post_id: int, user: CurrentWriter, db: DbSession) -> Post:
    return authoring.submit_post(db, user, post_id)


@router.post("/me/posts/{post_id}/withdraw", response_model=MyPostDetail)
def withdraw_post(post_id: int, user: CurrentWriter, db: DbSession) -> Post:
    return authoring.withdraw_post(db, user, post_id)


@router.delete("/me/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, user: CurrentWriter, db: DbSession) -> Response:
    authoring.delete_post(db, user, post_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/uploads/images", response_model=UploadOut, status_code=status.HTTP_201_CREATED)
async def upload_image(file: UploadFile, _: CurrentWriter) -> UploadOut:
    data = await file.read(upload_service.MAX_BYTES + 1)
    # Decoding and resizing is CPU work; keep it off the event loop.
    return UploadOut(url=await run_in_threadpool(upload_service.save_image, data))
