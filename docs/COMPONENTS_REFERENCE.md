# Component Reference — CT B2C Storefront

> Complete reference for all React components in the frontend.

---

## Layout Components

### Header
**Location:** `apps/web/src/components/layout/Header.tsx`

Main navigation header with logo, navigation links, search, and user menu.

**Props:**
```typescript
interface HeaderProps {
  // No props — uses AuthContext, CartContext, and ThemeToggle internally
}
```

**Features:**
- Logo with home link
- Navigation links (Products, Category, Account)
- Search input (client-side redirect to PLP with search param)
- MiniCart dropdown
- UserMenu (login/logout/account links)
- ThemeToggle (dark/light mode)

**Usage:**
```tsx
<Header />
```

---

### Footer
**Location:** `apps/web/src/components/layout/Footer.tsx`

Site footer with links, copyright, and company info.

**Props:**
```typescript
interface FooterProps {
  // No props
}
```

**Usage:**
```tsx
<Footer />
```

---

### ThemeToggle
**Location:** `apps/web/src/components/layout/ThemeToggle.tsx`

Dark/light mode toggle button. Uses Tailwind's `darkMode: 'class'` and CSS custom properties.

**Props:**
```typescript
interface ThemeToggleProps {
  // No props — manages theme via document.documentElement.classList
}
```

**Features:**
- Persists to localStorage (`theme` key)
- No flash on page load (inline script in root layout)
- Icon switch (sun/moon)

**Usage:**
```tsx
<ThemeToggle />
```

---

### Breadcrumbs
**Location:** `apps/web/src/components/layout/Breadcrumbs.tsx`

Navigation breadcrumbs for product and category pages.

**Props:**
```typescript
interface Breadcrumb {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
}
```

**Usage:**
```tsx
<Breadcrumbs 
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Shoes', href: '/products?category=shoes' }
  ]} 
/>
```

---

## Product Components

### ProductCard
**Location:** `apps/web/src/components/products/ProductCard.tsx`

Displays a single product summary with image, name, price, and link.

**Props:**
```typescript
interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: {
    centAmount: number;
    currencyCode: string;
  };
  image?: string;
}
```

**Usage:**
```tsx
<ProductCard
  id="product-123"
  slug="blue-sneakers"
  name="Blue Sneakers"
  price={{ centAmount: 9999, currencyCode: 'USD' }}
  image="https://example.com/image.png"
/>
```

---

### ProductGrid
**Location:** `apps/web/src/components/products/ProductGrid.tsx`

Renders a responsive grid of ProductCard components.

**Props:**
```typescript
interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}
```

**Usage:**
```tsx
<ProductGrid products={productList} loading={isLoading} />
```

---

### Pagination
**Location:** `apps/web/src/components/products/Pagination.tsx`

Pagination controls for product listings. Updates URL search params.

**Props:**
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

**Usage:**
```tsx
<Pagination 
  currentPage={1} 
  totalPages={7} 
  onPageChange={(page) => router.push(`/products?page=${page}`)}
/>
```

---

### ProductSearch
**Location:** `apps/web/src/components/products/ProductSearch.tsx`

Search input box with real-time form submission to PLP with `search` query param.

**Props:**
```typescript
interface ProductSearchProps {
  initialValue?: string;
}
```

**Features:**
- Controlled input
- Form submission triggers `?search=query` redirect
- Resets pagination to page 1

**Usage:**
```tsx
<ProductSearch initialValue={searchParam} />
```

---

### CategoryFilter
**Location:** `apps/web/src/components/products/CategoryFilter.tsx`

Dropdown select to filter products by category. Updates URL `?category=slug` param.

**Props:**
```typescript
interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
}
```

**Usage:**
```tsx
<CategoryFilter 
  categories={categoriesList}
  selectedCategory={categoryParam}
/>
```

---

### ImageGallery
**Location:** `apps/web/src/components/products/ImageGallery.tsx`

Main image display with thumbnail carousel and zoom on hover.

**Props:**
```typescript
interface ImageGalleryProps {
  images: Array<{ url: string }>;
  alt: string;
}
```

**Features:**
- Main image with zoom effect
- Thumbnail carousel (click to select)
- Keyboard navigation (arrow keys)
- Responsive sizing

