import type { Page } from '@playwright/test';

/**
 * Helper utilities for E2E tests
 */

/**
 * Wait for API response with specific criteria
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string,
  timeout = 5000
) {
  return page.waitForResponse(
    (response) =>
      response.url().includes(urlPattern) && response.status() === 200,
    { timeout }
  );
}

/**
 * Add product to cart via UI
 */
export async function addProductToCart(page: Page, productName?: string) {
  if (productName) {
    // Find product by name and click
    await page.getByText(productName).first().click();
  } else {
    // Add first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
  }

  // Click add to cart
  await page.getByRole('button', { name: /add to cart/i }).click();

  // Wait for success message
  await page.getByText(/added to cart/i).waitFor();
}

/**
 * Login user
 */
export async function loginUser(
  page: Page,
  email: string,
  password: string
) {
  await page.goto('http://localhost:3001/login');

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);

  // Intercept login response
  const loginPromise = page.waitForResponse((r) =>
    r.url().includes('/api/v1/auth/login')
  );

  await page.getByRole('button', { name: /login|sign in/i }).click();

  await loginPromise;
  await page.waitForURL(/\/(dashboard|account|products)/);
}

/**
 * Complete checkout
 */
export async function completeCheckout(
  page: Page,
  addressOverrides: any = {}
) {
  // Default address
  const address = {
    firstName: 'John',
    lastName: 'Doe',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    ...addressOverrides,
  };

  // Shipping address step
  await page.getByLabel(/first name/i).fill(address.firstName);
  await page.getByLabel(/last name/i).fill(address.lastName);
  await page.getByLabel(/street/i).fill(address.street);
  await page.getByLabel(/city/i).fill(address.city);
  await page.getByLabel(/state|region/i).fill(address.state);
  await page.getByLabel(/zip|postal/i).fill(address.zip);

  await page.getByRole('button', { name: /next|continue/i }).click();

  // Shipping method step
  const shippingMethod = page.locator('[data-testid="shipping-method"]').first();
  await shippingMethod.click();

  await page.getByRole('button', { name: /next|continue/i }).click();

  // Review step
  await page.getByRole('button', { name: /place order|confirm/i }).click();
}

/**
 * Get cart count from header
 */
export async function getCartCount(page: Page): Promise<number> {
  const cartBadge = page.locator('[data-testid="cart-count"]');
  if (await cartBadge.isVisible()) {
    const text = await cartBadge.textContent();
    return parseInt(text || '0');
  }
  return 0;
}

/**
 * Mock payment success
 */
export async function mockPaymentSuccess(page: Page) {
  await page.route('**/api/v1/payments/**', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        transactionId: 'txn-12345',
        state: 'Success',
      }),
    });
  });
}

/**
 * Assert product in cart
 */
export async function assertProductInCart(page: Page, productName: string) {
  await page.goto('http://localhost:3001/cart');
  const cartItem = page.getByText(productName);
  const isVisible = await cartItem.isVisible();
  if (!isVisible) {
    throw new Error(`Product "${productName}" not found in cart`);
  }
}

/**
 * Assert order confirmation
 */
export async function assertOrderConfirmation(page: Page) {
  await page.getByText(/order confirmed|thank you/i).waitFor();
  const orderNumber = page.getByText(/order #\d+/i);
  if (!(await orderNumber.isVisible())) {
    throw new Error('Order confirmation page not reached');
  }
}
