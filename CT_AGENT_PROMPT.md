# 🤖 Agentic Coding Prompt — commercetools B2C Kickoff Project (Scalable Monorepo)

---

## 🧭 PRIME DIRECTIVE FOR ALL AGENTS

> **Before you write a single line of code, you MUST:**
> 1. Read `AGENT_CONTEXT.md` in the project root.
> 2. Understand the current state of the project (what's done, what's pending, known issues).
> 3. After completing your work, **update `AGENT_CONTEXT.md`** to reflect what changed and what the next agent should know.
>
> This file is the shared brain of the project. Neglecting it breaks continuity for every agent that follows you.

---

## 📋 Project Overview

| Field | Value |
|---|---|
| **Project Name** | `ct-b2c-storefront` |
| **Architecture** | Monorepo — NestJS API + Next.js Frontend, separately deployed |
| **Platform** | commercetools (Composable Commerce) |
| **Monorepo Tool** | Turborepo |
| **Backend** | NestJS (TypeScript strict) → Cloud Run `api` service |
| **Frontend** | Next.js App Router (TypeScript strict) → Cloud Run `web` service |
| **Styling** | Tailwind CSS |
| **CT SDK** | `@commercetools/sdk-client-v2` (backend only) |
| **Local Dev** | docker-compose (api + web + Redis all in containers) |
| **Local Redis** | Redis 7 Alpine container (no internet needed for dev) |
| **Prod Caching** | Upstash Redis (serverless, used in staging + prod only) |
| **CDN** | GCP Cloud CDN in front of frontend Cloud Run |
| **Container Registry** | GCP Artifact Registry |
| **CI/CD** | GitHub Actions (Full GitOps — PR checks + staging + prod) |
| **GCP** | Configured only when production-ready — skipped for local dev |
| **Git Flow** | GitFlow (main / develop / release / hotfix) |
| **B2C Scope** | Product Listing, PDP, Cart, Checkout, Auth, Order History |

---

## 🏛️ Architecture Overview

```
                        ┌─────────────────────────────────────────────┐
                        │                  GitHub                      │
                        │   main / develop / release/* / hotfix/*      │
                        └──────────────────┬──────────────────────────┘
                                           │ GitHub Actions
                    ┌──────────────────────┼──────────────────────────┐
                    │                      │                           │
             PR Checks CI           Staging Deploy              Prod Deploy
                    └──────────────────────┴──────────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │         GCP Artifact Registry         │
                        │   web:sha / web:latest / api:sha...  │
                        └──────────────────┬──────────────────┘
                                           │
               ┌───────────────────────────┴────────────────────────────┐
               │                                                         │
   ┌───────────▼────────────┐                          ┌────────────────▼───────────┐
   │   Cloud CDN (frontend) │                          │   Cloud Run: api service   │
   │   Global edge cache    │                          │   NestJS — port 8080       │
   └───────────┬────────────┘                          │   (internal ingress only)  │
               │                                       └────────────────┬───────────┘
   ┌───────────▼────────────┐                                           │
   │  Cloud Run: web service│                                           │
   │  Next.js — port 3000   │──── Server-side fetch ───────────────────┘
   │  (public)              │
   └────────────────────────┘
                                                      ┌─────────────────────────────┐
               Both services connect to ─────────────►│  Redis (local container)    │
                                                      │  or Upstash (staging/prod)  │
                                                      └─────────────────────────────┘
                                                      ┌─────────────────────────────┐
               API service connects to ──────────────►│   commercetools API         │
                                                      │  (CT never called from web) │
                                                      └─────────────────────────────┘
```

> ⚠️ **GCP is not required for local development.** The entire stack runs locally via docker-compose. GCP phases (Artifact Registry, Cloud Run, Secret Manager, CDN) are configured only when you are ready to deploy to production.

### Local Development Architecture (docker-compose)
```
  localhost:3000              localhost:8080              localhost:6379
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Next.js (web)   │──────►│  NestJS (api)    │──────►│  Redis 7 Alpine  │
│  container       │  http │  container       │       │  container       │
└──────────────────┘       └────────┬─────────┘       └──────────────────┘
                                    │ HTTPS
                           ┌────────▼─────────┐
                           │ commercetools API │
                           │  (cloud — only    │
                           │   CT credentials  │
                           │   needed locally) │
                           └──────────────────┘
```

### Key Architecture Principles
1. **CT SDK lives exclusively in the NestJS backend.** The frontend never calls CT directly — credentials are secure and commerce logic is centralised.
2. **Frontend calls NestJS via server-side fetch** in Server Components. No CT credentials ever reach the browser.
3. **Local Redis container** replaces Upstash for local dev — zero internet dependency, zero accounts needed beyond CT itself.
4. **Upstash Redis** is only introduced for staging and production environments where a managed, serverless Redis is needed.
5. **GCP is entirely deferred** — all GCP phases (Cloud Run, Artifact Registry, Secret Manager, CDN) are skipped until production deployment is required.
6. **NestJS API is internal-only in production** — Cloud Run `--ingress=internal` ensures it is never publicly reachable on GCP.

---

## 📁 AGENT_CONTEXT.md — Spec & Lifecycle Rules

### What this file is
`AGENT_CONTEXT.md` lives at the **monorepo root**. It is the single source of truth across all agent sessions.

### Required Structure

```md
# AGENT CONTEXT — CT B2C Storefront

## Last Updated
<ISO timestamp — which agent/task updated it>

## Project State
<One-paragraph summary of current project state>

## Completed Work
<Checklist — tasks done with brief notes>

## In Progress
<What is being built right now>

## Pending / Backlog
<Ordered list of remaining work>

## Architecture Decisions
<Key decisions and WHY>

## Known Issues / Watch-outs
<Bugs, CT quirks, GCP gotchas, Turborepo pitfalls>

## Environment Variables
<All .env keys across all packages — no values, just keys + descriptions>

## Service URLs
<Cloud Run URLs for web and api, per environment>

## CT Project Info
<Region, project key, API endpoint, scopes>

## GCP Info
<Project ID, region, Artifact Registry, Cloud Run services, CDN config>

## GitHub Info
<Repo URL, branch protection, environments>
```

### Rules for all agents
- **READ first, code second.** No exceptions.
- **Scope your changes** — working on `api`? Do not touch `web` unless essential.
- **Every session ends** with an updated `AGENT_CONTEXT.md`.
- Flag and resolve any conflict between `AGENT_CONTEXT.md` and actual code before proceeding.

---

## 🐙 Phase 0 — GitHub Repository Setup

