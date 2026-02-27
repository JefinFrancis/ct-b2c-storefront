# Architecture & Patterns Guide — CT B2C Storefront

> Deep dive into architectural decisions, patterns, and design principles.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Monorepo Structure](#monorepo-structure)
3. [Core Patterns](#core-patterns)
4. [Data Flow](#data-flow)
5. [Authentication & Authorization](#authentication--authorization)
6. [Caching Strategy](#caching-strategy)
7. [Error Handling](#error-handling)
8. [Security Considerations](#security-considerations)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Global Users                             │
└────────────┬────────────────────────────────────┬────────────┘
             │                                    │
         Browser                            CDN Cache
             │                                    │
    ┌────────▼──────────┐                 ┌─────▼──────────┐
    │  Next.js Frontend  │                 │   Cloud CDN    │
    │  (port 3000)       │◄────Cache────┤  (global edge)  │
    └────────┬──────────┘                 └────────────────┘
             │
      Server-side fetch
      (RSC data loading)
             │
    ┌────────▼──────────┐
    │  NestJS API        │
    │  (port 8080)       │
    │  (internal-only)   │
    └────────┬──────────┘
             │
    ┌────────┴──────────────┬─────────────┐
    │                       │             │
┌───▼───────┐      ┌────────▼─────┐  ┌──▼──────────┐
│  CT API   │      │  Redis Cache │  │  Secret Mgr│
│(external) │      │  (Upstash)   │  │ (GCP)      │
└───────────┘      └──────────────┘  └────────────┘
```

### Architectural Principles

#### 1. **Monorepo with Clear Boundaries**
- Single Git repository, multiple independent services
- Shared types and config via packages (types/, config/, eslint-config/)
- Each app has its own `package.json`, `Dockerfile`, .env
- Turborepo orchestrates builds and tests

#### 2. **API-Centric Commerce Logic**
- **All CT SDK calls live in NestJS backend only**
- Frontend never imports or calls CT directly
- Frontend calls HTTP API which wraps CT
- Credentials stay on backend, never exposed to browser

#### 3. **Stateless Services**
- Both web and API are stateless
- Redis handles session-to-cartId mapping (TTL-based)
- Stateful data lives in CT platform

#### 4. **Server-Driven, Cache-Aware**
- Next.js Server Components (RSC) by default
- Server-side data fetching reduces JavaScript
- Redis cache-aside pattern for frequently accessed data
- Cloud CDN caches static assets

#### 5. **Zero Trust Security**
- JWT tokens in HTTP-only cookies (server-side reads)
- Tokens in localStorage (client-side JavaScript only when needed)
- Protected routes enforce JWT with middleware + guards
- Secret Manager for sensitive values in production

---

## Monorepo Structure

### Layout

```
ct-b2c-storefront/
├── apps/
│   ├── api/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/                 # JWT auth, login, register
│   │   │   ├── cart/                 # Cart CRUD, shipping, billing
│   │   │   ├── commercetools/        # CT SDK wrapper (ONLY place CT is imported)
│   │   │   ├── customers/            # Customer CRUD, addresses
│   │   │   ├── health/               # K8s health probe
│   │   │   ├── orders/               # Order creation, history
│   │   │   ├── payments/             # PSP integration
│   │   │   ├── products/             # Product catalog (cached)
│   │   │   ├── redis/                # Redis service (env-aware)
│   │   │   ├── wishlist/             # CT Shopping Lists wrapper
│   │   │   ├── app.module.ts
│   │   │   └── main.ts               # Entry point, config
│   │   ├── Dockerfile                # Multi-stage build
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                          # Next.js 15 frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx           # Homepage
│       │   │   ├── layout.tsx         # Root layout, providers
│       │   │   ├── middleware.ts      # Route protection
│       │   │   └── (store)/           # Storefront routes
│       │   │       ├── products/      # PLP, PDP
│       │   │       ├── category/[...slug]/
│       │   │       ├── cart/
│       │   │       ├── checkout/
│       │   │       └── account/       # Protected routes
│       │   ├── components/
│       │   │   ├── layout/            # Header, Footer, ThemeToggle
│       │   │   ├── products/          # Product-specific components
│       │   │   ├── cart/              # Cart components
│       │   │   ├── checkout/          # Checkout flow
│       │   │   ├── orders/            # Order display
│       │   │   ├── auth/              # Login, register forms
│       │   │   └── home/              # Homepage sections
│       │   ├── contexts/              # React Contexts
│       │   │   ├── AuthContext.tsx    # Auth state
│       │   │   ├── CartContext.tsx    # Cart state
│       │   │   └── CheckoutContext.tsx # Checkout flow
│       │   ├── lib/
│       │   │   ├── api-client.ts      # Single HTTP client
│       │   │   ├── format-price.ts
│       │   │   └── hooks/             # Custom hooks
│       │   └── types/                 # Type definitions
│       ├── public/                    # Static assets
│       ├── Dockerfile
│       ├── next.config.ts
│       ├── package.json
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
├── packages/                         # Shared code
│   ├── types/                        # @ct-b2c/types
│   │   └── src/
│   │       ├── product.ts
│   │       ├── cart.ts
│   │       ├── order.ts
│   │       ├── customer.ts
│   │       └── ...
│   ├── config/                       # @ct-b2c/config
│   │   └── src/
│   │       ├── env.ts                # Zod schemas
│   │       └── constants.ts
│   └── eslint-config/                # @ct-b2c/eslint-config
│       ├── base.js
│       ├── next.js
│       └── nest.js
│
├── scripts/                          # Utility scripts
│   └── seed.js                       # CT sample data seeding
│
├── docker-compose.yml                # Local dev environment
├── turbo.json                        # Turborepo config
├── tsconfig.base.json                # Shared TypeScript config
└── package.json                      # Root workspace config
```

---

## Core Patterns

### 1. Dependency Injection (NestJS)

Every service follows NestJS DI pattern:

```typescript
// Module
@Module({
  imports: [CommercetoolsModule, RedisModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}

// Service with dependencies injected
@Injectable()
export class ProductsService {
  constructor(
    private readonly ctService: CommercetoolsService,
    private readonly redisService: RedisService,
  ) {}

  async list(params: ListProductsDto) {
    const cacheKey = `products:list:${JSON.stringify(params)}`;
    
    // Try cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    // Fetch from CT
    const products = await this.ctService.getProducts(params);
    
    // Store in cache
    await this.redisService.set(cacheKey, JSON.stringify(products), {
      EX: 300, // 5 minutes
    });
    
    return products;
  }
}

// Controller returning service result
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  list(@Query() query: ListProductsDto) {
    return this.service.list(query);
  }
}
```

### 2. React Contexts for Client State

AuthContext and CartContext manage client-side state without Redux:

```typescript
// AuthContext
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { token, customer } = await response.json();
    
    setToken(token);
    setCustomer(customer);
    localStorage.setItem('auth-token', token);
    
    // Trigger cart merge via CartContext
  };

  return (
    <AuthContext.Provider value={{ customer, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Usage in component ("use client")
function UserMenu() {
  const { customer, logout } = useContext(AuthContext);
  if (!customer) return <LoginLink />;
  
  return (
    <div>
      <p>Hello, {customer.firstName}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Cache-Aside Pattern (Redis)

Every read operation checks cache first:

```typescript
async function getProduct(slug: string) {
  const cacheKey = `products:slug:${slug}`;
  
  // Step 1: Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Step 2: Cache miss — fetch from CT
  const product = await ctService.getProductBySlug(slug);
  
  // Step 3: Store in cache (5 min TTL)
  await redis.set(cacheKey, JSON.stringify(product), { EX: 300 });
  
  // Step 4: Return
  return product;
}
```

### 4. Session-Based Cart Mapping

Anonymous carts use session IDs:

```typescript
// Frontend: Generate session ID on first visit
const sessionId = localStorage.getItem('session-id') || uuidv4();
localStorage.setItem('session-id', sessionId);

// API call includes session header
fetch('/api/v1/cart/session/current', {
  headers: { 'X-Session-Id': sessionId },
});

// Backend: Map session to cartId in Redis
async getOrCreateCartForSession(sessionId: string) {
  // Step 1: Check if session → cartId mapping exists in Redis
  let cartId = await redis.get(`session:${sessionId}`);
  
  if (!cartId) {
    // Step 2: Create new anonymous cart
    const newCart = await ctService.createCart();
    cartId = newCart.id;
    
    // Step 3: Store mapping in Redis (30-day TTL)
    await redis.set(`session:${sessionId}`, cartId, { EX: 2592000 });
  }
  
  return ctService.getCart(cartId);
}
```

### 5. Server Components for Data Fetching

Next.js RSC reduces JavaScript and fetches on server:

```typescript
// app/(store)/products/page.tsx — Server Component (no "use client")
import { apiClient } from '@/lib/api-client';

export default async function ProductListPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; page?: string };
}) {
  // Fetch on server (INTERNAL_API_URL)
  const products = await apiClient.productsApi.list({
    search: searchParams.search,
    category: searchParams.category,
    limit: 20,
    offset: (parseInt(searchParams.page) - 1) * 20,
  });

  return (
    <>
      <h1>Products</h1>
      <ProductGrid products={products.results} />
      <Pagination 
        currentPage={parseInt(searchParams.page) || 1}
        totalPages={Math.ceil(products.total / 20)}
      />
    </>
  );
}
```

---

## Data Flow

### Authentication Flow

```
User Input (Login Form)
  │
  ├─► POST /api/v1/auth/login
  │   └─► NestJS AuthService
  │       ├─► Call CT login() endpoint
  │       ├─► Generate JWT token
  │       └─► Return { token, customer }
  │
  ├─► Browser stores:
  │   ├─► localStorage['auth-token'] = token
  │   └─► HttpOnly cookie['auth-token'] = token
  │
  ├─► CartContext triggered:
  │   └─► Merge anonymous cart with customer cart
  │       (CT handles via anonymousCartSignInMode)
  │
  └─► Redirect to /account (protected by middleware)
```

### Product Listing Flow

```
User visits /products?search=shoes
  │
  ├─► Next.js RSC (page.tsx)
  │   ├─► Calls apiClient.productsApi.list({ search: 'shoes' })
  │   │   └─► Server-side fetch to INTERNAL_API_URL
  │   │
  │   └─► NestJS GET /api/v1/products?search=shoes
  │       │
  │       ├─► ProductsService.list()
  │       │   ├─► Check Redis cache (key: products:list:search:shoes:...)
  │       │   │   ├─► Cache hit → Return cached products
  │       │   │   └─► Cache miss → Fetch from CT
  │       │   │       └─► Store in Redis (5 min TTL)
  │       │   │
  │       │   └─► Return products.json
  │       │
  │       └─► Response sent to browser
  │
  └─► ProductCard components rendered
      └─► No JavaScript needed (RSC, no "use client")
```

### Add to Cart Flow

```
User clicks Add to Cart button
  │
  ├─► "use client" AddToCartButton component
  │   ├─► CartContext.addItem(productId, variantId, quantity)
  │   │   └─► Calls imageapi via api-client HTTP client
  │   │       (Browser-side fetch to NEXT_PUBLIC_API_URL)
  │   │
  │   └─► POST /api/v1/cart/:cartId/line-items
  │       │   (Header: X-Session-Id or Authorization for auth carts)
  │       │
  │       ├─► NestJS CartService.addLineItemToCart()
  │       │   ├─► Call CT API to update cart
  │       │   ├─► Invalidate cache: del shipping:{cartId}
  │       │   └─► Return updated cart.json
  │       │
  │       └─► CartContext updates state
  │           ├─► MiniCart shows updated count
  │           └─► Toast notification "Added to cart"
```

---

## Authentication & Authorization

### JWT Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "customer-id-123",
    "customerId": "customer-id-123",
    "iat": 1677000000,
    "exp": 1677003600
  },
  "signature": "HS256(header.payload, secret)"
}
```

### Protected Routes

**Backend (NestJS):**
```typescript
@UseGuards(JwtAuthGuard)
@Get('/auth/me')
getMe(@Request() req) {
  return req.user; // Contains { customerId }
}
```

**Frontend (Next.js):**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  
  if (!token && request.nextUrl.pathname.startsWith('/account')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*'],
};
```

---

## Caching Strategy

### Cache Tiers

| Layer | Tool | Duration | Data |
|---|---|---|---|
| **Global CDN** | Cloud CDN | 1 hour | Static assets (JS, CSS, images) |
| **Application Cache** | Redis | 5-15 min | Products, categories, shipping methods |
| **Browser Cache** | HTTP headers | 1 day | Static assets, API responses |

### Cache Invalidation

```typescript
// When product inventory changes:
async updateProduct(productId: string) {
  // Update in CT
  await ctService.updateProduct(productId);
  
  // Invalidate all product caches
  await redisService.del('products:list:*');         // All lists
  await redisService.del(`products:slug:*`);        // All slugs
  await redisService.del(`products:${productId}`);  // Specific
}

// When cart changes:
async addLineItem(cartId: string) {
  // Update in CT
  const cart = await ctService.addLineItem(cartId);
  
  // Invalidate shipping methods for this cart
  await redisService.del(`shipping:${cartId}`);
  
  return cart;
}
```

---

## Error Handling

### API Error Response Format

```json
{
  "statusCode": 400,
  "message": "Cart is missing shipping address",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|---|---|---|
| 200 | Success | Product list returned |
| 201 | Created | Order created |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing JWT |
| 404 | Not Found | Product doesn't exist |
| 409 | Conflict | Email already registered |
| 422 | Validation Error | Password too weak |
| 500 | Server Error | Unexpected exception |

### Frontend Error Handling

```typescript
try {
  await cartContext.addItem(productId, variantId);
  // Show toast: "Added to cart"
} catch (error) {
  if (error.statusCode === 400) {
    // Show: "Please select a valid variant"
  } else if (error.statusCode === 401) {
    // Redirect to login
  } else {
    // Show generic: "Something went wrong"
  }
}
```

---

## Security Considerations

### 1. Credentials
- CT credentials stored in backend `.env` only
- Frontend never directly imports CT SDK
- Secrets stored in GCP Secret Manager (production)

### 2. JWT Tokens
- Signed with HS256 algorithm
- Stored in HTTP-only cookies (production)
- Stored in localStorage (client JS when needed)
- 1-hour expiration (configurable)
- Refreshed via login endpoint

### 3. CORS
- Backend configured with specific allowed origins
- Local dev: `http://localhost:3000`
- Production: `https://yourdomain.com`

### 4. HTTPS
- All production traffic via HTTPS
- Cloud Run + Cloud CDN force HTTPS
- HTTP redirected to HTTPS

### 5. Rate Limiting
- Ready for `@nestjs/throttler` Redis-based throttling
- Can limit login attempts, API calls per minute

### 6. Input Validation
- Zod schemas on all DTO inputs
- Server-side validation (never trust client)
- Sanitized email, password, address inputs

---

## Scalability Considerations

### Horizontal Scaling
- Stateless services scale horizontally
- Redis (Upstash) shared across instances
- CT API rate limits: 300 req/sec per project

### Database Pressure
- Cache-aside reduces CT API calls by 80%+
- Upstash Redis handled automatic failover
- CT project can support 100K+ concurrent carts

### Front-End Performance
- Cloud CDN caches assets globally
- Next.js Image component optimizes images
- RSA reduces JavaScript bundle by 60%+
- Lazy loading for routes and components

### Monitoring
- Cloud Run: CPU, memory, request count
- CloudWatch: Logs for errors and slow queries
- Datadog/New Relic: Optional APM integration

---

*Last updated: 2026-02-25*

