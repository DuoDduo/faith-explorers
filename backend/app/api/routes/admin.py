from typing import Annotated, Literal

from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, DbSession
from app.models import (
    ApplicationStatus,
    AuthorApplication,
    Comment,
    CommentStatus,
    ContactMessage,
    Post,
    PostStatus,
    User,
)
from app.schemas import (
    AdminApplicationOut,
    AdminCommentOut,
    AdminOverview,
    AdminUserOut,
    CommentStatusIn,
    ContactMessageOut,
    FeatureIn,
    HandledIn,
    MyPostDetail,
    MyPostSummary,
    Page,
    ReviewIn,
    UserUpdateIn,
)
from app.services import admin as admin_service

router = APIRouter(prefix="/admin", tags=["admin"])

PageNumber = Annotated[int, Query(ge=1)]
PageSize = Annotated[int, Query(ge=1, le=100)]


@router.get("/overview", response_model=AdminOverview)
def overview(_: CurrentAdmin, db: DbSession) -> AdminOverview:
    return admin_service.overview(db)


# Applications


@router.get("/applications", response_model=Page[AdminApplicationOut])
def applications(
    _: CurrentAdmin,
    db: DbSession,
    status: ApplicationStatus | None = ApplicationStatus.PENDING,
    page: PageNumber = 1,
    page_size: PageSize = 20,
) -> Page[AdminApplicationOut]:
    return admin_service.list_applications(db, status, page, page_size)


@router.post("/applications/{application_id}/approve", response_model=AdminApplicationOut)
def approve_application(
    application_id: int, payload: ReviewIn, admin: CurrentAdmin, db: DbSession
) -> AuthorApplication:
    return admin_service.review_application(db, admin, application_id, True, payload.note)


@router.post("/applications/{application_id}/reject", response_model=AdminApplicationOut)
def reject_application(
    application_id: int, payload: ReviewIn, admin: CurrentAdmin, db: DbSession
) -> AuthorApplication:
    return admin_service.review_application(db, admin, application_id, False, payload.note)


# Posts


@router.get("/posts", response_model=Page[MyPostSummary])
def posts(
    _: CurrentAdmin,
    db: DbSession,
    status: PostStatus | None = PostStatus.PENDING,
    page: PageNumber = 1,
    page_size: PageSize = 20,
) -> Page[MyPostSummary]:
    return admin_service.list_posts(db, status, page, page_size)


@router.get("/posts/{post_id}", response_model=MyPostDetail)
def post(post_id: int, _: CurrentAdmin, db: DbSession) -> Post:
    return admin_service.get_post(db, post_id)


@router.post("/posts/{post_id}/publish", response_model=MyPostDetail)
def publish(post_id: int, _: CurrentAdmin, db: DbSession) -> Post:
    return admin_service.publish_post(db, post_id)


@router.post("/posts/{post_id}/return", response_model=MyPostDetail)
def return_to_author(post_id: int, payload: ReviewIn, _: CurrentAdmin, db: DbSession) -> Post:
    return admin_service.return_post(db, post_id, payload.note)


@router.post("/posts/{post_id}/unpublish", response_model=MyPostDetail)
def unpublish(post_id: int, _: CurrentAdmin, db: DbSession) -> Post:
    return admin_service.unpublish_post(db, post_id)


@router.put("/posts/{post_id}/featured", response_model=MyPostDetail)
def feature(post_id: int, payload: FeatureIn, _: CurrentAdmin, db: DbSession) -> Post:
    return admin_service.set_featured(db, post_id, payload.featured)


# Comments


@router.get("/comments", response_model=Page[AdminCommentOut])
def comments(
    _: CurrentAdmin,
    db: DbSession,
    status: CommentStatus | None = None,
    page: PageNumber = 1,
    page_size: PageSize = 20,
) -> Page[AdminCommentOut]:
    return admin_service.list_comments(db, status, page, page_size)


@router.put("/comments/{comment_id}/status", response_model=AdminCommentOut)
def comment_status(
    comment_id: int, payload: CommentStatusIn, _: CurrentAdmin, db: DbSession
) -> Comment:
    return admin_service.set_comment_status(db, comment_id, payload.status)


# Contact messages


@router.get("/messages", response_model=Page[ContactMessageOut])
def messages(
    _: CurrentAdmin,
    db: DbSession,
    show: Literal["open", "handled", "all"] = "open",
    page: PageNumber = 1,
    page_size: PageSize = 20,
) -> Page[ContactMessageOut]:
    handled = {"open": False, "handled": True, "all": None}[show]
    return admin_service.list_messages(db, handled, page, page_size)


@router.put("/messages/{message_id}/handled", response_model=ContactMessageOut)
def message_handled(
    message_id: int, payload: HandledIn, _: CurrentAdmin, db: DbSession
) -> ContactMessage:
    return admin_service.set_message_handled(db, message_id, payload.handled)


# Users


@router.get("/users", response_model=Page[AdminUserOut])
def users(
    _: CurrentAdmin,
    db: DbSession,
    q: Annotated[str | None, Query(max_length=100)] = None,
    page: PageNumber = 1,
    page_size: PageSize = 20,
) -> Page[AdminUserOut]:
    return admin_service.list_users(db, q, page, page_size)


@router.patch("/users/{user_id}", response_model=AdminUserOut)
def update_user(user_id: int, payload: UserUpdateIn, admin: CurrentAdmin, db: DbSession) -> User:
    return admin_service.update_user(db, admin, user_id, payload)
