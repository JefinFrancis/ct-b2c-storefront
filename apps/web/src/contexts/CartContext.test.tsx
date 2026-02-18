import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";
import { cartApi } from "@/lib/api-client";
import type { Cart } from "@ct-b2c/types";

// Mock the api-client
vi.mock("@/lib/api-client", () => ({
  cartApi: {
    getSessionCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

const mockCartApi = vi.mocked(cartApi);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

const createMockCart = (
  lineItems: Cart["lineItems"] = [],
  overrides: Partial<Cart> = {}
): Cart => ({
  id: "cart-123",
  version: 1,
  createdAt: "2024-01-01T00:00:00.000Z",
  lastModifiedAt: "2024-01-01T00:00:00.000Z",
  lineItems,
  cartState: "Active",
  totalPrice: {
    centAmount: 0,
    currencyCode: "USD",
    type: "centPrecision",
    fractionDigits: 2,
  },
  totalLineItemQuantity: 0,
  ...overrides,
});

// Test component to access context
function TestConsumer() {
  const { cart, isLoading, error, itemCount } = useCart();

  return (
    <div>
      <span data-testid="loading">{isLoading ? "loading" : "loaded"}</span>
      <span data-testid="error">{error || "no-error"}</span>
      <span data-testid="cart-id">{cart?.id || "no-cart"}</span>
      <span data-testid="item-count">{itemCount}</span>
    </div>
  );
}

describe("CartContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem("ct_session_id", "test-session-id");
  });

  describe("CartProvider", () => {
    it("fetches cart on mount when session exists", async () => {
      const mockCart = createMockCart();
      mockCartApi.getSessionCart.mockResolvedValue(mockCart);

      render(
        <CartProvider>
          <TestConsumer />
        </CartProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("cart-id")).toHaveTextContent("cart-123");
      });

      expect(mockCartApi.getSessionCart).toHaveBeenCalledWith("test-session-id");
    });

    it("shows loading state while fetching cart", async () => {
      let resolveCart: (cart: Cart) => void;
      const cartPromise = new Promise<Cart>((resolve) => {
        resolveCart = resolve;
      });
      mockCartApi.getSessionCart.mockReturnValue(cartPromise);

      render(
        <CartProvider>
          <TestConsumer />
        </CartProvider>
      );

      expect(screen.getByTestId("loading")).toHaveTextContent("loading");

      await act(async () => {
        resolveCart!(createMockCart());
        await cartPromise;
      });

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });

    it("sets error when cart fetch fails", async () => {
      mockCartApi.getSessionCart.mockRejectedValue(new Error("Network error"));

      render(
        <CartProvider>
          <TestConsumer />
        </CartProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Network error");
      });
    });

    it("calculates item count from line items", async () => {
      const mockCart = createMockCart([
        {
          id: "item-1",
          productId: "prod-1",
          name: { "en-US": "Product 1" },
          quantity: 2,
          price: {
            id: "price-1",
            value: {
              centAmount: 1000,
              currencyCode: "USD",
              type: "centPrecision",
              fractionDigits: 2,
            },
          },
          totalPrice: {
            centAmount: 2000,
            currencyCode: "USD",
            type: "centPrecision",
            fractionDigits: 2,
          },
          variant: { id: 1, sku: "SKU-1", images: [], attributes: [], prices: [] },
        },
        {
          id: "item-2",
          productId: "prod-2",
          name: { "en-US": "Product 2" },
          quantity: 3,
          price: {
            id: "price-2",
            value: {
              centAmount: 500,
              currencyCode: "USD",
              type: "centPrecision",
              fractionDigits: 2,
            },
          },
          totalPrice: {
            centAmount: 1500,
            currencyCode: "USD",
            type: "centPrecision",
            fractionDigits: 2,
          },
          variant: { id: 1, sku: "SKU-2", images: [], attributes: [], prices: [] },
        },
      ]);
      mockCartApi.getSessionCart.mockResolvedValue(mockCart);

      render(
        <CartProvider>
          <TestConsumer />
        </CartProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("item-count")).toHaveTextContent("5");
      });
    });

    it("generates session ID when not present", async () => {
      localStorageMock.clear();
      const mockCart = createMockCart();
      mockCartApi.getSessionCart.mockResolvedValue(mockCart);

      render(
        <CartProvider>
          <TestConsumer />
        </CartProvider>
      );

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "ct_session_id",
          expect.any(String)
        );
      });
    });
  });

  describe("useCart hook", () => {
    it("throws error when used outside provider", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<TestConsumer />)).toThrow(
        "useCart must be used within a CartProvider"
      );

      consoleError.mockRestore();
    });
  });
});
