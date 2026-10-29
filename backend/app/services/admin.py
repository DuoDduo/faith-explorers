"""Editorial and site administration: reviews, moderation, inbox and user management."""

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.exceptions import ConflictError, NotFoundError
from app.models import (
    ApplicationStatus,
    AuthorApplication,
    Comment,
    CommentStatus,
    ContactMessage,
    Post,
    PostStatus,
    Role,
    User,
)
from app.models.base import utcnow
from app.schemas import (
    AdminApplicationOut,
    AdminCommentOut,
    AdminOverview,
    AdminUserOut,
    ContactMessageOut,
    MyPostSummary,
    Page,
    UserUpdateIn,
)
from app.services.pagination import paginate

_POST_OPTIONS = (joinedload(Post.author), joinedload(Post.category), selectinload(Post.tags))


def _count(db: Session, stmt) -> int:
    return db.scalar(select(func.count()).select_from(stmt.subquery())) or 0


def overview(db: Session) -> AdminOverview:
    return AdminOverview(
        pending_applications=_count(
            db,
            select(AuthorApplication.id).where(
                AuthorApplication.status == ApplicationStatus.PENDING
            ),
        ),
        pending_posts=_count(db, select(Post.id).where(Post.status == PostStatus.PENDING)),
        unhandled_messages=_count(
            db, select(ContactMessage.id).where(ContactMessage.handled.is_(False))
        ),
        published_posts=_count(db, select(Post.id).where(Post.status == PostStatus.PUBLISHED)),
        users=_count(db, select(User.id).where(User.email.is_not(None))),
        comments=_count(db, select(Comment.id)),
    )


# --- Author applications ------------------------------------------------------------


def list_applications(
    db: Session, status: ApplicationStatus | None, page: int, page_size: int
) -> Page[AdminApplicationOut]:
    stmt = select(AuthorApplication)
    if status is not None:
        stmt = stmt.where(AuthorApplication.status == status)
    return paginate(
        db,
        stmt,
        AdminApplicationOut,
        page=page,
        page_size=page_size,
        order_by=(AuthorApplication.created_at.asc(), AuthorApplication.id.asc()),
        options=(joinedload(AuthorApplication.user),),
    )


def _pending_application(db: Session, application_id: int) -> AuthorApplication:
    application = db.get(AuthorApplication, application_id)
    if application is None:
        raise NotFoundError("Application")
    if application.status != ApplicationStatus.PENDING:
        raise ConflictError("This application has already been reviewed")
    return application


def review_application(
    db: Session, admin: User, application_id: int, approve: bool, note: str | None
) -> AuthorApplication:
    application = _pending_application(db, application_id)
    application.status = ApplicationStatus.APPROVED if approve else ApplicationStatus.REJECTED
    application.reviewed_at = utcnow()
    application.reviewer_id = admin.id
    application.review_note = note
    if approve and application.user.role == Role.READER:
        application.user.role = Role.AUTHOR
    db.commit()
    return application


# --- Posts --------------------------------------------------------------------------


def list_posts(
    db: Session, status: PostStatus | None, page: int, page_size: int
) -> Page[MyPostSummary]:
    stmt = select(Post)
    if status is not None:
        stmt = stmt.where(Post.status == status)
    # The review queue is first-come, first-served; other views show recent activity first.
    order = (Post.updated_at.asc(),) if status == PostStatus.PENDING else (Post.updated_at.desc(),)
    return paginate(
        db,
        stmt,
        MyPostSummary,
        page=page,
        page_size=page_size,
        order_by=(*order, Post.id.desc()),
        options=_POST_OPTIONS,
    )


def get_post(db: Session, post_id: int) -> Post:
    post = db.scalar(select(Post).where(Post.id == post_id).options(*_POST_OPTIONS))
    if post is None:
        raise NotFoundError("Post")
    return post


def publish_post(db: Session, post_id: int) -> Post:
    post = get_post(db, post_id)
    if post.status == PostStatus.PUBLISHED:
        raise ConflictError("This post is already published")
    post.status = PostStatus.PUBLISHED
    post.published_at = post.published_at or utcnow()
    post.review_note = None
    db.commit()
    return get_post(db, post_id)


def return_post(db: Session, post_id: int, note: str | None) -> Post:
    """Send a submission back to its author as a draft, with feedback."""
    post = get_post(db, post_id)
    if post.status != PostStatus.PENDING:
        raise ConflictError("Only posts waiting for review can be sent back")
    post.status = PostStatus.DRAFT
    post.review_note = note
    db.commit()
    return get_post(db, post_id)


def unpublish_post(db: Session, post_id: int) -> Post:
    post = get_post(db, post_id)
    if post.status != PostStatus.PUBLISHED:
        raise ConflictError("This post isn't published")
    post.status = PostStatus.DRAFT
    post.featured = False
    db.commit()
    return get_post(db, post_id)


def set_featured(db: Session, post_id: int, featured: bool) -> Post:
    post = get_post(db, post_id)
    if featured and post.status != PostStatus.PUBLISHED:
        raise ConflictError("Only published posts can be featured")
    post.featured = featured
    db.commit()
    return get_post(db, post_id)


# --- Comments -----------------------------------------------------------------------


def list_comments(
    db: Session, status: CommentStatus | None, page: int, page_size: int
) -> Page[AdminCommentOut]:
    stmt = select(Comment)
    if status is not None:
        stmt = stmt.where(Comment.status == status)
    return paginate(
        db,
        stmt,
        AdminCommentOut,
        page=page,
        page_size=page_size,
        order_by=(Comment.created_at.desc(), Comment.id.desc()),
        options=(joinedload(Comment.user), joinedload(Comment.post)),
    )


def set_comment_status(db: Session, comment_id: int, status: CommentStatus) -> Comment:
    comment = db.scalar(
        select(Comment)
        .where(Comment.id == comment_id)
        .options(joinedload(Comment.user), joinedload(Comment.post))
    )
    if comment is None:
        raise NotFoundError("Comment")
    comment.status = status
    db.commit()
    return comment


# --- Contact messages ---------------------------------------------------------------


def list_messages(
    db: Session, handled: bool | None, page: int, page_size: int
) -> Page[ContactMessageOut]:
    stmt = select(ContactMessage)
    if handled is not None:
        stmt = stmt.where(ContactMessage.handled.is_(handled))
    return paginate(
        db,
        stmt,
        ContactMessageOut,
        page=page,
        page_size=page_size,
        order_by=(ContactMessage.created_at.desc(), ContactMessage.id.desc()),
    )


def set_message_handled(db: Session, message_id: int, handled: bool) -> ContactMessage:
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise NotFoundError("Message")
    message.handled = handled
    db.commit()
    return message


# --- Users --------------------------------------------------------------------------


def list_users(db: Session, q: str | None, page: int, page_size: int) -> Page[AdminUserOut]:
    # Seeded authors from the old site have no email and can't sign in; leave them out.
    stmt = select(User).where(User.email.is_not(None))
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(or_(User.name.ilike(pattern), User.email.ilike(pattern)))
    return paginate(
        db,
        stmt,
        AdminUserOut,
        page=page,
        page_size=page_size,
        order_by=(User.created_at.desc(), User.id.desc()),
    )


def update_user(db: Session, admin: User, user_id: int, changes: UserUpdateIn) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise NotFoundError("User")
    if user.id == admin.id and (
        (changes.role is not None and changes.role != Role.ADMIN) or changes.is_active is False
    ):
        raise ConflictError("You can't remove your own admin access")
    if changes.role is not None:
        user.role = changes.role
    if changes.is_active is not None:
        user.is_active = changes.is_active
    db.commit()
    return user
