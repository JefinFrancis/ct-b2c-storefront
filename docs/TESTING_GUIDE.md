# Testing Guide — CT B2C Storefront

> Comprehensive testing strategy, patterns, and examples for API and web.

---

## Overview

The project uses:
- **API Tests:** Jest with NestJS testing utilities (64 tests)
- **Web Tests:** Vitest + React Testing Library (87 tests)
- **Total:** 151 tests across the storefront
- **Coverage Target:** 80%+ for services and components

All tests are co-located with source files:
- API: `*.spec.ts` next to service/controller files
- Web: `*.test.tsx` next to component files

---

## Quick Start

```bash
# Run all tests
npm test

# Run by package
npm run test:api      # Jest — 64 tests
npm run test:web      # Vitest — 87 tests

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm run test:api -- auth.service.spec
npm run test:web -- ProductCard.test
```

---

## API Testing (Jest + @nestjs/testing)

### Test Structure

```typescript
// apps/api/src/products/products.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { CommercetoolsService } from '../commercetools/commercetools.service';
import { RedisService } from '../redis/redis.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let ctService: CommercetoolsService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: CommercetoolsService,
          useValue: {
            getProducts: jest.fn(),
            getProductBySlug: jest.fn(),
            getCategories: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    ctService = module.get<CommercetoolsService>(CommercetoolsService);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('list', () => {
    it('should return cached products if available', async () => {
      const mockProducts = [
        { id: '1', slug: 'shoes', name: 'Shoes', price: { centAmount: 9999 } },
      ];

      jest.spyOn(redisService, 'get').mockResolvedValueOnce(JSON.stringify(mockProducts));

      const result = await service.list({ search: '', limit: 20, offset: 0 });

      expect(result).toEqual(mockProducts);
      expect(ctService.getProducts).not.toHaveBeenCalled(); // Cache hit
    });

    it('should fetch from CT if cache miss', async () => {
      const mockProducts = [
        { id: '1', slug: 'shoes', name: 'Shoes', price: { centAmount: 9999 } },
      ];

      jest.spyOn(redisService, 'get').mockResolvedValueOnce(null); // Cache miss
      jest.spyOn(ctService, 'getProducts').mockResolvedValueOnce(mockProducts);
      jest.spyOn(redisService, 'set').mockResolvedValueOnce('OK');

      const result = await service.list({ search: '', limit: 20, offset: 0 });

      expect(result).toEqual(mockProducts);
      expect(ctService.getProducts).toHaveBeenCalledWith({ search: '', limit: 20, offset: 0 });
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('products:list'),
        JSON.stringify(mockProducts),
        { EX: 300 } // 5 min TTL
      );
    });

    it('should handle search parameter', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);
      jest.spyOn(ctService, 'getProducts').mockResolvedValueOnce([]);

      await service.list({ search: 'blue sneakers', limit: 20, offset: 0 });

      expect(ctService.getProducts).toHaveBeenCalledWith({
        search: 'blue sneakers',
        limit: 20,
        offset: 0,
      });
    });

    it('should handle pagination', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);
      jest.spyOn(ctService, 'getProducts').mockResolvedValueOnce([]);

      await service.list({ search: '', limit: 50, offset: 100 });

      expect(ctService.getProducts).toHaveBeenCalledWith({
        search: '',
        limit: 50,
        offset: 100,
      });
    });
  });

  describe('getBySlug', () => {
    it('should return product by slug', async () => {
      const mockProduct = {
        id: '1',
        slug: 'blue-sneakers',
        name: 'Blue Sneakers',
      };

      jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);
      jest.spyOn(ctService, 'getProductBySlug').mockResolvedValueOnce(mockProduct);
      jest.spyOn(redisService, 'set').mockResolvedValueOnce('OK');

      const result = await service.getBySlug('blue-sneakers');

      expect(result).toEqual(mockProduct);
      expect(ctService.getProductBySlug).toHaveBeenCalledWith('blue-sneakers');
    });

    it('should throw not found if product does not exist', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);
      jest.spyOn(ctService, 'getProductBySlug').mockResolvedValueOnce(null);

      await expect(service.getBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### Mocking Patterns

#### Mock CommercetoolsService

```typescript
{
  provide: CommercetoolsService,
  useValue: {
    getProducts: jest.fn(),
    getProductBySlug: jest.fn(),
    getCategories: jest.fn(),
    createCart: jest.fn(),
    getCart: jest.fn(),
    createCustomer: jest.fn(),
  },
}
```

#### Mock RedisService

```typescript
{
  provide: RedisService,
  useValue: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    mget: jest.fn(),
    mset: jest.fn(),
  },
}
```

#### Test Fixtures

```typescript
const mockProduct = {
  id: 'product-123',
  slug: 'blue-sneakers',
  name: 'Blue Sneakers',
  description: 'Comfortable blue sneakers',
  price: { centAmount: 9999, currencyCode: 'USD' },
  images: [{ url: 'https://example.com/image.jpg' }],
  variants: [
    {
      id: 1,
      sku: 'SKU-001',
      attributes: { size: 'M', color: 'Blue' },
      isAvailable: true,
    },
  ],
};

