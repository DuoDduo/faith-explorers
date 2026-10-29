from sqlalchemy import update

from app.models import Role, User

SLUG = "7-keys-to-building-a-christ-centered-relationship"


def sign_up(client, email: str) -> dict[str, str]:
    res = client.post(
        "/api/auth/register",
        json={"name": email.split("@")[0], "email": email, "password": "long enough pw"},
    )
    return {"Authorization": f"Bearer {res.json()['token']}"}


def test_posting_requires_sign_in(client):
    res = client.post(f"/api/posts/{SLUG}/comments", json={"body": "Hi"})
    assert res.status_code == 401


def test_signed_in_reader_can_comment(client):
    headers = sign_up(client, "reader@example.com")
    res = client.post(f"/api/posts/{SLUG}/comments", json={"body": "  Amen!  "}, headers=headers)
    assert res.status_code == 201
    assert res.json()["body"] == "Amen!"
    assert res.json()["user"]["name"] == "reader"

    thread = client.get(f"/api/posts/{SLUG}/comments").json()
    assert [c["body"] for c in thread][-1] == "Amen!"
    assert client.get("/api/comments/latest").json()[0]["body"] == "Amen!"


def test_comment_validation(client):
    headers = sign_up(client, "reader@example.com")
    blank = client.post(f"/api/posts/{SLUG}/comments", json={"body": "   "}, headers=headers)
    long = client.post(f"/api/posts/{SLUG}/comments", json={"body": "x" * 2001}, headers=headers)
    missing = client.post("/api/posts/nope/comments", json={"body": "Hi"}, headers=headers)
    assert blank.status_code == long.status_code == 422
    assert missing.status_code == 404


def test_only_author_or_admin_can_delete(client, db):
    author = sign_up(client, "author@example.com")
    other = sign_up(client, "other@example.com")
    admin = sign_up(client, "admin@example.com")
    db.execute(update(User).where(User.email == "admin@example.com").values(role=Role.ADMIN))
    db.commit()

    def post_comment() -> int:
        res = client.post(f"/api/posts/{SLUG}/comments", json={"body": "Hi"}, headers=author)
        return res.json()["id"]

    first = post_comment()
    assert client.delete(f"/api/comments/{first}", headers=other).status_code == 403
    assert client.delete(f"/api/comments/{first}", headers=author).status_code == 204
    assert client.delete(f"/api/comments/{first}", headers=author).status_code == 404

    second = post_comment()
    assert client.delete(f"/api/comments/{second}", headers=admin).status_code == 204
