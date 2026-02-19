# AGENT CONTEXT — CT B2C Storefront

## Last Updated
2026-02-18 — Agent Session 13 / Task 10 (Bugfix: CT Order-Customer Association)

## Project State
GitHub repository created (private) with GitFlow branches (main, develop) pushed.
commercetools project (c-spire-oe-demo, US region) is configured with an Admin API
client. Sample data seeded: 42 categories, 127 products, 4 product types, 1 tax
category, 2 zones, 2 shipping methods. Turborepo monorepo scaffold complete with
NestJS API and Next.js web. Features 1-6 complete (Products, PDP, Cart, Auth, Checkout, Orders History).
Bugfix releases applied: (1) CORS, search, category filter, variant selector, auth token;
(2) Checkout shipping method mapping, login via CT login endpoint, forgot/reset password flow;
(3) Order-customer association — orders now properly linked to CT customer.
**Unit testing completed for all features** — 151 tests total (64 API + 87 Web).

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

### ✅ Feature 4: Auth API + Auth UI wiring (Task 5)
- [x] auth.service.ts: CT password flow for login, customers.post for registration
- [x] auth.service.ts: getMe() fetches customer by ID, verifyToken() for JWT validation
- [x] auth.controller.ts: POST /auth/login, POST /auth/register, GET /auth/me (protected)
- [x] JwtStrategy: extracts customerId from JWT, attaches to request.user
- [x] JwtAuthGuard: protects routes requiring authentication
- [x] api-client.ts: authApi.getMe(token) method added
- [x] AuthContext: React context with login, register, logout, customer state
- [x] AuthContext: JWT stored in localStorage + cookie (for middleware)
- [x] Login page: form validation, error handling, redirect param support
- [x] Register page: form validation, password confirmation, auto-login after register
- [x] middleware.ts: protects /account/orders, /account/profile, /account/addresses, /checkout
- [x] UserMenu component: dropdown showing customer name, logout, account links
- [x] Store layout: AuthProvider wraps CartProvider
- [x] TypeScript type check passes (both api and web)

### ✅ Feature 5: Checkout API + Checkout UI (Task 6)
- [x] packages/types/checkout.ts: ShippingMethod, SetShippingAddressInput, CheckoutStep types
- [x] cart.service.ts: setShippingAddress(), getShippingMethods(), setShippingMethod()
- [x] cart.controller.ts: POST /cart/:id/shipping-address, GET /cart/:id/shipping-methods, POST /cart/:id/shipping-method
- [x] orders.service.ts: createFromCart() with validation (address, method, items required)
- [x] orders.service.ts: findById() method for order retrieval
- [x] orders.controller.ts: POST /orders (create order from cart), GET /orders/:id
- [x] orders.module.ts: imports CartModule for service dependency
- [x] api-client.ts: cartApi checkout methods + ordersApi.create/get
- [x] CheckoutContext: multi-step state management (address → shipping → review)
- [x] AddressForm component: shipping address input with validation
- [x] ShippingMethodSelector component: shipping method selection with pricing
- [x] OrderReview component: order summary before placing order
- [x] OrderConfirmation component: success message with order details
- [x] CheckoutSteps component: visual step indicator
- [x] Checkout page: multi-step form with CheckoutProvider
- [x] Unit tests: 10 API tests (orders.service.spec.ts), 30 Web tests
- [x] TypeScript type check passes

### ✅ Feature 6: Orders History (Task 7)
- [x] GET /orders API already implemented (JWT protected, uses customerId query)
- [x] ordersApi.list(token) already in api-client.ts
- [x] OrderStatusBadge component: colored badges for order/payment/shipment states
- [x] OrderCard component: order summary with line items, statuses, total, view link
- [x] Orders page (/account/orders): client component, fetches and displays orders
- [x] Order details page (/account/orders/[id]): full order info with items and summary
- [x] Unit tests: 10 OrderStatusBadge tests + 12 OrderCard tests (22 new Web tests)
- [x] TypeScript type check passes

### ✅ Bugfix: Web Functionality (Task 8)
- [x] CORS fix: ALLOWED_ORIGIN=http://localhost:3001 in docker-compose.yml
- [x] Next.js images: placehold.co added to remotePatterns in next.config.ts
- [x] ProductSearch component: search box on PLP with URL param integration
- [x] CategoryFilter component: category dropdown filter on PLP
- [x] products.controller.ts: GET /products/categories endpoint
- [x] products.service.ts: getCategories() with 10-min Redis cache
- [x] VariantSelector: color swatch support, hidden redundant attributes
- [x] AuthContext: exposed token state for orders fetching
- [x] Order details page: LocalizedString helper, fixed Address.state → region
- [x] All 143 tests pass (57 API + 86 Web)

### ✅ Bugfix: Checkout, Login, Forgot Password (Task 9)
- [x] ShippingMethodSelector crash: mapped CT zoneRates to flat ShippingMethod price in cart.service.ts
- [x] Login 401 fix: switched from password flow (getCustomerApiRoot) to CT login() endpoint (admin API)
- [x] Forgot password page: /account/forgot-password with email form and dev-mode token display
- [x] Reset password page: /account/reset-password with token input, password validation, Suspense wrapper
- [x] Auth API: POST /auth/forgot-password, POST /auth/reset-password endpoints
- [x] auth.service.ts: forgotPassword() (password token + email enumeration prevention), resetPassword()
- [x] api-client.ts: authApi.forgotPassword(), authApi.resetPassword() methods
- [x] Login page: "Forgot password?" link now points to /account/forgot-password
- [x] Auth unit tests updated: login test uses login().post() mock, 4 new tests for forgot/reset password
- [x] CT customer password fix: recreated customer with proper password hash
- [x] All 147 tests pass (61 API + 86 Web)

