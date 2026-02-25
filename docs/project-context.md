# Project Context — ct-b2c-storefront

> LLM-optimized project context for AI agents. Read this before writing any code.

## Identity

| Field | Value |
|---|---|
| Name | ct-b2c-storefront |
| Type | B2C e-commerce storefront |
| Platform | commercetools Composable Commerce |
| Architecture | Turborepo monorepo — NestJS API + Next.js 15 frontend |
| Status | All 7 features complete, 151 tests passing, ready for CI/CD & deployment |

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Monorepo | Turborepo + npm workspaces | turbo ^2.5 |
| Backend | NestJS (TypeScript strict) | ^10.4 |
| Frontend | Next.js App Router (TypeScript strict) | ^15.1 |
| UI | React 19 + Tailwind CSS 3 | ^19.0 / ^3.4 |
| Commerce | commercetools Platform SDK | ^8.24 |
| Auth | Passport JWT (@nestjs/passport) | ^10.0 |
| Cache | Redis 7 (local) / Upstash (prod) | ioredis ^5.4 |
| API Tests | Jest + @nestjs/testing | ^29.7 |
| Web Tests | Vitest + @testing-library/react | ^3.2 / ^16.3 |
| Container | Docker + docker-compose | node:20 base |

## Monorepo Structure

```
ct-b2c-storefront/
├── apps/
│   ├── api/           # NestJS backend (port 8080)
│   │   └── src/
│   │       ├── auth/          # JWT auth (login, register, forgot/reset password)
│   │       ├── cart/          # Cart CRUD, sessions, shipping, billing, discounts
│   │       ├── commercetools/ # CT SDK wrapper (ONLY place CT SDK is imported)
│   │       ├── customers/     # Customer + address CRUD
│   │       ├── health/        # /health endpoint for Cloud Run
│   │       ├── orders/        # Order creation from cart, order history
│   │       ├── payments/      # Mock PSP payment processing
│   │       ├── products/      # Product catalog with Redis cache-aside
│   │       ├── redis/         # Redis service (env-aware: ioredis or Upstash)
│   │       └── wishlist/      # CT Shopping Lists API wrapper
│   └── web/           # Next.js frontend (port 3000)
│       └── src/
│           ├── app/
│           │   ├── page.tsx           # Homepage (hero, categories, trending)
│           │   ├── layout.tsx         # Root layout (AuthProvider + CartProvider)
│           │   └── (store)/           # Store route group
│           │       ├── products/      # PLP + PDP
│           │       ├── category/[...slug]/ # Category pages (nested slugs)
│           │       ├── cart/          # Full cart page
│           │       ├── checkout/      # Multi-step checkout
│           │       └── account/       # Profile, orders, addresses, wishlist
│           ├── components/
│           │   ├── layout/            # Header, Footer, ThemeToggle
│           │   ├── checkout/          # AddressForm, ShippingMethodSelector, etc.
│           │   ├── orders/            # OrderCard, OrderStatusBadge
│           │   └── home/              # HeroSection, FeaturedCategories, etc.
│           ├── contexts/              # AuthContext, CartContext, CheckoutContext
│           ├── lib/
│           │   ├── api-client.ts      # Single HTTP client (server vs browser URL)
│           │   └── format-price.ts    # Shared price formatting utility
│           └── middleware.ts          # Route protection (JWT in cookie)
├── packages/
│   ├── types/         # Shared TS types (Product, Cart, Order, Customer, etc.)
│   ├── config/        # Shared config (zod env schemas, constants)
│   └── eslint-config/ # Shared ESLint presets (base, next, nest)
├── scripts/
│   └── seed.js        # Idempotent CT sample data seeder
├── docker-compose.yml # Local dev: api + web + redis containers
└── turbo.json         # Build pipeline config
```

## Critical Patterns

### 1. CT SDK Isolation
The CT SDK (`@commercetools/sdk-client-v2`, `@commercetools/platform-sdk`) is **only** imported in `apps/api/src/commercetools/commercetools.service.ts`. All other services receive it via NestJS DI. **Never import CT SDK in apps/web.**

### 2. API Client (Frontend)
All HTTP calls from `apps/web` go through `apps/web/src/lib/api-client.ts`. It auto-detects server vs browser context:
- Server-side (RSC): uses `INTERNAL_API_URL` (Docker: `http://api:8080`)
- Client-side: uses `NEXT_PUBLIC_API_URL` (`http://localhost:8080`)

All API paths use the `/api/v1` prefix (set in NestJS `main.ts`).

