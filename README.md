# faith-explorers

A Christian blog website with articles on the Christian faith.

The project is two independent applications that talk over HTTP:

| App | Stack | Docs |
|---|---|---|
| [`backend/`](backend/) | FastAPI · SQLAlchemy 2 · Alembic · PostgreSQL | [backend/README.md](backend/README.md) |
| [`frontend/`](frontend/) | Next.js 16 (App Router) · React 19 · TypeScript | [frontend/README.md](frontend/README.md) |

Each has its own dependencies, tests, linting and Dockerfile, so either can be moved into its
own repository later without changes. [`legacy/`](legacy/) keeps the original static HTML site
for reference; its content was imported into the database by `backend/scripts/seed.py`.

```
faith-explorers/
├── backend/                FastAPI service
│   ├── app/
│   │   ├── api/routes/     HTTP handlers (thin)
│   │   ├── services/       business logic and queries
│   │   ├── models/         SQLAlchemy tables
│   │   ├── schemas/        Pydantic request/response models
│   │   └── core/           settings, database, error handling
│   ├── alembic/            migrations
│   ├── scripts/            seed + image optimization
│   └── tests/              api/ and unit/
├── frontend/               Next.js app
│   ├── src/app/            routes
│   ├── src/components/     layout · ui · sections · posts · comments · categories · forms
│   ├── src/lib/            api (server-side data), actions (Server Actions), helpers
│   └── tests/
├── legacy/                 original HTML/CSS/JS site
├── docker-compose.yml      local stack: Postgres + API + web
├── docker-compose.prod.yml production stack behind Caddy (HTTPS)
├── docs/DEPLOYMENT.md      how to deploy
└── .github/workflows/ci.yml
```

## Quick start (Docker)

```bash
docker compose up --build -d
docker compose run --rm api python -m scripts.seed     # first time only
```

Web: http://localhost:3000 · API docs: http://localhost:8000/docs

## Local development

Requirements: Python 3.13 + [uv](https://docs.astral.sh/uv/), Node 22, PostgreSQL 16
(`docker compose up -d db` starts one).

```bash
# Terminal 1: API on :8000
cd backend
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run python -m scripts.seed
uv run uvicorn app.main:app --reload

# Terminal 2: web on :3000
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Checks (also run in CI)

```bash
cd backend  && uv run ruff check . && uv run ruff format --check . && uv run pytest
cd frontend && npm run lint && npm run typecheck && npm run format:check && npm test && npm run build
```

## Roadmap

- [x] Next.js frontend with the original design; articles have their own URLs
- [x] FastAPI + Postgres backend, migrations, legacy content import
- [x] Working contact form and newsletter sign-up
- [x] Accounts: register, sign in/out, account page, reader / author / admin roles
- [x] Signed-in readers comment on articles and can delete their own comments (admins: any)
- [x] Likes and saved articles
- [x] "Write for us" applications; author dashboard with a Markdown editor, preview and cover uploads
- [x] Admin: author approvals, article review queue, Editor's picks, comment moderation, contact inbox, user roles
- [x] Email: password reset, contact-form forwarding, newsletter double opt-in, review notifications
- [x] Rate limiting on sign-in, sign-up and public forms
- [x] Production setup: `docker-compose.prod.yml` with automatic HTTPS, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [x] Account settings (profile, photo, password, delete account), newsletter sending, RSS feed
- [ ] Go live
