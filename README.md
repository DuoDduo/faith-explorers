# faith-explorers

A Christian blog website with articles on the Christian faith.

The site is a **React + TypeScript** frontend talking to a **FastAPI + PostgreSQL** backend.
The original static HTML site is kept in [`legacy/`](legacy/) for reference; its content was
imported into the database by `backend/scripts/seed.py`.

```
backend/    FastAPI app, SQLAlchemy models, Alembic migrations, seed script, tests
frontend/   Vite + React + TypeScript app (React Router, TanStack Query)
legacy/     The original HTML/CSS/JS site and JSON data
```

## Running locally

Requirements: Python 3.13 with [uv](https://docs.astral.sh/uv/), Node 22+, and PostgreSQL 16
(either installed locally or via `docker compose up -d`).

```bash
# 1. Database
docker compose up -d                 # or use a local Postgres with the same user/db

# 2. API  ->  http://localhost:8000  (interactive docs at /docs)
cd backend
cp .env.example .env
uv sync
uv run alembic upgrade head          # create tables
uv run python -m scripts.seed        # import the legacy articles
uv run uvicorn app.main:app --reload

# 3. Web app  ->  http://localhost:5173
cd frontend
npm install
npm run dev                          # proxies /api and /media to :8000
```

## Checks

```bash
cd backend  && uv run pytest && uv run ruff check . && uv run ruff format --check .
cd frontend && npm test && npm run typecheck && npm run lint && npm run build
```

Backend tests use an in-memory SQLite database seeded with the real content, so they don't
need Postgres running.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/posts?category=&tag=&q=&featured=&sort=recent\|popular&page=&page_size=` | Paginated published posts |
| GET | `/api/posts/{slug}` | One post (Markdown body) |
| POST | `/api/posts/{slug}/views` | Count a visit |
| GET | `/api/posts/{slug}/comments` | Visible comments on a post |
| GET | `/api/categories`, `/api/categories/{slug}` | Categories with published post counts |
| GET | `/api/comments/latest` | Newest comments site-wide |
| POST | `/api/contact` | Store a contact-form message |
| POST | `/api/newsletter/subscribe` | Add a newsletter subscriber |

Images are served from `/media/...` (`backend/media/`). `backend/scripts/optimize_images.py`
produced them from `legacy/sopimages/` (46 MB → 6 MB).

## Schema changes

Edit `backend/app/models.py`, then:

```bash
cd backend
uv run alembic revision --autogenerate -m "describe the change"
uv run alembic upgrade head
```

Keep `frontend/src/api/types.ts` in sync with `backend/app/schemas.py`.

## Roadmap

- [x] React + TypeScript frontend with the original design
- [x] FastAPI + Postgres backend, migrations, legacy content import
- [x] Working contact form and newsletter sign-up (stored in the database)
- [ ] Accounts: register / login (httpOnly session cookie), roles reader / author / admin
- [ ] Readers post comments and like posts
- [ ] "Become an author" applications, author dashboard with a Markdown editor and image upload
- [ ] Admin: approve posts and authors, moderate comments, read contact messages
- [ ] Email: contact-form notifications, newsletter double opt-in
- [ ] Deployment (e.g. web on Vercel/Netlify, API + Postgres on Render/Railway/Fly)
