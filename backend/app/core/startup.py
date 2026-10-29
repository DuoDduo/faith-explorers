import logging

from app.core.config import Settings

log = logging.getLogger(__name__)


def check_production_settings(settings: Settings) -> None:
    """Refuse to start a production API with unsafe settings; warn about incomplete ones."""
    if not settings.is_production:
        return
    if not settings.internal_api_key or settings.internal_api_key == "change-me":
        raise RuntimeError(
            "INTERNAL_API_KEY must be set to a long random value in production "
            "(the same value as the web server's INTERNAL_API_KEY)."
        )
    if not settings.site_url.startswith("https://"):
        log.warning("SITE_URL is %r; links in emails should use https.", settings.site_url)
    if settings.email_backend != "smtp":
        log.warning(
            "EMAIL_BACKEND is %r: password reset and newsletter emails will not be delivered.",
            settings.email_backend,
        )
