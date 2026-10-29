from sqlalchemy import func, select, update

from app.models import Post, PostLike, PostStatus

SLUG = "embracing-a-lifestyle-of-humility"
OTHER = "the-art-of-spiritual-fasting"


def sign_up(client, email: str) -> dict[str, str]:
    res = client.post(
        "/api/auth/register",
        json={"name": "Reader", "email": email, "password": "long enough pw"},
    )
    return {"Authorization": f"Bearer {res.json()['token']}"}


def test_anonymous_engagement(client):
    res = client.get(f"/api/posts/{SLUG}/engagement")
    assert res.json() == {"like_count": 0, "liked": False, "bookmarked": False}
    assert client.put(f"/api/posts/{SLUG}/like").status_code == 401
    assert client.put(f"/api/posts/{SLUG}/bookmark").status_code == 401
    assert client.get("/api/me/bookmarks").status_code == 401


def test_like_is_idempotent_and_counted(client, db):
    alice = sign_up(client, "alice@example.com")
    bob = sign_up(client, "bob@example.com")

    assert client.put(f"/api/posts/{SLUG}/like", headers=alice).json()["like_count"] == 1
    again = client.put(f"/api/posts/{SLUG}/like", headers=alice).json()
    assert again == {"like_count": 1, "liked": True, "bookmarked": False}
    assert client.put(f"/api/posts/{SLUG}/like", headers=bob).json()["like_count"] == 2

    # Bob's view shows his own state; anonymous readers see only the count.
    assert client.get(f"/api/posts/{SLUG}/engagement", headers=bob).json()["liked"] is True
    assert client.get(f"/api/posts/{SLUG}/engagement").json()["liked"] is False
    assert client.get(f"/api/posts/{SLUG}").json()["like_count"] == 2

    assert client.delete(f"/api/posts/{SLUG}/like", headers=alice).json()["like_count"] == 1
    assert client.delete(f"/api/posts/{SLUG}/like", headers=alice).json()["like_count"] == 1

    rows = db.scalar(select(func.count()).select_from(PostLike))
    stored = db.scalar(select(Post.like_count).where(Post.slug == SLUG))
    assert rows == stored == 1


def test_bookmarks_listed_newest_first(client):
    alice = sign_up(client, "alice@example.com")
    client.put(f"/api/posts/{SLUG}/bookmark", headers=alice)
    client.put(f"/api/posts/{OTHER}/bookmark", headers=alice)
    client.put(f"/api/posts/{OTHER}/bookmark", headers=alice)  # no duplicate

    saved = client.get("/api/me/bookmarks", headers=alice).json()
    assert saved["total"] == 2
    assert [p["slug"] for p in saved["items"]] == [OTHER, SLUG]

    state = client.delete(f"/api/posts/{OTHER}/bookmark", headers=alice).json()
    assert state["bookmarked"] is False
    saved = client.get("/api/me/bookmarks", headers=alice).json()
    assert [p["slug"] for p in saved["items"]] == [SLUG]


def test_bookmarks_are_private(client):
    alice = sign_up(client, "alice@example.com")
    bob = sign_up(client, "bob@example.com")
    client.put(f"/api/posts/{SLUG}/bookmark", headers=alice)
    assert client.get("/api/me/bookmarks", headers=bob).json()["total"] == 0
    assert client.get(f"/api/posts/{SLUG}/engagement", headers=bob).json()["bookmarked"] is False


def test_unpublished_posts_drop_out_of_bookmarks(client, db):
    alice = sign_up(client, "alice@example.com")
    client.put(f"/api/posts/{SLUG}/bookmark", headers=alice)
    db.execute(update(Post).where(Post.slug == SLUG).values(status=PostStatus.DRAFT))
    db.commit()
    assert client.get("/api/me/bookmarks", headers=alice).json()["total"] == 0
    assert client.put(f"/api/posts/{SLUG}/like", headers=alice).status_code == 404


def test_expired_token_is_treated_as_anonymous_for_reads(client):
    res = client.get(
        f"/api/posts/{SLUG}/engagement", headers={"Authorization": "Bearer not-a-token"}
    )
    assert res.status_code == 200
    assert res.json()["liked"] is False