**Usage:**
```tsx
<ImageGallery
  images={product.images}
  alt={product.name}
/>
```

---

### VariantSelector
**Location:** `apps/web/src/components/products/VariantSelector.tsx`

Display and select product variants (size, color) with availability.

**Props:**
```typescript
interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: number;
  onVariantChange: (variantId: number) => void;
}

interface ProductVariant {
  id: number;
  sku: string;
  attributes: Record<string, string>; // { size: 'M', color: 'Red' }
  isAvailable: boolean;
}
```

**Features:**
- Displays variant attributes (size, color)
- Color swatches for color variants
- Hides redundant attributes (e.g., `masterVariant`)
- Availability status
- Disabled out-of-stock variants

**Usage:**
```tsx
<VariantSelector
  variants={product.variants}
  selectedVariantId={selectedId}
  onVariantChange={(id) => setSelectedId(id)}
/>
```

---

### AddToCartButton
**Location:** `apps/web/src/components/products/AddToCartButton.tsx`

Button to add product variant to cart. Shows loading/success/error states.

**Props:**
```typescript
interface AddToCartButtonProps {
  productId: string;
  variantId: number;
  quantity?: number;
  disabled?: boolean;
}
```

**Features:**
- Uses `CartContext` to add item
- Shows loading spinner during API call
- Displays success toast/message
- Handles errors gracefully
- Can be disabled (out of stock)

**Usage:**
```tsx
<AddToCartButton
  productId={product.id}
  variantId={selectedVariant.id}
  quantity={quantity}
/>
```

---

### ProductDetails
**Location:** `apps/web/src/components/products/ProductDetails.tsx`

`"use client"` wrapper component that combines ImageGallery, VariantSelector, and AddToCartButton.

**Props:**
```typescript
interface ProductDetailsProps {
  product: Product;
}
```

**Features:**
- Manages variant selection state
- Integrates gallery, selector, and add-to-cart
- Responsive layout (stacked on mobile, side-by-side on desktop)

**Usage:**
```tsx
<ProductDetails product={productData} />
```

---

## Cart Components

### MiniCart
**Location:** `apps/web/src/components/cart/MiniCart.tsx`

Dropdown cart preview in header showing items, quantity, subtotal, and link to full cart.

**Props:**
```typescript
interface MiniCartProps {
  // No props — uses CartContext internally
}
```

**Features:**
- Shows 3-5 most recent items
- Quick remove buttons
- Subtotal calculation
- "View Cart" link
- Empty state message

**Usage:**
```tsx
<MiniCart />
```

---

### CartItem
**Location:** `apps/web/src/components/cart/CartItem.tsx`

Single line item in cart with quantity controls and remove button.

**Props:**
```typescript
interface CartItemProps {
  item: LineItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

interface LineItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: Price;
  image?: string;
}
```

**Usage:**
```tsx
<CartItem
  item={lineItem}
  onUpdateQuantity={(q) => updateCart(lineItem.id, q)}
  onRemove={() => removeFromCart(lineItem.id)}
/>
```

---

### CartSummary
**Location:** `apps/web/src/components/cart/CartSummary.tsx`

Order summary showing subtotal, shipping, discount, and total.

**Props:**
```typescript
interface CartSummaryProps {
  subtotal: Price;
  shipping?: Price;
  discount?: Price;
  tax?: Price;
}
```

**Usage:**
```tsx
<CartSummary
  subtotal={{ centAmount: 9900, currencyCode: 'USD' }}
  shipping={{ centAmount: 500, currencyCode: 'USD' }}
  discount={{ centAmount: -1000, currencyCode: 'USD' }}
/>
```

---

### DiscountCodeInput
**Location:** `apps/web/src/components/cart/DiscountCodeInput.tsx`

Form to apply/remove discount codes to cart.

**Props:**
```typescript
interface DiscountCodeInputProps {
  onApply: (code: string) => Promise<void>;
  onRemove: (code: string) => Promise<void>;
  appliedCodes: string[];
}
```

**Features:**
- Input field + button to apply code
- Display applied codes with remove buttons
- Loading/error states
- Validation feedback

**Usage:**
```tsx
<DiscountCodeInput
  onApply={applyDiscountCode}
  onRemove={removeDiscountCode}
  appliedCodes={cart.discountCodes}
/>
```

