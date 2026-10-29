from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel


class SubscribeIn(BaseModel):
    email: EmailStr


class TokenIn(BaseModel):
    token: str = Field(min_length=10, max_length=200)


class NewsletterIn(BaseModel):
    subject: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=1, max_length=10_000)
    include_recent: bool = True


class NewsletterIssueOut(ORMModel):
    id: int
    subject: str
    recipient_count: int
    sent_at: datetime


class NewsletterOverview(BaseModel):
    confirmed: int
    pending: int
    issues: list[NewsletterIssueOut]