### Step 1: Create the Repository
1. Go to [https://github.com/new](https://github.com/new)
2. Name: `ct-b2c-storefront`, visibility: **Private**
3. Do **not** initialise with any files — the agent handles this

### Step 2: Initialise GitFlow Branch Structure
```bash
git init
git remote add origin git@github.com:<org>/ct-b2c-storefront.git

git checkout -b main
git add .
git commit -m "chore: initial monorepo scaffold"
git push -u origin main

git checkout -b develop
git push -u origin develop
```

### Step 3: Branch Protection Rules

| Branch | Rules |
|---|---|
| `main` | Require PR + 1 approval + CI status checks, no direct push, no force push |
| `develop` | Require PR + CI status checks, no direct push |
| `release/*` | Require PR + CI status checks |
| `hotfix/*` | Require PR + CI status checks |

### Step 4: GitHub Environments

| Environment | Branch | Approvals |
|---|---|---|
| `staging` | `develop` | None (auto-deploy) |
| `production` | `main` | Required (min 1) |

### Step 5: GitHub Secrets
```
# commercetools (used by NestJS API only)
CTP_PROJECT_KEY
CTP_CLIENT_ID
CTP_CLIENT_SECRET
CTP_AUTH_URL
CTP_API_URL
CTP_SCOPES

# Upstash Redis
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# GCP
GCP_PROJECT_ID
GCP_REGION
GCP_WORKLOAD_IDENTITY_PROVIDER
GCP_SERVICE_ACCOUNT

# App URLs per environment
NEXT_PUBLIC_APP_URL_STAGING
NEXT_PUBLIC_APP_URL_PROD
```

---

## 🔀 Phase 0b — GitFlow Strategy

### Branch Model
```
main            ← production only. Always tagged with semver.
  └─ hotfix/*   ← emergency prod fixes → merge back to main + develop

develop         ← integration branch. All features land here first.
  └─ feature/*  ← all feature work branches off develop
  └─ bugfix/*   ← bug fixes for develop

release/*       ← stabilisation before prod → merge to main + develop
```

### Branch Naming
```
feature/CT-<id>-short-description       e.g. feature/CT-001-product-listing
bugfix/CT-<id>-short-description        e.g. bugfix/CT-042-cart-quantity
hotfix/v<semver>-description            e.g. hotfix/v1.0.1-checkout-crash
release/v<semver>                       e.g. release/v1.0.0
chore/description                       e.g. chore/turborepo-setup
```

### Commit Convention (Conventional Commits)
```
feat(api/cart): add anonymous cart creation endpoint
feat(web/plp): implement product listing with pagination
fix(api/auth): resolve token expiry not refreshing
chore(deps): bump @commercetools/sdk-client-v2
ci(pipeline): add turborepo remote cache to github actions
refactor(api/products): extract CT product mapper to service
test(api/cart): add unit tests for CartService
docs(readme): update local dev setup instructions
```

> Prefix commits with `(api/*)` or `(web/*)` or `(packages/*)` to signal which package changed.

### Agent Git Workflow (every feature task)
```bash
# 1. Always branch from develop
git checkout develop && git pull origin develop
git checkout -b feature/CT-XXX-description

# 2. Small, atomic commits as you work
git commit -m "feat(api/products): add product search endpoint"

# 3. Push and open PR → develop
git push origin feature/CT-XXX-description

# 4. After merge, delete branch locally
git branch -d feature/CT-XXX-description
```

### Release & Hotfix Rules
- **Release**: bump `package.json` versions, update `CHANGELOG.md`, bug fixes only — merge to `main` (tag) AND back to `develop`
- **Hotfix**: branch from `main`, fix, merge to `main` (tag patch) AND `develop`
- **Tags**: every merge to `main` → `git tag -a v1.0.0 -m "Release v1.0.0"`

---

## ☁️ Phase 0c — GCP Project Setup

### Step 1: Create & Configure Project
```bash
gcloud projects create ct-b2c-storefront --name="CT B2C Storefront"
gcloud config set project ct-b2c-storefront
gcloud billing projects link ct-b2c-storefront --billing-account=<BILLING_ACCOUNT_ID>
```

### Step 2: Enable Required APIs
```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  compute.googleapis.com \
  networkservices.googleapis.com \
  certificatemanager.googleapis.com
```

### Step 3: Create Artifact Registry
```bash
gcloud artifacts repositories create ct-b2c-images \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker images for CT B2C — web and api"
```

### Step 4: Create Deployer Service Account (Least Privilege)
```bash
gcloud iam service-accounts create ct-b2c-deployer \
  --display-name="CT B2C Deployer"

for role in roles/run.admin roles/artifactregistry.writer \
            roles/iam.serviceAccountUser roles/secretmanager.secretAccessor; do
  gcloud projects add-iam-policy-binding ct-b2c-storefront \
    --member="serviceAccount:ct-b2c-deployer@ct-b2c-storefront.iam.gserviceaccount.com" \
    --role="$role"
done
```

### Step 5: Workload Identity Federation (Keyless GCP Auth)
```bash
gcloud iam workload-identity-pools create "github-pool" \
  --location="global" --display-name="GitHub Actions Pool"

gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

gcloud iam service-accounts add-iam-policy-binding \
  ct-b2c-deployer@ct-b2c-storefront.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-pool/attribute.repository/<ORG>/<REPO>"
```

### Step 6: Store Secrets in GCP Secret Manager
```bash
for secret in CTP_PROJECT_KEY CTP_CLIENT_ID CTP_CLIENT_SECRET \
              CTP_AUTH_URL CTP_API_URL CTP_SCOPES \
              UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN; do
  echo -n "placeholder" | gcloud secrets create $secret --data-file=-
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:ct-b2c-deployer@ct-b2c-storefront.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Step 7: Cloud CDN Setup (done after first web Cloud Run deploy)
```bash
# Create serverless NEG pointing to web Cloud Run
gcloud compute network-endpoint-groups create ct-web-neg \
  --region=us-central1 \
  --network-endpoint-type=serverless \
  --cloud-run-service=ct-b2c-web-prod

# Create backend service with CDN enabled
gcloud compute backend-services create ct-web-backend \
  --global --enable-cdn --cache-mode=CACHE_ALL_STATIC

gcloud compute backend-services add-backend ct-web-backend \
  --global \
  --network-endpoint-group=ct-web-neg \
  --network-endpoint-group-region=us-central1

# URL map → HTTP proxy → forwarding rule
gcloud compute url-maps create ct-web-url-map \
  --default-service=ct-web-backend

gcloud compute target-http-proxies create ct-web-proxy \
  --url-map=ct-web-url-map

gcloud compute forwarding-rules create ct-web-forwarding-rule \
  --global --target-http-proxy=ct-web-proxy --ports=80
```
> For HTTPS production: provision a managed SSL certificate via `gcloud certificate-manager` and attach to an HTTPS proxy. Document the Load Balancer IP in `AGENT_CONTEXT.md`.

---

## 💻 Phase 0e — Local Development Setup

> **This is where all day-to-day development happens.** GCP phases (0b–0d) are only executed when you are ready to deploy to production. This entire phase requires nothing beyond Docker Desktop and CT credentials.

### Prerequisites (Local Dev Only)
```
✅ Docker Desktop (running)
✅ Node.js 20+ (for Turborepo CLI outside containers)
✅ commercetools account with project key + API credentials (Phase 1)
❌ No GCP account needed
❌ No Upstash account needed
❌ No cloud services needed
```

### Root docker-compose.yml
Create at **monorepo root** — wires all three services together with hot reload:

```yaml
version: "3.9"

services:

  # ── Redis (local container — replaced by Upstash in staging/prod) ─────────
  redis:
    image: redis:7-alpine
    container_name: ct-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # ── NestJS API ──────────────────────────────────────────────────────────
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
      target: builder            # builder stage has devDeps + hot reload support
    container_name: ct-api
    ports:
      - "8080:8080"
    env_file:
      - ./apps/api/.env.local
    environment:
      NODE_ENV: development
      PORT: "8080"
      REDIS_URL: redis://redis:6379    # Docker service name, not localhost
    volumes:
      - ./apps/api/src:/app/src        # Hot reload — changes reflect immediately
      - ./packages:/packages           # Shared packages available in container
      - /app/node_modules              # Prevent host node_modules override
    command: npm run start:dev
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s

  # ── Next.js Web ─────────────────────────────────────────────────────────
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
      target: builder            # builder stage for dev
    container_name: ct-web
    ports:
      - "3000:3000"
    env_file:
      - ./apps/web/.env.local
    environment:
      NODE_ENV: development
      # Server-side fetch uses Docker service name (internal network)
      INTERNAL_API_URL: http://api:8080
      # Browser-side fetch uses localhost (external)
      NEXT_PUBLIC_API_URL: http://localhost:8080
      REDIS_URL: redis://redis:6379
    volumes:
      - ./apps/web/src:/app/src
      - ./packages:/packages
      - /app/node_modules
      - /app/.next
    command: npm run dev
    depends_on:
      api:
        condition: service_healthy

volumes:
  redis-data:

networks:
  default:
    name: ct-b2c-network
```

> **Important — Two API URLs for Next.js**: Inside the Docker network, server-side Next.js RSC fetches reach NestJS via `http://api:8080` (Docker hostname). Browser-side client component fetches use `http://localhost:8080`. The agent must handle this in `api-client.ts` by checking `typeof window === "undefined"` to pick the right base URL.

### api-client.ts — Server vs Browser URL Handling
```typescript
// Pick the right base URL depending on execution context
const API_BASE =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:8080")  // Server-side (RSC / Route Handler)
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"); // Browser (Client Components)
```

### Per-Package Environment Files

The agent must create `.env.local` (gitignored) AND `.env.example` (committed) inside each app.

#### `apps/api/.env.example`
```env
# ── commercetools ──────────────────────────────────────────────────────────
# Get these from Merchant Center → Settings → Developer Settings → API Clients
CTP_PROJECT_KEY=your-project-key
CTP_CLIENT_ID=your-client-id
CTP_CLIENT_SECRET=your-client-secret
CTP_AUTH_URL=https://auth.europe-west1.gcp.commercetools.com
CTP_API_URL=https://api.europe-west1.gcp.commercetools.com
CTP_SCOPES=view_products:your-key manage_my_orders:your-key manage_my_profile:your-key manage_my_payments:your-key create_anonymous_token:your-key

# ── Redis ──────────────────────────────────────────────────────────────────
# Local dev: use Redis container via docker-compose (REDIS_URL is set by docker-compose)
# Staging/Prod: leave REDIS_URL blank and set UPSTASH_REDIS_REST_URL + TOKEN instead
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ── Server ─────────────────────────────────────────────────────────────────
PORT=8080
ALLOWED_ORIGIN=http://localhost:3000
```

#### `apps/web/.env.example`
```env
# ── API URLs ───────────────────────────────────────────────────────────────
# NEXT_PUBLIC_API_URL: used by browser (client components)
# INTERNAL_API_URL:    used by server (RSC, Route Handlers) — overridden by docker-compose
NEXT_PUBLIC_API_URL=http://localhost:8080
INTERNAL_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Redis ──────────────────────────────────────────────────────────────────
# Local dev: overridden by docker-compose to redis://redis:6379
# Staging/Prod: use Upstash values
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### RedisService — Environment-Aware (Auto-detects local vs Upstash)
Update `apps/api/src/redis/redis.service.ts` to support both:

```typescript
/**
 * RedisService — auto-detects Redis mode from environment.
 * Local dev (REDIS_URL set):     uses ioredis → local Redis container
 * Staging/Prod (UPSTASH_* set):  uses @upstash/redis → Upstash HTTP REST
 */
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private ioredisClient: import("ioredis").Redis | null = null;
  private upstashClient: import("@upstash/redis").Redis | null = null;

  constructor(private config: ConfigService) {
    const redisUrl     = this.config.get<string>("REDIS_URL");
    const upstashUrl   = this.config.get<string>("UPSTASH_REDIS_REST_URL");
    const upstashToken = this.config.get<string>("UPSTASH_REDIS_REST_TOKEN");

    if (redisUrl) {
      const IoRedis = require("ioredis");
      this.ioredisClient = new IoRedis(redisUrl);
      this.logger.log(`[Redis] Local mode — ${redisUrl}`);
    } else if (upstashUrl && upstashToken) {
      const { Redis } = require("@upstash/redis");
      this.upstashClient = new Redis({ url: upstashUrl, token: upstashToken });
      this.logger.log("[Redis] Upstash mode");
    } else {
      throw new Error("Redis misconfigured: set REDIS_URL (local) or UPSTASH_REDIS_REST_URL+TOKEN (prod)");
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.ioredisClient) {
      const val = await this.ioredisClient.get(key);
      return val ? (JSON.parse(val) as T) : null;
    }
    return this.upstashClient!.get<T>(key);
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (this.ioredisClient) {
      const s = JSON.stringify(value);
      ttlSeconds
        ? await this.ioredisClient.set(key, s, "EX", ttlSeconds)
        : await this.ioredisClient.set(key, s);
      return;
    }
    ttlSeconds
      ? await this.upstashClient!.set(key, value, { ex: ttlSeconds })
      : await this.upstashClient!.set(key, value);
  }

  async del(key: string): Promise<void> {
    if (this.ioredisClient) { await this.ioredisClient.del(key); return; }
    await this.upstashClient!.del(key);
  }

  async onModuleDestroy() {
    if (this.ioredisClient) await this.ioredisClient.quit();
  }
}
```

Add `ioredis` to `apps/api`:
```bash
cd apps/api && npm install ioredis && npm install -D @types/ioredis
```

### Developer Commands (document in root README.md)

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

### Local URLs Once Running
| Service | URL | Notes |
|---|---|---|
| Next.js frontend | http://localhost:3000 | Main storefront |
| NestJS API | http://localhost:8080 | REST API |
| NestJS health | http://localhost:8080/health | Cloud Run health check endpoint |
| Redis | localhost:6379 | Connect with RedisInsight or redis-cli |
| API docs | http://localhost:8080/api/v1 | Add Swagger via `@nestjs/swagger` optionally |

### Onboarding a New Developer (First-Time Setup)
The agent must include this verbatim in the root `README.md` under a "Getting Started" section:

```bash
# 1. Clone
git clone git@github.com:<org>/ct-b2c-storefront.git
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

