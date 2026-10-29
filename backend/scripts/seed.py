"""Import the legacy static-site content (legacy/*.json) into the database.

The old site kept articles in three overlapping JSON files with no IDs, dates or
authors for most entries. This script merges them into real rows:

  * blog-data.json  -> 6 authored posts (the first 3 were index.json's "Editor's picks")
  * category.json   -> 10 categories and their 38 articles
  * popular.json    -> 4 "recent" + 5 "popular" posts and the 4 sample comments

Undated articles get publish dates that keep the old page order, and the
"popular" posts get view counts so they still top the Popular list.

Usage (from backend/):
  uv run python -m scripts.seed           # refuses to run if posts already exist
  uv run python -m scripts.seed --reset   # wipes content tables first
"""

import argparse
import json
import re
from datetime import UTC, datetime, timedelta
from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import (
    Category,
    Comment,
    Post,
    PostStatus,
    Role,
    Tag,
    User,
    post_tags,
)
from app.utils.text import read_time_minutes, slugify

LEGACY = Path(__file__).resolve().parents[2] / "legacy"

CATEGORY_COVERS = {
    "Faith and Spirituality": "HOE MAY-17.jpg",
    "Relationships and Marriage": "HOE MAY-55.jpg",
    "Singleness and Celibacy": "HOE MAY-25.jpg",
    "Parenting and Family": "HOE MAY-26.jpg",
    "Christian Ethics": "HOE MAY-76.jpg",
    "Discipleship and Christian Ministry": "HOE MAY-12.jpg",
    "Worship": "broisrael (3).jpg",
    "Financial Stewardship": "HOE MAY-53.jpg",
    "Forgiveness and Reconciliation": "HOE MAY-41.jpg",
    "Spiritual Disciplines": "HOE MAY-51.jpg",
    # Needed by articles whose old category had no page of its own.
    "Purpose and Calling": "HOE MAY-11.jpg",
    "Christian Living": "HOE MAY-14.jpg",
    "Emotional Health": "HOE MAY-52.jpg",
}

# Old free-text categories on blog/recent posts -> real categories.
CATEGORY_ALIASES = {
    "Relationship": "Relationships and Marriage",
    "Relationship and Marriage": "Relationships and Marriage",
    "Friendship": "Relationships and Marriage",
    "Purpose": "Purpose and Calling",
    "Lifestyle": "Christian Living",
    "Trust": "Faith and Spirituality",
}

# popular.json's popularPosts had no category at all.
POPULAR_CATEGORIES = {
    "Embracing Diversity": "Christian Living",
    "Practicing Gratitude": "Spiritual Disciplines",
    "Stewardship of Time": "Christian Living",
    "Living a Life of Forgiveness": "Forgiveness and Reconciliation",
    "Financial Stewardship": "Financial Stewardship",
}

# Which article each sample comment was written about (matched by title prefix).
COMMENT_TARGETS = [
    "7 Keys to Building a Christ-Centered Relationship",
    "Embracing Singleness",
    "The Power of Forgiveness in Relationships",
    "Prayer and Meditation",
]

EDITORIAL_TEAM = "Faith Explorers Team"


def media(legacy_src: str | None) -> str | None:
    """'./sopimages/HOE MAY-51.jpg' -> '/media/images/hoe-may-51.jpg' (None if not ours)."""
    if not legacy_src or "sopimages/" not in legacy_src:
        return None
    path = Path(legacy_src.split("sopimages/", 1)[1])
    return f"/media/images/{slugify(path.stem)}{path.suffix.lower()}"


def to_markdown(body: str | list[str]) -> str:
    """Legacy bodies are HTML strings whose only markup is <br>."""
    text = " ".join(body) if isinstance(body, list) else body
    paragraphs = [p.strip() for p in re.split(r"(?:\s*<br\s*/?>\s*)+", text)]
    return "\n\n".join(p for p in paragraphs if p)


def clean_title(title: str) -> str:
    return re.sub(r"^\s*\d+\.\s*", "", title).strip()


def parse_date(value: str) -> datetime:
    return datetime.strptime(value, "%d %B %Y").replace(hour=9, tzinfo=UTC)


