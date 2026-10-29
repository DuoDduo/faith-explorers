import io

import pytest
from PIL import Image
from sqlalchemy import select, update

from app.core.config import settings
from app.models import ApplicationStatus, AuthorApplication, Post, PostStatus, Role, User

POST = {
    "title": "Walking Humbly Every Day",
    "excerpt": "Practical ways to grow in humility at home and at work.",
    "body": "First paragraph.\n\nSecond paragraph with **bold** text.",
    "category": "christian-living",
    "tags": ["#Humility", "humility", " Growth "],
}


def sign_up(client, email: str) -> dict[str, str]:
    res = client.post(
        "/api/auth/register",
        json={"name": email.split("@")[0].title(), "email": email, "password": "long enough pw"},
    )
    return {"Authorization": f"Bearer {res.json()['token']}"}


def make(db, email: str, role: Role) -> None:
    db.execute(update(User).where(User.email == email).values(role=role))
    db.commit()


@pytest.fixture
def author(client, db):
    headers = sign_up(client, "writer@example.com")
    make(db, "writer@example.com", Role.AUTHOR)
    return headers


# --- Applications ---------------------------------------------------------------------


def test_reader_applies_once(client, db):
    reader = sign_up(client, "reader@example.com")
    assert client.get("/api/me/author-application", headers=reader).json() is None

    short = client.post("/api/author-applications", json={"motivation": "pls"}, headers=reader)
    assert short.status_code == 422

    motivation = "I lead a youth group and write devotionals every week."
    res = client.post("/api/author-applications", json={"motivation": motivation}, headers=reader)
    assert res.status_code == 201
    assert res.json()["status"] == "pending"

    again = client.post("/api/author-applications", json={"motivation": motivation}, headers=reader)
    assert again.status_code == 409
    mine = client.get("/api/me/author-application", headers=reader).json()
    assert mine["motivation"] == motivation


def test_rejected_reader_can_reapply(client, db):
    reader = sign_up(client, "reader@example.com")
    motivation = "I would love to share what I have learned about prayer."
    client.post("/api/author-applications", json={"motivation": motivation}, headers=reader)
    db.execute(update(AuthorApplication).values(status=ApplicationStatus.REJECTED))
    db.commit()
    res = client.post("/api/author-applications", json={"motivation": motivation}, headers=reader)
    assert res.status_code == 201


def test_authors_cannot_apply(client, author):
    res = client.post(
        "/api/author-applications",
        json={"motivation": "Already an author but applying anyway for fun."},
        headers=author,
    )
    assert res.status_code == 409


# --- Writing --------------------------------------------------------------------------


def test_readers_cannot_write(client):
    reader = sign_up(client, "reader@example.com")
    assert client.get("/api/me/posts", headers=reader).status_code == 403
    assert client.post("/api/me/posts", json=POST, headers=reader).status_code == 403
    assert client.get("/api/me/posts").status_code == 401


def test_draft_lifecycle(client, db, author):
    created = client.post("/api/me/posts", json=POST, headers=author)
    assert created.status_code == 201
    draft = created.json()
    assert draft["status"] == "draft"
    assert draft["slug"] == "walking-humbly-every-day"
    assert [t["name"] for t in draft["tags"]] == ["Humility", "Growth"]
    assert draft["category"]["slug"] == "christian-living"

    # Drafts aren't public.
    assert client.get(f"/api/posts/{draft['slug']}").status_code == 404

    edited = client.put(
        f"/api/me/posts/{draft['id']}", json={**POST, "title": "Walking Humbly"}, headers=author
    ).json()
    assert edited["slug"] == "walking-humbly"

    submitted = client.post(f"/api/me/posts/{draft['id']}/submit", headers=author).json()
    assert submitted["status"] == "pending"
    assert client.get("/api/posts/walking-humbly").status_code == 404

    withdrawn = client.post(f"/api/me/posts/{draft['id']}/withdraw", headers=author).json()
    assert withdrawn["status"] == "draft"

    mine = client.get("/api/me/posts", headers=author).json()
    assert [p["title"] for p in mine["items"]] == ["Walking Humbly"]

    assert client.delete(f"/api/me/posts/{draft['id']}", headers=author).status_code == 204
    assert client.get(f"/api/me/posts/{draft['id']}", headers=author).status_code == 404