### .gitignore (monorepo root)
```
# Env files — never commit these
**/.env.local
**/.env.*.local

# Docker overrides
docker-compose.override.yml

# Turborepo cache
.turbo

# Build outputs
apps/api/dist
apps/web/.next

# Node modules
**/node_modules
```

---

## 🏗️ Phase 1 — Monorepo Scaffold (Turborepo)

### Step 1: Initialise Turborepo
```bash
npx create-turbo@latest ct-b2c-storefront
cd ct-b2c-storefront
```

### Step 2: Full Monorepo Structure
```
ct-b2c-storefront/                          ← monorepo root
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-staging.yml
│       └── deploy-prod.yml
│
├── apps/
│   ├── api/                                # NestJS → Cloud Run: api (internal)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── commercetools/
│   │   │   │   ├── commercetools.module.ts
│   │   │   │   ├── commercetools.service.ts
│   │   │   │   └── commercetools.config.ts
│   │   │   ├── products/
│   │   │   │   ├── products.module.ts
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   └── dto/
│   │   │   ├── cart/
│   │   │   │   ├── cart.module.ts
│   │   │   │   ├── cart.controller.ts
│   │   │   │   ├── cart.service.ts
│   │   │   │   └── dto/
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/            # JWT + CT password strategy
│   │   │   │   └── guards/
│   │   │   ├── orders/
│   │   │   │   ├── orders.module.ts
│   │   │   │   ├── orders.controller.ts
│   │   │   │   └── orders.service.ts
│   │   │   ├── customers/
│   │   │   │   ├── customers.module.ts
│   │   │   │   ├── customers.controller.ts
│   │   │   │   └── customers.service.ts
│   │   │   ├── redis/
│   │   │   │   ├── redis.module.ts
│   │   │   │   └── redis.service.ts
│   │   │   └── health/
│   │   │       └── health.controller.ts   # GET /health → Cloud Run health checks
│   │   ├── test/
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── web/                               # Next.js → Cloud Run: web (public + CDN)
│       ├── src/
│       │   ├── app/
│       │   │   ├── (store)/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx
│       │   │   │   ├── products/
│       │   │   │   │   ├── page.tsx        # PLP
│       │   │   │   │   └── [slug]/page.tsx # PDP
│       │   │   │   ├── cart/page.tsx
│       │   │   │   ├── checkout/page.tsx
│       │   │   │   └── account/
│       │   │   │       ├── login/page.tsx
│       │   │   │       ├── register/page.tsx
│       │   │   │       └── orders/page.tsx
│       │   │   └── layout.tsx
│       │   ├── lib/
│       │   │   ├── api-client.ts           # Typed fetch wrapper → NestJS API
│       │   │   └── redis.ts                # Upstash Redis (session/cart store)
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   ├── product/
│       │   │   ├── cart/
│       │   │   ├── checkout/
│       │   │   └── layout/
│       │   ├── hooks/
│       │   │   ├── useCart.ts
│       │   │   └── useCustomer.ts
│       │   ├── context/
│       │   │   ├── CartContext.tsx
│       │   │   └── AuthContext.tsx
│       │   ├── types/
│       │   │   └── api.ts                  # Re-exports from @ct-b2c/types
│       │   └── middleware.ts               # Auth route protection
│       ├── Dockerfile
│       ├── .dockerignore
│       ├── next.config.ts                  # output: standalone
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── types/                              # Shared API contract types
│   │   ├── src/
│   │   │   ├── product.ts
│   │   │   ├── cart.ts
│   │   │   ├── order.ts
│   │   │   ├── customer.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── config/                             # Shared zod env schemas + constants
│   │   ├── src/
│   │   │   ├── env.ts
│   │   │   └── constants.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── eslint-config/                      # Shared ESLint rules
│       ├── index.js
│       └── package.json
│
├── turbo.json
├── package.json                            # Root workspace config
├── .env.example                            # All env vars across all packages
├── AGENT_CONTEXT.md                        # ← Mandatory shared agent context
├── CHANGELOG.md
└── README.md
```