const mockCart = {
  id: 'cart-123',
  customerId: null,
  version: 1,
  lineItems: [
    {
      id: 'line-1',
      productId: 'product-123',
      variantId: 1,
      name: 'Blue Sneakers',
      quantity: 2,
      price: { centAmount: 9999, currencyCode: 'USD' },
    },
  ],
  subtotal: { centAmount: 19998, currencyCode: 'USD' },
};

const mockCustomer = {
  id: 'customer-123',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  addresses: [],
};

const mockOrder = {
  id: 'order-123',
  orderNumber: 'ORD-00001',
  customerId: 'customer-123',
  createdAt: new Date().toISOString(),
  totalPrice: { centAmount: 12999, currencyCode: 'USD' },
  orderState: 'Open',
  paymentState: 'Pending',
  shipmentState: 'Pending',
  lineItems: [],
};
```

### Controller Tests

```typescript
// apps/api/src/products/products.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            list: jest.fn(),
            getBySlug: jest.fn(),
            getCategories: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  describe('GET /api/v1/products', () => {
    it('should return list of products', async () => {
      const mockProducts = [
        { id: '1', slug: 'shoes', name: 'Shoes' },
      ];

      jest.spyOn(service, 'list').mockResolvedValueOnce(mockProducts);

      const result = await controller.list(
        { search: '', category: '', limit: 20, offset: 0 }
      );

      expect(result).toEqual(mockProducts);
    });
  });

  describe('GET /api/v1/products/:slug', () => {
    it('should return product by slug', async () => {
      const mockProduct = { id: '1', slug: 'shoes', name: 'Shoes' };

      jest.spyOn(service, 'getBySlug').mockResolvedValueOnce(mockProduct);

      const result = await controller.getBySlug('shoes');

      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(service, 'getBySlug').mockRejectedValueOnce(
        new NotFoundException('Product not found')
      );

      await expect(controller.getBySlug('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
```

---

## Web Testing (Vitest + React Testing Library)

### Test Structure

```typescript
// apps/web/src/components/products/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: 'product-1',
    slug: 'blue-sneakers',
    name: 'Blue Sneakers',
    price: { centAmount: 9999, currencyCode: 'USD' },
    image: 'https://example.com/shoe.jpg',
  };

  it('renders product name', () => {
    render(<ProductCard {...mockProduct} />);
    expect(screen.getByText('Blue Sneakers')).toBeInTheDocument();
  });

  it('renders formatted price', () => {
    render(<ProductCard {...mockProduct} />);
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('renders image with alt text', () => {
    render(<ProductCard {...mockProduct} />);
    const image = screen.getByAltText('Blue Sneakers');
    expect(image).toHaveAttribute('src', 'https://example.com/shoe.jpg');
  });

  it('links to product detail page', () => {
    render(<ProductCard {...mockProduct} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/blue-sneakers');
  });

  it('renders without image prop', () => {
    const { image, ...productWithoutImage } = mockProduct;
    render(<ProductCard {...productWithoutImage} />);
    expect(screen.getByText('Blue Sneakers')).toBeInTheDocument();
  });
});
```

### Mocking Hooks & Contexts

```typescript
// Mock useRouter
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    push: jest.fn(),
    pathname: '/',
  });
});

// Mock useContext (AuthContext)
import { AuthContext } from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext', () => ({
  AuthContext: createContext(null),
  useAuth: jest.fn(),
}));

beforeEach(() => {
  (useAuth as jest.Mock).mockReturnValue({
    customer: null,
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: false,
  });
});

