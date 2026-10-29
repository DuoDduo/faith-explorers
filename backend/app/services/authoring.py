"""Author applications and authors' own posts (drafts, edits, submission for review)."""

import math

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.exceptions import ConflictError, InvalidInputError, NotFoundError
from app.models import (
    ApplicationStatus,
    AuthorApplication,
    Category,
    Post,
    PostStatus,
    Role,
    Tag,
    User,
)
from app.models.base import utcnow
from app.schemas import ApplicationIn, MyPostSummary, Page, PostWriteIn
from app.utils.text import read_time_minutes, slugify

WRITER_ROLES = (Role.AUTHOR, Role.ADMIN)


# --- Applications -------------------------------------------------------------------


def latest_application(db: Session, user: User) -> AuthorApplication | None:
    return db.scalar(
        select(AuthorApplication)
        .where(AuthorApplication.user_id == user.id)
        .order_by(AuthorApplication.created_at.desc(), AuthorApplication.id.desc())
        .limit(1)
    )


def apply(db: Session, user: User, payload: ApplicationIn) -> AuthorApplication:
    if user.role in WRITER_ROLES:
        raise ConflictError("You can already write for Faith Explorers")
    latest = latest_application(db, user)
    if latest is not None and latest.status == ApplicationStatus.PENDING:
        raise ConflictError("Your application is already being reviewed")
    application = AuthorApplication(user_id=user.id, motivation=payload.motivation)
    db.add(application)
    db.commit()
    return application


# --- Posts --------------------------------------------------------------------------


def _with_relations():
    return (joinedload(Post.author), joinedload(Post.category), selectinload(Post.tags))


def _category(db: Session, slug: str) -> Category:
    category = db.scalar(select(Category).where(Category.slug == slug))
    if category is None:
        raise InvalidInputError("category", "Choose a category from the list")
    return category


def _tags(db: Session, names: list[str]) -> list[Tag]:
    tags = []
    for name in names:
        slug = slugify(name)
        if not slug:
            continue
        tag = db.scalar(select(Tag).where(Tag.slug == slug))
        if tag is None:
            tag = Tag(name=name, slug=slug)
            db.add(tag)
        tags.append(tag)
    return tags


def _unique_slug(db: Session, title: str, exclude_id: int | None = None) -> str:
    base = slugify(title) or "post"
    slug, n = base, 2
    while True:
        stmt = select(Post.id).where(Post.slug == slug)
        if exclude_id is not None:
            stmt = stmt.where(Post.id != exclude_id)
        if db.scalar(stmt) is None:
            return slug
        slug, n = f"{base}-{n}", n + 1


def _apply_fields(db: Session, post: Post, payload: PostWriteIn) -> None:
    post.title = payload.title
    post.excerpt = payload.excerpt
    post.body = payload.body
    post.cover_url = payload.cover_url
    post.category = _category(db, payload.category)
    post.tags = _tags(db, payload.tags)
    post.read_time = read_time_minutes(payload.body)


def list_my_posts(db: Session, user: User, page: int, page_size: int) -> Page[MyPostSummary]:
    stmt = select(Post).where(Post.author_id == user.id)
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    posts = db.scalars(
        stmt.order_by(Post.updated_at.desc(), Post.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .options(*_with_relations())
    ).all()
    return Page[MyPostSummary](
        items=[MyPostSummary.model_validate(p) for p in posts],
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, math.ceil(total / page_size)),
    )


def get_my_post(db: Session, user: User, post_id: int) -> Post:
    """A post the user may edit: their own, or any post for admins."""
    post = db.scalar(select(Post).where(Post.id == post_id).options(*_with_relations()))
    if post is None or (post.author_id != user.id and user.role != Role.ADMIN):
        raise NotFoundError("Post")  # don't reveal other authors' drafts exist
    return post


def create_post(db: Session, user: User, payload: PostWriteIn) -> Post:
    post = Post(author=user, status=PostStatus.DRAFT, slug=_unique_slug(db, payload.title))
    _apply_fields(db, post, payload)
    db.add(post)
    db.commit()
    return get_my_post(db, user, post.id)


def update_post(db: Session, user: User, post_id: int, payload: PostWriteIn) -> Post:
    post = get_my_post(db, user, post_id)
    # The URL is fixed once published so shared links keep working.
    if post.status != PostStatus.PUBLISHED and payload.title != post.title:
        post.slug = _unique_slug(db, payload.title, exclude_id=post.id)
    _apply_fields(db, post, payload)
    db.commit()
    return get_my_post(db, user, post.id)


def submit_post(db: Session, user: User, post_id: int) -> Post:
    """Drafts go to review; admins publish their own posts directly."""
    post = get_my_post(db, user, post_id)
    if post.status == PostStatus.PUBLISHED:
        raise ConflictError("This post is already published")
    if user.role == Role.ADMIN:
        post.status = PostStatus.PUBLISHED
        post.published_at = utcnow()
    else:
        post.status = PostStatus.PENDING
    db.commit()
    return get_my_post(db, user, post.id)


def withdraw_post(db: Session, user: User, post_id: int) -> Post:
    """Take a post out of the review queue and back to draft."""
    post = get_my_post(db, user, post_id)
    if post.status != PostStatus.PENDING:
        raise ConflictError("Only posts waiting for review can be withdrawn")
    post.status = PostStatus.DRAFT
    db.commit()
    return get_my_post(db, user, post.id)


def delete_post(db: Session, user: User, post_id: int) -> None:
    post = get_my_post(db, user, post_id)
    if post.status == PostStatus.PUBLISHED and user.role != Role.ADMIN:
        raise ConflictError("Published posts can only be removed by an admin")
    db.delete(post)
    db.commit()
