from datetime import timedelta

from sqlalchemy import select, update

from app.models import Role, User, UserSession
from app.models.base import utcnow

PASSWORD = "correct horse battery"


def register(client, email="ada@example.com", name="Ada Lovelace", password=PASSWORD):
    return client.post(
        "/api/auth/register", json={"name": name, "email": email, "password": password}
    )


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_register_creates_reader_and_signs_in(client, db):
    res = register(client, email="Ada@Example.com")
    assert res.status_code == 201
    body = res.json()
    assert body["user"]["email"] == "ada@example.com"
    assert body["user"]["role"] == "reader"
    assert body["token"]

    user = db.scalar(select(User).where(User.email == "ada@example.com"))
    assert user.password_hash.startswith("$argon2id$")
    assert PASSWORD not in user.password_hash

    me = client.get("/api/auth/me", headers=auth_header(body["token"]))
    assert me.json()["name"] == "Ada Lovelace"


def test_session_token_is_stored_hashed(client, db):
    token = register(client).json()["token"]
    stored = db.scalars(select(UserSession.token_hash)).all()
    assert len(stored) == 1
    assert token not in stored


def test_register_rejects_duplicates_and_weak_input(client):
    assert register(client).status_code == 201
    duplicate = register(client, email="ADA@example.com")
    assert duplicate.status_code == 409

    weak = register(client, email="other@example.com", password="short")
    assert weak.status_code == 422
    blank_name = register(client, email="third@example.com", name="   ")
    assert blank_name.status_code == 422


def test_login(client):
    register(client)
    ok = client.post("/api/auth/login", json={"email": "ADA@example.com", "password": PASSWORD})
    assert ok.status_code == 200
    assert ok.json()["user"]["email"] == "ada@example.com"

    wrong = client.post("/api/auth/login", json={"email": "ada@example.com", "password": "nope"})
    unknown = client.post("/api/auth/login", json={"email": "who@example.com", "password": "x"})
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()


def test_seeded_authors_without_passwords_cannot_log_in(client, db):
    db.execute(update(User).where(User.name == "Pastor Flo").values(email="flo@example.com"))
    db.commit()
    res = client.post("/api/auth/login", json={"email": "flo@example.com", "password": "x"})
    assert res.status_code == 401


def test_me_requires_a_valid_session(client, db):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers=auth_header("bogus")).status_code == 401

    token = register(client).json()["token"]
    db.execute(update(UserSession).values(expires_at=utcnow() - timedelta(minutes=1)))
    db.commit()
    assert client.get("/api/auth/me", headers=auth_header(token)).status_code == 401


def test_deactivated_users_are_signed_out(client, db):
    token = register(client).json()["token"]
    db.execute(update(User).where(User.email == "ada@example.com").values(is_active=False))
    db.commit()
    assert client.get("/api/auth/me", headers=auth_header(token)).status_code == 401


def test_logout_revokes_only_that_session(client):
    first = register(client).json()["token"]
    second = client.post(
        "/api/auth/login", json={"email": "ada@example.com", "password": PASSWORD}
    ).json()["token"]

    assert client.post("/api/auth/logout", headers=auth_header(first)).status_code == 204
    assert client.get("/api/auth/me", headers=auth_header(first)).status_code == 401
    assert client.get("/api/auth/me", headers=auth_header(second)).status_code == 200


def test_roles_are_reported(client, db):
    token = register(client).json()["token"]
    db.execute(update(User).where(User.email == "ada@example.com").values(role=Role.ADMIN))
    db.commit()
    assert client.get("/api/auth/me", headers=auth_header(token)).json()["role"] == "admin"


def test_failed_sign_up_leaves_no_account(client, db, monkeypatch):
    from app.services import auth as auth_service

    def broken_session(*_args):
        raise RuntimeError("session store unavailable")

    monkeypatch.setattr(auth_service, "create_session", broken_session)
    try:
        register(client)
    except RuntimeError:
        pass
    db.rollback()
    assert db.scalar(select(User).where(User.email == "ada@example.com")) is None
