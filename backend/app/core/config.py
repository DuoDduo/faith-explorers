from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]  # backend/


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://faith:faith@localhost:5432/faith_explorers"
    # Comma-separated list of origins allowed to call the API from a browser.
    cors_origins: str = "http://localhost:3000"
    media_dir: Path = BASE_DIR / "media"
    media_url: str = "/media"
    session_ttl_days: int = 30
    # Public URL of the website, used for links in emails.
    site_url: str = "http://localhost:3000"

    # Email: "console" logs messages (development), "smtp" sends them, "memory" keeps them
    # in app.emails.sender.outbox (tests).
    email_backend: str = "console"
    email_from: str = "Faith Explorers <no-reply@localhost>"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    # Where contact-form messages are forwarded; leave empty to only keep them in the admin.
    contact_notify_email: str = ""

    # Shared secret the web server sends with the visitor's IP (see core/rate_limit.py).
    internal_api_key: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
