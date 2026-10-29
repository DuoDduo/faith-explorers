from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, str_enum
from app.models.enums import Role

if TYPE_CHECKING:
    from app.models.post import Post


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    # Nullable so content authors imported from the old site can exist before they sign up.
    email: Mapped[str | None] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str | None] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    bio: Mapped[str | None] = mapped_column(Text)
    role: Mapped[Role] = mapped_column(str_enum(Role), default=Role.READER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    posts: Mapped[list["Post"]] = relationship(back_populates="author")
