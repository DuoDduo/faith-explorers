from sqlalchemy import select

from app.models import Subscriber


def test_newsletter_subscribe_is_idempotent(client, db):
    first = client.post("/api/newsletter/subscribe", json={"email": "Reader@Example.com"})
    again = client.post("/api/newsletter/subscribe", json={"email": "reader@example.com"})
    assert first.status_code == 201
    assert again.status_code == 200
    assert first.json() == again.json()
    assert db.scalars(select(Subscriber.email)).all() == ["reader@example.com"]
