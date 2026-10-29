from datetime import timedelta

from sqlalchemy import update

from app.models import PasswordResetToken
from app.models.base import utcnow
from tests.helpers import link_token, sign_up

OLD = "long enough pw"
NEW = "a brand new passphrase"


def request_reset(client, email="ada@example.com"):
    return client.post("/api/auth/password-reset", json={"email": email})


def login(client, password, email="ada@example.com"):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def test_reset_flow(client, outbox):
    session = sign_up(client, "ada@example.com", OLD)
    res = request_reset(client, "ADA@example.com")
    assert res.status_code == 202
    assert len(outbox) == 1
    assert "/reset-password?token=" in outbox[0].text

    done = client.post(
        "/api/auth/password-reset/confirm",
        json={"token": link_token(outbox[0]), "password": NEW},
    )
    assert done.status_code == 200

    assert login(client, OLD).status_code == 401
    assert login(client, NEW).status_code == 200
    # Every existing session was signed out, and the user was told.
    assert client.get("/api/auth/me", headers=session).status_code == 401
    assert outbox[-1].subject == "Your Faith Explorers password was changed"


def test_unknown_email_gets_the_same_reply_and_no_email(client, outbox):
    sign_up(client, "ada@example.com")
    known = request_reset(client)
    unknown = request_reset(client, "nobody@example.com")
    assert known.status_code == unknown.status_code == 202
    assert known.json() == unknown.json()
    assert [e.to for e in outbox] == ["ada@example.com"]


def test_links_are_single_use_and_replace_each_other(client, outbox):
    sign_up(client, "ada@example.com")
    request_reset(client)
    request_reset(client)
    first, second = link_token(outbox[0]), link_token(outbox[1])

    ok = client.post("/api/auth/password-reset/confirm", json={"token": second, "password": NEW})
    assert ok.status_code == 200
    for token in (second, first):
        reused = client.post(
            "/api/auth/password-reset/confirm", json={"token": token, "password": "another one!"}
        )
        assert reused.status_code == 422
        assert reused.json()["detail"][0]["loc"] == ["body", "token"]


def test_expired_links_are_rejected(client, db, outbox):
    sign_up(client, "ada@example.com")
    request_reset(client)
    db.execute(update(PasswordResetToken).values(expires_at=utcnow() - timedelta(minutes=1)))
    db.commit()
    res = client.post(
        "/api/auth/password-reset/confirm", json={"token": link_token(outbox[0]), "password": NEW}
    )
    assert res.status_code == 422


def test_new_password_must_be_long_enough(client, outbox):
    sign_up(client, "ada@example.com")
    request_reset(client)
    res = client.post(
        "/api/auth/password-reset/confirm", json={"token": link_token(outbox[0]), "password": "x"}
    )
    assert res.status_code == 422


def test_reset_requests_are_rate_limited_per_email(client, outbox):
    sign_up(client, "ada@example.com")
    for _ in range(3):
        assert request_reset(client).status_code == 202
    assert request_reset(client).status_code == 429
