# Faith Explorers Web

Next.js 16 (App Router, TypeScript) frontend for Faith Explorers. All data comes from the
FastAPI backend in [`../backend`](../backend).

## Setup

```bash
cp .env.example .env.local   # API_URL=http://localhost:8000
npm install
npm run dev                  # http://localhost:3000 (the API must be running)
```

## How it talks to the API

- **Reads:** Server Components call the functions in `src/lib/api/`. Each one reads at request
  time (so `next build` doesn't need the API) and caches the result with `"use cache"`, so
  repeat visits within a few minutes don't hit the backend.
- **Writes:** forms post to Server Actions in `src/lib/actions/`, which call the API from the
  server. The browser never calls FastAPI directly, so there's no CORS setup or public API URL.
- **Images:** `/media/*` is rewritten to the API (see `next.config.ts`), so article covers and
  avatars go through `next/image` optimization like local images.

## Layout

```
src/
  app/                    routes (App Router): pages, metadata, not-found, error
  components/
    layout/               Header, Footer
    ui/                   generic building blocks: Hero, SectionHeading, Pagination, Avatar…
    sections/             page sections: AboutSection, Faq, Testimonials, HotTopics…
    posts/                PostCard, PostGrid, PaginatedPosts, ArticleBody…
    comments/             CommentItem, PostComments, LatestComments
    categories/           CategoryCard, CategoryGrid
    forms/                ContactForm, NewsletterForm, SearchForm, FormField
    providers/            client-only setup (scroll animations)
  content/                static copy and navigation
  lib/
    api/                  server-only data access (cached)
    actions/              Server Actions for form submissions
    format.ts, url.ts, validation.ts
  styles/
    legacy/               the original site's stylesheets, unchanged
    app.css               styles added for the new components
  types/api.ts            API response types (mirror backend/app/schemas)
tests/                    Vitest + Testing Library
```

Components that fetch data are async Server Components and are rendered inside `<Suspense>`
with a skeleton fallback. Only components that need browser APIs or state are Client
Components (`"use client"`).

## Commands

| Task                  | Command                                                       |
| --------------------- | ------------------------------------------------------------- |
| Dev server            | `npm run dev`                                                 |
| Tests                 | `npm test`                                                    |
| Lint / types / format | `npm run lint` · `npm run typecheck` · `npm run format:check` |
| Production build      | `npm run build` (outputs a standalone server for Docker)      |
