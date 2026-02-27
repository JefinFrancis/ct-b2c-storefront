/**
 * CheckoutContext tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { CheckoutProvider, useCheckout } from "./CheckoutContext";
import type { Cart, ShippingMethod, Order } from "@ct-b2c/types";

// Mock the api-client
vi.mock("@/lib/api-client", () => ({
  cartApi: {
    setShippingAddress: vi.fn(),
    setBillingAddress: vi.fn(),
    getShippingMethods: vi.fn(),
    setShippingMethod: vi.fn(),
  },
  ordersApi: {
    create: vi.fn(),
  },
}));

// Mock the AuthContext
const mockToken = "test-jwt-token";
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    token: mockToken,
    customer: { id: "customer-123", email: "test@example.com" },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
  })),
}));

import { cartApi, ordersApi } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

const mockCart: Cart = {
  id: "cart-123",
  version: 1,
  lineItems: [
    {
      id: "line-1",
      productId: "prod-1",
      name: { "en-US": "Test Product" },
      variant: { id: 1 },
      price: {
        id: "price-1",
        value: { currencyCode: "USD", centAmount: 1999, fractionDigits: 2 },
      },
      quantity: 2,
      totalPrice: { currencyCode: "USD", centAmount: 3998, fractionDigits: 2 },
    },
  ],
  totalPrice: { currencyCode: "USD", centAmount: 3998, fractionDigits: 2 },
  cartState: "Active",
};

const mockShippingMethods: ShippingMethod[] = [
  {
    id: "sm-1",
    name: "Standard Shipping",
    price: { currencyCode: "USD", centAmount: 599, fractionDigits: 2 },
    deliveryTime: "5-7",
  },
  {
    id: "sm-2",
    name: "Express Shipping",
    price: { currencyCode: "USD", centAmount: 1499, fractionDigits: 2 },
    deliveryTime: "2-3",
  },
];

const mockOrder: Order = {
  id: "order-123",
  version: 1,
  lineItems: mockCart.lineItems,
  totalPrice: mockCart.totalPrice,
  orderState: "Open",
  createdAt: "2024-01-15T10:00:00Z",
  lastModifiedAt: "2024-01-15T10:00:00Z",
};

// Test component to access context
function TestConsumer({
  onContext,
}: {
  onContext?: (ctx: ReturnType<typeof useCheckout>) => void;
}) {
  const ctx = useCheckout();
  onContext?.(ctx);
  return (
    <div>
      <span data-testid="step">{ctx.currentStep}</span>
      <span data-testid="loading">{ctx.isLoading ? "loading" : "idle"}</span>
      <span data-testid="error">{ctx.error || "none"}</span>
      <span data-testid="cart-id">{ctx.cart?.id || "no-cart"}</span>
    </div>
  );
}

describe("CheckoutContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CheckoutProvider", () => {
    it("initializes with address step", () => {
      render(
        <CheckoutProvider>
          <TestConsumer />
        </CheckoutProvider>
      );

      expect(screen.getByTestId("step")).toHaveTextContent("address");
    });

    it("accepts initial cart", () => {
      render(
        <CheckoutProvider initialCart={mockCart}>
          <TestConsumer />
        </CheckoutProvider>
      );

      expect(screen.getByTestId("cart-id")).toHaveTextContent("cart-123");
    });

    it("setCart updates cart state", () => {
      let contextRef: ReturnType<typeof useCheckout> | null = null;

      render(
        <CheckoutProvider>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </CheckoutProvider>
      );

      act(() => {
        contextRef!.setCart(mockCart);
      });

      expect(screen.getByTestId("cart-id")).toHaveTextContent("cart-123");
    });
  });

  describe("setShippingAddress", () => {
    it("sets shipping address and advances to shipping step", async () => {
      const updatedCart = { ...mockCart, shippingAddress: { country: "US" } };
      (cartApi.setShippingAddress as ReturnType<typeof vi.fn>).mockResolvedValue(
        updatedCart
      );
      (cartApi.setBillingAddress as ReturnType<typeof vi.fn>).mockResolvedValue(
        updatedCart
      );

      let contextRef: ReturnType<typeof useCheckout> | null = null;

      render(
        <CheckoutProvider initialCart={mockCart}>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </CheckoutProvider>
      );

      await act(async () => {
        await contextRef!.setShippingAddress({
          firstName: "John",
          lastName: "Doe",
          streetName: "123 Main St",
          city: "New York",
          postalCode: "10001",
          country: "US",
        });
      });

      expect(screen.getByTestId("step")).toHaveTextContent("shipping");
      expect(cartApi.setShippingAddress).toHaveBeenCalledWith("cart-123", {
        firstName: "John",
        lastName: "Doe",
        streetName: "123 Main St",
        city: "New York",
        postalCode: "10001",
        country: "US",
      });
    });

    it("throws error when no cart available", async () => {
      let contextRef: ReturnType<typeof useCheckout> | null = null;

      render(
        <CheckoutProvider>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </CheckoutProvider>
      );

      await expect(
        contextRef!.setShippingAddress({
          firstName: "John",
          lastName: "Doe",
          streetName: "123 Main St",
          city: "New York",
          postalCode: "10001",
          country: "US",
        })
      ).rejects.toThrow("No cart available");
    });

    it("sets error on API failure", async () => {
      (cartApi.setShippingAddress as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("API Error")
      );

      let contextRef: ReturnType<typeof useCheckout> | null = null;

      render(
        <CheckoutProvider initialCart={mockCart}>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </CheckoutProvider>
      );

      await expect(
        contextRef!.setShippingAddress({
          firstName: "John",
          lastName: "Doe",
          streetName: "123 Main St",
          city: "New York",
          postalCode: "10001",
          country: "US",
        })
      ).rejects.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("API Error");
      });
    });
  });

  describe("loadShippingMethods", () => {
    it("loads shipping methods from API", async () => {
      (cartApi.getShippingMethods as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockShippingMethods
      );

      let contextRef: ReturnType<typeof useCheckout> | null = null;

      render(
        <CheckoutProvider initialCart={mockCart}>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </CheckoutProvider>
      );

      await act(async () => {
        await contextRef!.loadShippingMethods();
      });

      expect(contextRef!.shippingMethods).toEqual(mockShippingMethods);
      expect(cartApi.getShippingMethods).toHaveBeenCalledWith("cart-123");
    });
  });

  describe("selectShippingMethod", () => {
    it("sets shipping method and advances to review step", async () => {
      const updatedCart = {
        ...mockCart,
        shippingInfo: { shippingMethodName: "Standard", price: { centAmount: 599, currencyCode: "USD", fractionDigits: 2 } },
      };
      (cartApi.setShippingMethod as ReturnType<typeof vi.fn>).mockResolvedValue(
        updatedCart
      );

      let contextRef: ReturnType<typeof useCheckout> | null = null;

      render(
        <CheckoutProvider initialCart={mockCart}>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </CheckoutProvider>
      );

      await act(async () => {
        await contextRef!.selectShippingMethod("sm-1");
      });

      expect(screen.getByTestId("step")).toHaveTextContent("payment");
      expect(contextRef!.selectedShippingMethodId).toBe("sm-1");
    });
  });

  describe("placeOrder", () => {
    it("creates order from cart with auth token", async () => {
      (ordersApi.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrder);

      let contextRef: ReturnType<typeof useCheckout> | null = null;

      render(
        <CheckoutProvider initialCart={mockCart}>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </CheckoutProvider>
      );

      let order: Order | undefined;
      await act(async () => {
        order = await contextRef!.placeOrder();
      });

      expect(order).toEqual(mockOrder);
      expect(contextRef!.order).toEqual(mockOrder);
      expect(ordersApi.create).toHaveBeenCalledWith("cart-123", mockToken);
    });

    it("throws error when not logged in", async () => {
      // Override the mock to return null token
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        token: null,
        customer: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        clearError: vi.fn(),
      });

      let contextRef: ReturnType<typeof useCheckout> | null = null;

      render(
        <CheckoutProvider initialCart={mockCart}>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </CheckoutProvider>
      );

      await expect(contextRef!.placeOrder()).rejects.toThrow(
        "You must be logged in to place an order"
      );

      // Restore the mock
      (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        token: mockToken,
        customer: { id: "customer-123", email: "test@example.com" },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        clearError: vi.fn(),
      });
    });

    it("sets error on API failure", async () => {
      (ordersApi.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Order failed")
      );

      let contextRef: ReturnType<typeof useCheckout> | null = null;

      render(
        <CheckoutProvider initialCart={mockCart}>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </CheckoutProvider>
      );

      await expect(contextRef!.placeOrder()).rejects.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Order failed");
      });
    });
  });

  describe("navigation", () => {
    it("goToStep changes current step", () => {
      let contextRef: ReturnType<typeof useCheckout> | null = null;

      render(
        <CheckoutProvider>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </CheckoutProvider>
      );

      act(() => {
        contextRef!.goToStep("shipping");
      });

      expect(screen.getByTestId("step")).toHaveTextContent("shipping");
    });

    it("resetCheckout resets to initial state", () => {
      let contextRef: ReturnType<typeof useCheckout> | null = null;

      render(
        <CheckoutProvider>
          <TestConsumer onContext={(ctx) => (contextRef = ctx)} />
        </CheckoutProvider>
      );

      act(() => {
        contextRef!.goToStep("review");
      });

      expect(screen.getByTestId("step")).toHaveTextContent("review");

      act(() => {
        contextRef!.resetCheckout();
      });

      expect(screen.getByTestId("step")).toHaveTextContent("address");
    });
  });
});
