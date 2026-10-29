# End-to-end tests

Playwright tests that drive the real app in a browser: the FastAPI server with a seeded
database, and a production build of the web app. CI runs them on every pull request.

## Running locally

```bash
# 1. API (from backend/), logging emails to a file the tests can read
uv run alembic upgrade head && uv run python -m scripts.seed --reset
INTERNAL_API_KEY=e2e uv run uvicorn app.main:app --port 8000 > /tmp/api.log 2>&1 &

# 2. Web app (from frontend/)
npm run build && INTERNAL_API_KEY=e2e npm start &

# 3. Tests
E2E_DATABASE_URL=postgresql://faith:faith@localhost:5432/faith_explorers \
E2E_API_LOG=/tmp/api.log \
npm run test:e2e
```

`INTERNAL_API_KEY` must match on both servers: each test presents itself as a different
visitor IP, so the API's per-IP rate limits don't block the many sign-ups.
