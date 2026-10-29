"""Importing this package registers every table on Base.metadata (used by Alembic)."""

from app.models.author_application import AuthorApplication
from app.models.base import Base
from app.models.category import Category
from app.models.comment import Comment
from app.models.contact import ContactMessage
from app.models.engagement import Bookmark, PostLike
from app.models.enums import ApplicationStatus, CommentStatus, PostStatus, Role
from app.models.password_reset import PasswordResetToken
from app.models.post import Post, Tag, post_tags
from app.models.session import UserSession
from app.models.subscriber import Subscriber
from app.models.user import User

__all__ = [
    "ApplicationStatus",
    "AuthorApplication",
    "Base",
    "Bookmark",
    "Category",
    "Comment",
    "CommentStatus",
    "ContactMessage",
    "PasswordResetToken",
    "Post",
    "PostLike",
    "PostStatus",
    "Role",
    "Subscriber",
    "Tag",
    "User",
    "UserSession",
    "post_tags",
]
