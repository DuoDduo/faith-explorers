"""Plain-text email bodies. Kept short and personal, like a note from the editors."""

from app.core.config import settings
from app.emails.sender import Email

SIGN_OFF = "\n\nGrace and peace,\nThe Faith Explorers team"


def _link(path: str) -> str:
    return settings.site_url.rstrip("/") + path


def password_reset(to: str, name: str, token: str) -> Email:
    return Email(
        to=to,
        subject="Reset your Faith Explorers password",
        text=(
            f"Hi {name},\n\n"
            "Someone (hopefully you) asked to reset your password. Use this link within the "
            "next hour to choose a new one:\n\n"
            f"{_link(f'/reset-password?token={token}')}\n\n"
            "If you didn't ask for this, you can ignore this email and your password won't "
            "change." + SIGN_OFF
        ),
    )


def password_changed(to: str, name: str) -> Email:
    return Email(
        to=to,
        subject="Your Faith Explorers password was changed",
        text=(
            f"Hi {name},\n\n"
            "Your password was just changed and you've been signed out on other devices.\n\n"
            "If this wasn't you, reset your password straight away:\n"
            f"{_link('/forgot-password')}" + SIGN_OFF
        ),
    )


def newsletter_confirm(to: str, token: str) -> Email:
    return Email(
        to=to,
        subject="Confirm your Faith Explorers subscription",
        text=(
            "Thanks for subscribing to Faith Explorers!\n\n"
            "Please confirm your email address so we can send you new articles:\n\n"
            f"{_link(f'/newsletter/confirm?token={token}')}\n\n"
            "If you didn't sign up, ignore this email and you won't hear from us." + SIGN_OFF
        ),
    )


def contact_notification(to: str, name: str, sender: str, message: str) -> Email:
    return Email(
        to=to,
        reply_to=sender,
        subject=f"New message from {name} via Faith Explorers",
        text=(
            f"{name} <{sender}> wrote:\n\n{message}\n\n"
            f"Reply to this email to answer them, or mark it handled in the admin:\n"
            f"{_link('/admin/messages')}"
        ),
    )


def application_reviewed(to: str, name: str, approved: bool, note: str | None) -> Email:
    if approved:
        body = (
            "Good news: your application to write for Faith Explorers has been approved!\n\n"
            f"You can start your first article in your dashboard:\n{_link('/dashboard')}"
        )
    else:
        body = (
            "Thank you for applying to write for Faith Explorers. We aren't able to approve "
            "your application right now."
        )
    if note:
        body += f"\n\nA note from the editors:\n{note}"
    if not approved:
        body += f"\n\nYou're welcome to apply again:\n{_link('/become-an-author')}"
    subject = "You're now a Faith Explorers author" if approved else "Your author application"
    return Email(to=to, subject=subject, text=f"Hi {name},\n\n{body}{SIGN_OFF}")


def post_published(to: str, name: str, title: str, slug: str) -> Email:
    return Email(
        to=to,
        subject=f"Published: {title}",
        text=(
            f"Hi {name},\n\n"
            f"Your article “{title}” is now live on Faith Explorers:\n"
            f"{_link(f'/articles/{slug}')}\n\nThank you for writing!" + SIGN_OFF
        ),
    )


def post_returned(to: str, name: str, title: str, post_id: int, note: str | None) -> Email:
    feedback = f"\n\nFeedback from the editor:\n{note}" if note else ""
    return Email(
        to=to,
        subject=f"Changes requested: {title}",
        text=(
            f"Hi {name},\n\n"
            f"An editor has sent “{title}” back to your drafts.{feedback}\n\n"
            f"Make your changes and submit it again here:\n{_link(f'/dashboard/{post_id}/edit')}"
            + SIGN_OFF
        ),
    )
