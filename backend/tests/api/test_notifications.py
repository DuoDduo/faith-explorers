from sqlalchemy import update

from app.core.config import settings
from app.models import Role, User
from tests.helpers import sign_up

POST = {
    "title": "A Quiet Heart",
    "excerpt": "Learning stillness before God in a noisy world.",
    "body": "Be still, and know.",
    "category": "spiritual-disciplines",
    "tags": [],
}


def make(db, email: str, role: Role) -> None:
    db.execute(update(User).where(User.email == email).values(role=role))
    db.commit()


def test_contact_messages_are_forwarded_when_configured(client, outbox, monkeypatch):
    message = {"name": "Ada", "email": "ada@example.com", "message": "Hello there"}
    client.post("/api/contact", json=message)
    assert outbox == []  # off by default

    monkeypatch.setattr(settings, "contact_notify_email", "editors@example.com")
    client.post("/api/contact", json=message)
    assert len(outbox) == 1
    assert outbox[0].to == "editors@example.com"
    assert outbox[0].reply_to == "ada@example.com"
    assert "Hello there" in outbox[0].text


def test_applicants_hear_back(client, db, outbox):
    admin = sign_up(client, "admin@example.com")
    make(db, "admin@example.com", Role.ADMIN)
    reader = sign_up(client, "reader@example.com")
    client.post(
        "/api/author-applications",
        json={"motivation": "I write devotionals for my church every single week."},
        headers=reader,
    )
    app_id = client.get("/api/admin/applications", headers=admin).json()["items"][0]["id"]
    client.post(
        f"/api/admin/applications/{app_id}/approve", json={"note": "Welcome!"}, headers=admin
    )

    assert len(outbox) == 1
    assert outbox[0].to == "reader@example.com"
    assert "approved" in outbox[0].text
    assert "Welcome!" in outbox[0].text


def test_authors_hear_about_review_decisions(client, db, outbox):
    admin = sign_up(client, "admin@example.com")
    make(db, "admin@example.com", Role.ADMIN)
    author = sign_up(client, "author@example.com")
    make(db, "author@example.com", Role.AUTHOR)
    post = client.post("/api/me/posts", json=POST, headers=author).json()
    client.post(f"/api/me/posts/{post['id']}/submit", headers=author)

    client.post(
        f"/api/admin/posts/{post['id']}/return", json={"note": "Add a verse."}, headers=admin
    )
    assert outbox[-1].subject == "Changes requested: A Quiet Heart"
    assert "Add a verse." in outbox[-1].text
    assert f"/dashboard/{post['id']}/edit" in outbox[-1].text

    client.post(f"/api/me/posts/{post['id']}/submit", headers=author)
    client.post(f"/api/admin/posts/{post['id']}/publish", headers=admin)
    assert outbox[-1].subject == "Published: A Quiet Heart"
    assert f"/articles/{post['slug']}" in outbox[-1].text
    assert all(e.to == "author@example.com" for e in outbox)


def test_admins_are_not_emailed_about_their_own_posts(client, db, outbox):
    admin = sign_up(client, "admin@example.com")
    make(db, "admin@example.com", Role.ADMIN)
    post = client.post("/api/me/posts", json=POST, headers=admin).json()
    published = client.post(f"/api/admin/posts/{post['id']}/publish", headers=admin)
    assert published.json()["status"] == "published"
    assert outbox == []