---

## Checkout Components

### CheckoutSteps
**Location:** `apps/web/src/components/checkout/CheckoutSteps.tsx`

Visual step indicator showing current checkout progress.

**Props:**
```typescript
interface CheckoutStepsProps {
  currentStep: 1 | 2 | 3;
}
```

**Features:**
- Shows 3 steps: Address → Shipping → Review
- Current step highlighted
- Completed steps marked with checkmark

**Usage:**
```tsx
<CheckoutSteps currentStep={2} />
```

---

### AddressForm
**Location:** `apps/web/src/components/checkout/AddressForm.tsx`

Form to enter and validate shipping address.

**Props:**
```typescript
interface AddressFormProps {
  onSubmit: (address: ShippingAddress) => Promise<void>;
  initialAddress?: ShippingAddress;
  isLoading?: boolean;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  streetName: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
```

**Features:**
- Form validation (required fields, postal code format)
- Suggestions for US states/countries
- Submit button with loading state
- Error display

**Usage:**
```tsx
<AddressForm
  onSubmit={async (address) => {
    await setShippingAddress(address);
  }}
/>
```

---

### ShippingMethodSelector
**Location:** `apps/web/src/components/checkout/ShippingMethodSelector.tsx`

Radio button selection of available shipping methods with pricing.

**Props:**
```typescript
interface ShippingMethodSelectorProps {
  methods: ShippingMethod[];
  selectedMethodId?: string;
  onSelect: (methodId: string) => Promise<void>;
  isLoading?: boolean;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: Price;
  estimatedDays?: number;
}
```

**Features:**
- Radio selection
- Displays price and estimated delivery
- Submit button
- Loading state

**Usage:**
```tsx
<ShippingMethodSelector
  methods={shippingMethods}
  selectedMethodId={selectedMethod}
  onSelect={setShippingMethod}
/>
```

---

### OrderReview
**Location:** `apps/web/src/components/checkout/OrderReview.tsx`

Final order review before placing order. Shows items, address, shipping, and totals.

**Props:**
```typescript
interface OrderReviewProps {
  cart: Cart;
  onPlaceOrder: () => Promise<void>;
  isLoading?: boolean;
}
```

**Features:**
- Displays all order details
- Edit buttons to go back to previous steps (optional)
- "Place Order" button
- Error handling

**Usage:**
```tsx
<OrderReview
  cart={currentCart}
  onPlaceOrder={placeOrder}
/>
```

---

### OrderConfirmation
**Location:** `apps/web/src/components/checkout/OrderConfirmation.tsx`

Success message after order placement with order number and details.

**Props:**
```typescript
interface OrderConfirmationProps {
  order: Order;
  onContinueShopping: () => void;
}
```

**Usage:**
```tsx
<OrderConfirmation
  order={createdOrder}
  onContinueShopping={() => router.push('/')}
/>
```

---

## Account Components

### OrderCard
**Location:** `apps/web/src/components/orders/OrderCard.tsx`

Summary card for a single order in orders list.

**Props:**
```typescript
interface OrderCardProps {
  order: Order;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalPrice: Price;
  orderState: 'Open' | 'Confirmed' | 'Complete' | 'Cancelled';
  paymentState: 'Pending' | 'Paid' | 'Failed';
  shipmentState: 'Pending' | 'Shipped' | 'Delivered';
  lineItems: LineItem[];
}
```

**Features:**
- Order number and date
- Status badges (order, payment, shipment)
- Line items preview
- Total price
- Link to order details

**Usage:**
```tsx
<OrderCard order={order} />
```

---

### OrderStatusBadge
**Location:** `apps/web/src/components/orders/OrderStatusBadge.tsx`

Colored badge showing order/payment/shipment status.

**Props:**
```typescript
interface OrderStatusBadgeProps {
  state: 'Open' | 'Confirmed' | 'Complete' | 'Cancelled' | 'Pending' | 'Paid' | 'Failed' | 'Shipped' | 'Delivered';
  type: 'order' | 'payment' | 'shipment';
}
```

**Features:**
- Color-coded by status (green = success, yellow = pending, red = failed)
- Readable status labels
- Responsive sizing

**Usage:**
```tsx
<OrderStatusBadge state="Paid" type="payment" />
```

---

