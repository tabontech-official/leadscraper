# LeadStack Finder

Production-ready SaaS to upload business search CSVs, find leads via compliant APIs (SerpAPI, Google Places), enrich websites, detect technology stacks, and export filtered leads.

## Features

- **Auth** — Clerk authentication
- **CSV upload** — Validate `zip_code`, `category`, `state` columns
- **Search providers** — Swappable SerpAPI & Google Places implementations
- **Background jobs** — BullMQ + Redis in production; in-memory queue for local dev (no Redis required)
- **Website crawler** — Emails, phones, socials, contact/about pages (SSRF-safe)
- **Tech detection** — Shopify, WordPress, WooCommerce, Wix, Squarespace, Webflow, React, Next.js, Magento, BigCommerce
- **Leads dashboard** — TanStack Table with filters, pagination, bulk export
- **Plan limits** — Free / Pro / Agency (Stripe-ready structure)

## Tech stack

- Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui
- Prisma + PostgreSQL
- BullMQ + Redis (optional locally)
- Clerk, papaparse, axios, cheerio

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/leadstack
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

SERPAPI_KEY=your_serpapi_key
GOOGLE_PLACES_API_KEY=optional

# Optional — leave unset for local dev (jobs run in-process)
# REDIS_URL=redis://localhost:6379
```

### 3. PostgreSQL (required)

You need a Postgres database. **Docker is not required.**

**Windows options:**
- Install [PostgreSQL for Windows](https://www.postgresql.org/download/windows/) and create a `leadstack` database
- Use a free cloud DB: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) — paste the connection string into `DATABASE_URL`

**Optional:** `docker compose up -d` only if you already have Docker and want local Postgres/Redis.

### 4. Database setup

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run the app (Windows / no Docker / no Redis)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Without `REDIS_URL`:** search and tech jobs run **in-process** inside the Next.js server. You will see a one-time console warning:

`Redis unavailable, using in-memory fallback. Do not use this in production.`

**You do not need** `npm run worker` for local development.

### Production (with Redis)

Set `REDIS_URL`, then run both:

```bash
npm run dev   # or npm start
npm run worker
```

## Clerk setup

1. Create an app at [clerk.com](https://clerk.com)
2. Add sign-in/sign-up URLs: `/login`, `/signup`
3. Copy API keys to `.env`

## API keys

### SerpAPI (recommended)

1. Sign up at [serpapi.com](https://serpapi.com)
2. Copy API key to `SERPAPI_KEY`
3. Uses Google Maps engine (compliant, not HTML scraping)

### Google Places (optional)

1. Enable Places API in Google Cloud Console
2. Set `GOOGLE_PLACES_API_KEY`

## CSV format

```csv
zip_code,category,state
10001,pet shops,New York
90210,dentists,California
```

Sample file: `public/sample.csv`

## User flow

1. Sign up / log in
2. **Dashboard → Upload CSV**
3. Preview & validate rows
4. Choose results per row, provider, tech detection
5. **Start Search** — job runs in background (Redis worker) or in-process (local dev)
6. View progress under **Jobs**
7. Filter leads under **Leads** (e.g. Technology = Shopify)
8. **Export filtered** or **Export selected** as CSV

## Plan limits

| Plan   | Uploads/mo | Max rows | Results/row | Max leads |
|--------|------------|----------|-------------|-----------|
| FREE   | 1          | 100      | 10          | 500       |
| PRO    | 10         | 5,000    | 20          | 50,000    |
| AGENCY | 999        | 50,000   | 50          | 500,000   |

Upgrade path: add Stripe webhook → update `User.plan` in Prisma.

## Project structure

```
app/                  # Pages & API routes
components/           # UI & dashboard components
lib/
  csv/                # Parse & validate
  search-providers/   # SerpAPI, Google Places
  crawler/            # Website extraction + SSRF
  tech-detection/     # Stack detection rules
  jobs/               # Queue (Redis or in-memory) & processors
  export/             # CSV export
  plans/              # Plan limits
prisma/               # Database schema
workers/              # Background worker entry
```

## API routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/upload-csv` | Validate CSV |
| POST | `/api/jobs/start` | Create & enqueue job |
| GET | `/api/jobs` | List jobs |
| GET | `/api/jobs/[id]` | Job detail |
| GET | `/api/leads` | Filtered leads |
| GET | `/api/leads/export` | CSV export |
| POST | `/api/tech-detect` | Re-run tech detection |

## Job queue (Redis vs in-memory)

| Mode | When | Behavior |
|------|------|----------|
| **In-memory** | `REDIS_URL` unset or Redis unreachable | Jobs run inside `npm run dev`. Console warns once. Not for production. |
| **Redis + BullMQ** | `REDIS_URL` set and reachable | Jobs enqueued to Redis; run `npm run worker` to process them. |

What still works without Redis: CSV upload, search jobs, crawling, tech detection, leads dashboard, export.

What differs without Redis: no separate worker process; jobs share the Next.js process (fine for local dev).

## Security

- All API routes require authentication
- Users only access their own data
- Zod validation on inputs
- SSRF protection on crawls (blocks localhost/private IPs)
- API keys server-side only

## Commands

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev          # enough for local Windows dev (no Redis)
npm run worker       # only when REDIS_URL is set (production)
npm run build
```

## License

MIT
