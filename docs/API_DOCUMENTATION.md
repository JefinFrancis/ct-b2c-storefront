# API Documentation — CT B2C Storefront

> Complete reference for the NestJS API at `apps/api`

## Overview

The NestJS API serves as the single backend for the CT B2C Storefront. All commercetools SDK calls are isolated here — the frontend never accesses CT directly.

| Property | Value |
|---|---|
| **Base URL (local dev)** | `http://localhost:8080` |
| **Base URL (server-side fetch)** | `http://api:8080` (Docker) |
| **Base URL (production)** | Cloud Run `api` service (internal-only) |
| **API Prefix** | `/api/v1` |
| **Authentication** | JWT (Bearer token) |
| **Cache Backend** | Redis (ioredis local, Upstash prod) |

---

## Authentication

### JWT Strategy

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

**Token Claims:**
```json
{
  "sub": "<customer-id>",
  "customerId": "<customer-id>",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Token Storage (Frontend):**
- localStorage key: `auth-token`
- Cookie name: `auth-token` (httpOnly, secure in production)
- Cookie TTL: matches token expiration

### Protected Routes

All endpoints under `/api/v1/auth/me`, `/api/v1/orders`, `/api/v1/customers`, `/api/v1/cart/:id/checkout` require `JwtAuthGuard`.

---

## Endpoints

### Health

#### `GET /health`
LivenessProbe endpoint for Cloud Run deployments.

**Response:**
```json
{
  "status": "ok"
}
```

---

### Products

#### `GET /api/v1/products`
List products with optional search, filters, and pagination.

**Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `search` | string | - | Search product name/description |
| `category` | string | - | Filter by category slug |
| `limit` | number | 20 | Items per page |
| `offset` | number | 0 | Pagination offset |
| `sort` | string | `createdAt desc` | Sort field and order |

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": "product-id",
      "key": "product-key",
      "slug": "product-slug",
      "name": "Product Name",
      "description": "...",
      "price": {
        "centAmount": 1999,
        "currencyCode": "USD"
      },
      "image": "https://...",
      "variants": [
        {
          "id": 1,
          "sku": "SKU-123",
          "attributes": { "size": "M", "color": "Red" },
          "isAvailable": true
        }
      ]
    }
  ],
  "total": 127,
  "limit": 20,
  "offset": 0
}
```

**Cache:** 5-min Redis cache on `products:list:{search}:{category}:{limit}:{offset}`

---

#### `GET /api/v1/products/:slug`
Get a single product by slug.

**Response (200 OK):**
```json
{
  "id": "product-id",
  "key": "product-key",
  "slug": "product-slug",
  "name": "Product Name",
  "description": "...",
  "price": { "centAmount": 1999, "currencyCode": "USD" },
  "images": [
    { "url": "https://..." },
    { "url": "https://..." }
  ],
  "variants": [
    {
      "id": 1,
      "sku": "SKU-123",
      "attributes": { "size": "M", "color": "Red" },
      "isAvailable": true,
      "prices": [
        { "value": { "centAmount": 1999, "currencyCode": "USD" } }
      ]
    }
  ],
  "categoryIds": ["category-1", "category-2"]
}
```

**Cache:** 5-min Redis cache on `products:slug:{slug}`

---

#### `GET /api/v1/products/categories`
List all product categories.

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": "category-id",
      "key": "category-key",
      "slug": "category-slug",
      "name": "Category Name",
      "description": "...",
      "parentId": null,
      "children": [...]
    }
  ],
  "total": 42
}
```

**Cache:** 10-min Redis cache on `categories:all`

---

### Authentication

#### `POST /api/v1/auth/login`
Authenticate a customer with email and password.

**Request:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "customer": {
    "id": "customer-id",
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Responses:**
- `401 Unauthorized` — Invalid credentials
- `400 Bad Request` — Missing email/password

---

#### `POST /api/v1/auth/register`
Create a new customer account.

**Request:**
```json
{
  "email": "newcustomer@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "customer": {
    "id": "customer-id",
    "email": "newcustomer@example.com",
    "firstName": "Jane",
    "lastName": "Smith"
  }
}
```

**Error Responses:**
- `400 Bad Request` — Email already exists or validation failed
- `409 Conflict` — Customer with email already registered

---

#### `GET /api/v1/auth/me`
Get current authenticated customer.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "id": "customer-id",
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "addresses": [
    {
      "id": "address-id",
      "firstName": "John",
      "lastName": "Doe",
      "streetName": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US",
      "isDefaultShippingAddress": true
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` — Missing or invalid token

---

