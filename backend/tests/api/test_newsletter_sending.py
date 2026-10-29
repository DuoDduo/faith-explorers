from datetime import timedelta

import pytest
from sqlalchemy import select, update

from app.models import NewsletterIssue, Post, Role, Subscriber, User
from app.models.base import utcnow
from tests.helpers import link_token, sign_up

ISSUE = {
    "subject": "October at Faith Explorers",
    "message": "Grace to you!",
    "include_recent": True,
}


@pytest.fixture
def admin(client, db):
    headers = sign_up(client, "admin@example.com")
    db.execute(update(User).where(User.email == "admin@example.com").values(role=Role.ADMIN))
    db.commit()
    return headers


def subscribe(client, outbox, email: str, confirm: bool = True) -> None:
    client.post("/api/newsletter/subscribe", json={"email": email})
    if confirm:
        client.post("/api/newsletter/confirm", json={"token": link_token(outbox[-1])})


def publish_recently(db, slug: str, days_ago: int = 1) -> None:
    db.execute(
        update(Post)
        .where(Post.slug == slug)
        .values(published_at=utcnow() - timedelta(days=days_ago))
    )
    db.commit()


def test_only_admins_can_send(client):
    reader = sign_up(client, "reader@example.com")
    assert client.get("/api/admin/newsletter", headers=reader).status_code == 403
    assert client.post("/api/admin/newsletter/send", json=ISSUE, headers=reader).status_code == 403


def test_sends_to_confirmed_subscribers_only(client, db, admin, outbox):
    subscribe(client, outbox, "a@example.com")
    subscribe(client, outbox, "b@example.com")
    subscribe(client, outbox, "pending@example.com", confirm=False)
    publish_recently(db, "the-art-of-spiritual-fasting")
    outbox.clear()

    overview = client.get("/api/admin/newsletter", headers=admin).json()
    assert (overview["confirmed"], overview["pending"]) == (2, 1)

    res = client.post("/api/admin/newsletter/send", json=ISSUE, headers=admin)
    assert res.json()["detail"] == "Sending to 2 subscribers."
    assert sorted(e.to for e in outbox) == ["a@example.com", "b@example.com"]

    email = next(e for e in outbox if e.to == "a@example.com")
    assert email.subject == ISSUE["subject"]
    assert "Grace to you!" in email.text
    assert "/articles/the-art-of-spiritual-fasting" in email.text

    # Each reader gets their own working unsubscribe link.
    token = db.scalar(
        select(Subscriber.unsubscribe_token).where(Subscriber.email == "a@example.com")
    )
    assert f"/newsletter/unsubscribe?token={token}" in email.text

    issues = client.get("/api/admin/newsletter", headers=admin).json()["issues"]
    assert [(i["subject"], i["recipient_count"]) for i in issues] == [(ISSUE["subject"], 2)]


def test_recent_articles_are_those_since_the_last_issue(client, db, admin, outbox):
    subscribe(client, outbox, "a@example.com")
    publish_recently(db, "the-art-of-spiritual-fasting", days_ago=3)
    client.post("/api/admin/newsletter/send", json=ISSUE, headers=admin)

    publish_recently(db, "prayer-and-meditation", days_ago=0)
    outbox.clear()
    client.post("/api/admin/newsletter/send", json=ISSUE, headers=admin)
    text = outbox[0].text
    assert "/articles/prayer-and-meditation" in text
    assert "/articles/the-art-of-spiritual-fasting" not in text

    outbox.clear()
    plain = {**ISSUE, "include_recent": False}
    client.post("/api/admin/newsletter/send", json=plain, headers=admin)
    assert "New on Faith Explorers" not in outbox[0].text


def test_test_send_goes_to_the_admin_only(client, admin, outbox):
    subscribe(client, outbox, "a@example.com")
    outbox.clear()
    res = client.post("/api/admin/newsletter/test", json=ISSUE, headers=admin)
    assert res.json()["detail"] == "Test sent to admin@example.com."
    assert [(e.to, e.subject) for e in outbox] == [
        ("admin@example.com", "[Test] October at Faith Explorers")
    ]


def test_nothing_is_recorded_without_subscribers(client, db, admin, outbox):
    res = client.post("/api/admin/newsletter/send", json=ISSUE, headers=admin)
    assert "no confirmed subscribers" in res.json()["detail"]
    assert db.scalar(select(NewsletterIssue.id)) is None
    assert outbox == []
