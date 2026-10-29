# Faith Explorers API

FastAPI + SQLAlchemy 2 + PostgreSQL. Interactive docs at `http://localhost:8000/docs`.

## Setup

```bash
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run python -m scripts.seed          # import the legacy site's articles
uv run uvicorn app.main:app --reload
```

## Layout

```
app/
  main.py            app factory: middleware, routers, /media static files
  core/              settings, database session, exceptions -> HTTP mapping
  models/            SQLAlchemy tables, one module per domain
  schemas/           Pydantic request/response models
  services/          business logic and queries (no HTTP concerns)
  api/
    deps.py          shared FastAPI dependencies
    router.py        mounts every route module under /api
    routes/          thin HTTP handlers that call services
  utils/             small pure helpers
alembic/             migrations
scripts/             seed.py (legacy import), optimize_images.py
tests/
  api/               endpoint tests (in-memory SQLite, seeded)
  unit/              pure-function tests
media/               uploaded and seeded images served at /media
```

Adding a feature usually means: model -> migration -> schema -> service -> route -> test.

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | | Create a reader account, returns a session token |
| POST | `/api/auth/login` | | Exchange email + password for a session token |
| POST | `/api/auth/logout` | ✓ | Revoke the current session |
| GET | `/api/auth/me` | ✓ | The signed-in user |
| GET | `/api/posts` | | Published posts (`category`, `tag`, `q`, `featured`, `sort`, `page`, `page_size`) |
| GET | `/api/posts/{slug}` | | One post with its Markdown body |
| POST | `/api/posts/{slug}/views` | | Count a view |
| GET | `/api/posts/{slug}/comments` | | Visible comments on a post |
| POST | `/api/posts/{slug}/comments` | ✓ | Add a comment |
| DELETE | `/api/comments/{id}` | ✓ | Delete your own comment (admins: any) |
| GET | `/api/posts/{slug}/engagement` | optional | Like count, and whether you liked / saved it |
| PUT, DELETE | `/api/posts/{slug}/like` | ✓ | Like / unlike (idempotent) |
| PUT, DELETE | `/api/posts/{slug}/bookmark` | ✓ | Save / unsave (idempotent) |
| GET | `/api/me/bookmarks` | ✓ | Your saved posts, newest first |
| POST | `/api/author-applications` | ✓ | Apply to become an author |
| GET | `/api/me/author-application` | ✓ | Your latest application, or null |
| GET, POST | `/api/me/posts` | author | List your posts / create a draft |
| GET, PUT, DELETE | `/api/me/posts/{id}` | author | Read, edit or delete your post |
| POST | `/api/me/posts/{id}/submit` | author | Send for review (admins: publish) |
| POST | `/api/me/posts/{id}/withdraw` | author | Back from review to draft |
| POST | `/api/uploads/images` | author | Upload a JPEG/PNG/WebP (≤ 5 MB), returns its URL |
| GET | `/api/comments/latest` | | Newest comments site-wide |
| GET | `/api/categories`, `/api/categories/{slug}` | | Categories with post counts |
| POST | `/api/contact` | | Store a contact message |
| POST | `/api/newsletter/subscribe` | | Add a subscriber |

Authenticated requests send `Authorization: Bearer <token>`. Tokens are random, stored only
as SHA-256 hashes in the `sessions` table, and expire after `SESSION_TTL_DAYS` (default 30).
Passwords are hashed with Argon2id.

Uploads are decoded and re-encoded with Pillow (which also strips EXIF/GPS data), resized
to at most 1600px wide and stored under `media/uploads/`. In Docker that folder is a volume.

## Commands

| Task | Command |
|---|---|
| Tests | `uv run pytest` |
| Lint / format | `uv run ruff check .` / `uv run ruff format .` |
| New migration | `uv run alembic revision --autogenerate -m "..."` |
| Check models match migrations | `uv run alembic check` |
| Re-import content | `uv run python -m scripts.seed --reset` |