#### `POST /api/v1/auth/forgot-password`
Request a password reset token.

**Request:**
```json
{
  "email": "customer@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If an account exists, a reset link has been sent."
}
```

> **Note:** Returns success regardless of account existence (security best practice).
> In development, the token is echoed in response for testing.

---

#### `POST /api/v1/auth/reset-password`
Reset password with token.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword456!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully."
}
```

**Error Responses:**
- `400 Bad Request` — Invalid or expired token
- `422 Unprocessable Entity` — Password validation failed

---

### Cart

#### `GET /api/v1/cart/session/current`
Get or create an anonymous cart for a session.

**Headers:**
```
X-Session-Id: <uuid-v4>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "id": "cart-id",
  "customerId": null,
  "lineItems": [
    {
      "id": "line-item-id",
      "productId": "product-id",
      "variantId": 1,
      "name": "Product Name",
      "quantity": 2,
      "price": { "centAmount": 1999, "currencyCode": "USD" }
    }
  ],
  "subtotal": { "centAmount": 3998, "currencyCode": "USD" },
  "discountCodes": ["SUMMER20"],
  "shippingAddress": null,
  "shippingMethod": null,
  "version": 1
}
```

---

#### `POST /api/v1/cart/:id/line-items`
Add a product variant to cart.

**Request:**
```json
{
  "productId": "product-id",
  "variantId": 1,
  "quantity": 2
}
```

**Response (200 OK):** Updated cart object (see above).

---

#### `PATCH /api/v1/cart/:id/line-items/:lineItemId`
Update quantity of a line item.

**Request:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):** Updated cart object.

---

#### `DELETE /api/v1/cart/:id/line-items/:lineItemId`
Remove a line item from cart.

**Response (200 OK):** Updated cart object.

---

#### `POST /api/v1/cart/:id/shipping-address`
Set shipping address for cart.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "streetName": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "US"
}
```

**Response (200 OK):** Updated cart object with shippingAddress.

---

#### `GET /api/v1/cart/:id/shipping-methods`
Get available shipping methods for cart's address.

**Response (200 OK):**
```json
{
  "shippingMethods": [
    {
      "id": "shipping-method-id",
      "name": "Standard Shipping",
      "description": "5-7 business days",
      "price": { "centAmount": 500, "currencyCode": "USD" }
    }
  ]
}
```

---

#### `POST /api/v1/cart/:id/shipping-method`
Select a shipping method for cart.

**Request:**
```json
{
  "shippingMethodId": "shipping-method-id"
}
```

**Response (200 OK):** Updated cart object with shippingMethod.

---

#### `POST /api/v1/cart/:id/discount-codes`
Apply a discount code to cart.

**Request:**
```json
{
  "code": "SUMMER20"
}
```

**Response (200 OK):** Updated cart object with discountCodes.

---

#### `DELETE /api/v1/cart/:id/discount-codes/:code`
Remove a discount code from cart.

**Response (200 OK):** Updated cart object.

---

### Orders

#### `GET /api/v1/orders`
List orders for authenticated customer.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | number | 20 | Items per page |
| `offset` | number | 0 | Pagination offset |

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": "order-id",
      "orderNumber": "ORD-00001",
      "customerId": "customer-id",
      "createdAt": "2026-02-25T10:30:00Z",
      "totalPrice": { "centAmount": 12999, "currencyCode": "USD" },
      "orderState": "Open",
      "paymentState": "Pending",
      "shipmentState": "Pending",
      "lineItems": [
        {
          "id": "line-item-id",
          "productName": "Product Name",
          "quantity": 2,
          "price": { "centAmount": 1999, "currencyCode": "USD" }
        }
      ]
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

#### `POST /api/v1/orders`
Create an order from cart.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "cartId": "cart-id"
}
```

**Response (201 Created):**
```json
{
  "id": "order-id",
  "orderNumber": "ORD-00001",
  "customerId": "customer-id",
  "createdAt": "2026-02-25T10:30:00Z",
  "totalPrice": { "centAmount": 12999, "currencyCode": "USD" },
  "orderState": "Open",
  "paymentState": "Pending",
  "shipmentState": "Pending",
  "lineItems": [...]
}
```

**Error Responses:**
- `400 Bad Request` — Cart missing address or shipping method
- `422 Unprocessable Entity` — Cart has no line items

---

#### `GET /api/v1/orders/:id`
Get order details by ID.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):** Full order object (see POST /api/v1/orders response).

---

### Customers

#### `GET /api/v1/customers/:id`
Get customer by ID (authenticated only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "id": "customer-id",
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "addresses": [...]
}
```

---

