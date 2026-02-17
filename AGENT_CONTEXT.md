# AGENT CONTEXT — CT B2C Storefront

## Last Updated
2026-02-17 — Agent Session 7 / Task 4 (Feature 3: Cart API + Cart UI wiring)

## Project State
GitHub repository created (private) with GitFlow branches (main, develop) pushed.
commercetools project (c-spire-oe-demo, US region) is configured with an Admin API
client. Sample data seeded: 42 categories, 127 products, 4 product types, 1 tax
category, 2 zones, 2 shipping methods. Turborepo monorepo scaffold complete with
NestJS API and Next.js web. Feature 1 (Products API + PLP) wired. Feature 2 (PDP)
complete. Feature 3 (Cart API + Cart UI) now complete — cart service wired to CT SDK
with Redis session storage (30-day TTL), CartContext manages cart state, MiniCart
dropdown in header, full cart page with quantity controls and order summary.

## Completed Work

### ✅ Local Dev Foundation
- [x] GitHub repo, GitFlow branches (main, develop) created and pushed
- [x] CT account, project key, and API credentials created
- [x] CT sample data seeded (products, categories, tax category, shipping)
- [x] .gitignore configured (env files, .turbo, dist, node_modules)
- [x] Seed script created (scripts/seed.js) — idempotent, skips existing data
- [x] docker-compose.yml created (api + web + redis containers)
- [x] Per-package .env.example files created and committed
- [x] README.md with architecture, getting started, developer commands