## Auth Components

### LoginForm
**Location:** `apps/web/src/components/auth/LoginForm.tsx`

Form for customer login with email and password.

**Props:**
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}
```

**Features:**
- Email input validation
- Password input (masked)
- Form submission via AuthContext.login()
- Error display
- "Forgot password?" link
- Register link

**Usage:**
```tsx
<LoginForm
  onSuccess={() => router.push('/account')}
  redirectTo="/checkout"
/>
```

---

### RegisterForm
**Location:** `apps/web/src/components/auth/RegisterForm.tsx`

Form for new customer registration.

**Props:**
```typescript
interface RegisterFormProps {
  onSuccess?: () => void;
}
```

**Features:**
- Email input with duplicate check
- Password input with strength indicator
- Confirm password
- First/last name
- Terms acceptance checkbox
- Auto-login after register

**Usage:**
```tsx
<RegisterForm onSuccess={() => router.push('/account')} />
```

---

### UserMenu
**Location:** `apps/web/src/components/auth/UserMenu.tsx`

Dropdown menu showing customer name, logout button, and account links.

**Props:**
```typescript
interface UserMenuProps {
  // No props — uses AuthContext internally
}
```

**Features:**
- Shows logout if authenticated
- Shows login link if not authenticated
- Account links (Profile, Orders, Addresses, Wishlist)

**Usage:**
```tsx
<UserMenu />
```

---

## Home Page Components

### HeroSection
**Location:** `apps/web/src/components/home/HeroSection.tsx`

Large hero banner with background image, headline, and CTA button.

**Props:**
```typescript
interface HeroSectionProps {
  heading: string;
  subheading?: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage?: string;
}
```

**Usage:**
```tsx
<HeroSection
  heading="Summer Collection"
  subheading="Up to 50% off"
  ctaText="Shop Now"
  ctaHref="/products?category=summer"
/>
```

---

### FeaturedCategories
**Location:** `apps/web/src/components/home/FeaturedCategories.tsx`

Grid of category cards with images and links.

**Props:**
```typescript
interface FeaturedCategoriesProps {
  categories: Category[];
}
```

**Usage:**
```tsx
<FeaturedCategories categories={topCategories} />
```

---

### TrendingProducts
**Location:** `apps/web/src/components/home/TrendingProducts.tsx`

Carousel or grid of trending/bestselling products.

**Props:**
```typescript
interface TrendingProductsProps {
  products: Product[];
  limit?: number;
}
```

**Usage:**
```tsx
<TrendingProducts products={trendingProducts} limit={6} />
```

---

### NewsletterSignup
**Location:** `apps/web/src/components/home/NewsletterSignup.tsx`

Email signup form for newsletter.

**Props:**
```typescript
interface NewsletterSignupProps {
  onSuccess?: () => void;
}
```

**Features:**
- Email input
- Subscribe button
- Success/error messages
- Spinner during submission

**Usage:**
```tsx
<NewsletterSignup onSuccess={() => setShowThanks(true)} />
```

---

## Common Patterns

### useAsync Hook
**Location:** `apps/web/src/lib/hooks/useAsync.ts`

Custom hook for async operations (fetch, POST, etc).

```typescript
const { data, loading, error } = useAsync(
  async () => await fetchProducts(),
  [dependency]
);
```

---

### formatPrice Utility
**Location:** `apps/web/src/lib/format-price.ts`

Format prices in centAmount to currency string.

```typescript
formatPrice(1999, 'USD') // '$19.99'
formatPrice(5000, 'EUR') // '€50.00'
```

---

### API Client
**Location:** `apps/web/src/lib/api-client.ts`

Single HTTP client for all API calls. Handles auth, session ID, and URL routing.

```typescript
const products = await apiClient.productsApi.list({
  search: 'shoes',
  limit: 20
});

const cart = await apiClient.cartApi.getCurrent(sessionId);

const customer = await apiClient.authApi.getMe(token);
```

---

## Testing Components

All components have corresponding test files (`.test.tsx`).

Example:
```tsx
// ProductCard.test.tsx
describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard name="Shoes" price={{ centAmount: 9999, currencyCode: 'USD' }} />);
    expect(screen.getByText('Shoes')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });
});
```

Run all web tests:
```bash
npm run test:web
```

