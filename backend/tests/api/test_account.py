import io

import pytest
from PIL import Image
from sqlalchemy import select, update

from app.core.config import settings
from app.models import Comment, Post, Role, User
from tests.helpers import sign_up

PASSWORD = "long enough pw"
SLUG = "embracing-a-lifestyle-of-humility"


def me(client, headers):
    return client.get("/api/auth/me", headers=headers)


def test_update_profile(client):
    headers = sign_up(client, "ada@example.com")
    res = client.patch(
        "/api/me/profile", json={"name": "  Ada Lovelace ", "bio": "Writer."}, headers=headers
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Ada Lovelace"
    assert res.json()["bio"] == "Writer."

    # Omitted fields are left alone; an explicit empty bio clears it.
    cleared = client.patch("/api/me/profile", json={"bio": ""}, headers=headers).json()
    assert cleared["name"] == "Ada Lovelace"
    assert cleared["bio"] is None

    assert client.patch("/api/me/profile", json={"name": " "}, headers=headers).status_code == 422
    assert client.patch("/api/me/profile", json={"name": "X"}).status_code == 401


@pytest.fixture
def media_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "media_dir", tmp_path)
    return tmp_path


def test_avatar_is_cropped_square(client, media_dir):
    headers = sign_up(client, "ada@example.com")
    buffer = io.BytesIO()
    Image.new("RGB", (1200, 800), "purple").save(buffer, "PNG")
    res = client.put(
        "/api/me/avatar",
        files={"file": ("me.png", buffer.getvalue(), "image/png")},
        headers=headers,
    )
    assert res.status_code == 200
    url = res.json()["avatar_url"]
    with Image.open(media_dir / url.removeprefix("/media/")) as img:
        assert img.size == (400, 400)

    removed = client.delete("/api/me/avatar", headers=headers).json()
    assert removed["avatar_url"] is None


def test_change_password_keeps_this_session_only(client, outbox):
    this_device = sign_up(client, "ada@example.com", PASSWORD)
    other = client.post("/api/auth/login", json={"email": "ada@example.com", "password": PASSWORD})
    other_device = {"Authorization": f"Bearer {other.json()['token']}"}

    wrong = client.post(
        "/api/me/password",
        json={"current_password": "nope", "new_password": "new passphrase"},
        headers=this_device,
    )
    assert wrong.status_code == 422
    assert wrong.json()["detail"][0]["loc"] == ["body", "current_password"]

    ok = client.post(
        "/api/me/password",
        json={"current_password": PASSWORD, "new_password": "new passphrase"},
        headers=this_device,
    )
    assert ok.status_code == 204
    assert me(client, this_device).status_code == 200
    assert me(client, other_device).status_code == 401
    assert outbox[-1].subject == "Your Faith Explorers password was changed"

    login = client.post(
        "/api/auth/login", json={"email": "ada@example.com", "password": "new passphrase"}
    )
    assert login.status_code == 200


def test_delete_account_removes_personal_data(client, db):
    headers = sign_up(client, "ada@example.com", PASSWORD)
    client.post(f"/api/posts/{SLUG}/comments", json={"body": "Lovely"}, headers=headers)
    client.put(f"/api/posts/{SLUG}/like", headers=headers)
    client.put(f"/api/posts/{SLUG}/bookmark", headers=headers)

    wrong = client.request("DELETE", "/api/me", json={"password": "nope"}, headers=headers)
    assert wrong.status_code == 422

    res = client.request("DELETE", "/api/me", json={"password": PASSWORD}, headers=headers)
    assert res.status_code == 204
    assert me(client, headers).status_code == 401

    db.expire_all()
    assert db.scalar(select(User).where(User.email == "ada@example.com")) is None
    assert db.scalar(select(Post.like_count).where(Post.slug == SLUG)) == 0
    assert "Lovely" not in [c.body for c in db.scalars(select(Comment))]

    login = client.post("/api/auth/login", json={"email": "ada@example.com", "password": PASSWORD})
    assert login.status_code == 401
    # The address can be used to sign up again.
    assert (
        client.post(
            "/api/auth/register",
            json={"name": "Ada", "email": "ada@example.com", "password": PASSWORD},
        ).status_code
        == 201
    )


def test_admins_cannot_delete_themselves(client, db):
    headers = sign_up(client, "admin@example.com", PASSWORD)
    db.execute(update(User).where(User.email == "admin@example.com").values(role=Role.ADMIN))
    db.commit()
    res = client.request("DELETE", "/api/me", json={"password": PASSWORD}, headers=headers)
    assert res.status_code == 409
    assert me(client, headers).status_code == 200
