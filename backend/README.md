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
| POST | `/api/auth/password-reset` | | Email a one-hour reset link (same reply for unknown emails) |
| POST | `/api/auth/password-reset/confirm` | | Set a new password from a link; signs out every session |
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
| GET | `/api/admin/overview` | admin | Counts of pending work and site totals |
| GET | `/api/admin/applications` | admin | Applications (`status=pending\|approved\|rejected`) |
| POST | `/api/admin/applications/{id}/approve`, `/reject` | admin | Review an application, optional `note` |
| GET | `/api/admin/posts`, `/api/admin/posts/{id}` | admin | Posts by status (review queue first-come, first-served) |
| POST | `/api/admin/posts/{id}/publish`, `/return`, `/unpublish` | admin | Publish, send back with a `note`, or take down |
| PUT | `/api/admin/posts/{id}/featured` | admin | Add to / remove from Editor's picks |
| GET, PUT | `/api/admin/comments`, `/api/admin/comments/{id}/status` | admin | Moderate comments (hide / restore) |
| GET, PUT | `/api/admin/messages`, `/api/admin/messages/{id}/handled` | admin | Contact inbox (`show=open\|handled\|all`) |
| GET, PATCH | `/api/admin/users`, `/api/admin/users/{id}` | admin | Search users, change role or deactivate |

The first admin has to be set directly in the database:
`UPDATE users SET role = 'admin' WHERE email = 'you@example.com';`
After that, admins manage everyone else from `/admin`. Admins can't demote or deactivate
themselves, so there's always at least one.
| GET | `/api/comments/latest` | | Newest comments site-wide |
| GET | `/api/categories`, `/api/categories/{slug}` | | Categories with post counts |
| POST | `/api/contact` | | Store a contact message |
| POST | `/api/newsletter/subscribe` | | Start a subscription and email a confirmation link |
| POST | `/api/newsletter/confirm`, `/unsubscribe` | | Confirm (double opt-in) or leave with a token from an email |

Authenticated requests send `Authorization: Bearer <token>`. Tokens are random, stored only
as SHA-256 hashes in the `sessions` table, and expire after `SESSION_TTL_DAYS` (default 30).
Passwords are hashed with Argon2id.

Uploads are decoded and re-encoded with Pillow (which also strips EXIF/GPS data), resized
to at most 1600px wide and stored under `media/uploads/`. In Docker that folder is a volume.

## Email

Emails are plain text and sent in the background after the response, so a slow or failing
mail server never affects the request. Set `EMAIL_BACKEND`:

- `console` (default): emails are written to the API log. Handy in development.
- `smtp`: sent through any SMTP provider (Gmail, Brevo, Resend, Postmark, Mailgun…) using
  `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` and `EMAIL_FROM`.

What gets sent: password reset links and "password changed" notices, newsletter confirmation
links, contact-form messages (to `CONTACT_NOTIFY_EMAIL`, with Reply-To set to the visitor),
and emails to writers when their application or article is reviewed. Links point at
`SITE_URL`.

## Rate limits

Abuse-prone endpoints are rate limited (`app/core/rate_limit.py`) and answer `429` with a
`Retry-After` header when a limit is hit:

| What | Limit |
|---|---|
| Sign-in | 20 per IP / 15 min, and 5 *failed* attempts per account / 15 min |
| Sign-up | 5 per IP / hour |
| Contact form | 5 per IP / hour |
| Newsletter sign-up | 10 per IP / hour |
| Comments | 10 per user / 10 min |
| Image uploads | 30 per user / hour |
| Author applications | 3 per user / day |
| Password reset requests | 5 per IP and 3 per email / hour |

All traffic reaches the API through the Next.js server, which forwards the visitor's IP in
`X-Client-IP`. The API only trusts that header when the request also carries the shared
`INTERNAL_API_KEY`, so it can't be spoofed by calling the API directly. Counters are kept in
memory, which suits one API instance; use a shared store such as Redis before scaling out.

## Commands

| Task | Command |
|---|---|
| Tests | `uv run pytest` |
| Lint / format | `uv run ruff check .` / `uv run ruff format .` |
| New migration | `uv run alembic revision --autogenerate -m "..."` |
| Check models match migrations | `uv run alembic check` |
| Re-import content | `uv run python -m scripts.seed --reset` |
