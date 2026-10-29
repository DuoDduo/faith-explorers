from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, str_enum
from app.models.category import Category
from app.models.enums import PostStatus
from app.models.user import User

if TYPE_CHECKING:
    from app.models.comment import Comment

post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(60), unique=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)


class Post(TimestampMixin, Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    excerpt: Mapped[str] = mapped_column(Text)
    body: Mapped[str] = mapped_column(Text)  # Markdown
    cover_url: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[PostStatus] = mapped_column(
        str_enum(PostStatus), default=PostStatus.DRAFT, index=True
    )
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    read_time: Mapped[int] = mapped_column(Integer, default=1)
    views: Mapped[int] = mapped_column(Integer, default=0)
    # Kept in step with post_likes by the like/unlike service so listings needn't count rows.
    like_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    # Editor feedback when a submission is sent back; cleared when resubmitted.
    review_note: Mapped[str | None] = mapped_column(Text)

    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)

    author: Mapped[User] = relationship(back_populates="posts")
    category: Mapped[Category] = relationship(back_populates="posts")
    tags: Mapped[list[Tag]] = relationship(secondary=post_tags)
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )
