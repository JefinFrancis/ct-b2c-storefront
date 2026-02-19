# CT B2C Storefront

A composable commerce B2C storefront built with **commercetools**, **NestJS**, **Next.js**, and **Turborepo**. Features full e-commerce functionality including product browsing, cart management, authentication, checkout flow, order history, wishlist, discount codes, and customer address management.

## Tech Stack

- **Backend**: NestJS (Node.js 20), TypeScript, JWT authentication
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Commerce Platform**: commercetools Composable Commerce API
- **Cache**: Redis 7 Alpine (local dev), Upstash (staging/prod)
- **Monorepo**: Turborepo with npm workspaces
- **Containerization**: Docker + Docker Compose
- **Testing**: Jest (API), Vitest + React Testing Library (Web)
- **Code Quality**: ESLint, TypeScript strict mode

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

## Features

### 🛍️ Product Catalog
- Product listing with search, filters, and pagination
- Category-based filtering
- Product detail pages with image galleries
- Variant selection (size, color) with availability
- Redis-cached product data (5-min TTL)

### 🛒 Shopping Cart
- Session-based cart management
- Add, update, remove line items
- Mini cart dropdown in header
- Cart persistence across browser sessions
- Anonymous cart merge on login/register
- Discount code support (apply/remove)
- Billing address configuration

### 🔐 Authentication & Customer Management
- Customer registration and login (JWT-based)
- Password reset flow
- Protected routes (checkout, account pages)
- Customer profile management
- Full address CRUD (shipping/billing)
- Default address selection

### 💳 Checkout & Orders
- Multi-step checkout flow (address → shipping → payment → review)
- Shipping method selection with pricing
- Payment processing (mock PSP for demo)
- Order creation with CT integration
- Order history with detailed views
- Order status tracking (payment, shipment)

### ❤️ Wishlist
- Add/remove products to wishlist
- Wishlist page with product grid
- Quick add-to-cart from wishlist
- Heart icon toggle on product pages

### 🎁 Promotions
- Discount code input
- Applied discount visualization
- Order total recalculation

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

# 5. Start everything (builds images and starts containers)
docker compose up --build

# 6. Seed sample data (optional but recommended)
cd scripts
cp .env.example .env
# Fill in CT credentials in scripts/.env
node seed.js
cd ..

# 7. Open http://localhost:3000
```

**Note**: The seed script creates 42 categories, 127 products, shipping methods, and tax categories in your commercetools project.

## Developer Commands

```bash
# ── First-time startup ──────────────────────────────────────────────────────
docker compose up --build          # Builds all images and starts all services

# ── Daily use ───────────────────────────────────────────────────────────────
docker compose up                  # Start without rebuilding
docker compose up --build api      # Rebuild only api (after package.json changes)
docker compose up --build web      # Rebuild only web

# ── Rebuild Docker ──────────────────────────────────────────────────────────
docker compose down                # Stop all services
docker compose build               # Rebuild all images without starting
docker compose build --no-cache    # Rebuild all images from scratch (clears layer cache)
docker compose build api           # Rebuild only API image
docker compose build web           # Rebuild only web image
docker compose up --build --force-recreate    # Rebuild and recreate all containers

# ── Clean rebuild (when dependencies change) ────────────────────────────────
docker compose down -v             # Stop and remove volumes (clears Redis data)
docker compose build --no-cache    # Rebuild without cache
docker compose up                  # Start fresh

# ── Logs ────────────────────────────────────────────────────────────────────
docker compose logs -f             # All services
docker compose logs -f api         # API only
docker compose logs -f web         # Web only

# ── Stop ────────────────────────────────────────────────────────────────────
docker compose down                # Stop (keeps Redis data volume)
docker compose down -v             # Stop and wipe Redis data
docker compose down --volumes --remove-orphans  # Complete cleanup

# ── Utilities ───────────────────────────────────────────────────────────────
docker compose exec redis redis-cli          # Redis CLI
docker compose exec api sh                   # Shell into API container
docker compose exec web sh                   # Shell into web container
docker ps --filter name=ct-                  # Check container status

# ── Testing (run on host, not inside containers) ────────────────────────────
npm install                        # Install root deps first
npx turbo test                     # All packages
npx turbo test --filter=api        # API only (Jest)
npx turbo test --filter=web        # Web only (Vitest)
npx turbo typecheck                # TypeScript check all packages
npx turbo lint                     # Lint all packages
npx turbo build                    # Build all packages
npx turbo build --force            # Rebuild all packages (ignore cache)
```

## Local URLs

| Service | URL | Notes |
|---|---|---|
| Next.js frontend | http://localhost:3000 | Main storefront |
| NestJS API | http://localhost:8080 | REST API |
| NestJS health | http://localhost:8080/health | Cloud Run health check endpoint |
| Redis | localhost:6379 | Connect with RedisInsight or redis-cli |

## Seeding Sample Data

If you haven't run the seed script during setup:

```bash
cd scripts
cp .env.example .env
# Fill in your CT credentials in scripts/.env
node seed.js
cd ..
```

**What it creates:**
- 42 categories (Fashion, Electronics, Home & Garden, etc.)
- 127 products across all categories
- 4 product types
- 1 tax category (Standard Tax 20%)
- 2 shipping zones
- 2 shipping methods (Standard & Express)

The seed script is **idempotent** — safe to run multiple times. It checks each entity by key and only creates what's missing.

## Project Structure

```
ct-b2c-storefront/
├── apps/
│   ├── api/             # NestJS backend (port 8080)
│   │   └── src/
│   │       ├── auth/        # JWT authentication
│   │       ├── cart/        # Shopping cart management
│   │       ├── commercetools/  # CT SDK wrapper
│   │       ├── customers/   # Customer & address management
│   │       ├── orders/      # Order creation & retrieval
│   │       ├── payments/    # Payment processing (mock PSP)
│   │       ├── products/    # Product catalog
│   │       ├── redis/       # Redis caching service
│   │       └── wishlist/    # Wishlist management
│   └── web/             # Next.js frontend (port 3000)
│       └── src/
│           ├── app/         # App Router pages
│           │   ├── (store)/       # Store layout group
│           │   │   ├── products/  # Product listing & detail
│           │   │   ├── cart/      # Shopping cart
│           │   │   ├── checkout/  # Multi-step checkout
│           │   │   └── account/   # Customer account pages
│           │   └── auth/          # Login & register
│           ├── components/  # Reusable React components
│           ├── contexts/    # React contexts (Auth, Cart, Checkout)
│           ├── lib/         # Utilities (api-client, redis)
│           └── types/       # Frontend-specific types
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

## Testing

This project includes comprehensive unit tests for all features.

### Test Coverage

| Module | Tests | Framework |
|--------|-------|-----------|
| API (NestJS) | 64 tests | Jest + @nestjs/testing |
| Web (Next.js) | 87 tests | Vitest + React Testing Library |
| **Total** | **151 tests** | ✅ All passing |

### API Tests
- `products.service.spec.ts` — 14 tests (CT SDK, caching)
- `auth.service.spec.ts` — 17 tests (login, register, password reset)
- `cart.service.spec.ts` — 18 tests (cart operations, discounts)
- `customers.service.spec.ts` — 5 tests (address CRUD)
- `orders.service.spec.ts` — 14 tests (order creation)

### Web Tests
- `ProductCard.test.tsx` — 9 tests
- `MiniCart.test.tsx` — 9 tests
- `CartContext.test.tsx` — 6 tests
- `AuthContext.test.tsx` — 10 tests
- `CheckoutContext.test.tsx` — 13 tests
- `AddressForm.test.tsx` — 8 tests
- `ShippingMethodSelector.test.tsx` — 10 tests
- `OrderStatusBadge.test.tsx` — 10 tests
- `OrderCard.test.tsx` — 12 tests

### Running Tests

```bash
# Run all tests
npm test

# Run API tests only
npm run test:api
# or
npx turbo test --filter=api

# Run Web tests only
npm run test:web
# or
npx turbo test --filter=web

# Run tests in watch mode
cd apps/api && npm test -- --watch
cd apps/web && npm test

# Run tests with coverage
cd apps/api && npm test -- --coverage
cd apps/web && npm test -- --coverage
```

## Troubleshooting

### Docker Issues

**Containers won't start**
```bash
# Check Docker daemon is running
docker ps

# View container logs
docker compose logs -f

# Complete rebuild
docker compose down -v
docker compose build --no-cache
docker compose up
```

**Port conflicts (3000 or 8080 already in use)**
```bash
# Find process using port
lsof -i :3000
lsof -i :8080

# Kill process or change ports in docker-compose.yml
```

**Redis connection errors**
```bash
# Check Redis is running
docker compose ps

# Connect to Redis CLI
docker compose exec redis redis-cli
# Then in redis-cli: PING (should return PONG)
```

### API Issues

**401 Unauthorized errors**
- Check CT credentials in `apps/api/.env.local`
- Verify JWT token is present in requests
- Check token expiration (15d default)

**404 Not Found from CT**
- Verify CT project key is correct
- Check CT region matches (US by default)
- Ensure sample data is seeded (`node scripts/seed.js`)

**Empty product list**
```bash
# Seed sample data
cd scripts
cp .env.example .env
# Fill in CT credentials
node seed.js
```

### Build Issues

**Turbo build fails**
```bash
# Clear Turbo cache
npx turbo build --force

# Clear all caches and rebuild
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf .turbo apps/*/.turbo packages/*/.turbo
npm install
npx turbo build
```

**TypeScript errors**
```bash
# Run type check
npx turbo typecheck

# Check specific package
cd apps/web && npx tsc --noEmit
```

### Environment Variables

**Missing or invalid env vars**
```bash
# Check API env file exists
ls -la apps/api/.env.local

# Check web env file exists
ls -la apps/web/.env.local

# Copy examples if needed
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
```

### Common Fixes

**Clear all data and start fresh**
```bash
docker compose down -v
rm -rf apps/web/.next
npm run build
docker compose up --build
```

**Reset development environment**
```bash
# Stop everything
docker compose down -v

# Clean build artifacts
rm -rf apps/web/.next apps/api/dist

# Rebuild
docker compose build --no-cache
docker compose up
```

## API Endpoints

### Public Endpoints
```
GET    /health                        # Health check
GET    /products                      # List products (pagination, search, filters)
GET    /products/categories           # List categories
GET    /products/:slug                # Get product by slug
GET    /cart/session/current          # Get cart by session (X-Session-Id header)
POST   /cart/:id/items                # Add item to cart
PATCH  /cart/:id/items/:lineItemId    # Update line item quantity
DELETE /cart/:id/items/:lineItemId    # Remove line item
POST   /cart/:id/discount-codes       # Apply discount code
DELETE /cart/:id/discount-codes/:code # Remove discount code
POST   /cart/:id/shipping-address     # Set shipping address
POST   /cart/:id/billing-address      # Set billing address
GET    /cart/:id/shipping-methods     # Get available shipping methods
POST   /cart/:id/shipping-method      # Set shipping method
POST   /auth/register                 # Register new customer
POST   /auth/login                    # Login (returns JWT)
POST   /auth/forgot-password          # Request password reset token
POST   /auth/reset-password           # Reset password with token
```

### Protected Endpoints (require JWT)
```
GET    /auth/me                       # Get current customer
GET    /orders                        # List customer orders
GET    /orders/:id                    # Get order by ID
POST   /orders                        # Create order from cart
GET    /customers/:id                 # Get customer by ID
PATCH  /customers/:id                 # Update customer
POST   /customers/:id/addresses       # Add address
PATCH  /customers/:id/addresses/:addressId  # Update address
DELETE /customers/:id/addresses/:addressId  # Remove address
POST   /customers/:id/addresses/:addressId/default-shipping  # Set default shipping
POST   /customers/:id/addresses/:addressId/default-billing   # Set default billing
POST   /customers/:id/change-password # Change password
GET    /wishlist                      # Get customer wishlist
POST   /wishlist/items                # Add item to wishlist
DELETE /wishlist/items/:lineItemId   # Remove item from wishlist
GET    /wishlist/items/:productId     # Check if product is in wishlist
POST   /payments/checkout             # Process payment (mock PSP)
GET    /payments/:id                  # Get payment by ID
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
