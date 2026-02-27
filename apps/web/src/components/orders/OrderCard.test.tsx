/**
 * Unit tests for OrderCard component.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Order } from "@ct-b2c/types";
import { OrderCard } from "./OrderCard";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockOrder: Order = {
  id: "order-123",
  version: 1,
  orderNumber: "ORD-001",
  customerId: "customer-abc",
  customerEmail: "test@example.com",
  lineItems: [
    {
      id: "line-1",
      productId: "prod-1",
      name: { "en-US": "Test Product" },
      quantity: 2,
      variant: {
        id: 1,
        sku: "SKU-001",
        images: [{ url: "https://example.com/image.jpg" }],
      },
      price: {
        id: "price-1",
        value: { centAmount: 2999, currencyCode: "USD", fractionDigits: 2 },
      },
      totalPrice: { centAmount: 5998, currencyCode: "USD", fractionDigits: 2 },
    },
    {
      id: "line-2",
      productId: "prod-2",
      name: { "en-US": "Another Product" },
      quantity: 1,
      variant: {
        id: 2,
        sku: "SKU-002",
      },
      price: {
        id: "price-2",
        value: { centAmount: 4999, currencyCode: "USD", fractionDigits: 2 },
      },
      totalPrice: { centAmount: 4999, currencyCode: "USD", fractionDigits: 2 },
    },
  ],
  totalPrice: { centAmount: 10997, currencyCode: "USD", fractionDigits: 2 },
  orderState: "Open",
  paymentState: "Paid",
  shipmentState: "Shipped",
  createdAt: "2026-02-15T10:30:00Z",
  lastModifiedAt: "2026-02-15T10:30:00Z",
};

describe("OrderCard", () => {
  it("renders order number", () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByTestId("order-number")).toHaveTextContent(
      "Order #ORD-001",
    );
  });

  it("renders order date formatted", () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByTestId("order-date")).toHaveTextContent("Feb 15, 2026");
  });

  it("renders order state badge", () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByTestId("order-status-badge")).toHaveTextContent("Open");
  });

  it("renders payment state badge", () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByTestId("payment-status-badge")).toHaveTextContent(
      "Paid",
    );
  });

  it("renders shipment state badge", () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByTestId("shipment-status-badge")).toHaveTextContent(
      "Shipped",
    );
  });

  it("renders line items", () => {
    render(<OrderCard order={mockOrder} />);
    const lineItems = screen.getAllByTestId("order-line-item");
    expect(lineItems).toHaveLength(2);
    expect(lineItems[0]).toHaveTextContent("Test Product");
    expect(lineItems[1]).toHaveTextContent("Another Product");
  });

  it("renders total price formatted", () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByTestId("order-total")).toHaveTextContent(
      "Total: $109.97",
    );
  });

  it("renders view details link", () => {
    render(<OrderCard order={mockOrder} />);
    const link = screen.getByTestId("view-order-link");
    expect(link).toHaveAttribute("href", "/account/orders/order-123");
    expect(link).toHaveTextContent("View Details");
  });

  it("uses order ID when orderNumber is not set", () => {
    const orderWithoutNumber = { ...mockOrder, orderNumber: undefined };
    render(<OrderCard order={orderWithoutNumber} />);
    expect(screen.getByTestId("order-number")).toHaveTextContent(
      "Order #ORDER-12",
    );
  });

  it("shows remaining items count when more than 3 items", () => {
    const orderWithManyItems: Order = {
      ...mockOrder,
      lineItems: [
        ...mockOrder.lineItems,
        {
          id: "line-3",
          productId: "prod-3",
          name: { "en-US": "Product 3" },
          quantity: 1,
          variant: { id: 3 },
          price: {
            id: "price-3",
            value: { centAmount: 1999, currencyCode: "USD", fractionDigits: 2 },
          },
          totalPrice: { centAmount: 1999, currencyCode: "USD", fractionDigits: 2 },
        },
        {
          id: "line-4",
          productId: "prod-4",
          name: { "en-US": "Product 4" },
          quantity: 1,
          variant: { id: 4 },
          price: {
            id: "price-4",
            value: { centAmount: 1999, currencyCode: "USD", fractionDigits: 2 },
          },
          totalPrice: { centAmount: 1999, currencyCode: "USD", fractionDigits: 2 },
        },
      ],
    };
    render(<OrderCard order={orderWithManyItems} />);
    const lineItems = screen.getAllByTestId("order-line-item");
    expect(lineItems).toHaveLength(3);
    expect(screen.getByText("+ 1 more item")).toBeInTheDocument();
  });

  it("renders without optional status badges", () => {
    const orderWithoutOptionalStates: Order = {
      ...mockOrder,
      paymentState: undefined,
      shipmentState: undefined,
    };
    render(<OrderCard order={orderWithoutOptionalStates} />);
    expect(screen.getByTestId("order-status-badge")).toBeInTheDocument();
    expect(
      screen.queryByTestId("payment-status-badge"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("shipment-status-badge"),
    ).not.toBeInTheDocument();
  });

  it("renders placeholder for items without images", () => {
    const orderWithNoImage: Order = {
      ...mockOrder,
      lineItems: [
        {
          ...mockOrder.lineItems[1],
          variant: { id: 1 },
        },
      ],
    };
    render(<OrderCard order={orderWithNoImage} />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
