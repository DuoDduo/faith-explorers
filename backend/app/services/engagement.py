"""Likes and bookmarks. Both operations are idempotent: repeating them changes nothing."""

from sqlalchemy import delete, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import Bookmark, Post, PostLike, PostStatus, User
from app.schemas import EngagementOut, Page, PostSummary
from app.services.pagination import paginate


def _insert_once(db: Session, row: PostLike | Bookmark) -> bool:
    """Insert unless it already exists. Returns True if a row was added."""
    if db.get(type(row), (row.user_id, row.post_id)) is not None:
        return False
    try:
        with db.begin_nested():
            db.add(row)
    except IntegrityError:  # a concurrent request inserted it first
        return False
    return True


def _adjust_like_count(db: Session, post: Post, delta: int) -> None:
    db.execute(update(Post).where(Post.id == post.id).values(like_count=Post.like_count + delta))


def engagement(db: Session, post: Post, user: User | None) -> EngagementOut:
    db.refresh(post, ["like_count"])
    liked = bookmarked = False
    if user is not None:
        liked = db.get(PostLike, (user.id, post.id)) is not None
        bookmarked = db.get(Bookmark, (user.id, post.id)) is not None
    return EngagementOut(like_count=post.like_count, liked=liked, bookmarked=bookmarked)


def like(db: Session, post: Post, user: User) -> EngagementOut:
    if _insert_once(db, PostLike(user_id=user.id, post_id=post.id)):
        _adjust_like_count(db, post, +1)
    db.commit()
    return engagement(db, post, user)


def unlike(db: Session, post: Post, user: User) -> EngagementOut:
    removed = db.execute(
        delete(PostLike).where(PostLike.user_id == user.id, PostLike.post_id == post.id)
    ).rowcount
    if removed:
        _adjust_like_count(db, post, -1)
    db.commit()
    return engagement(db, post, user)


def bookmark(db: Session, post: Post, user: User) -> EngagementOut:
    _insert_once(db, Bookmark(user_id=user.id, post_id=post.id))
    db.commit()
    return engagement(db, post, user)


def unbookmark(db: Session, post: Post, user: User) -> EngagementOut:
    db.execute(delete(Bookmark).where(Bookmark.user_id == user.id, Bookmark.post_id == post.id))
    db.commit()
    return engagement(db, post, user)


def list_bookmarks(db: Session, user: User, page: int, page_size: int) -> Page[PostSummary]:
    """The user's saved posts that are still published, most recently saved first."""
    stmt = (
        select(Post)
        .join(Bookmark, Bookmark.post_id == Post.id)
        .where(Bookmark.user_id == user.id, Post.status == PostStatus.PUBLISHED)
    )
    return paginate(
        db,
        stmt,
        PostSummary,
        page=page,
        page_size=page_size,
        order_by=(Bookmark.created_at.desc(),),
        options=(joinedload(Post.author), joinedload(Post.category), selectinload(Post.tags)),
    )
