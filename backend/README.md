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

## Commands

| Task | Command |
|---|---|
| Tests | `uv run pytest` |
| Lint / format | `uv run ruff check .` / `uv run ruff format .` |
| New migration | `uv run alembic revision --autogenerate -m "..."` |
| Check models match migrations | `uv run alembic check` |
| Re-import content | `uv run python -m scripts.seed --reset` |