### Step 3: turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "!.next/cache/**"]
    },
    "lint":      { "outputs": [] },
    "typecheck": { "dependsOn": ["^build"], "outputs": [] },
    "test":      { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "dev":       { "cache": false, "persistent": true }
  }
}
```

### Step 4: Root package.json
```json
{
  "name": "ct-b2c-storefront",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev":       "turbo dev",
    "build":     "turbo build",
    "lint":      "turbo lint",
    "typecheck": "turbo typecheck",
    "test":      "turbo test",
    "build:api": "turbo build --filter=api",
    "build:web": "turbo build --filter=web"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 🔧 Phase 2 — NestJS API (`apps/api`)

### Step 1: Scaffold
```bash
cd apps && npx @nestjs/cli new api --package-manager npm --strict
cd api
```

### Step 2: Install Dependencies
```bash
npm install \
  @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/terminus \
  passport passport-jwt passport-local \
  @upstash/redis \
  @commercetools/sdk-client-v2 @commercetools/platform-sdk \
  class-validator class-transformer zod helmet compression

npm install -D @types/passport-jwt @types/passport-local @types/compression
```

### Step 3: Key Implementations

#### CommercetoolsService (`src/commercetools/commercetools.service.ts`)
```typescript
/**
 * CommercetoolsService — wraps all CT SDK client initialisation.
 * The ONLY place in the codebase that imports the CT SDK client builder.
 * Exposes typed API roots for each auth flow.
 */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientBuilder } from "@commercetools/sdk-client-v2";
import { createApiBuilderFromCtpClient } from "@commercetools/platform-sdk";

@Injectable()
export class CommercetoolsService {
  constructor(private config: ConfigService) {}

  private get cfg() {
    return {
      projectKey:   this.config.getOrThrow("CTP_PROJECT_KEY"),
      clientId:     this.config.getOrThrow("CTP_CLIENT_ID"),
      clientSecret: this.config.getOrThrow("CTP_CLIENT_SECRET"),
      authUrl:      this.config.getOrThrow("CTP_AUTH_URL"),
      apiUrl:       this.config.getOrThrow("CTP_API_URL"),
      scopes:       this.config.getOrThrow("CTP_SCOPES").split(" "),
    };
  }

  /** Client credentials — catalog reads, admin operations */
  getApiRoot() {
    const { projectKey, clientId, clientSecret, authUrl, apiUrl, scopes } = this.cfg;
    const client = new ClientBuilder()
      .withClientCredentialsFlow({ host: authUrl, projectKey, credentials: { clientId, clientSecret }, scopes, fetch })
      .withHttpMiddleware({ host: apiUrl, fetch })
      .build();
    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }

  /** Password flow — authenticated customer operations */
  getCustomerApiRoot(username: string, password: string) {
    const { projectKey, clientId, clientSecret, authUrl, apiUrl, scopes } = this.cfg;
    const client = new ClientBuilder()
      .withPasswordFlow({ host: authUrl, projectKey, credentials: { clientId, clientSecret, user: { username, password } }, scopes, fetch })
      .withHttpMiddleware({ host: apiUrl, fetch })
      .build();
    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }

  /** Anonymous flow — guest cart and checkout */
  getAnonymousApiRoot(anonymousId?: string) {
    const { projectKey, clientId, clientSecret, authUrl, apiUrl, scopes } = this.cfg;
    const client = new ClientBuilder()
      .withAnonymousSessionFlow({ host: authUrl, projectKey, credentials: { clientId, clientSecret, anonymousId }, scopes, fetch })
      .withHttpMiddleware({ host: apiUrl, fetch })
      .build();
    return createApiBuilderFromCtpClient(client).withProjectKey({ projectKey });
  }
}
```

#### RedisService (`src/redis/redis.service.ts`)
```typescript
/**
 * RedisService — Upstash Redis wrapper for NestJS.
 * Used for: CT response caching, cart session storage, token caching.
 */
import { Injectable } from "@nestjs/common";
import { Redis } from "@upstash/redis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(private config: ConfigService) {
    this.client = new Redis({
      url:   this.config.getOrThrow("UPSTASH_REDIS_REST_URL"),
      token: this.config.getOrThrow("UPSTASH_REDIS_REST_TOKEN"),
    });
  }

  async get<T>(key: string): Promise<T | null> {
    return this.client.get<T>(key);
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    ttlSeconds
      ? await this.client.set(key, value, { ex: ttlSeconds })
      : await this.client.set(key, value);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
```

#### Health Check (`src/health/health.controller.ts`)
```typescript
/**
 * HealthController — required for Cloud Run liveness/readiness checks.
 * GET /health → 200 OK
 */
import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";

@Controller("health")
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() { return this.health.check([]); }
}
```

#### main.ts
```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import compression from "compression";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(compression());
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
```

### Step 4: NestJS Dockerfile (`apps/api/Dockerfile`)
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nestjs
EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/main"]
```

---

## 🌐 Phase 3 — Next.js Frontend (`apps/web`)

### Step 1: Scaffold
```bash
cd apps
npx create-next-app@latest web \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd web
```

### Step 2: Install Dependencies
```bash
npm install @upstash/redis zod
npm install -D @types/node vitest @vitejs/plugin-react \
  @testing-library/react @testing-library/jest-dom
```

### Step 3: API Client (`src/lib/api-client.ts`)
```typescript
/**
 * api-client.ts — typed fetch wrapper for all NestJS API calls.
 * The ONLY file in apps/web that makes HTTP requests to the backend.
 * All calls are server-side — this file must never be imported in Client Components.
 */
import type { Product, Cart, Order, Customer } from "@ct-b2c/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const productsApi = {
  list: (p?: { limit?: number; offset?: number; category?: string }) =>
    apiFetch<{ results: Product[]; total: number }>(`/products?${new URLSearchParams(p as Record<string, string>)}`),
  getBySlug: (slug: string) => apiFetch<Product>(`/products/${slug}`),
};

