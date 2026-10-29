import pytest
from sqlalchemy import select, update

from app.models import Post, Role, User

POST = {
    "title": "Hope in Hard Seasons",
    "excerpt": "Holding on to God's promises when life is difficult.",
    "body": "Paragraph one.\n\nParagraph two.",
    "category": "faith-and-spirituality",
    "tags": ["hope"],
}


def sign_up(client, email: str) -> dict[str, str]:
    res = client.post(
        "/api/auth/register",
        json={"name": email.split("@")[0].title(), "email": email, "password": "long enough pw"},
    )
    return {"Authorization": f"Bearer {res.json()['token']}"}


def set_role(db, email: str, role: Role) -> None:
    db.execute(update(User).where(User.email == email).values(role=role))
    db.commit()


@pytest.fixture
def admin(client, db):
    headers = sign_up(client, "admin@example.com")
    set_role(db, "admin@example.com", Role.ADMIN)
    return headers


def test_admin_routes_require_admin(client, db):
    assert client.get("/api/admin/overview").status_code == 401
    author = sign_up(client, "author@example.com")
    set_role(db, "author@example.com", Role.AUTHOR)
    for path in ("overview", "applications", "posts", "comments", "messages", "users"):
        assert client.get(f"/api/admin/{path}", headers=author).status_code == 403


def test_approving_an_application_makes_an_author(client, db, admin):
    reader = sign_up(client, "reader@example.com")
    motivation = "I write a weekly devotional for my church newsletter."
    client.post("/api/author-applications", json={"motivation": motivation}, headers=reader)

    queue = client.get("/api/admin/applications", headers=admin).json()
    assert queue["total"] == 1
    item = queue["items"][0]
    assert item["user"]["email"] == "reader@example.com"
    assert client.get("/api/admin/overview", headers=admin).json()["pending_applications"] == 1

    approved = client.post(
        f"/api/admin/applications/{item['id']}/approve", json={}, headers=admin
    ).json()
    assert approved["status"] == "approved"
    assert client.get("/api/auth/me", headers=reader).json()["role"] == "author"
    assert client.get("/api/me/posts", headers=reader).status_code == 200

    again = client.post(f"/api/admin/applications/{item['id']}/reject", json={}, headers=admin)
    assert again.status_code == 409


def test_rejection_note_is_shown_to_applicant(client, admin):
    reader = sign_up(client, "reader@example.com")
    motivation = "I would like to write about youth ministry and mentoring."
    client.post("/api/author-applications", json={"motivation": motivation}, headers=reader)
    app_id = client.get("/api/admin/applications", headers=admin).json()["items"][0]["id"]

    client.post(
        f"/api/admin/applications/{app_id}/reject",
        json={"note": "Please include a writing sample."},
        headers=admin,
    )
    mine = client.get("/api/me/author-application", headers=reader).json()
    assert mine["status"] == "rejected"
    assert mine["review_note"] == "Please include a writing sample."
    assert client.get("/api/auth/me", headers=reader).json()["role"] == "reader"


def test_review_queue_publish_and_return(client, db, admin):
    author = sign_up(client, "author@example.com")
    set_role(db, "author@example.com", Role.AUTHOR)
    draft = client.post("/api/me/posts", json=POST, headers=author).json()
    client.post(f"/api/me/posts/{draft['id']}/submit", headers=author)

    queue = client.get("/api/admin/posts", headers=admin).json()
    assert [p["id"] for p in queue["items"]] == [draft["id"]]

    returned = client.post(
        f"/api/admin/posts/{draft['id']}/return",
        json={"note": "Add a scripture reference in the intro."},
        headers=admin,
    ).json()
    assert returned["status"] == "draft"
    mine = client.get(f"/api/me/posts/{draft['id']}", headers=author).json()
    assert mine["review_note"] == "Add a scripture reference in the intro."

    # Resubmitting clears the note; publishing makes it public.
    resubmitted = client.post(f"/api/me/posts/{draft['id']}/submit", headers=author).json()
    assert resubmitted["review_note"] is None
    published = client.post(f"/api/admin/posts/{draft['id']}/publish", headers=admin).json()
    assert published["status"] == "published"
    assert client.get(f"/api/posts/{draft['slug']}").status_code == 200

    featured = client.put(
        f"/api/admin/posts/{draft['id']}/featured", json={"featured": True}, headers=admin
    )
    assert featured.json()["featured"] is True
    picks = client.get("/api/posts", params={"featured": True, "page_size": 10}).json()
    assert draft["slug"] in [p["slug"] for p in picks["items"]]

    unpublished = client.post(f"/api/admin/posts/{draft['id']}/unpublish", headers=admin).json()
    assert unpublished["status"] == "draft"
    assert unpublished["featured"] is False
    assert client.get(f"/api/posts/{draft['slug']}").status_code == 404


