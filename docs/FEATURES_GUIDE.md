# Features Guide — CT B2C Storefront

> Complete guide to all 7 B2C features implemented in the storefront.

---

## Feature 1: Products & Product Listing (PLP)

### Overview
Browse and search the entire product catalog with filtering, search, and pagination.

### User Flow
1. Customer lands on `/products` (PLP page)
2. Sees paginated grid of products (20 per page by default)
3. Can search by product name/description via search box
4. Can filter by category dropdown
5. Can paginate through results
6. Clicks product card to view details on PDP

### Key Components
- [ProductCard](COMPONENTS_REFERENCE.md#productcard) — Individual product summary
- [ProductGrid](COMPONENTS_REFERENCE.md#productgrid) — Responsive grid layout
- [ProductSearch](COMPONENTS_REFERENCE.md#productsearch) — Search input
- [CategoryFilter](COMPONENTS_REFERENCE.md#categoryfilter) — Category dropdown
- [Pagination](COMPONENTS_REFERENCE.md#pagination) — Page navigation

### API Endpoints
- `GET /api/v1/products` — List products with search, filter, pagination
- `GET /api/v1/products/categories` — List all categories (cached 10 min)

### Data Flow
```
Browser
  │
  ├─► Next.js RSC (page.tsx)
  │   └─► api-client.productsApi.list()
  │       └─► GET http://api:8080/api/v1/products?search=...&category=...&limit=...&offset=...
  │           (Server-side fetch via INTERNAL_API_URL)
  │
  └─► NestJS API
      └─► ProductsService
          ├─► Check Redis cache
          ├─► Fetch from CT SDK (if cache miss)
          └─► Return products
```

### Caching
- **Products list:** 5-min Redis cache
- **Categories:** 10-min Redis cache
- **Cache key:** `products:list:{search}:{category}:{limit}:{offset}`

### Testing
```bash
npm run test:api -- products.service.spec
npm run test:web -- ProductCard.test
```

---

## Feature 2: Product Detail Page (PDP)

### Overview
Display full product information with images, variants, availability, and add-to-cart.

### User Flow
1. Customer clicks product card on PLP
2. Navigates to `/products/:slug`
3. Sees full product details: images, variants, price, description
4. Selects variant (size, color, etc.)
5. Confirms availability
6. Adds to cart

### Key Components
- [ImageGallery](COMPONENTS_REFERENCE.md#imagegallery) — Image carousel with zoom
- [VariantSelector](COMPONENTS_REFERENCE.md#variantselector) — Size/color/etc selection
- [AddToCartButton](COMPONENTS_REFERENCE.md#addtocartbutton) — Add to cart action
- [ProductDetails](COMPONENTS_REFERENCE.md#productdetails) — Wrapper component
- [Breadcrumbs](COMPONENTS_REFERENCE.md#breadcrumbs) — Navigation

### API Endpoints
- `GET /api/v1/products/:slug` — Get single product by slug

### Data Flow
```
Browser (Next.js RSC)
  │
  ├─► ProductPage (app/products/[slug]/page.tsx)
  │   └─► api-client.productsApi.getBySlug('blue-sneakers')
  │       └─► GET http://api:8080/api/v1/products/blue-sneakers
  │           └─► Cache-aside using INTERNAL_API_URL
  │
  ├─► ProductDetails (use client)
  │   ├─► ImageGallery
  │   ├─► VariantSelector (hooks state)
  │   └─► AddToCartButton
  │       └─► CartContext.addItem()
  │           └─► POST /api/v1/cart/:id/line-items (browser fetch)
```

### Variant Management
- Each variant has unique SKU, attributes, and pricing
- Color variants show color swatches
- Out-of-stock variants are disabled
- Selected variant updates image and price

### Testing
```bash
npm run test:api -- products.service.spec
npm run test:web -- ImageGallery.test ProductDetails.test
```

---

## Feature 3: Shopping Cart

### Overview
Manage shopping cart with add, update, remove, and persistent session storage.

### User Flow
1. Customer adds product to cart (creates anonymous cart if needed)
2. Session ID saved to localStorage, mapped to cartId in Redis
3. Can view mini cart in header
4. Can view full cart page at `/cart`
5. Can update quantities, remove items
6. Can apply discount codes (pre-checkout)

### Key Components
- [MiniCart](COMPONENTS_REFERENCE.md#minicart) — Header cart dropdown
- [CartItem](COMPONENTS_REFERENCE.md#cartitem) — Single line item
- [CartSummary](COMPONENTS_REFERENCE.md#cartsummary) — Order summary
- [DiscountCodeInput](COMPONENTS_REFERENCE.md#discountcodeinput) — Discount code form

### API Endpoints
- `GET /api/v1/cart/session/current` — Get or create anonymous cart
- `POST /api/v1/cart/:id/line-items` — Add product to cart
- `PATCH /api/v1/cart/:id/line-items/:lineItemId` — Update line item quantity
- `DELETE /api/v1/cart/:id/line-items/:lineItemId` — Remove from cart
- `POST /api/v1/cart/:id/discount-codes` — Apply discount code
- `DELETE /api/v1/cart/:id/discount-codes/:code` — Remove discount code

### Session Model
```
Frontend (localStorage)
  ├─► session-id: UUID v4 (e.g., "550e8400-e29b-41d4-a716-446655440000")
  │
  └─► HTTP Request
      └─► X-Session-Id: 550e8400-e29b-41d4-a716-446655440000
          │
Backend (Redis)
  └─► session:550e8400-e29b-41d4-a716-446655440000 → cartId
      └─► TTL: 30 days
```

### Cart Context
```typescript
// AuthContext provides
{
  cart: Cart;
  addItem: (productId, variantId, quantity) => Promise<void>;
  updateQuantity: (lineItemId, quantity) => Promise<void>;
  removeItem: (lineItemId) => Promise<void>;
  applyDiscountCode: (code) => Promise<void>;
  removeDiscountCode: (code) => Promise<void>;
}
```

### On Login/Register
- Anonymous cart is merged with customer cart via CT `anonymousCartSignInMode: "MergeWithExistingCustomerCart"`
- Customer cart becomes the active cart
- Session ID is still used for session mapping

### Testing
```bash
npm run test:api -- cart.service.spec
npm run test:web -- CartItem.test MiniCart.test
```

---

## Feature 4: Authentication (Login/Register)

### Overview
Customer registration, login, password reset, and JWT-based session management.

### User Flow

#### Registration
1. Customer visits `/auth/register`
2. Fills email, password, first name, last name
3. Validates password strength
4. Submits — creates CT customer
5. Auto-logs in with JWT
6. Redirected to `/account` or referrer

#### Login
1. Customer visits `/auth/login`
2. Enters email and password
3. Submits — calls CT login() endpoint (admin API)
4. Receives JWT token
5. Token stored in localStorage + cookie
6. Redirected to `/account` or referrer

#### Forgot Password
1. Customer visits `/account/forgot-password`
2. Enters email
3. Receives password reset token
4. In dev mode, token is displayed in response
5. In prod, email sent with reset link

#### Reset Password
1. Customer visits `/account/reset-password?token=...`
2. Enters new password
3. Submits with token
4. Password updated in CT
5. Redirected to login page

### Key Components
- [LoginForm](COMPONENTS_REFERENCE.md#loginform) — Login form
- [RegisterForm](COMPONENTS_REFERENCE.md#registerform) — Registration form
- [UserMenu](COMPONENTS_REFERENCE.md#usermenu) — User dropdown in header

### API Endpoints
- `POST /api/v1/auth/login` — Authenticate with email/password
- `POST /api/v1/auth/register` — Create new customer
- `GET /api/v1/auth/me` — Get current authenticated customer (protected)
- `POST /api/v1/auth/forgot-password` — Request password reset
- `POST /api/v1/auth/reset-password` — Reset password with token

### JWT Flow
```
Register/Login
  │
  ├─► POST /api/v1/auth/login
  │   └─► NestJS generates JWT (HS256 algorithm)
  │       └─► Payload: { sub: customerId, customerId, iat, exp }
  │
  └─► Browser receives token
      ├─► localStorage['auth-token'] = token
      ├─► Cookie['auth-token'] = token (httpOnly in prod)
      │
      └─► AuthContext.login() triggers CartContext merge
          └─► Anonymous cart merges with customer cart (CT handles)
```

### Protected Routes
Routes require JWT in cookie (checked by next.js middleware.ts):
- `/account/*` — All account pages
- `/checkout/*` — Checkout pages
- `/api/v1/auth/me` — Auth API
- `/api/v1/orders/*` — Orders API
- `/api/v1/customers/*` — Customer API

### Testing
```bash
npm run test:api -- auth.service.spec auth.controller.spec
npm run test:web -- LoginForm.test RegisterForm.test
```

---

## Feature 5: Checkout (Multi-Step)

### Overview
Multi-step checkout flow: Address → Shipping → Review → Order.

### User Flow
1. Customer clicks "Proceed to Checkout" on cart page
2. **Step 1 — Address:** Enter shipping address
3. **Step 2 — Shipping:** Select shipping method (displays available methods + pricing)
4. **Step 3 — Review:** Review order details
5. **Place Order:** Creates order from cart, clears cart
6. **Confirmation:** Shows order number, details, next steps

### Key Components
- [CheckoutSteps](COMPONENTS_REFERENCE.md#checkoutsteps) — Step indicator
- [AddressForm](COMPONENTS_REFERENCE.md#addressform) — Address input
- [ShippingMethodSelector](COMPONENTS_REFERENCE.md#shippingmethodselector) — Shipping selection
- [OrderReview](COMPONENTS_REFERENCE.md#orderreview) — Final review
- [OrderConfirmation](COMPONENTS_REFERENCE.md#orderconfirmation) — Success screen

### API Endpoints
- `POST /api/v1/cart/:id/shipping-address` — Set shipping address
- `GET /api/v1/cart/:id/shipping-methods` — Get available shipping methods
- `POST /api/v1/cart/:id/shipping-method` — Select shipping method
- `POST /api/v1/orders` — Create order from cart

### Checkout Flow
```
CheckoutPage (use client)
  │
  ├─► CheckoutContext
  │   └─► Manages step state (1, 2, or 3)
  │
  ├─► Step 1: Address
  │   └─► AddressForm
  │       └─► POST /api/v1/cart/:id/shipping-address
  │           └─► NestJS validates address
  │
  ├─► Step 2: Shipping
  │   └─► ShippingMethodSelector
  │       ├─► GET /api/v1/cart/:id/shipping-methods
  │       │   └─► Returns CT shipping zones mapped to methods
  │       └─► POST /api/v1/cart/:id/shipping-method
  │
  └─► Step 3: Review
      └─► OrderReview
          └─► POST /api/v1/orders
              └─► CartService.createFromCart()
                  ├─► Validates address, shipping, items
                  ├─► Creates CT Order
                  └─► Returns order with number, status, items
```

### CheckoutContext
```typescript
{
  currentStep: 1 | 2 | 3;
  shippingAddress?: ShippingAddress;
  selectedShippingMethod?: ShippingMethod;
  
  setShippingAddress: (address) => Promise<void>;
  getShippingMethods: () => Promise<ShippingMethod[]>;
  selectShippingMethod: (methodId) => Promise<void>;
  placeOrder: () => Promise<Order>;
}
```

### Error Handling
- Address validation (required fields, postal code format)
- Shipping method selection (at least one method required)
- Order creation validation (checks items, address, method exist)
- Network error recovery (retry buttons)

### Testing
```bash
npm run test:api -- cart.service.spec orders.service.spec
npm run test:web -- AddressForm.test ShippingMethodSelector.test
```

---

## Feature 6: Order History & Details

### Overview
View all orders and order-specific details for authenticated customers.

### User Flow
1. Customer navigates to `/account/orders`
2. Sees list of all past orders
3. Each order shows: number, date, status, total, items preview
4. Clicks order to view `/account/orders/:id`
5. Sees full order details: all items, address, shipping method, payment status, etc.

### Key Components
- [OrderCard](COMPONENTS_REFERENCE.md#ordercard) — Order summary in list
- [OrderStatusBadge](COMPONENTS_REFERENCE.md#orderstatusbadge) — Colored status indicator

### API Endpoints
- `GET /api/v1/orders` — List orders for authenticated customer (protected)
- `GET /api/v1/orders/:id` — Get single order by ID (protected)

### Data Flow
```
OrdersPage (RSC, protected by middleware)
  │
  ├─► api-client.ordersApi.list(token)
  │   └─► GET http://api:8080/api/v1/orders?limit=20&offset=0
  │       │   (Server-side fetch, uses INTERNAL_API_URL)
  │       │
  │       └─► NestJS OrdersService.findByCustomerId(customerId)
  │           └─► Fetches from CT API
  │
  └─► OrderGrid
      └─► OrderCard[]
          └─► Each card links to /account/orders/:id
```

### Order Structure
```json
{
  "id": "order-id",
  "orderNumber": "ORD-00001",
  "customerId": "customer-id",
  "createdAt": "2026-02-25T10:30:00Z",
  "totalPrice": { "centAmount": 12999, "currencyCode": "USD" },
  "orderState": "Open",       // Open, Confirmed, Complete, Cancelled
  "paymentState": "Pending",  // Pending, Paid, Failed
  "shipmentState": "Pending", // Pending, Shipped, Delivered
  "lineItems": [...],
  "shippingAddress": {...},
  "shippingMethod": {...},
  "paymentInfo": {...}
}
```

### Order States

| State | Meaning |
|---|---|
| **Open** | Order created, not yet confirmed |
| **Confirmed** | Order confirmed, payment processing |
| **Complete** | Order delivered |
| **Cancelled** | Order cancelled |

### Testing
```bash
npm run test:api -- orders.service.spec orders.controller.spec
npm run test:web -- OrderCard.test OrderStatusBadge.test
```

---

## Feature 7: Category Pages & Homepage

### Overview
Homepage with hero section, featured categories, trending products. Category pages show filtered products.

### Homepage Flow
1. Customer visits `/`
2. Sees hero section with call-to-action
3. Sees featured categories as clickable cards
4. Sees trending/bestselling products
5. Newsletter signup section
6. Each section is clickable CTA to relevant product/category pages

### Category Pages Flow
1. Customer navigates to `/category/[...slug]` (nested slugs supported)
2. Sees category name and description
3. Sees all products in that category
4. Can use search/filter/pagination

### Key Components
- [HeroSection](COMPONENTS_REFERENCE.md#herosection) — Large banner
- [FeaturedCategories](COMPONENTS_REFERENCE.md#featuredcategories) — Category grid
- [TrendingProducts](COMPONENTS_REFERENCE.md#trendingproducts) — Best sellers carousel
- [NewsletterSignup](COMPONENTS_REFERENCE.md#newslettersignup) — Email signup
- [Header](COMPONENTS_REFERENCE.md#header) — Secondary navigation
- [Footer](COMPONENTS_REFERENCE.md#footer) — Site footer

### Route Structure
```
pages/
├── page.tsx                    # Homepage
├── (store)/
│   ├── category/
│   │   └── [...slug]/
│   │       └── page.tsx        # Category page (supports nested slugs)
│   └── products/
│       ├── page.tsx            # PLP
│       └── [slug]/
│           └── page.tsx        # PDP
```

### API Endpoints
- `GET /api/v1/products/categories` — Categories for homepage
- `GET /api/v1/products?category=...` — Products for category page

### Data Flow
```
Homepage (RSC)
  │
  ├─► Pre-fetched categories + products from API
  │   └─► Cache-aside (10 min categories, 5 min products)
  │
  ├─► HeroSection (static or dynamic)
  ├─► FeaturedCategories
  └─► TrendingProducts
```

### Responsive Design
- Mobile: Stacked layout, single-column
- Tablet: 2-column grid
- Desktop: 3-4 column grid
- Hero: Full width, responsive image sizing

### Theme Support
- Light mode: White background, dark text, indigo accents
- Dark mode: Dark background, light text, indigo accents
- Toggle in header, persists to localStorage
- No flash on page load (inline script in root layout)

### Testing
```bash
npm run test:web -- HeroSection.test FeaturedCategories.test
```

---

## Additional Features (Beyond 7)

### Wishlist
Save favorite products to personal wishlist using CT Shopping Lists API.

**Routes:**
- `/account/wishlist` — View wishlist
- Add/remove buttons on product cards

**API Endpoints:**
- `GET /api/v1/wishlist` — Get customer wishlist
- `POST /api/v1/wishlist/items` — Add product
- `DELETE /api/v1/wishlist/items/:productId` — Remove product

---

### Discount Codes
Apply multiple discount codes during checkout.

**Features:**
- Apply code from cart page
- View applied codes with remove buttons
- Real-time validation
- Error feedback

**API Endpoints:**
- `POST /api/v1/cart/:id/discount-codes` — Apply code
- `DELETE /api/v1/cart/:id/discount-codes/:code` — Remove code

---

### Customer Addresses
Manage multiple shipping/billing addresses.

**Routes:**
- `/account/addresses` — View and manage addresses
- Edit/delete/set-as-default buttons

**API Endpoints:**
- `GET /api/v1/auth/me` — Addresses in customer object
- `POST /api/v1/customers/:id/addresses` — Add address
- `DELETE /api/v1/customers/:id/addresses/:addressId` — Remove address

---

### Customer Profile
View and edit customer information (name, email, etc.).

**Routes:**
- `/account/profile` — View and edit profile

**Features:**
- Display current customer data
- Edit name/email (CT update)
- Show all saved addresses
- Display account creation date

---

## Testing All Features

```bash
# Run all tests
npm test

# Run by feature
npm run test:api -- products.service.spec    # Feature 1
npm run test:api -- cart.service.spec        # Feature 3
npm run test:api -- auth.service.spec        # Feature 4
npm run test:api -- orders.service.spec      # Feature 6

npm run test:web -- ProductCard.test         # Feature 1/2
npm run test:web -- CartItem.test            # Feature 3
npm run test:web -- LoginForm.test           # Feature 4
npm run test:web -- AddressForm.test         # Feature 5
npm run test:web -- OrderCard.test           # Feature 6
```

---

## Feature Checklist

- [x] Feature 1: Products & PLP
- [x] Feature 2: Product Detail Page
- [x] Feature 3: Shopping Cart
- [x] Feature 4: Authentication
- [x] Feature 5: Multi-Step Checkout
- [x] Feature 6: Order History & Details
- [x] Feature 7: Category Pages & Homepage
- [x] Additional: Wishlist
- [x] Additional: Discount Codes
- [x] Additional: Customer Addresses
- [x] Additional: Customer Profile
- [x] UI/UX: Dark Mode & Theming
- [x] UI/UX: Responsive Design
- [x] Unit Testing: 151 tests (64 API + 87 Web)

---

*Last updated: 2026-02-25*

