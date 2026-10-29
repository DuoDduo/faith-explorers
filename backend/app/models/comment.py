from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, str_enum
from app.models.enums import CommentStatus
from app.models.post import Post
from app.models.user import User


class Comment(TimestampMixin, Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    body: Mapped[str] = mapped_column(Text)
    status: Mapped[CommentStatus] = mapped_column(
        str_enum(CommentStatus), default=CommentStatus.VISIBLE
    )
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    post: Mapped[Post] = relationship(back_populates="comments")
    user: Mapped[User] = relationship()