class Seeder:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.categories: dict[str, Category] = {}
        self.tags: dict[str, Tag] = {}
        self.authors: dict[str, User] = {}
        self.slugs: set[str] = set()

    def category(self, name: str) -> Category:
        name = CATEGORY_ALIASES.get(name, name)
        if name not in self.categories:
            cover = CATEGORY_COVERS.get(name)
            self.categories[name] = Category(
                name=name, slug=slugify(name), cover_url=media(f"sopimages/{cover}")
            )
            self.db.add(self.categories[name])
        return self.categories[name]

    def tag(self, name: str) -> Tag:
        name = name.lstrip("#").replace("Christain", "Christian")
        if name not in self.tags:
            self.tags[name] = Tag(name=name, slug=slugify(name))
        return self.tags[name]

    def user(self, name: str, avatar: str | None, role: Role) -> User:
        if name not in self.authors:
            self.authors[name] = User(name=name, avatar_url=media(avatar), role=role)
            self.db.add(self.authors[name])
        return self.authors[name]

    def unique_slug(self, title: str) -> str:
        base = slug = slugify(title)
        n = 2
        while slug in self.slugs:
            slug, n = f"{base}-{n}", n + 1
        self.slugs.add(slug)
        return slug

    def post(self, *, title, excerpt, body, category, author, published_at, cover=None,
             featured=False, views=0, tags=()) -> Post:  # fmt: skip
        title = clean_title(title)
        body_md = to_markdown(body)
        category_obj = self.category(category)
        post = Post(
            slug=self.unique_slug(title),
            title=title,
            excerpt=excerpt.strip(),
            body=body_md,
            cover_url=media(cover) or category_obj.cover_url,
            status=PostStatus.PUBLISHED,
            featured=featured,
            read_time=read_time_minutes(body_md),
            views=views,
            published_at=published_at,
            author=author,
            category=category_obj,
            tags=[self.tag(t) for t in tags],
        )
        self.db.add(post)
        return post

    def run(self) -> None:
        blog = json.loads((LEGACY / "blog-data.json").read_text())
        featured_ids = {p["id"] for p in json.loads((LEGACY / "index.json").read_text())}
        by_category = json.loads((LEGACY / "category.json").read_text())
        popular = json.loads((LEGACY / "popular.json").read_text())

        team = self.user(EDITORIAL_TEAM, "sopimages/Faith.png", Role.ADMIN)
        posts: list[Post] = []

        # Category articles: undated, so spread them over the weeks before the blog posts.
        start = datetime(2023, 6, 1, 9, tzinfo=UTC)
        for group in by_category:
            for article in group["articles"]:
                posts.append(self.post(
                    title=article["title"], excerpt=article["content"], body=article["body"],
                    category=group["category"], author=team,
                    published_at=start + timedelta(days=len(posts)),
                ))  # fmt: skip

        for i, item in enumerate(popular["popularPosts"]):
            category = next(c for k, c in POPULAR_CATEGORIES.items() if item["title"].startswith(k))
            posts.append(self.post(
                title=item["title"], excerpt=item["content"], body=item["body"],
                category=category, author=team, published_at=parse_date(item["date"]),
                views=500 - i * 50,
            ))  # fmt: skip

        for item in blog:
            author = self.user(item["author"], item["authorImage"], Role.AUTHOR)
            posts.append(self.post(
                title=item["title"], excerpt=item["content"], body=item["body"],
                category=item["category"], author=author, cover=item["imageSrc"],
                published_at=parse_date(item["date"]) + timedelta(minutes=item["id"]),
                featured=item["id"] in featured_ids, tags=[item["category"]],
            ))  # fmt: skip

        # "Recent posts" were the newest articles on the old site, listed newest first.
        recent_start = datetime(2023, 8, 24, 9, tzinfo=UTC)
        for i, item in enumerate(popular["recentPosts"]):
            posts.append(self.post(
                title=item["title"], excerpt=item["content"], body=item["body"],
                category=item["category"], author=team, cover=item["imageSrc"],
                published_at=recent_start - timedelta(hours=i), tags=item["tags"],
            ))  # fmt: skip

        for i, item in enumerate(popular["latestComment"]):
            target = next(p for p in posts if p.title.startswith(COMMENT_TARGETS[i]))
            commenter = self.user(item["author"]["name"], item["author"]["avatar"], Role.READER)
            created = parse_date(item["date"]) + timedelta(hours=i)
            self.db.add(Comment(
                body=item["comment"], post=target, user=commenter,
                created_at=created, updated_at=created,
            ))  # fmt: skip

        self.db.commit()
        print(
            f"Seeded {len(posts)} posts, {len(self.categories)} categories, "
            f"{len(self.authors)} users, {len(self.tags)} tags, "
            f"{len(popular['latestComment'])} comments."
        )


def reset(db: Session) -> None:
    for table in (Comment, post_tags, Post, Tag, Category, User):
        db.execute(delete(table))
    db.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--reset", action="store_true", help="delete existing content first")
    args = parser.parse_args()

    with SessionLocal() as db:
        if args.reset:
            reset(db)
        elif db.scalar(select(Post.id).limit(1)) is not None:
            raise SystemExit("Database already has posts. Re-run with --reset to replace them.")
        Seeder(db).run()


if __name__ == "__main__":
    main()
