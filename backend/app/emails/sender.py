"""Delivers emails through the configured backend. Called from background tasks so a slow
or failing mail server never delays or breaks the request that triggered the email."""

import logging
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage as MimeMessage

from app.core.config import settings

log = logging.getLogger(__name__)

# Messages "sent" with the memory backend, for tests.
outbox: list["Email"] = []


@dataclass(frozen=True)
class Email:
    to: str
    subject: str
    text: str
    reply_to: str | None = None


def _smtp_send(email: Email) -> None:
    message = MimeMessage()
    message["From"] = settings.email_from
    message["To"] = email.to
    message["Subject"] = email.subject
    if email.reply_to:
        message["Reply-To"] = email.reply_to
    message.set_content(email.text)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
        if settings.smtp_use_tls:
            smtp.starttls()
        if settings.smtp_username:
            smtp.login(settings.smtp_username, settings.smtp_password)
        smtp.send_message(message)


def send(email: Email) -> None:
    backend = settings.email_backend
    try:
        if backend == "smtp":
            _smtp_send(email)
        elif backend == "memory":
            outbox.append(email)
        else:
            log.info("Email to %s: %s\n%s", email.to, email.subject, email.text)
    except (OSError, smtplib.SMTPException):
        # Log and carry on: the user-facing action already succeeded.
        log.exception("Failed to send email %r to %s", email.subject, email.to)