### ✅ Bugfix: CT Order-Customer Association (Task 10)
- [x] Root cause: carts created anonymously → orders had no customerId → invisible in findByCustomer
- [x] cart.service.ts: added setCustomerId() method (CT setCustomerId + setCustomerEmail actions)
- [x] orders.controller.ts: POST /orders now protected by @UseGuards(JwtAuthGuard)
- [x] orders.service.ts: createFromCart() accepts customerId/email, calls setCustomerId before order creation
- [x] api-client.ts: ordersApi.create(cartId, token) now passes auth token
- [x] CheckoutContext: imports useAuth, placeOrder() passes JWT token, validates login required
- [x] OrderCard.tsx: fixed pre-existing LocalizedString type error in alt/name display
- [x] Unit tests: 3 new CartService tests (setCustomerId), 1 new CheckoutContext test (login required)
- [x] All 151 tests pass (64 API + 87 Web)

### 🧪 Unit Testing Status
> **MANDATORY:** All features must include unit tests. See CT_AGENT_PROMPT.md for testing standards.

| Feature | API Tests | Web Tests | Status |
|---------|-----------|-----------|--------|
| Feature 1: Products API + PLP | ✅ 14 tests | ✅ 9 tests | Complete |
| Feature 2: PDP | N/A | ✅ (via ProductCard) | Complete |
| Feature 3: Cart API + UI | ✅ 18 tests | ✅ 15 tests | Complete |
| Feature 4: Auth API + UI | ✅ 17 tests | ✅ 10 tests | Complete |
| Feature 5: Checkout | ✅ 14 tests | ✅ 31 tests | Complete |
| CustomersService | ✅ 5 tests | N/A | Complete |
| Feature 6: Orders History | N/A (API exists) | ✅ 22 tests | Complete |

**Test Summary:**
- Total: **151 tests** (64 API + 87 Web) — all passing ✅
- API tests: Jest + @nestjs/testing
- Web tests: Vitest + @testing-library/react

**Test Files Created:**
- `apps/api/src/products/products.service.spec.ts` (14 tests)
- `apps/api/src/auth/auth.service.spec.ts` (17 tests)
- `apps/api/src/cart/cart.service.spec.ts` (18 tests)
- `apps/api/src/customers/customers.service.spec.ts` (5 tests)
- `apps/api/src/orders/orders.service.spec.ts` (14 tests)
- `apps/web/src/components/ProductCard.test.tsx` (9 tests)
- `apps/web/src/components/MiniCart.test.tsx` (9 tests)
- `apps/web/src/contexts/CartContext.test.tsx` (6 tests)
- `apps/web/src/contexts/AuthContext.test.tsx` (10 tests)
- `apps/web/src/contexts/CheckoutContext.test.tsx` (13 tests)
- `apps/web/src/components/checkout/AddressForm.test.tsx` (8 tests)
- `apps/web/src/components/checkout/ShippingMethodSelector.test.tsx` (10 tests)
- `apps/web/src/components/orders/OrderStatusBadge.test.tsx` (10 tests)
- `apps/web/src/components/orders/OrderCard.test.tsx` (12 tests)

**Test Infrastructure:**
- NestJS (apps/api): Jest configured via `@nestjs/testing`
- Next.js (apps/web): Vitest + @testing-library/react + jsdom
- Run all tests: `npm test`
- Run API tests: `npm run test:api` or `npx turbo test --filter=api`
- Run Web tests: `npm run test:web` or `npx turbo test --filter=web`

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
Nothing in progress. All features and bugfixes complete.

All planned B2C features (1-6) are now complete. Next priorities:
1. Consider Profile/Address management (customer profile page)
2. CI/CD pipeline implementation
3. GCP deployment when production-ready

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
2. ~~Feature 1: Products API + PLP wiring~~ ✅ Done in Task 2 + tests
3. ~~Feature 2: PDP wiring~~ ✅ Done in Task 3 + tests
4. ~~Feature 3: Cart API + Cart UI wiring~~ ✅ Done in Task 4 + tests
5. ~~Feature 4: Auth API + Auth UI wiring~~ ✅ Done in Task 5 + tests
6. ~~Task 5.5: Add unit tests for Features 1-4~~ ✅ Done (86 tests passing)
7. ~~Feature 5: Checkout API + Checkout UI~~ ✅ Done in Task 6 + tests (121 tests)
8. ~~Feature 6: Orders API + Order History~~ ✅ Done in Task 7 + tests (143 tests)
9. Profile/Address management (optional)
10. Cart merge on login (customers.login() flow)

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
- JWT auth: 7-day expiry, stored in localStorage (API calls) + cookie (middleware)
- CT password flow for login validation — getCustomerApiRoot(email, password)
- Next.js middleware protects /account/*, /checkout/* routes server-side
- AuthContext handles client-side auth state; redirects handled on mount
- **Unit testing mandatory**: Jest for NestJS, Vitest for Next.js, tests required for all features
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
- Cart-customer association: setCustomerId is called at order creation time (not at login), so cart browsing is anonymous until checkout
- Order creation requires authentication (JwtAuthGuard on POST /orders)
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