### 3. Auth Flow
- JWT-based auth via `@nestjs/passport` + `passport-jwt`
- Token stored in `localStorage` + `auth-token` cookie (for middleware)
- Protected routes enforced by Next.js `middleware.ts` (checks cookie)
- API guards: `JwtAuthGuard` on protected endpoints
- Login uses CT `login().post()` (admin API), not password flow

### 4. Cart Session Model
- Anonymous carts use `X-Session-Id` header (UUID v4, stored in localStorage)
- Session→cartId mapping stored in Redis (`session:{id}` → cartId, 30-day TTL)
- On login/register, anonymous cart merges via CT `anonymousCartSignInMode: "MergeWithExistingCustomerCart"`

### 5. Redis Cache-Aside
- Products cached 5 min, categories cached 10 min
- Cache keys: `products:list:{params}`, `products:slug:{slug}`, `categories:all`
- RedisService is env-aware: uses `ioredis` (REDIS_URL) or `@upstash/redis` (UPSTASH_*)

### 6. NestJS Module Pattern
Every domain has: `*.module.ts`, `*.controller.ts`, `*.service.ts`, optionally `dto/`. Services inject `CommercetoolsService` and `RedisService`. Controllers handle HTTP, services handle business logic.

### 7. Next.js App Router Conventions
- Server Components by default (data fetching in page.tsx)
- `"use client"` only for interactive components (forms, contexts, buttons)
- Route groups: `(store)` for storefront layout with Header/Footer
- `@ct-b2c/types` imported for type safety

### 8. Theming
- Tailwind `darkMode: 'class'` with CSS custom properties in `globals.css`
- ThemeToggle component with localStorage persistence
- No-flash inline script in root `layout.tsx`
- Brand color: indigo palette

### 9. Test Patterns
- **API**: Jest with `@nestjs/testing`, mock CT SDK responses via `jest.fn()`
- **Web**: Vitest + `@testing-library/react` + jsdom, mock `api-client.ts` via `vi.mock()`
- Test files co-located: `*.spec.ts` (API), `*.test.tsx` (Web)

## Environment Variables

### API (`apps/api/.env.local`)
| Variable | Purpose |
|---|---|
| CTP_PROJECT_KEY | CT project key |
| CTP_CLIENT_ID | CT API client ID |
| CTP_CLIENT_SECRET | CT API client secret |
| CTP_AUTH_URL | CT auth endpoint (e.g., `https://auth.us-central1.gcp.commercetools.com`) |
| CTP_API_URL | CT API endpoint (e.g., `https://api.us-central1.gcp.commercetools.com`) |
| CTP_SCOPES | Space-separated CT scopes |
| REDIS_URL | Local Redis URL (`redis://localhost:6379`) |
| PORT | Server port (default: 8080) |
| ALLOWED_ORIGIN | CORS origin (default: `http://localhost:3000`) |

### Web (`apps/web/.env.local`)
| Variable | Purpose |
|---|---|
| NEXT_PUBLIC_API_URL | API URL for browser fetches |
| INTERNAL_API_URL | API URL for server-side fetches |
| NEXT_PUBLIC_APP_URL | Frontend URL |
| REDIS_URL | Redis URL |

## Docker Development

```bash
docker compose up --build    # First time / after deps change
docker compose up            # Daily use
docker compose down -v       # Full reset (clears Redis)
```

| Service | Host Port | Container Port |
|---|---|---|
| Web (Next.js) | 3001 | 3000 |
| API (NestJS) | 8080 | 8080 |
| Redis | 6380 | 6379 |

## Commands

```bash
npm test                    # All 151 tests
npm run test:api            # 64 API tests (Jest)
npm run test:web            # 87 Web tests (Vitest)
npx turbo typecheck         # TypeScript all packages
npx turbo build             # Build all packages
npx turbo lint              # Lint all packages
```

## CT Project Info

| Field | Value |
|---|---|
| Project Key | c-spire-oe-demo |
| Region | US (us-central1) |
| Sample Data | 42 categories, 127 products, 4 product types, 2 shipping methods |
| Seed Script | `scripts/seed.js` (idempotent) |

## Git Conventions

- **Branch model**: GitFlow (main / develop / feature/* / bugfix/* / release/* / hotfix/*)
- **Naming**: `feature/CT-<id>-description` or `chore/description`
- **Commits**: Conventional Commits with scope — `feat(api/cart): add discount endpoint`
- **Current branch**: develop
- **Repo**: github.com/JefinFrancis/ct-b2c-storefront (public)

## What's Next

1. CI/CD pipeline (GitHub Actions)
2. GCP deployment (Cloud Run, Artifact Registry, Secret Manager)
3. Cloud CDN setup
4. Release v1.0.0
