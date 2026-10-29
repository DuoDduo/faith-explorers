# Deploying Faith Explorers

There are two pieces to run: the **API** (FastAPI, `backend/`) with its **Postgres** database,
and the **web app** (Next.js, `frontend/`). Visitors only ever talk to the web app; it calls
the API from the server.

Two ways to host it:

- **A. One server with Docker** (recommended to start): a single VPS from any provider
  (Hetzner, DigitalOcean, Linode, AWS Lightsail…). Everything, including HTTPS, comes from
  `docker-compose.prod.yml`. Roughly $5–10/month.
- **B. Managed services**: the web app on a Next.js host (e.g. Vercel), the API on any
  Docker host, and a managed Postgres. More moving parts, less server upkeep.

Either way you'll need: a domain name, and an SMTP account for email (Brevo, Resend,
Postmark, Mailgun and others have free tiers).

---

## A. One server with Docker

### 1. Prepare the server

- Create an Ubuntu VPS with at least 1 GB RAM (2 GB is comfortable for builds).
- Install Docker: <https://docs.docker.com/engine/install/ubuntu/>
- Point your domain at the server: an `A` record for `faithexplorers.org` (and one for
  `www.faithexplorers.org`) with the server's IP address.
- Allow ports 80 and 443 in the firewall.

### 2. Get the code and configure it

```bash
git clone https://github.com/DuoDduo/faith-explorers.git
cd faith-explorers
cp .env.production.example .env
nano .env
```

Fill in every value. Generate secrets with `openssl rand -hex 32` (use different values
for `POSTGRES_PASSWORD` and `INTERNAL_API_KEY`).

### 3. Start it

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Caddy requests an HTTPS certificate on the first visit, so give DNS a few minutes to
update before opening the site. The API applies database migrations every time it starts.

### 4. Import the existing articles (first time only)

```bash
docker compose -f docker-compose.prod.yml run --rm api python -m scripts.seed
```

### 5. Make yourself the admin

Register on the site, then:

```bash
docker compose -f docker-compose.prod.yml exec db \
  psql -U faith faith_explorers -c "UPDATE users SET role='admin' WHERE email='you@example.com';"
```

Everyone else is managed from `/admin` after that.

### Updating

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Backups

The database and uploaded images live in Docker volumes. Back up the database daily, e.g.
with a cron job:

```bash
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U faith faith_explorers \
  | gzip > ~/backups/faith-$(date +%F).sql.gz
```

and copy `~/backups` (plus the `uploads` volume) somewhere off the server.

---

## B. Managed services

### Database

Create a Postgres 16 database with your provider and copy its connection URL.
`postgres://…` URLs are accepted as-is.

### API (`backend/`)

Deploy `backend/` as a Docker service (it has its own `Dockerfile`; the start command
runs migrations, then the server on `$PORT`). Give it a **persistent disk mounted at
`/app/media/uploads`** or uploaded images are lost on every deploy. Run **one instance**:
rate-limit counters are kept in memory.

| Variable | Value |
|---|---|
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | from your database provider |
| `SITE_URL` | `https://your-domain` (used in email links) |
| `CORS_ORIGINS` | `https://your-domain` |
| `INTERNAL_API_KEY` | a long random secret, same as the web app's |
| `EMAIL_BACKEND` | `smtp` |
| `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` | from your SMTP provider |
| `CONTACT_NOTIFY_EMAIL` | optional: where contact messages go |

Health check path: `/api/health`. Seed once with `python -m scripts.seed` from the
provider's shell/console.

### Web app (`frontend/`)

Deploy `frontend/` (root directory `frontend`) to a Next.js host, or as a Docker service
with its `Dockerfile`.

| Variable | Value |
|---|---|
| `API_URL` | the API's URL, e.g. `https://api.your-domain` or a private-network address |
| `SITE_URL` | `https://your-domain`, available **at build time and runtime** |
| `INTERNAL_API_KEY` | same value as the API's |

---

## Checklist before announcing the site

- [ ] `https://your-domain` loads and the padlock shows a valid certificate
- [ ] Sign up, sign out, use "Forgot your password?" and receive the email
- [ ] Subscribe to the newsletter and receive the confirmation email
- [ ] Send a contact message and receive it at `CONTACT_NOTIFY_EMAIL`
- [ ] Upload a cover image in the dashboard, redeploy, and check it's still there
- [ ] `https://your-domain/sitemap.xml` lists your articles with the right domain
- [ ] A database backup has run and you've tried restoring it once