export const cartApi = {
  get:        (id: string)        => apiFetch<Cart>(`/cart/${id}`),
  create:     ()                  => apiFetch<Cart>(`/cart`, { method: "POST" }),
  addItem:    (id: string, b: unknown) => apiFetch<Cart>(`/cart/${id}/items`, { method: "POST",   body: JSON.stringify(b) }),
  updateItem: (id: string, lid: string, b: unknown) => apiFetch<Cart>(`/cart/${id}/items/${lid}`, { method: "PATCH",  body: JSON.stringify(b) }),
  removeItem: (id: string, lid: string) => apiFetch<Cart>(`/cart/${id}/items/${lid}`, { method: "DELETE" }),
};

export const authApi = {
  login:    (b: { email: string; password: string }) =>
    apiFetch<{ token: string; customer: Customer }>(`/auth/login`,    { method: "POST", body: JSON.stringify(b) }),
  register: (b: unknown) =>
    apiFetch<{ token: string; customer: Customer }>(`/auth/register`, { method: "POST", body: JSON.stringify(b) }),
};

export const ordersApi = {
  list: (token: string) => apiFetch<Order[]>(`/orders`, { token }),
};
```

### Step 4: Redis Session Store (`src/lib/redis.ts`)
```typescript
/**
 * redis.ts — Upstash Redis client for the web app.
 * Used for: cart ID per session, ISR invalidation flags.
 * Server-side only — never import in Client Components.
 */
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const CART_KEY = (sessionId: string) => `cart:${sessionId}`;
export const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days
```

### Step 5: next.config.ts
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",   // Required for Docker multi-stage
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.commercetools.com" }],
  },
};

export default nextConfig;
```

### Step 6: Next.js Dockerfile (`apps/web/Dockerfile`)
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

---

## ⚙️ Phase 4 — GitHub Actions CI/CD

### 1. PR Checks — `.github/workflows/ci.yml`
```yaml
name: CI — PR Checks

on:
  pull_request:
    branches: [main, develop, "release/*"]

jobs:
  ci:
    name: Lint, Typecheck & Test (all packages)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - uses: actions/cache@v4
        with:
          path: .turbo
          key: turbo-${{ github.sha }}
          restore-keys: turbo-
      - run: npx turbo typecheck
      - run: npx turbo lint
      - run: npx turbo test

  docker-check:
    name: Docker Build Check — ${{ matrix.app }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [api, web]
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          context: ./apps/${{ matrix.app }}
          push: false
          build-args: |
            NEXT_PUBLIC_API_URL=https://api.internal
            NEXT_PUBLIC_APP_URL=https://staging.example.com
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 2. Staging Deploy — `.github/workflows/deploy-staging.yml`
```yaml
name: Deploy — Staging

on:
  push:
    branches: [develop]

env:
  REGISTRY: ${{ secrets.GCP_REGION }}-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/ct-b2c-images

