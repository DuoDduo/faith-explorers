import secrets
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, utcnow


class Subscriber(Base):
    __tablename__ = "subscribers"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, server_default=func.now()
    )
    # Double opt-in: set when the subscriber clicks the link in the confirmation email.
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    confirm_token_hash: Mapped[str | None] = mapped_column(String(64), unique=True)
    # Included in every newsletter so readers can leave with one click.
    unsubscribe_token: Mapped[str] = mapped_column(
        String(64), unique=True, default=lambda: secrets.token_urlsafe(32)
    )
