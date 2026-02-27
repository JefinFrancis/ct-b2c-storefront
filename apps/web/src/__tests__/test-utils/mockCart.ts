import { vi } from "vitest";
import type { Cart, LineItem } from "@ct-b2c/types";

export function createMockLineItem(overrides: Partial<LineItem> = {}): LineItem {
  return {
    id: overrides.id ?? "line-item-1",
    productId: overrides.productId ?? "prod-1",
    name: overrides.name ?? { "en-US": "Test Product" },
    quantity: overrides.quantity ?? 1,
    variant: overrides.variant ?? { id: 1 },
    price: overrides.price ?? {
      id: "price-1",
      value: { centAmount: 1999, currencyCode: "USD", fractionDigits: 2 },
    },
    totalPrice: overrides.totalPrice ?? { centAmount: 1999, currencyCode: "USD", fractionDigits: 2 },
    ...(overrides as object),
  } as LineItem;
}

export function createMockCart(lineItems: LineItem[] = []): Cart {
  const totalCent = lineItems.reduce((sum, it) => sum + (it.totalPrice?.centAmount ?? 0), 0);
  return {
    id: "cart-123",
    version: 1,
    lineItems,
    cartState: "Active",
    totalPrice: { centAmount: totalCent, currencyCode: "USD", fractionDigits: 2 },
  } as Cart;
}

export function makeCartContextValue(overrides: Record<string, any> = {}) {
  return {
    cart: null,
    isLoading: false,
    error: null,
    itemCount: 0,
    addItem: vi.fn(),
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    refreshCart: vi.fn(),
    addDiscountCode: vi.fn(),
    removeDiscountCode: vi.fn(),
    setMergedCart: vi.fn(),
    getCartId: () => "cart-123",
    clearCart: vi.fn(),
    ...overrides,
  };
}

export default createMockCart;
