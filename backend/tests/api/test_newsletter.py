from sqlalchemy import select

from app.models import Subscriber
from tests.helpers import link_token


def subscriber(db, email: str) -> Subscriber | None:
    db.expire_all()
    return db.scalar(select(Subscriber).where(Subscriber.email == email))


def test_double_opt_in(client, db, outbox):
    res = client.post("/api/newsletter/subscribe", json={"email": "Reader@Example.com"})
    assert res.status_code == 202
    assert "confirm" in res.json()["detail"]

    assert len(outbox) == 1
    assert outbox[0].to == "reader@example.com"
    assert "/newsletter/confirm?token=" in outbox[0].text
    assert subscriber(db, "reader@example.com").confirmed_at is None

    confirmed = client.post("/api/newsletter/confirm", json={"token": link_token(outbox[0])})
    assert confirmed.status_code == 200
    assert subscriber(db, "reader@example.com").confirmed_at is not None

    # The link is single-use.
    again = client.post("/api/newsletter/confirm", json={"token": link_token(outbox[0])})
    assert again.status_code == 404


def test_reply_is_the_same_for_new_pending_and_confirmed_addresses(client, outbox):
    first = client.post("/api/newsletter/subscribe", json={"email": "reader@example.com"})
    pending = client.post("/api/newsletter/subscribe", json={"email": "reader@example.com"})
    assert first.json() == pending.json()
    assert len(outbox) == 2  # a fresh link for someone who lost the first email

    client.post("/api/newsletter/confirm", json={"token": link_token(outbox[-1])})
    confirmed = client.post("/api/newsletter/subscribe", json={"email": "reader@example.com"})
    assert confirmed.json() == first.json()
    assert len(outbox) == 2  # no email to people already subscribed


def test_only_the_latest_confirmation_link_works(client, outbox):
    client.post("/api/newsletter/subscribe", json={"email": "reader@example.com"})
    client.post("/api/newsletter/subscribe", json={"email": "reader@example.com"})
    old, new = link_token(outbox[0]), link_token(outbox[1])
    assert client.post("/api/newsletter/confirm", json={"token": old}).status_code == 404
    assert client.post("/api/newsletter/confirm", json={"token": new}).status_code == 200


def test_unsubscribe(client, db, outbox):
    client.post("/api/newsletter/subscribe", json={"email": "reader@example.com"})
    token = subscriber(db, "reader@example.com").unsubscribe_token

    res = client.post("/api/newsletter/unsubscribe", json={"token": token})
    assert res.status_code == 200
    assert subscriber(db, "reader@example.com") is None

    # Unknown tokens still get a friendly reply.
    unknown = client.post("/api/newsletter/unsubscribe", json={"token": "x" * 20})
    assert unknown.status_code == 200
