import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MiniCart from "./MiniCart";
import * as CartContextModule from "@/contexts/CartContext";
import { createMockCart, createMockLineItem, makeCartContextValue } from "@/__tests__/test-utils/mockCart";

// Mock the CartContext
vi.mock("@/contexts/CartContext", () => ({
  useCart: vi.fn(),
}));

const mockUseCart = vi.mocked(CartContextModule.useCart);

const mockLineItem = createMockLineItem({
  quantity: 2,
  price: { id: "price-1", value: { centAmount: 2999, currencyCode: "USD", fractionDigits: 2 } },
  totalPrice: { centAmount: 5998, currencyCode: "USD", fractionDigits: 2 },
  variant: { id: 1, sku: "SKU-001", images: [{ url: "https://example.com/image.jpg", dimensions: { w: 100, h: 100 } }], attributes: [] },
});

describe("MiniCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders cart icon button", () => {
    mockUseCart.mockReturnValue(makeCartContextValue({ cart: null, itemCount: 0 }));

    render(<MiniCart />);

    const button = screen.getByRole("button", { name: /shopping cart/i });
    expect(button).toBeInTheDocument();
  });

  it("shows item count badge when cart has items", () => {
    mockUseCart.mockReturnValue(makeCartContextValue({ cart: createMockCart([mockLineItem]), itemCount: 2 }));

    render(<MiniCart />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("does not show badge when cart is empty", () => {
    mockUseCart.mockReturnValue(makeCartContextValue({ cart: createMockCart([]), itemCount: 0 }));

    render(<MiniCart />);

    // Badge should not be present
    const badge = screen.queryByText("0");
    expect(badge).not.toBeInTheDocument();
  });

  it("shows 99+ when item count exceeds 99", () => {
    mockUseCart.mockReturnValue(makeCartContextValue({ cart: createMockCart([mockLineItem]), itemCount: 150 }));

    render(<MiniCart />);

    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("opens dropdown when button is clicked", () => {
    mockUseCart.mockReturnValue(makeCartContextValue({ cart: createMockCart([]), itemCount: 0 }));

    render(<MiniCart />);

    const button = screen.getByRole("button", { name: /shopping cart/i });
    fireEvent.click(button);

    expect(screen.getByText("Shopping Cart")).toBeInTheDocument();
  });

  it("shows loading state while cart is loading", () => {
    mockUseCart.mockReturnValue(makeCartContextValue({ cart: null, isLoading: true, itemCount: 0 }));

    render(<MiniCart />);

    const button = screen.getByRole("button", { name: /shopping cart/i });
    fireEvent.click(button);

    // Should show loading spinner (animate-spin class)
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("shows empty cart message when cart has no items", () => {
    mockUseCart.mockReturnValue(makeCartContextValue({ cart: createMockCart([]), itemCount: 0 }));

    render(<MiniCart />);

    const button = screen.getByRole("button", { name: /shopping cart/i });
    fireEvent.click(button);

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByText("Continue Shopping")).toBeInTheDocument();
  });

  it("displays line items when cart has products", () => {
    mockUseCart.mockReturnValue(makeCartContextValue({ cart: createMockCart([mockLineItem]), itemCount: 2 }));

    render(<MiniCart />);

    const button = screen.getByRole("button", { name: /shopping cart/i });
    fireEvent.click(button);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("Qty: 2")).toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", () => {
    mockUseCart.mockReturnValue(makeCartContextValue({ cart: createMockCart([]), itemCount: 0 }));

    render(
      <div>
        <MiniCart />
        <div data-testid="outside">Outside</div>
      </div>
    );

    // Open the dropdown
    const button = screen.getByRole("button", { name: /shopping cart/i });
    fireEvent.click(button);
    expect(screen.getByText("Shopping Cart")).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside"));

    // Dropdown should be closed
    expect(screen.queryByText("Your cart is empty")).not.toBeInTheDocument();
  });
});
