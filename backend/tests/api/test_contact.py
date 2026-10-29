from sqlalchemy import select

from app.models import ContactMessage


def test_contact_form_is_stored(client, db):
    payload = {"name": "Ada", "email": "ada@example.com", "message": "Hello!"}
    res = client.post("/api/contact", json=payload)
    assert res.status_code == 201
    assert db.scalar(select(ContactMessage.email)) == "ada@example.com"

    bad = client.post("/api/contact", json={**payload, "email": "not-an-email", "message": ""})
    assert bad.status_code == 422
