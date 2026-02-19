# CT B2C Storefront

A composable commerce B2C storefront built with **commercetools**, **NestJS**, **Next.js**, and **Turborepo**.

## Architecture

```
  localhost:3000              localhost:8080              localhost:6379
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Next.js (web)   │──────▶│  NestJS (api)    │──────▶│  Redis 7 Alpine  │
│  container       │  http │  container       │       │  container       │
└──────────────────┘       └────────┬─────────┘       └──────────────────┘
                                    │ HTTPS
                           ┌────────▼─────────┐
                           │ commercetools API │
                           └──────────────────┘
```

- **NestJS API** — all CT SDK calls, business logic, caching
- **Next.js Web** — App Router, server components, Tailwind CSS
- **Redis** — local container for dev, Upstash for staging/prod
- **CT SDK lives exclusively in the API** — credentials never reach the browser

## Getting Started

### Prerequisites

- Docker Desktop (running)
- Node.js 20+
- commercetools account with project key + API credentials

### First-Time Setup

```bash
# 1. Clone
git clone git@github.com:JefinFrancis/ct-b2c-storefront.git
cd ct-b2c-storefront

# 2. Install root dependencies
npm install

# 3. Configure API credentials
cp apps/api/.env.example apps/api/.env.local
# Open apps/api/.env.local and fill in your CT credentials

# 4. Configure web env (defaults work out of the box for local dev)
cp apps/web/.env.example apps/web/.env.local

# 5. Start everything
docker-compose up --build

# 6. Open http://localhost:3000
```

## Developer Commands

```bash
# ── First-time startup ──────────────────────────────────────────────────────
docker-compose up --build          # Builds all images and starts all services

# ── Daily use ───────────────────────────────────────────────────────────────
docker-compose up                  # Start without rebuilding
docker-compose up --build api      # Rebuild only api (after package.json changes)
docker-compose up --build web      # Rebuild only web

# ── Logs ────────────────────────────────────────────────────────────────────
docker-compose logs -f             # All services
docker-compose logs -f api         # API only
docker-compose logs -f web         # Web only

# ── Stop ────────────────────────────────────────────────────────────────────
docker-compose down                # Stop (keeps Redis data volume)
docker-compose down -v             # Stop and wipe Redis data

# ── Utilities ───────────────────────────────────────────────────────────────
docker-compose exec redis redis-cli          # Redis CLI
docker-compose exec api sh                   # Shell into API container
docker-compose exec web sh                   # Shell into web container

# ── Testing (run on host, not inside containers) ────────────────────────────
npm install                        # Install root deps first
npx turbo test                     # All packages
npx turbo test --filter=api        # API only
npx turbo test --filter=web        # Web only
npx turbo typecheck                # TypeScript check all packages
npx turbo lint                     # Lint all packages
```

## Local URLs

| Service | URL | Notes |
|---|---|---|
| Next.js frontend | http://localhost:3000 | Main storefront |
| NestJS API | http://localhost:8080 | REST API |
| NestJS health | http://localhost:8080/health | Cloud Run health check endpoint |
| Redis | localhost:6379 | Connect with RedisInsight or redis-cli |

## Seeding Sample Data

```bash
cd scripts
cp .env.example .env
# Fill in your CT credentials in scripts/.env
node seed.js
```

The seed script is idempotent — safe to run multiple times. It checks each entity by key and only creates what's missing.

## Project Structure

```
ct-b2c-storefront/
├── apps/
│   ├── api/             # NestJS backend (port 8080)
│   └── web/             # Next.js frontend (port 3000)
├── packages/
│   ├── types/           # Shared TypeScript types
│   ├── config/          # Shared configuration
│   └── eslint-config/   # Shared ESLint rules
├── scripts/
│   └── seed.js          # CT sample data seeder
├── docker-compose.yml   # Local dev: api + web + redis
├── turbo.json           # Turborepo pipeline config
└── package.json         # Root workspace config
```

## Environment Variables

### API (`apps/api/.env.local`)

| Variable | Description |
|---|---|
| `CTP_PROJECT_KEY` | commercetools project key |
| `CTP_CLIENT_ID` | CT API client ID |
| `CTP_CLIENT_SECRET` | CT API client secret |
| `CTP_AUTH_URL` | CT auth endpoint |
| `CTP_API_URL` | CT API endpoint |
| `CTP_SCOPES` | Space-separated CT scopes |
| `REDIS_URL` | Local Redis URL (overridden by docker-compose) |
| `PORT` | Server port (default: 8080) |
| `ALLOWED_ORIGIN` | CORS origin (default: http://localhost:3000) |

### Web (`apps/web/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | API URL for browser fetches |
| `INTERNAL_API_URL` | API URL for server-side fetches (overridden by docker-compose to `http://api:8080`) |
| `NEXT_PUBLIC_APP_URL` | Frontend URL |
| `REDIS_URL` | Local Redis URL (overridden by docker-compose) |

## Git Workflow

- **GitFlow**: `main` → production, `develop` → integration
- **Branches**: `feature/*`, `bugfix/*`, `release/*`, `hotfix/*`
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) with scope prefix

## License

Private — All rights reserved.
