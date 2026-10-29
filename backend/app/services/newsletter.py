"""Newsletter sign-up with double opt-in: nobody is emailed until they confirm."""

from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import hash_token, new_session_token
from app.emails import sender, templates
from app.emails.sender import Email
from app.models import NewsletterIssue, Post, PostStatus, Subscriber, User
from app.models.base import utcnow
from app.schemas import NewsletterIn, NewsletterIssueOut, NewsletterOverview


def subscribe(db: Session, email: str) -> Email | None:
    """Start (or restart) a subscription. Returns the confirmation email to send, if any."""
    email = email.lower()
    subscriber = db.scalar(select(Subscriber).where(Subscriber.email == email))
    if subscriber is not None and subscriber.confirmed_at is not None:
        return None  # already subscribed; nothing to confirm
    if subscriber is None:
        subscriber = Subscriber(email=email)
        db.add(subscriber)
    token = new_session_token()
    subscriber.confirm_token_hash = hash_token(token)
    db.commit()
    return templates.newsletter_confirm(email, token)


def confirm(db: Session, token: str) -> bool:
    subscriber = db.scalar(
        select(Subscriber).where(Subscriber.confirm_token_hash == hash_token(token))
    )
    if subscriber is None:
        return False
    subscriber.confirmed_at = subscriber.confirmed_at or utcnow()
    subscriber.confirm_token_hash = None
    db.commit()
    return True


def unsubscribe(db: Session, token: str) -> bool:
    subscriber = db.scalar(select(Subscriber).where(Subscriber.unsubscribe_token == token))
    if subscriber is None:
        return False
    db.delete(subscriber)
    db.commit()
    return True


# --- Sending issues (admin) -----------------------------------------------------------

RECENT_LIMIT = 5
DEFAULT_LOOKBACK = timedelta(days=30)


def overview(db: Session) -> NewsletterOverview:
    confirmed = db.scalar(
        select(func.count(Subscriber.id)).where(Subscriber.confirmed_at.is_not(None))
    )
    pending = db.scalar(select(func.count(Subscriber.id)).where(Subscriber.confirmed_at.is_(None)))
    issues = db.scalars(
        select(NewsletterIssue).order_by(NewsletterIssue.sent_at.desc()).limit(20)
    ).all()
    return NewsletterOverview(
        confirmed=confirmed or 0,
        pending=pending or 0,
        issues=[NewsletterIssueOut.model_validate(i) for i in issues],
    )


def recent_posts(db: Session) -> list[tuple[str, str]]:
    """Articles published since the last issue (or the last 30 days), newest first."""
    last_sent = db.scalar(select(func.max(NewsletterIssue.sent_at)))
    since = last_sent or utcnow() - DEFAULT_LOOKBACK
    rows = db.execute(
        select(Post.title, Post.slug)
        .where(Post.status == PostStatus.PUBLISHED, Post.published_at > since)
        .order_by(Post.published_at.desc())
        .limit(RECENT_LIMIT)
    ).all()
    return [(title, slug) for title, slug in rows]


def _issue_posts(db: Session, payload: NewsletterIn) -> list[tuple[str, str]]:
    return recent_posts(db) if payload.include_recent else []


def preview(db: Session, to: str, payload: NewsletterIn) -> Email:
    """A test copy for the admin; its unsubscribe link is a harmless placeholder."""
    return templates.newsletter_issue(
        to, f"[Test] {payload.subject}", payload.message, _issue_posts(db, payload), "preview"
    )


def send_issue(
    db: Session, admin: User, payload: NewsletterIn
) -> tuple[NewsletterIssue | None, list[Email]]:
    """Record the issue and build one personalised email per confirmed subscriber.

    Nothing is recorded when there's nobody to send to.
    """
    subscribers = db.scalars(
        select(Subscriber).where(Subscriber.confirmed_at.is_not(None)).order_by(Subscriber.id)
    ).all()
    if not subscribers:
        return None, []
    posts = _issue_posts(db, payload)
    emails = [
        templates.newsletter_issue(
            s.email, payload.subject, payload.message, posts, s.unsubscribe_token
        )
        for s in subscribers
    ]
    issue = NewsletterIssue(
        subject=payload.subject,
        message=payload.message,
        recipient_count=len(emails),
        sent_by_id=admin.id,
    )
    db.add(issue)
    db.commit()
    return issue, emails


def deliver(emails: list[Email]) -> None:
    for email in emails:
        sender.send(email)
