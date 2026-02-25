# Quick Reference & FAQ — CT B2C Storefront

> Common tasks, solutions, and frequently asked questions.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflows](#development-workflows)
3. [Common Tasks](#common-tasks)
4. [Troubleshooting](#troubleshooting)
5. [FAQ](#faq)

---

## Getting Started

### First-Time Setup (5 minutes)

```bash
# 1. Clone repo
git clone https://github.com/JefinFrancis/ct-b2c-storefront.git
cd ct-b2c-storefront

# 2. Create environment files
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local

# 3. Edit .env files with your CT credentials
# Edit: CTP_PROJECT_KEY, CTP_CLIENT_ID, CTP_CLIENT_SECRET, etc.

# 4. Start services
docker compose up --build

# 5. Open browser
# Frontend: http://localhost:3001
# API: http://localhost:8080
```

### Without Docker

```bash
npm install
cd apps/api && npm run start:dev     # Terminal 1
# In another terminal:
cd apps/web && npm run dev            # Terminal 2
# In another terminal:
npm test                              # Terminal 3 (optional)
```

---

## Development Workflows

### Adding a New Feature

**Example: Add "Related Products" section to PDP**

1. **Create API endpoint:**
   ```typescript
   // apps/api/src/products/products.service.ts
   async getRelatedProducts(productId: string): Promise<Product[]> {
     // Fetch related from CT
     return this.ctService.getRelatedProducts(productId);
   }

   // apps/api/src/products/products.controller.ts
   @Get(':id/related')
   getRelated(@Param('id') id: string) {
     return this.service.getRelatedProducts(id);
   }
   ```

2. **Add tests:**
   ```typescript
   // apps/api/src/products/products.service.spec.ts
   it('should return related products', async () => {
     const related = await service.getRelatedProducts('product-1');
     expect(related).toHaveLength(4);
   });
   ```

3. **Create React component:**
   ```typescript
   // apps/web/src/components/products/RelatedProducts.tsx
   "use client";
   
   import { useEffect, useState } from 'react';
   import { apiClient } from '@/lib/api-client';
   
   export function RelatedProducts({ productId }: { productId: string }) {
     const [products, setProducts] = useState([]);
     
     useEffect(() => {
       apiClient.productsApi.getRelated(productId)
         .then(setProducts);
     }, [productId]);
     
     return (
       <section>
         <h2>Related Products</h2>
         <ProductGrid products={products} />
       </section>
     );
   }
   ```

4. **Add to PDP:**
   ```typescript
   // apps/web/src/app/(store)/products/[slug]/page.tsx
   import { RelatedProducts } from '@/components/products/RelatedProducts';
   
   export default async function ProductPage({ params }) {
     const product = await getProduct(params.slug);
     
     return (
       <>
         <ProductDetails product={product} />
         <RelatedProducts productId={product.id} />
       </>
     );
   }
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

6. **Commit:**
   ```bash
   git checkout -b feature/CT-123-related-products
   git add .
   git commit -m "feat(api/products): add related products endpoint"
   git push origin feature/CT-123-related-products
   # Create PR on GitHub
   ```

---

### Fixing a Bug

**Example: Cart shows wrong total after discount code**

1. **Identify the issue:**
   - Reproduce the bug locally
   - Check CartContext state
   - Check cart.service.ts in API

2. **Write a test that captures the bug:**
   ```typescript
   it('should correctly recalculate total when discount is applied', async () => {
     const cart = { subtotal: 100, discountAmount: 10 };
     const total = calculateTotal(cart);
     expect(total).toBe(90); // Currently fails
   });
   ```

3. **Fix the code:**
   ```typescript
   // apps/api/src/cart/cart.service.ts
   async applyDiscountCode(cartId: string, code: string) {
     const cart = await this.ctService.getCart(cartId);
     const updated = await this.ctService.applyDiscountCode(cartId, code);
     
     // Fix: Recalculate total correctly
     updated.total = updated.subtotal - (updated.discount || 0);
     
     return updated;
   }
   ```

4. **Verify test passes:**
   ```bash
   npm run test:api -- cart.service.spec
   ```

5. **Commit:**
   ```bash
   git commit -m "fix(api/cart): correct total calculation with discounts"
   ```

---

### Refactoring Code

**Example: Extract utility function**

1. **Identify duplication:**
   - Format price appears in 5 components
   - Logic: `centAmount / 100` with currency symbol

2. **Create shared utility:**
   ```typescript
   // apps/web/src/lib/format-price.ts
   export function formatPrice(centAmount: number, currencyCode: string): string {
     const amount = centAmount / 100;
     return new Intl.NumberFormat('en-US', {
       style: 'currency',
       currency: currencyCode,
     }).format(amount);
   }
   ```

3. **Update all imports:**
   ```typescript
   import { formatPrice } from '@/lib/format-price';
   
   // Instead of:
   // const price = `$${product.price.centAmount / 100}`;
   const price = formatPrice(product.price.centAmount, product.price.currencyCode);
   ```

4. **Add test:**
   ```typescript
   // apps/web/src/lib/format-price.test.ts
   import { formatPrice } from './format-price';
   
   describe('formatPrice', () => {
     it('formats cents to USD', () => {
       expect(formatPrice(1999, 'USD')).toBe('$19.99');
     });
   });
   ```

5. **Commit:**
   ```bash
   git commit -m "refactor(web): extract formatPrice utility function"
   ```

---

## Common Tasks

### Update commercetools Credentials

```bash
# Edit .env.local
vi apps/api/.env.local

# Update these variables:
# CTP_PROJECT_KEY=new-project
# CTP_CLIENT_ID=new-id
# CTP_CLIENT_SECRET=new-secret

# Restart services
docker compose down
docker compose up --build
```

### Add a New Product Type

1. Create in CT dashboard
2. Add to `scripts/seed.js` if sample data
3. No code changes needed — CT SDK auto-discovers

### Seed Sample Data

```bash
# Option 1: Using docker
docker compose exec api npm run seed

# Option 2: Manual
cd scripts
node seed.js
```

### View API Logs

```bash
# All logs
docker compose logs -f api

# Follow logs
docker compose logs -f api web

# Last 100 lines
docker compose logs --tail=100 api
```

### Reset Everything (Clear Redis)

```bash
# Stop all services and remove volumes
docker compose down -v

# Restart fresh
docker compose up --build
```

### Run Tests in Watch Mode

```bash
# Watch all tests
npm test -- --watch

# Watch only API tests
npm run test:api -- --watch

# Watch only Web tests
npm run test:web -- --watch
```

### Check TypeScript Errors

```bash
# Check all packages
npx turbo typecheck

# Check specific package
cd apps/api && npx tsc --noEmit
```

### Build for Production

```bash
# Build all packages
npx turbo build

# Build specific app
npm run build -w apps/web
npm run build -w apps/api
```

### Deploy Locally Built Docker Image to GCP

```bash
# Build locally
docker build -f apps/api/Dockerfile -t api:latest .

# Tag for GCP
docker tag api:latest us-central1-docker.pkg.dev/PROJECT/REPO/api:latest

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/PROJECT/REPO/api:latest

# Deploy to Cloud Run
gcloud run deploy api \
  --image=us-central1-docker.pkg.dev/PROJECT/REPO/api:latest \
  --region=us-central1
```

---

## Troubleshooting

### "Cannot connect to MongoDB" or "Redis connection refused"

```bash
# Check running containers
docker compose ps

# Check Redis logs
docker compose logs redis

# Restart Redis specifically
docker compose restart redis

# Or restart all
docker compose down -v
docker compose up
```

### "CORS error: Cross-Origin Request Blocked"

- Check `ALLOWED_ORIGIN` in `apps/api/.env.local`
- Should match your frontend URL
- For local dev: `http://localhost:3000`
- For production: your actual domain

```bash
# Verify CORS header in response
curl -i -H "Origin: http://localhost:3000" http://localhost:8080/api/v1/products
# Look for: Access-Control-Allow-Origin: http://localhost:3000
```

### "401 Unauthorized from CT API"

```bash
# Verify CT credentials
echo $CTP_PROJECT_KEY
echo $CTP_CLIENT_ID
echo $CTP_CLIENT_SECRET

# Test CT API directly with curl
curl -X POST https://auth.us-central1.gcp.commercetools.com/oauth/token \
  -d "grant_type=client_credentials&client_id=$CTP_CLIENT_ID&client_secret=$CTP_CLIENT_SECRET"

# If this fails, credentials are invalid
```

### "Cannot find module 'commercetools'"

```bash
# Reinstall all dependencies
npm ci

# Rebuild Docker image
docker compose up --build
```

### "Port 3000 already in use"

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
# Change ports: ["3002:3000"]
```

### "Tests failing after code change"

```bash
# Run tests in verbose mode to see what's failing
npm test -- --verbose

# Run specific test file
npm run test:api -- auth.service.spec

# Check if it's a snapshot test (update if intentional)
npm test -- -u
```

### "Next.js build fails with TypeScript errors"

```bash
# Check TypeScript errors
npx turbo typecheck

# Build next.js specifically with errors shown
cd apps/web
npm run build

# Fix errors in source code, then retry
```

### "Images not loading from localhost:3001"

1. Check image URL in browser DevTools (F12)
2. Ensure image domain is in `next.config.ts` remotePatterns
3. For placehold.co: already added
4. For custom domain: add it to remotePatterns

```typescript
// apps/web/next.config.ts
remotePatterns: [
  { protocol: 'https', hostname: 'placehold.co' },
  { protocol: 'https', hostname: 'your-domain.com' }, // Add here
]
```

---

## FAQ

### Q: Where should I import CommercetoolsService?

**A:** Only in `apps/api/src/commercetools/commercetools.service.ts`. All other services receive it via dependency injection.

```typescript
// ✅ Correct
constructor(private ctService: CommercetoolsService) {}

// ❌ Wrong — never do this in web or other files
import { CommercetoolsService } from '../commercetools/commercetools.service';
```

### Q: How do I get the current customer ID in a protected endpoint?

**A:** The JWT payload is attached to the request by `JwtAuthGuard`:

```typescript
@UseGuards(JwtAuthGuard)
@Get('/orders')
getOrders(@Request() req) {
  const customerId = req.user.customerId; // From JWT payload
  return this.ordersService.findByCustomer(customerId);
}
```

### Q: How do I add a new environment variable?

**A:** 

1. Add to `.env.example` (both api and web)
2. Add to `.env.local` with actual value
3. For TypeScript safety, add to Zod schema in `packages/config/src/env.ts`
4. Import from config package:

```typescript
import { getEnv } from '@ct-b2c/config';

const apiUrl = getEnv().NEXT_PUBLIC_API_URL;
```

### Q: How do I test components that use hooks?

**A:** Use react-testing-library and mock the hook's context:

```typescript
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    customer: { id: '1', email: 'test@example.com' },
    login: jest.fn(),
  }),
}));

