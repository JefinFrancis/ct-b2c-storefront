/**
 * ShippingMethodSelector component tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShippingMethodSelector } from "./ShippingMethodSelector";
import type { ShippingMethod } from "@ct-b2c/types";

const mockShippingMethods: ShippingMethod[] = [
  {
    id: "sm-standard",
    name: "Standard Shipping",
    price: { currencyCode: "USD", centAmount: 599, fractionDigits: 2 },
    deliveryTime: "5-7",
    description: "Delivered in 5-7 business days",
  },
  {
    id: "sm-express",
    name: "Express Shipping",
    price: { currencyCode: "USD", centAmount: 1499, fractionDigits: 2 },
    deliveryTime: "2-3",
  },
];

describe("ShippingMethodSelector", () => {
  const mockOnSelect = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all shipping methods", () => {
    render(
      <ShippingMethodSelector
        methods={mockShippingMethods}
        selectedMethodId={null}
        onSelect={mockOnSelect}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("Standard Shipping")).toBeInTheDocument();
    expect(screen.getByText("Express Shipping")).toBeInTheDocument();
    expect(screen.getByText("$5.99")).toBeInTheDocument();
    expect(screen.getByText("$14.99")).toBeInTheDocument();
  });

  it("shows description and delivery time when available", () => {
    render(
      <ShippingMethodSelector
        methods={mockShippingMethods}
        selectedMethodId={null}
        onSelect={mockOnSelect}
        onBack={mockOnBack}
      />
    );

    expect(
      screen.getByText("Delivered in 5-7 business days")
    ).toBeInTheDocument();
    expect(screen.getByText(/estimated delivery: 5-7 days/i)).toBeInTheDocument();
    expect(screen.getByText(/estimated delivery: 2-3 days/i)).toBeInTheDocument();
  });

  it("pre-selects shipping method from prop", () => {
    render(
      <ShippingMethodSelector
        methods={mockShippingMethods}
        selectedMethodId="sm-express"
        onSelect={mockOnSelect}
        onBack={mockOnBack}
      />
    );

    const expressRadio = screen.getByRole("radio", { name: /express shipping/i });
    expect(expressRadio).toBeChecked();
  });

  it("allows selecting a shipping method", async () => {
    const user = userEvent.setup();

    render(
      <ShippingMethodSelector
        methods={mockShippingMethods}
        selectedMethodId={null}
        onSelect={mockOnSelect}
        onBack={mockOnBack}
      />
    );

    const standardLabel = screen.getByText("Standard Shipping").closest("label");
    await user.click(standardLabel!);

    const standardRadio = screen.getByRole("radio", { name: /standard shipping/i });
    expect(standardRadio).toBeChecked();
  });

  it("calls onSelect with method ID on continue", async () => {
    const user = userEvent.setup();
    mockOnSelect.mockResolvedValue(undefined);

    render(
      <ShippingMethodSelector
        methods={mockShippingMethods}
        selectedMethodId={null}
        onSelect={mockOnSelect}
        onBack={mockOnBack}
      />
    );

    const standardLabel = screen.getByText("Standard Shipping").closest("label");
    await user.click(standardLabel!);
    await user.click(screen.getByRole("button", { name: /continue to review/i }));

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith("sm-standard");
    });
  });

  it("disables continue button when no selection", () => {
    render(
      <ShippingMethodSelector
        methods={mockShippingMethods}
        selectedMethodId={null}
        onSelect={mockOnSelect}
        onBack={mockOnBack}
      />
    );

    const continueButton = screen.getByRole("button", { name: /continue to review/i });
    expect(continueButton).toBeDisabled();
  });

  it("calls onBack when back button clicked", async () => {
    const user = userEvent.setup();

    render(
      <ShippingMethodSelector
        methods={mockShippingMethods}
        selectedMethodId={null}
        onSelect={mockOnSelect}
        onBack={mockOnBack}
      />
    );

    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(mockOnBack).toHaveBeenCalled();
  });

  it("shows message when no shipping methods available", () => {
    render(
      <ShippingMethodSelector
        methods={[]}
        selectedMethodId={null}
        onSelect={mockOnSelect}
        onBack={mockOnBack}
      />
    );

    expect(
      screen.getByText(/no shipping methods available/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/edit shipping address/i)).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    render(
      <ShippingMethodSelector
        methods={mockShippingMethods}
        selectedMethodId="sm-standard"
        onSelect={mockOnSelect}
        onBack={mockOnBack}
        isLoading={true}
      />
    );

    const continueButton = screen.getByRole("button", { name: /saving/i });
    expect(continueButton).toBeDisabled();
  });

  it("displays error from API failure", async () => {
    const user = userEvent.setup();
    mockOnSelect.mockRejectedValue(new Error("Failed to set shipping"));

    render(
      <ShippingMethodSelector
        methods={mockShippingMethods}
        selectedMethodId={null}
        onSelect={mockOnSelect}
        onBack={mockOnBack}
      />
    );

    const standardLabel = screen.getByText("Standard Shipping").closest("label");
    await user.click(standardLabel!);
    await user.click(screen.getByRole("button", { name: /continue to review/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /failed to set shipping/i
      );
    });
  });
});
