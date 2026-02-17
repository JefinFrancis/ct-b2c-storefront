# AGENT CONTEXT — CT B2C Storefront

## Last Updated
2026-02-17T00:00:00Z — Initialised by Agent Session 1

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
- Repo: https://github.com/JefinFrancis/ct-b2c-storefront
- Protected: main, develop, release/*, hotfix/*
- Environments: staging (auto-deploy), production (manual approval required)