render(<MyComponent />);
```

### Q: Why is my cart not persisting across page reloads?

**A:** Check if CartContext is wrapping the entire app in `layout.tsx`:

```typescript
// apps/web/src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Q: How do I handle image uploads for products?

**A:** Currently using external placeholder service (placehold.co). For production:

1. Create S3 bucket or GCS bucket for images
2. Add image upload endpoint in API
3. Return signed URL for image
4. Update product in CT with image URL

### Q: Can I use Redux instead of React Context?

**A:** Not recommended. React Context handles cart and auth well. If you need it:

1. Install Redux: `npm install redux react-redux`
2. Create store in `apps/web/src/store/`
3. Remove AuthContext and CartContext
4. Update all components to use hooks from Redux

### Q: How often should I update dependencies?

**A:** Run `npm outdated` monthly and `npm audit` weekly:

```bash
npm outdated  # See what's out of date
npm install   # Updates minor/patch versions
npm audit fix # Fixes security vulnerabilities
```

### Q: How do I monitor performance in production?

**A:** Enable Cloud Run metrics + optional APM:

1. Cloud Run dashboard shows CPU, memory, latency
2. CloudWatch Logs for application logs
3. Optional: Datadog, New Relic, or Sentry for APM

### Q: What happens if Redis goes down?

