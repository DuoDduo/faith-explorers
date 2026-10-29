"""Importing this package registers every table on Base.metadata (used by Alembic)."""

from app.models.base import Base
from app.models.category import Category
from app.models.comment import Comment
from app.models.contact import ContactMessage
from app.models.enums import CommentStatus, PostStatus, Role
from app.models.post import Post, Tag, post_tags
from app.models.subscriber import Subscriber
from app.models.user import User

__all__ = [
    "Base",
    "Category",
    "Comment",
    "CommentStatus",
    "ContactMessage",
    "Post",
    "PostStatus",
    "Role",
    "Subscriber",
    "Tag",
    "User",
    "post_tags",
]
