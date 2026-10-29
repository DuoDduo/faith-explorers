from sqlalchemy import select

from app.models import ContactMessage, Post, PostStatus, Subscriber


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_list_posts_paginates_newest_first(client):
    res = client.get("/api/posts", params={"page_size": 5})
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 53
    assert data["pages"] == 11
    assert len(data["items"]) == 5
    dates = [p["published_at"] for p in data["items"]]
    assert dates == sorted(dates, reverse=True)
    assert data["items"][0]["title"].startswith("Finding Hope and Healing After Divorce")

    last = client.get("/api/posts", params={"page_size": 5, "page": 11}).json()
    assert len(last["items"]) == 3


def test_featured_posts_are_the_old_editors_picks(client):
    items = client.get("/api/posts", params={"featured": True}).json()["items"]
    assert {p["slug"] for p in items} == {
        "7-keys-to-building-a-christ-centered-relationship",
        "finding-purpose-and-fulfillment-in-your-career-a-christian-perspective",
        "embracing-a-lifestyle-of-humility",
    }


def test_popular_sort_uses_views(client):
    items = client.get("/api/posts", params={"sort": "popular", "page_size": 5}).json()["items"]
    assert [p["views"] for p in items] == [500, 450, 400, 350, 300]


def test_filter_by_category_tag_and_search(client):
    worship = client.get("/api/posts", params={"category": "worship"}).json()
    assert worship["total"] == 5
    assert {p["category"]["slug"] for p in worship["items"]} == {"worship"}

    divorce = client.get("/api/posts", params={"tag": "divorce"}).json()
    assert [p["slug"] for p in divorce["items"]] == [
        "finding-hope-and-healing-after-divorce-a-christian-approach"
    ]

    search = client.get("/api/posts", params={"q": "fasting"}).json()
    assert search["total"] >= 1
    assert all("fasting" in (p["title"] + p["excerpt"]).lower() for p in search["items"])


def test_get_post_returns_markdown_body(client):
    res = client.get("/api/posts/7-keys-to-building-a-christ-centered-relationship")
    assert res.status_code == 200
    post = res.json()
    assert post["author"]["name"] == "Minister Uchechukwu"
    assert post["author"]["avatar_url"] == "/media/images/uche.jpg"
    assert "<br>" not in post["body"]
    assert "\n\n" in post["body"]


def test_unknown_and_unpublished_posts_404(client, db):
    assert client.get("/api/posts/nope").status_code == 404

    post = db.scalar(select(Post).where(Post.slug == "embracing-a-lifestyle-of-humility"))
    post.status = PostStatus.DRAFT
    db.commit()
    assert client.get(f"/api/posts/{post.slug}").status_code == 404
    assert client.post(f"/api/posts/{post.slug}/views").status_code == 404
    slugs = [p["slug"] for p in client.get("/api/posts", params={"page_size": 50}).json()["items"]]
    assert post.slug not in slugs


def test_record_view_increments(client):
    slug = "embracing-a-lifestyle-of-humility"
    assert client.post(f"/api/posts/{slug}/views").json() == {"views": 1}
    assert client.post(f"/api/posts/{slug}/views").json() == {"views": 2}
    assert client.get(f"/api/posts/{slug}").json()["views"] == 2


def test_categories_have_published_counts(client):
    cats = {c["slug"]: c for c in client.get("/api/categories").json()}
    assert len(cats) == 13
    assert cats["spiritual-disciplines"]["post_count"] == 7
    assert cats["worship"]["cover_url"] == "/media/images/broisrael-3.jpg"
    assert client.get("/api/categories/worship").json()["post_count"] == 5
    assert client.get("/api/categories/nope").status_code == 404


def test_comments(client):
    latest = client.get("/api/comments/latest").json()
    assert len(latest) == 4
    assert latest[0]["user"]["name"] == "Akinsanya Adeniyi"

    thread = client.get(
        "/api/posts/7-keys-to-building-a-christ-centered-relationship/comments"
    ).json()
    assert [c["user"]["name"] for c in thread] == ["Blessing James"]


def test_contact_form_is_stored(client, db):
    payload = {"name": "Ada", "email": "ada@example.com", "message": "Hello!"}
    res = client.post("/api/contact", json=payload)
    assert res.status_code == 201
    assert db.scalar(select(ContactMessage.email)) == "ada@example.com"

    bad = client.post("/api/contact", json={**payload, "email": "not-an-email", "message": ""})
    assert bad.status_code == 422


def test_newsletter_subscribe_is_idempotent(client, db):
    first = client.post("/api/newsletter/subscribe", json={"email": "Reader@Example.com"})
    again = client.post("/api/newsletter/subscribe", json={"email": "reader@example.com"})
    assert first.status_code == 201
    assert again.status_code == 200
    assert first.json() == again.json()
    assert db.scalars(select(Subscriber.email)).all() == ["reader@example.com"]