### ✅ Turborepo Monorepo Scaffold (Task 1)
- [x] turbo.json + root package.json with npm workspaces
- [x] tsconfig.base.json — shared TypeScript configuration
- [x] apps/api (NestJS): CT module, Redis module (env-aware), health endpoint
- [x] apps/api: products, cart, auth, orders, customers modules with controllers/services
- [x] apps/api: Dockerfile (multi-stage), .dockerignore, nest-cli.json
- [x] apps/web (Next.js): app router pages (/, /products, /cart, /account/*, /checkout)
- [x] apps/web: api-client.ts (dual URL), redis.ts, Tailwind CSS
- [x] apps/web: Dockerfile (multi-stage), .dockerignore, next.config.ts (standalone)
- [x] packages/types: Product, Cart, Order, Customer, common types
- [x] packages/config: env.ts (zod schemas), constants.ts
- [x] packages/eslint-config: base, next, nest presets
- [x] npm install + turbo build successful (5/5 tasks)

### ✅ Feature 1: Products API + PLP wiring (Task 2)
- [x] products.service.ts: CT SDK integration with Redis cache-aside (5-min TTL)
- [x] products.controller.ts: GET /products (paginated, filterable, searchable)
- [x] products.controller.ts: GET /products/:slug (single product by slug)
- [x] ProductCard component: displays product image, name, price
- [x] Pagination component: server-side pagination with URL query params
- [x] PLP page: fetches from API, displays ProductCard grid with pagination
- [x] api-client.ts: updated productsApi.list() with search param support
- [x] turbo build successful (5/5 tasks)

### ✅ Feature 2: PDP wiring (Task 3)
- [x] ImageGallery component: main image + thumbnails, zoom on hover
- [x] VariantSelector component: displays variant attributes, shows availability
- [x] AddToCartButton component: creates cart if needed, adds item, shows feedback
- [x] ProductDetails component: client component wrapper for variant state management
- [x] PDP page (Server Component): fetches product, SEO metadata, breadcrumbs
- [x] localStorage cart ID persistence (CartContext will replace this later)
- [x] Component barrel exports updated
- [x] TypeScript type check passes

### ✅ Feature 3: Cart API + Cart UI wiring (Task 4)
- [x] cart.service.ts: Redis session storage (30-day TTL, session:{id} → cartId)
- [x] cart.service.ts: getOrCreateCartForSession() method for session-based cart
- [x] cart.controller.ts: GET /cart/session/current endpoint with X-Session-Id header
- [x] cart.module.ts: RedisModule imported for session storage
- [x] api-client.ts: sessionId option in apiFetch, getSessionCart method
- [x] CartContext: React context with cart state, addItem, updateQuantity, removeItem
- [x] CartContext: UUID v4 session ID generation, localStorage persistence
- [x] MiniCart component: dropdown with item preview, remove, subtotal, cart link
- [x] Cart page: full UI with quantity controls, order summary, responsive design
- [x] Store layout: CartProvider wrapper, MiniCart replaces static Cart link
- [x] AddToCartButton: refactored to use CartContext instead of localStorage
- [x] TypeScript type check passes (both api and web)

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
Task 4 (Feature 3: Cart) complete. Branch `feature/CT-003-cart` ready to push and PR → develop.
Feature 2 branch merged into this branch for continuity.
Next agent session should pick up Task 5 (Feature 4: Auth API + Auth UI wiring).

### GitHub Environments — Created ✅
- **staging** — created (no protection rules, auto-deploy)
- **production** — created (no reviewers applied — see blocker below)

### ⚠️ Branch Protection — BLOCKED (GitHub Free plan, private repo)
Branch protection rules AND repository rulesets both require **GitHub Pro** (or a
public repo). `gh` CLI v2.86.0 was used but the API returns HTTP 403.

**Action required** — do ONE of the following, then apply these rules:
1. Upgrade to GitHub Pro ($4/mo at github.com/settings/billing), OR
2. Make the repo public (Settings → Danger Zone → Change visibility)

Once unblocked, apply these rules (via Settings → Branches or `gh api`):
- **main**: Require PR + 1 approval + CI status checks, no direct push, no force push
- **develop**: Require PR + CI status checks, no direct push
- **release/\***: Require PR + CI status checks
- **hotfix/\***: Require PR + CI status checks
- **production env**: Add JefinFrancis as required reviewer, restrict to main branch

## Pending / Backlog

### Local development (work on these now)
1. ~~packages/types — define all shared API contract types~~ ✅ Done in Task 1
2. ~~Feature 1: Products API + PLP wiring~~ ✅ Done in Task 2
3. ~~Feature 2: PDP wiring~~ ✅ Done in Task 3
4. ~~Feature 3: Cart API + Cart UI wiring~~ ✅ Done in Task 4
5. Feature 4: Auth API + Auth UI wiring
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
- Session-based cart: X-Session-Id header, Redis session:{id}→cartId mapping (30-day TTL)
- Next.js api-client uses dual URL — INTERNAL_API_URL for server, NEXT_PUBLIC_API_URL for browser
- Next.js output:standalone — required for Docker multi-stage production builds
- GCP fully deferred — codebase runs 100% locally before any cloud config is needed
- NestJS Cloud Run will be internal ingress in prod — not publicly reachable
- NEXT_PUBLIC_* injected at Docker build time via --build-arg (prod only)
- API deploys before web in CI; web gets API Cloud Run URL as build arg (prod only)
- min-instances=0 staging (cost saving) / min-instances=1 prod (no cold start)

## Known Issues / Watch-outs
- CT productProjections.search() needs Search module enabled in Merchant Center
- Admin API client (manage_project scope) used for seeding — app should use narrower scopes (view_products, manage_my_orders, etc.)
- CT attribute names are globally unique across product types — 'size' must be ltext (not text) due to existing 'Furniture and decor' product type
- CT project locale is en-US (not en) — all localized strings must use en-US key
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
- JWT_SECRET=dev-secret-change-me-in-production — for auth token signing

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
- Region: us-central1.gcp (US)
- Project Key: c-spire-oe-demo
- Auth URL: https://auth.us-central1.gcp.commercetools.com
- API URL: https://api.us-central1.gcp.commercetools.com
- API Client: ct-b2c-storefront (Admin scope: manage_project)
- Scopes (for app .env): view_products:c-spire-oe-demo manage_my_orders:c-spire-oe-demo manage_my_profile:c-spire-oe-demo manage_my_payments:c-spire-oe-demo create_anonymous_token:c-spire-oe-demo
- Seeded Data: 42 categories (29 demo + 13 fashion), 127 products (117 demo + 10 fashion), 4 product types, 1 tax category, 2 zones, 2 shipping methods
- Locale: project uses en-GB, de-DE, en-US — seed data uses en-US
- Demo data: furniture/home goods theme (CT sample project data, pre-existing)
- Fashion data: clothing, accessories, footwear (our seed script)

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
