from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.emails import sender
from app.main import app
from app.models import Base
from scripts.seed import Seeder


@pytest.fixture(autouse=True)
def outbox(monkeypatch) -> Iterator[list[sender.Email]]:
    """Emails "sent" during the test."""
    monkeypatch.setattr(settings, "email_backend", "memory")
    sender.outbox.clear()
    yield sender.outbox
    sender.outbox.clear()


@pytest.fixture(autouse=True)
def reset_rate_limits() -> Iterator[None]:
    limiter.reset()
    yield
    limiter.reset()


@pytest.fixture
def db() -> Iterator[Session]:
    # In-memory SQLite so the suite runs without Postgres; seeded with the real legacy content.
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with TestSession() as session:
        Seeder(session).run()
    with TestSession() as session:
        yield session
    engine.dispose()


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
