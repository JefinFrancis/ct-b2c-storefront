import { test as base, type Page } from '@playwright/test';

/**
 * Playwright Test Fixtures for Web Tests
 * Provides setup/teardown and shared utilities
 */

// Playwright's fixture generics are strict; cast to any to allow custom fixtures used in tests.
export const test = (base as any).extend({
  /**
   * Authenticated user fixture
   * Logs in before test and logs out after
   */
  authenticatedPage: async ({ page }: { page: Page }, use: (p: Page) => Promise<void>) => {
    // Login
    await page.goto('http://localhost:3001/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Wait for redirect to authenticated area
    await page.waitForURL(/\/(dashboard|account|products)/);

    // Use authenticated page
    await use(page);

    // Cleanup: logout if available
    try {
      const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      }
    } catch {
      // Silently ignore if logout not found
    }
  },

  /**
   * Shopping cart fixture
   * Provides a cart with products for testing checkout flows
   */
  cartWithItems: async ({ page }: { page: Page }, use: (p: Page) => Promise<void>) => {
    // Go to products
    await page.goto('http://localhost:3001/products');

    // Add first product to cart
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    await page.getByRole('button', { name: /add to cart/i }).click();

    // Go to cart
    await page.goto('http://localhost:3001/cart');

    // Use cart page
    await use(page);
  },

  /**
   * Mock API responses for predictable testing
   */
  mockApi: async ({ page }: { page: Page }, use: (p: Page) => Promise<void>) => {
    const mockData = {
      products: [
        {
          id: 'prod-1',
          name: 'Test Product 1',
          price: 99.99,
          image: 'https://via.placeholder.com/300',
        },
        {
          id: 'prod-2',
          name: 'Test Product 2',
          price: 149.99,
          image: 'https://via.placeholder.com/300',
        },
      ],
      cart: {
        id: 'cart-1',
        lineItems: [],
        totalPrice: 0,
      },
    };

    // Mock products endpoint
    await page.route('**/api/v1/products**', (route: any) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify(mockData.products),
      });
    });

    // Mock cart endpoint
    await page.route('**/api/v1/cart**', (route: any) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify(mockData.cart),
      });
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
