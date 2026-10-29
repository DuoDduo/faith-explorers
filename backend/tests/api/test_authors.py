from sqlalchemy import select

from app.models import Post, PostStatus
from tests.helpers import sign_up


def test_author_profile_counts_published_articles(client, db):
    post = db.scalar(select(Post).where(Post.status == PostStatus.PUBLISHED).limit(1))
    author_id = post.author_id
    published = db.query(Post).filter_by(author_id=author_id, status=PostStatus.PUBLISHED).count()

    res = client.get(f"/api/authors/{author_id}")
    assert res.status_code == 200
    profile = res.json()
    assert profile["name"] == post.author.name
    assert profile["post_count"] == published
    assert "email" not in profile


def test_posts_can_be_filtered_by_author(client, db):
    post = db.scalar(select(Post).where(Post.status == PostStatus.PUBLISHED).limit(1))
    items = client.get("/api/posts", params={"author": post.author_id, "page_size": 50}).json()
    assert items["total"] >= 1
    assert {p["author"]["id"] for p in items["items"]} == {post.author_id}


def test_readers_and_unknown_users_have_no_profile(client):
    reader = client.get("/api/auth/me", headers=sign_up(client, "reader@example.com")).json()
    assert client.get(f"/api/authors/{reader['id']}").status_code == 404
    assert client.get("/api/authors/999999").status_code == 404