**A:** Requests still work but will be slower (no caching). Implement fallback:

```typescript
const cached = await redisService.get(key).catch(() => null);
if (!cached) {
  const fresh = await ctService.getProduct(id);
  // Store in cache (if available)
}
```

### Q: Should I use Server Components or Client Components?

**A:**

- **Server Components (default):** Data fetching, database queries, secrets
- **Client Components ("use client"):** Interactivity, event handlers, hooks, contexts

```typescript
// Server Component
export default async function Page() {
  const data = await fetch('...');
  return <ClientComponent data={data} />;
}

// Client Component ("use client")
export function ClientComponent({ data }) {
  const [filter, setFilter] = useState('');
  return <button onClick={() => setFilter('new')}>Filter</button>;
}
```

### Q: How do I set up CI/CD?

**A:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#github-actions-cicd) for GitHub Actions workflow.

### Q: Can I use a different database instead of CT?

**A:** Possible but requires rewriting entire `commercetools.service.ts`. CT is core to the architecture.

### Q: What should I do before committing?

**A:**

```bash
npm test              # Pass all tests
npx turbo typecheck   # No TypeScript errors
git add .
git commit -m "feat(scope): description" # Follow Conventional Commits
git push origin feature/branch-name
```

---

## Command Cheat Sheet

```bash
# Development
npm install                    # Install all dependencies
docker compose up --build      # Start all services (first time)
docker compose up             # Start services daily
npm test                      # Run all tests
npm run test:api              # API tests only
npm run test:web              # Web tests only
npx turbo typecheck           # Type checking
npx turbo build               # Build all packages

# API
npm run start:dev -w apps/api # Start API in dev mode
npm run test:api -- --watch   # Watch API tests

# Web
npm run dev -w apps/web       # Start Next.js dev server
npm run build -w apps/web     # Build for production

# Git
git checkout -b feature/CT-123-name  # Create feature branch
git commit -m "feat(scope): message"  # Commit with conventional message
git push origin feature/CT-123-name   # Push to GitHub
git pull origin develop               # Sync with develop

# Docker
docker compose logs -f api     # Follow API logs
docker compose exec api npm test  # Run test in container
docker compose down -v         # Stop and clear volumes
```

---

*Last updated: 2026-02-25*