def test_validation_errors_point_at_fields(client, author):
    bad_category = client.post("/api/me/posts", json={**POST, "category": "nope"}, headers=author)
    assert bad_category.status_code == 422
    assert bad_category.json()["detail"][0]["loc"] == ["body", "category"]

    remote_cover = client.post(
        "/api/me/posts", json={**POST, "cover_url": "https://evil.example/x.jpg"}, headers=author
    )
    assert remote_cover.status_code == 422

    too_many = client.post(
        "/api/me/posts", json={**POST, "tags": [f"t{i}" for i in range(9)]}, headers=author
    )
    assert too_many.status_code == 422


def test_authors_only_see_their_own_posts(client, db, author):
    draft = client.post("/api/me/posts", json=POST, headers=author).json()
    other = sign_up(client, "other@example.com")
    make(db, "other@example.com", Role.AUTHOR)

    assert client.get(f"/api/me/posts/{draft['id']}", headers=other).status_code == 404
    assert client.put(f"/api/me/posts/{draft['id']}", json=POST, headers=other).status_code == 404
    assert client.get("/api/me/posts", headers=other).json()["total"] == 0


def test_admin_submission_publishes(client, db):
    admin = sign_up(client, "admin@example.com")
    make(db, "admin@example.com", Role.ADMIN)
    draft = client.post("/api/me/posts", json=POST, headers=admin).json()
    published = client.post(f"/api/me/posts/{draft['id']}/submit", headers=admin).json()
    assert published["status"] == "published"
    assert published["published_at"] is not None
    assert client.get(f"/api/posts/{draft['slug']}").status_code == 200

    # Slugs freeze once published so links keep working.
    edited = client.put(
        f"/api/me/posts/{draft['id']}", json={**POST, "title": "New Title"}, headers=admin
    ).json()
    assert edited["slug"] == draft["slug"]
    assert edited["title"] == "New Title"


def test_authors_cannot_delete_published_posts(client, db, author):
    draft = client.post("/api/me/posts", json=POST, headers=author).json()
    db.execute(update(Post).where(Post.id == draft["id"]).values(status=PostStatus.PUBLISHED))
    db.commit()
    assert client.delete(f"/api/me/posts/{draft['id']}", headers=author).status_code == 409
    assert db.scalar(select(Post.id).where(Post.id == draft["id"])) is not None


# --- Uploads --------------------------------------------------------------------------


@pytest.fixture
def media_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "media_dir", tmp_path)
    return tmp_path


def image_bytes(fmt: str = "JPEG", size=(2400, 1200)) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", size, "purple").save(buffer, fmt)
    return buffer.getvalue()


def test_upload_resizes_and_stores(client, author, media_dir):
    res = client.post(
        "/api/uploads/images",
        files={"file": ("photo.jpg", image_bytes(), "image/jpeg")},
        headers=author,
    )
    assert res.status_code == 201
    url = res.json()["url"]
    assert url.startswith("/media/uploads/") and url.endswith(".jpg")
    stored = media_dir / url.removeprefix("/media/")
    with Image.open(stored) as img:
        assert img.size == (1600, 800)


def test_upload_rejects_non_images_and_readers(client, author, media_dir):
    fake = client.post(
        "/api/uploads/images",
        files={"file": ("x.jpg", b"<?php echo 1; ?>", "image/jpeg")},
        headers=author,
    )
    assert fake.status_code == 422
    assert fake.json()["detail"][0]["loc"] == ["body", "file"]

    gif = client.post(
        "/api/uploads/images",
        files={"file": ("x.gif", image_bytes("GIF", (10, 10)), "image/gif")},
        headers=author,
    )
    assert gif.status_code == 422

    reader = sign_up(client, "reader@example.com")
    denied = client.post(
        "/api/uploads/images",
        files={"file": ("p.jpg", image_bytes(), "image/jpeg")},
        headers=reader,
    )
    assert denied.status_code == 403
    assert list(media_dir.rglob("*.*")) == []