def test_only_published_posts_can_be_featured(client, db, admin):
    draft = client.post("/api/me/posts", json=POST, headers=admin).json()
    res = client.put(
        f"/api/admin/posts/{draft['id']}/featured", json={"featured": True}, headers=admin
    )
    assert res.status_code == 409


def test_hiding_a_comment_removes_it_publicly(client, admin):
    slug = "7-keys-to-building-a-christ-centered-relationship"
    reader = sign_up(client, "reader@example.com")
    comment = client.post(
        f"/api/posts/{slug}/comments", json={"body": "Spam spam spam"}, headers=reader
    ).json()

    hidden = client.put(
        f"/api/admin/comments/{comment['id']}/status", json={"status": "hidden"}, headers=admin
    ).json()
    assert hidden["status"] == "hidden"
    public = client.get(f"/api/posts/{slug}/comments").json()
    assert comment["id"] not in [c["id"] for c in public]
    assert (
        client.get("/api/admin/comments", params={"status": "hidden"}, headers=admin).json()[
            "total"
        ]
        == 1
    )

    client.put(
        f"/api/admin/comments/{comment['id']}/status", json={"status": "visible"}, headers=admin
    )
    assert comment["id"] in [c["id"] for c in client.get(f"/api/posts/{slug}/comments").json()]


def test_contact_inbox(client, admin):
    client.post(
        "/api/contact", json={"name": "Ada", "email": "ada@example.com", "message": "Hello!"}
    )
    inbox = client.get("/api/admin/messages", headers=admin).json()
    assert [m["message"] for m in inbox["items"]] == ["Hello!"]
    message_id = inbox["items"][0]["id"]

    client.put(f"/api/admin/messages/{message_id}/handled", json={"handled": True}, headers=admin)
    assert client.get("/api/admin/messages", headers=admin).json()["total"] == 0
    done = client.get("/api/admin/messages", params={"show": "handled"}, headers=admin).json()
    assert [m["id"] for m in done["items"]] == [message_id]
    everything = client.get("/api/admin/messages", params={"show": "all"}, headers=admin).json()
    assert everything["total"] == 1


def test_user_management(client, db, admin):
    reader = sign_up(client, "reader@example.com")
    users = client.get("/api/admin/users", params={"q": "reader"}, headers=admin).json()
    assert [u["email"] for u in users["items"]] == ["reader@example.com"]
    user_id = users["items"][0]["id"]

    promoted = client.patch(f"/api/admin/users/{user_id}", json={"role": "author"}, headers=admin)
    assert promoted.json()["role"] == "author"

    client.patch(f"/api/admin/users/{user_id}", json={"is_active": False}, headers=admin)
    assert client.get("/api/auth/me", headers=reader).status_code == 401


def test_admin_cannot_lock_themselves_out(client, db, admin):
    me = db.scalar(select(User).where(User.email == "admin@example.com"))
    demote = client.patch(f"/api/admin/users/{me.id}", json={"role": "reader"}, headers=admin)
    deactivate = client.patch(f"/api/admin/users/{me.id}", json={"is_active": False}, headers=admin)
    assert demote.status_code == deactivate.status_code == 409
    assert client.get("/api/auth/me", headers=admin).json()["role"] == "admin"


def test_seeded_content_authors_are_not_listed_as_users(client, db, admin):
    emails = [u["email"] for u in client.get("/api/admin/users", headers=admin).json()["items"]]
    assert emails == ["admin@example.com"]
    assert db.scalar(select(Post.id).limit(1)) is not None