#### `POST /api/v1/customers/:id/addresses`
Add a new address to customer.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "streetName": "456 Oak Ave",
  "city": "Boston",
  "state": "MA",
  "postalCode": "02101",
  "country": "US",
  "isDefaultShippingAddress": false
}
```

**Response (201 Created):** Updated customer object with new address.

---

#### `DELETE /api/v1/customers/:id/addresses/:addressId`
Delete a customer address.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):** Updated customer object.

---

### Wishlist

#### `GET /api/v1/wishlist`
Get current customer's wishlist.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "id": "wishlist-id",
  "name": "My Wishlist",
  "lineItems": [
    {
      "id": "line-item-id",
      "productId": "product-id",
      "productName": "Product Name"
    }
  ]
}
```

---

#### `POST /api/v1/wishlist/items`
Add product to wishlist.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "productId": "product-id"
}
```

**Response (200 OK):** Updated wishlist object.

---

#### `DELETE /api/v1/wishlist/items/:productId`
Remove product from wishlist.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):** Updated wishlist object.

---

## Error Responses

All endpoints follow standard HTTP status codes and return errors in this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

| Status | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created successfully |
| `400 Bad Request` | Invalid request parameters or body |
| `401 Unauthorized` | Missing or invalid authentication |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Resource already exists (e.g., duplicate email) |
| `422 Unprocessable Entity` | Validation failed |
| `500 Internal Server Error` | Server error |

---

## Pagination

List endpoints support cursor-based and offset-based pagination:

**Query Parameters:**
- `limit` (default: 20) — items per page
- `offset` (default: 0) — pagination offset

**Response:**
```json
{
  "results": [...],
  "total": 127,
  "limit": 20,
  "offset": 0
}
```

---

## Rate Limiting

Currently no rate limiting. Ready for future Redis-based rate limiting using `@nestjs/throttler`.

---

## Caching Strategy

### Cache-Aside Pattern

All read operations follow the cache-aside pattern:

1. **Check cache** — Redis GET on cache key
2. **Cache miss** — Fetch from CT API
3. **Store in cache** — Redis SET with TTL
4. **Return result** — Send to client

### Cache Keys & TTLs

| Resource | Key Pattern | TTL |
|---|---|---|
| Products list | `products:list:{search}:{category}:{limit}:{offset}` | 5 min |
| Product by slug | `products:slug:{slug}` | 5 min |
| Categories | `categories:all` | 10 min |
| Shipping methods | `shipping:{cartId}` | 15 min |
| Customer | `customer:{customerId}` | 5 min |

### Cache Invalidation

- **Add to cart** — Invalidate `shipping:{cartId}`
- **Update order** — Invalidate `customer:{customerId}`
- **Update product** → Invalidate `products:*` (wildcard)

---

## Module Architecture

```
apps/api/src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── guards/
│       └── jwt-auth.guard.ts
│
├── cart/
│   ├── cart.module.ts
│   ├── cart.service.ts
│   ├── cart.controller.ts
│   └── dto/
│       ├── create-line-item.dto.ts
│       └── set-shipping-address.dto.ts
│
├── commercetools/
│   ├── commercetools.module.ts
│   └── commercetools.service.ts  ← ONLY place CT SDK is imported
│
├── customers/
│   ├── customers.module.ts
│   ├── customers.service.ts
│   ├── customers.controller.ts
│   └── dto/
│       └── create-address.dto.ts
│
├── orders/
│   ├── orders.module.ts
│   ├── orders.service.ts
│   ├── orders.controller.ts
│   └── dto/
│       └── create-order.dto.ts
│
├── products/
│   ├── products.module.ts
│   ├── products.service.ts
│   ├── products.controller.ts
│   └── dto/
│       └── list-products.dto.ts
│
├── redis/
│   ├── redis.module.ts
│   └── redis.service.ts  ← Env-aware (ioredis vs Upstash)
│
├── wishlist/
│   ├── wishlist.module.ts
│   ├── wishlist.service.ts
│   └── wishlist.controller.ts
│
├── app.module.ts
└── main.ts
```

---

## Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing documentation.

Run API tests:
```bash
npm run test:api
```

---

## Environment Variables

See `apps/api/.env.example` for required variables:

```bash
# CT credentials
CTP_PROJECT_KEY=
CTP_CLIENT_ID=
CTP_CLIENT_SECRET=
CTP_AUTH_URL=
CTP_API_URL=
CTP_SCOPES=

# Redis
REDIS_URL=redis://redis:6379

# Server
PORT=8080
ALLOWED_ORIGIN=http://localhost:3000
```