// Mock API Client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    productsApi: {
      list: jest.fn(),
      getBySlug: jest.fn(),
    },
  },
}));
```

### User Interaction Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddToCartButton } from './AddToCartButton';

describe('AddToCartButton', () => {
  it('adds product to cart on click', async () => {
    const user = userEvent.setup();
    const mockAddItem = jest.fn();

    jest.mock('@/contexts/CartContext', () => ({
      useCart: () => ({
        addItem: mockAddItem,
      }),
    }));

    render(
      <AddToCartButton productId="product-1" variantId={1} />
    );

    const button = screen.getByRole('button', { name: /add to cart/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith('product-1', 1, 1);
    });
  });

  it('shows loading state while adding', async () => {
    const user = userEvent.setup();

    jest.mock('@/contexts/CartContext', () => ({
      useCart: () => ({
        addItem: jest.fn(() => new Promise(resolve => setTimeout(resolve, 100))),
      }),
    }));

    render(
      <AddToCartButton productId="product-1" variantId={1} />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // Button should show loading state
    expect(button).toHaveAttribute('disabled');
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
  });

  it('shows error message on failure', async () => {
    const user = userEvent.setup();

    jest.mock('@/contexts/CartContext', () => ({
      useCart: () => ({
        addItem: jest.fn(() => Promise.reject(new Error('Network error'))),
      }),
    }));

    render(
      <AddToCartButton productId="product-1" variantId={1} />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### Form Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits form with email and password', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn().mockResolvedValue({
      token: 'jwt-token',
      customer: { id: '1', email: 'john@example.com' },
    });

    jest.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({ login: mockLogin }),
    }));

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('john@example.com', 'password123');
    });
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Async Components

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { ProductListPage } from './ProductListPage';

describe('ProductListPage', () => {
  it('loads and displays products', async () => {
    const mockProducts = [
      { id: '1', slug: 'shoes', name: 'Shoes', price: { centAmount: 9999 } },
      { id: '2', slug: 'boots', name: 'Boots', price: { centAmount: 12999 } },
    ];

    jest.mock('@/lib/api-client', () => ({
      apiClient: {
        productsApi: {
          list: jest.fn().mockResolvedValue({
            results: mockProducts,
            total: 2,
            limit: 20,
            offset: 0,
          }),
        },
      },
    }));

    render(await ProductListPage());

    await waitFor(() => {
      expect(screen.getByText('Shoes')).toBeInTheDocument();
      expect(screen.getByText('Boots')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', () => {
    jest.mock('@/lib/api-client', () => ({
      apiClient: {
        productsApi: {
          list: jest.fn(() => new Promise(resolve => 
            setTimeout(() => resolve({ results: [], total: 0 }), 100)
          )),
        },
      },
    }));

    render(<ProductListPage />);

    // Should show skeleton/loading initially
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    jest.mock('@/lib/api-client', () => ({
      apiClient: {
        productsApi: {
          list: jest.fn().mockRejectedValue(new Error('Failed to fetch')),
        },
      },
    }));

    render(await ProductListPage());

    await waitFor(() => {
      expect(screen.getByText(/error loading products/i)).toBeInTheDocument();
    });
  });
});
```

---

## Snapshot Testing

```typescript
import { render } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard Snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <ProductCard
        id="1"
        slug="shoes"
        name="Shoes"
        price={{ centAmount: 9999, currencyCode: 'USD' }}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
```

Update snapshots when intentional changes are made:
```bash
npm run test:web -- -u
```

---

## Coverage

```bash
# Generate coverage report
npm test -- --coverage

# Generate HTML report
npm test -- --coverage --coverage-reporters=html

# Open report
open coverage/index.html
```

**Target Coverage:**
- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

---

## Test Organization

```
apps/api/src/
├── products/
│   ├── products.service.ts
│   ├── products.service.spec.ts        ← Test file
│   ├── products.controller.ts
│   ├── products.controller.spec.ts     ← Test file
│   └── ...

apps/web/src/
├── components/
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductCard.test.tsx        ← Test file
│   │   └── ...
└── lib/
    ├── api-client.ts
    ├── api-client.test.ts              ← Test file
    └── ...
```

---

## Best Practices

1. **Test behavior, not implementation** — Focus on what users see/do
2. **Use meaningful test names** — Test name should explain expected behavior
3. **Arrange, Act, Assert** — Structure tests clearly
4. **DRY test code** — Reuse fixtures and setup functions
5. **Mock external dependencies** — CT SDK, Redis, HTTP calls
6. **Test edge cases** — Empty states, errors, null values
7. **Write tests alongside code** — Test-driven development (TDD)
8. **Keep tests fast** — Mock expensive operations
9. **Avoid testing implementation details** — Test public API
10. **Use test doubles wisely** — Mock, stub, but not everything

---

## Running Tests in CI/CD

GitHub Actions (`.github/workflows/test.yml`):

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

*Last updated: 2026-02-25*

