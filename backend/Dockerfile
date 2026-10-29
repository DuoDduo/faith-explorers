FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:0.8.22 /uv /bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy PYTHONUNBUFFERED=1

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000
# Apply pending migrations, then serve. One worker: rate-limit counters live in memory.
# PORT is set by most hosting platforms; default to 8000.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