jobs:
  deploy-api:
    name: API → Staging
    runs-on: ubuntu-latest
    environment: staging
    permissions: { contents: read, id-token: write }
    outputs:
      api-url: ${{ steps.api-url.outputs.url }}
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}
      - uses: google-github-actions/setup-gcloud@v2
      - run: gcloud auth configure-docker ${{ secrets.GCP_REGION }}-docker.pkg.dev -q
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          context: ./apps/api
          push: true
          tags: ${{ env.REGISTRY }}/api:staging,${{ env.REGISTRY }}/api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - run: |
          gcloud run deploy ct-b2c-api-staging \
            --image=${{ env.REGISTRY }}/api:${{ github.sha }} \
            --region=${{ secrets.GCP_REGION }} \
            --platform=managed \
            --no-allow-unauthenticated \
            --ingress=internal \
            --set-secrets="CTP_PROJECT_KEY=CTP_PROJECT_KEY:latest,CTP_CLIENT_ID=CTP_CLIENT_ID:latest,CTP_CLIENT_SECRET=CTP_CLIENT_SECRET:latest,CTP_AUTH_URL=CTP_AUTH_URL:latest,CTP_API_URL=CTP_API_URL:latest,CTP_SCOPES=CTP_SCOPES:latest,UPSTASH_REDIS_REST_URL=UPSTASH_REDIS_REST_URL:latest,UPSTASH_REDIS_REST_TOKEN=UPSTASH_REDIS_REST_TOKEN:latest" \
            --set-env-vars="ALLOWED_ORIGIN=${{ secrets.NEXT_PUBLIC_APP_URL_STAGING }}" \
            --min-instances=0 --max-instances=5 --memory=512Mi --cpu=1 --port=8080
      - id: api-url
        run: |
          URL=$(gcloud run services describe ct-b2c-api-staging \
            --region=${{ secrets.GCP_REGION }} --format="value(status.url)")
          echo "url=$URL" >> $GITHUB_OUTPUT

  deploy-web:
    name: Web → Staging
    needs: deploy-api
    runs-on: ubuntu-latest
    environment: staging
    permissions: { contents: read, id-token: write }
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}
      - uses: google-github-actions/setup-gcloud@v2
      - run: gcloud auth configure-docker ${{ secrets.GCP_REGION }}-docker.pkg.dev -q
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          context: ./apps/web
          push: true
          tags: ${{ env.REGISTRY }}/web:staging,${{ env.REGISTRY }}/web:${{ github.sha }}
          build-args: |
            NEXT_PUBLIC_API_URL=${{ needs.deploy-api.outputs.api-url }}
            NEXT_PUBLIC_APP_URL=${{ secrets.NEXT_PUBLIC_APP_URL_STAGING }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - run: |
          gcloud run deploy ct-b2c-web-staging \
            --image=${{ env.REGISTRY }}/web:${{ github.sha }} \
            --region=${{ secrets.GCP_REGION }} \
            --platform=managed \
            --allow-unauthenticated \
            --set-secrets="UPSTASH_REDIS_REST_URL=UPSTASH_REDIS_REST_URL:latest,UPSTASH_REDIS_REST_TOKEN=UPSTASH_REDIS_REST_TOKEN:latest" \
            --set-env-vars="NEXT_PUBLIC_API_URL=${{ needs.deploy-api.outputs.api-url }}" \
            --min-instances=0 --max-instances=5 --memory=512Mi --cpu=1 --port=3000
```

### 3. Production Deploy — `.github/workflows/deploy-prod.yml`
```yaml
name: Deploy — Production

on:
  push:
    branches: [main]

env:
  REGISTRY: ${{ secrets.GCP_REGION }}-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/ct-b2c-images

jobs:
  deploy-api:
    name: API → Production
    runs-on: ubuntu-latest
    environment: production
    permissions: { contents: read, id-token: write }
    outputs:
      api-url: ${{ steps.api-url.outputs.url }}
      version: ${{ steps.version.outputs.tag }}
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}
      - uses: google-github-actions/setup-gcloud@v2
      - run: gcloud auth configure-docker ${{ secrets.GCP_REGION }}-docker.pkg.dev -q
      - id: version
        run: echo "tag=$(git describe --tags --abbrev=0 2>/dev/null || echo 'v0.0.1')" >> $GITHUB_OUTPUT
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          context: ./apps/api
          push: true
          tags: ${{ env.REGISTRY }}/api:latest,${{ env.REGISTRY }}/api:${{ steps.version.outputs.tag }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - run: |
          gcloud run deploy ct-b2c-api-prod \
            --image=${{ env.REGISTRY }}/api:${{ steps.version.outputs.tag }} \
            --region=${{ secrets.GCP_REGION }} \
            --platform=managed \
            --no-allow-unauthenticated \
            --ingress=internal \
            --set-secrets="CTP_PROJECT_KEY=CTP_PROJECT_KEY:latest,CTP_CLIENT_ID=CTP_CLIENT_ID:latest,CTP_CLIENT_SECRET=CTP_CLIENT_SECRET:latest,CTP_AUTH_URL=CTP_AUTH_URL:latest,CTP_API_URL=CTP_API_URL:latest,CTP_SCOPES=CTP_SCOPES:latest,UPSTASH_REDIS_REST_URL=UPSTASH_REDIS_REST_URL:latest,UPSTASH_REDIS_REST_TOKEN=UPSTASH_REDIS_REST_TOKEN:latest" \
            --set-env-vars="ALLOWED_ORIGIN=${{ secrets.NEXT_PUBLIC_APP_URL_PROD }}" \
            --min-instances=1 --max-instances=20 --memory=1Gi --cpu=2 --concurrency=100 --port=8080
      - id: api-url
        run: |
          URL=$(gcloud run services describe ct-b2c-api-prod \
            --region=${{ secrets.GCP_REGION }} --format="value(status.url)")
          echo "url=$URL" >> $GITHUB_OUTPUT

  deploy-web:
    name: Web → Production
    needs: deploy-api
    runs-on: ubuntu-latest
    environment: production
    permissions: { contents: read, id-token: write }
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}
      - uses: google-github-actions/setup-gcloud@v2
      - run: gcloud auth configure-docker ${{ secrets.GCP_REGION }}-docker.pkg.dev -q
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          context: ./apps/web
          push: true
          tags: ${{ env.REGISTRY }}/web:latest,${{ env.REGISTRY }}/web:${{ needs.deploy-api.outputs.version }}
          build-args: |
            NEXT_PUBLIC_API_URL=${{ needs.deploy-api.outputs.api-url }}
            NEXT_PUBLIC_APP_URL=${{ secrets.NEXT_PUBLIC_APP_URL_PROD }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - run: |
          gcloud run deploy ct-b2c-web-prod \
            --image=${{ env.REGISTRY }}/web:${{ needs.deploy-api.outputs.version }} \
            --region=${{ secrets.GCP_REGION }} \
            --platform=managed \
            --allow-unauthenticated \
            --set-secrets="UPSTASH_REDIS_REST_URL=UPSTASH_REDIS_REST_URL:latest,UPSTASH_REDIS_REST_TOKEN=UPSTASH_REDIS_REST_TOKEN:latest" \
            --set-env-vars="NEXT_PUBLIC_API_URL=${{ needs.deploy-api.outputs.api-url }}" \
            --min-instances=1 --max-instances=20 --memory=1Gi --cpu=2 --concurrency=100 --port=3000
      - uses: actions/create-release@v1
        env: { GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}" }
        with:
          tag_name: ${{ needs.deploy-api.outputs.version }}
          release_name: Release ${{ needs.deploy-api.outputs.version }}
```

---

## 🧩 Phase 5 — Feature Implementation

Build in this order. Each = one agent task on its own feature branch.

### Prerequisite: Shared Types (`packages/types`)
Before any feature, define all shared types: `Product`, `Cart`, `CartLineItem`, `Order`, `Customer`, `Address`. Both `apps/api` and `apps/web` import from `@ct-b2c/types`. This is the API contract — changes break at compile time, not runtime.

### Feature 1: Products
- **API**: `GET /api/v1/products` (paginated, filterable) · `GET /api/v1/products/:slug`
- CT: `productProjections.search().get()` — cache in Redis with 5-min TTL
- **Web**: PLP Server Component + ProductCard + pagination

### Feature 2: PDP
- **API**: Already covered by products endpoint
- **Web**: PDP Server Component, image gallery, variant selector, Add to Cart

### Feature 3: Cart
- **API**: `POST /cart` · `GET /cart/:id` · `POST /cart/:id/items` · `PATCH /cart/:id/items/:lid` · `DELETE /cart/:id/items/:lid`
- CT: anonymous cart flow; `cartId` stored in Redis keyed by session
- **Web**: CartContext, cart page, mini-cart

### Feature 4: Auth
- **API**: `POST /auth/register` · `POST /auth/login` (returns JWT) · `GET /auth/me`
- CT: password flow on login; `customers.post()` on register; cart merge via `customers.login().post()`
- **Web**: AuthContext, login/register pages, `middleware.ts` protects `/account/*`

### Feature 5: Checkout
- **API**: `POST /cart/:id/shipping-address` · `POST /cart/:id/shipping-method` · `POST /orders`
- CT: set address → set shipping method → `orders.post()`
- **Web**: multi-step form (address → shipping → confirm)

### Feature 6: Order History
- **API**: `GET /orders` (JWT protected, uses `me.orders.get()`)
- **Web**: `/account/orders`, order list with status badges

---

## ✅ Phase 6 — Quality & Conventions

### Enforced Conventions
- CT SDK **only** in `apps/api` — never in `apps/web`, checked at PR review
- Shared types **only** via `packages/types` — never duplicated across packages
- NestJS DTOs use `class-validator` + `class-transformer`
- Next.js forms use `zod`
- CT errors caught in NestJS services, re-thrown as typed `HttpException`
- Redis cache keys follow `resource:identifier` convention (e.g. `product:my-slug`, `cart:session-abc`)
- Every new file has a JSDoc comment describing its purpose
- Turborepo `--filter` used in CI to only rebuild affected packages

### NestJS Error Handling
```typescript
import { HttpException, HttpStatus } from "@nestjs/common";
import { type ApiError } from "@commercetools/platform-sdk";

try {
  return await this.ct.getApiRoot().products().get().execute();
} catch (error) {
  const e = error as ApiError;
  throw new HttpException(e.message ?? "CT API error", e.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR);
}
```

### Redis Cache-Aside Pattern
```typescript
async getProductBySlug(slug: string) {
  const key = `product:${slug}`;
  const cached = await this.redis.get(key);
  if (cached) return cached;

  const { body } = await this.ct.getApiRoot()
    .productProjections().withKey({ key: slug }).get().execute();

  await this.redis.set(key, body, 300); // 5-min TTL
  return body;
}
```

---

## 🔄 AGENT_CONTEXT.md — Initial Bootstrap Template

```markdown
# AGENT CONTEXT — CT B2C Storefront

## Last Updated
<timestamp> — Initialised by Agent Session 1

## Project State
Monorepo scaffolded with Turborepo. GitHub repo and GitFlow branches in place.
GCP project configured: Artifact Registry, Workload Identity, Secret Manager.
CT account set up. Upstash Redis provisioned. NestJS API and Next.js web apps
scaffolded with Dockerfiles and shared packages created. CI/CD pipelines committed.
No B2C features implemented yet.

## Completed Work

### ✅ Local Dev Foundation
- [ ] GitHub repo, GitFlow branches (main, develop), branch protection, environments
- [ ] CT account, project key, and API credentials created
- [ ] CT sample data seeded (products, categories, tax category, shipping)
- [ ] docker-compose.yml created (api + web + redis containers)
- [ ] Per-package .env.example files created and committed
- [ ] .gitignore configured (env files, .turbo, dist, node_modules)
- [ ] Turborepo monorepo scaffolded (apps/api, apps/web, packages/*)
- [ ] NestJS API: CT module, Redis module (env-aware), health endpoint, Dockerfile
- [ ] Next.js web: api-client.ts (dual URL), Redis lib, Dockerfile, next.config.ts
- [ ] packages/types, packages/config, packages/eslint-config created

### ⏳ GCP / Production (not started — deferred until production-ready)
- [ ] GitHub Secrets configured (CT, GCP, Upstash, app URLs)
- [ ] GCP project created, APIs enabled
- [ ] Artifact Registry created
- [ ] Deployer SA + Workload Identity Federation configured
- [ ] CT secrets stored in GCP Secret Manager
- [ ] Upstash Redis account + REST URL + token stored in Secret Manager
- [ ] GitHub Actions workflows (ci, deploy-staging, deploy-prod)
- [ ] Cloud CDN configured

## In Progress
Nothing yet.

## Pending / Backlog

### Local development (work on these now)
1. packages/types — define all shared API contract types
2. Feature 1: Products API + PLP
3. Feature 2: PDP
4. Feature 3: Cart API + Cart UI
5. Feature 4: Auth API + Auth UI
6. Feature 5: Checkout API + Checkout UI
7. Feature 6: Orders API + Order History

### Production (do these when ready to go live)
8. GitHub Actions CI/CD pipelines
9. GCP project setup + Secret Manager
10. Upstash Redis provisioning
11. Cloud Run deployments
12. Cloud CDN setup
13. Release v1.0.0

## Architecture Decisions
- Turborepo monorepo — shared types, single repo, smart build caching
- NestJS for API — structured DI modules, validation pipeline, easy to extend
- CT SDK exclusively in apps/api — credentials never reach browser or web service
- docker-compose for local dev — api + web + redis all containerised, no cloud deps
- Redis is environment-aware — ioredis (local container) vs Upstash (staging/prod)
- Next.js api-client uses dual URL — INTERNAL_API_URL for server, NEXT_PUBLIC_API_URL for browser
- Next.js output:standalone — required for Docker multi-stage production builds
- GCP fully deferred — codebase runs 100% locally before any cloud config is needed
- NestJS Cloud Run will be internal ingress in prod — not publicly reachable
- NEXT_PUBLIC_* injected at Docker build time via --build-arg (prod only)
- API deploys before web in CI; web gets API Cloud Run URL as build arg (prod only)
- min-instances=0 staging (cost saving) / min-instances=1 prod (no cold start)

## Known Issues / Watch-outs
- CT productProjections.search() needs Search module enabled in Merchant Center
- CT mutations always need current `version` — always fetch before mutating
- Anonymous → customer cart merge must happen at login via customers.login()
- Turborepo: packages/* builds before apps/* — handled automatically via dependsOn in turbo.json
- Next.js dual API URL: server-side uses INTERNAL_API_URL (Docker hostname), browser uses NEXT_PUBLIC_API_URL (localhost)
- Hot reload: src volume mounts in docker-compose enable live reload without rebuilding
- NestJS CORS: ALLOWED_ORIGIN must match web app URL exactly — no trailing slash

## Environment Variables

### apps/api/.env.local (local dev — never committed)
- CTP_PROJECT_KEY, CTP_CLIENT_ID, CTP_CLIENT_SECRET — CT credentials
- CTP_AUTH_URL, CTP_API_URL, CTP_SCOPES — CT endpoints
- REDIS_URL=redis://localhost:6379 — local Redis (overridden to redis://redis:6379 by docker-compose)
- ALLOWED_ORIGIN=http://localhost:3000
- PORT=8080

### apps/api (staging/prod — via GCP Secret Manager, when ready)
- Same CT vars above
- UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN — replaces REDIS_URL
- ALLOWED_ORIGIN — web Cloud Run URL

### apps/web/.env.local (local dev — never committed)
- NEXT_PUBLIC_API_URL=http://localhost:8080 — browser fetch base
- INTERNAL_API_URL=http://localhost:8080 — server fetch base (overridden to http://api:8080 by docker-compose)
- REDIS_URL=redis://localhost:6379 — local Redis (overridden by docker-compose)

## Service URLs
- API Staging:  <fill after first deploy>
- Web Staging:  <fill after first deploy>
- API Prod:     <fill after first deploy>
- Web Prod:     <fill after first deploy>
- CDN IP:       <fill after CDN setup>

## CT Project Info
- Region: <fill in>
- Project Key: <fill in>
- Auth URL: <fill in>
- API URL: <fill in>

## GCP Info
- Project ID: ct-b2c-storefront
- Region: us-central1
- Artifact Registry: us-central1-docker.pkg.dev/ct-b2c-storefront/ct-b2c-images
- Cloud Run API (staging): ct-b2c-api-staging — internal ingress
- Cloud Run Web (staging): ct-b2c-web-staging — public
- Cloud Run API (prod):    ct-b2c-api-prod    — internal ingress
- Cloud Run Web (prod):    ct-b2c-web-prod    — public, behind Cloud CDN

## GitHub Info
- Repo: https://github.com/<org>/ct-b2c-storefront
- Protected: main, develop, release/*, hotfix/*
- Environments: staging (auto-deploy), production (manual approval required)
```

---

## 🚀 Agent Task Execution Order

| Task | Description | Package(s) | Branch | Env |
|---|---|---|---|---|
| **0a** | GitHub repo + GitFlow branches + branch protection + environments | — | `main`/`develop` | All |
| **0b** | CT: account, project, API client, scopes, seed sample data | — | `chore/ct-setup` → `develop` | All |
| **0c** | docker-compose + per-package .env.example files + .gitignore | root | `chore/local-dev` → `develop` | Local |
| **1** | Turborepo scaffold + shared packages (types, config, eslint-config) | `packages/*` | `chore/monorepo-scaffold` → `develop` | Local |
| **2** | NestJS API: CT module, Redis module (env-aware), health, Dockerfile | `apps/api` | `chore/api-scaffold` → `develop` | Local |
| **3** | Next.js web: api-client (dual URL), Redis lib, Dockerfile, next.config | `apps/web` | `chore/web-scaffold` → `develop` | Local |
| **4** | Shared types: Product, Cart, Order, Customer, Address | `packages/types` | `feature/CT-000-shared-types` → `develop` | Local |
| **5** | Products: API endpoints + PLP page | `api` + `web` | `feature/CT-001-products` → `develop` | Local |
| **6** | PDP: product detail page | `web` | `feature/CT-002-pdp` → `develop` | Local |
| **7** | Cart: API endpoints + Cart UI + CartContext | `api` + `web` | `feature/CT-003-cart` → `develop` | Local |
| **8** | Auth: API (JWT) + login/register UI + middleware | `api` + `web` | `feature/CT-004-auth` → `develop` | Local |
| **9** | Checkout: API endpoints + multi-step checkout UI | `api` + `web` | `feature/CT-005-checkout` → `develop` | Local |
| **10** | Orders: API (me.orders) + Order History page | `api` + `web` | `feature/CT-006-orders` → `develop` | Local |
| **—** | *(When ready for production)* | | | |
| **P1** | GitHub Actions: ci.yml, deploy-staging.yml, deploy-prod.yml | `.github/` | `chore/cicd` → `develop` | GCP |
| **P2** | GCP: project, Artifact Registry, SA, Workload Identity, Secret Manager | — | `chore/gcp-setup` → `develop` | GCP |
| **P3** | Upstash: account, REST URL + token, store in Secret Manager | — | `chore/upstash-setup` → `develop` | GCP |
| **P4** | Cloud CDN: configure after first web Cloud Run prod deploy | GCP | `chore/cdn-setup` → `develop` | GCP |
| **P5** | Release v1.0.0: version bump, CHANGELOG, merge to main | All | `release/v1.0.0` → `main` | **Prod** |

> Tasks 0a–10 = all local development. Tasks P1–P5 = production readiness, executed only when you decide to go live on GCP.
> Each task = one agent session. Always start by reading `AGENT_CONTEXT.md`. Always end by updating it.

---

## 💡 Scalability & Architecture Decision Log

| Concern | Decision | Why It Scales |
|---|---|---|
| **CT API rate limits** | Redis cache-aside on all product reads (5-min TTL) | Traffic spikes hit Redis, not CT — rate limits protected |
| **Independent scaling** | API + Web on separate Cloud Run instances | Frontend traffic surge doesn't starve API capacity and vice versa |
| **Credential security** | CT SDK only in NestJS; web uses typed HTTP client | Security boundary holds permanently as team grows |
| **Shared contract** | `packages/types` shared between API and Web | API breaking changes caught at compile time, not runtime |
| **Stateless containers** | All shared state (session, cart) in Upstash Redis | Any number of Cloud Run instances can serve any request |
| **Global performance** | Cloud CDN caches Next.js static + ISR assets at edge | Latency reduced globally; Cloud Run instances protected from static traffic |
| **API security** | NestJS Cloud Run `--ingress=internal` | API is never directly exposed to the internet |
| **Build performance** | Turborepo smart caching — only rebuilds changed packages | CI stays fast as monorepo grows |
| **Docker efficiency** | Multi-stage builds, non-root users, standalone output | Lean images (~180–250MB), faster pulls, secure containers |
| **GCP auth** | Workload Identity Federation | Zero long-lived credentials — no JSON key rotation risk |
| **Secret management** | GCP Secret Manager injected at Cloud Run runtime | Secrets never baked into images, fully auditable and rotatable |
| **Future: event-driven** | CT Subscriptions API → GCP Pub/Sub | Add order event processing later without restructuring — just wire CT to Pub/Sub |
| **Future: new service** | Add `apps/cms`, `apps/search` to monorepo | Turborepo + shared packages make adding services low-friction |
| **Observability** | `/health` on NestJS → Cloud Run health checks | Unhealthy instances auto-restarted; zero manual intervention |
| **Deploy order** | API deploys before Web in CI; Web gets API URL dynamically | Web always points to the freshly deployed API — no hardcoded URLs |

---

*Generated for: commercetools B2C · Turborepo monorepo · NestJS API · Next.js Frontend · TypeScript strict · Tailwind CSS · Upstash Redis · GCP Cloud Run (separate api + web) · GCP Artifact Registry · GCP Secret Manager · Cloud CDN · Workload Identity Federation · GitFlow · GitHub Actions Full GitOps*
