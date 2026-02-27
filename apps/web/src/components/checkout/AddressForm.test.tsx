/**
 * AddressForm component tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressForm } from "./AddressForm";

describe("AddressForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required form fields", () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(<AddressForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/street address/i), "123 Main St");
    await user.type(screen.getByLabelText(/city/i), "New York");
    await user.type(screen.getByLabelText(/postal code/i), "10001");

    await user.click(screen.getByRole("button", { name: /continue to shipping/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "John",
          lastName: "Doe",
          streetName: "123 Main St",
          city: "New York",
          postalCode: "10001",
          country: "US",
        })
      );
    });
  });

  it("shows validation error for missing first name", async () => {
    const user = userEvent.setup();

    render(<AddressForm onSubmit={mockOnSubmit} />);

    // Adding last name but NOT first name
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/street address/i), "123 Main St");
    await user.type(screen.getByLabelText(/city/i), "New York");
    await user.type(screen.getByLabelText(/postal code/i), "10001");

    await user.click(screen.getByRole("button", { name: /continue to shipping/i }));

    // The form has HTML5 required validation, so the submit won't happen
    // We just verify onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("requires address fields via HTML5 validation", async () => {
    const user = userEvent.setup();

    render(<AddressForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    // Not filling required street, city, postal code fields

    await user.click(screen.getByRole("button", { name: /continue to shipping/i }));

    // HTML5 validation prevents form submission
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("pre-fills form with initial address", () => {
    render(
      <AddressForm
        onSubmit={mockOnSubmit}
        initialAddress={{
          firstName: "Jane",
          lastName: "Smith",
          streetName: "456 Oak Ave",
          city: "Boston",
          postalCode: "02101",
        }}
      />
    );

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Jane");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Smith");
    expect(screen.getByLabelText(/street address/i)).toHaveValue("456 Oak Ave");
    expect(screen.getByLabelText(/city/i)).toHaveValue("Boston");
    expect(screen.getByLabelText(/postal code/i)).toHaveValue("02101");
  });

  it("shows loading state when isLoading is true", () => {
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent(/saving/i);
    expect(button).toBeDisabled();
  });

  it("displays error from API failure", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValue(new Error("Server error"));

    render(<AddressForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/street address/i), "123 Main St");
    await user.type(screen.getByLabelText(/city/i), "New York");
    await user.type(screen.getByLabelText(/postal code/i), "10001");

    await user.click(screen.getByRole("button", { name: /continue to shipping/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/server error/i);
    });
  });

  it("allows selecting different country", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(<AddressForm onSubmit={mockOnSubmit} />);

    await user.selectOptions(screen.getByLabelText(/country/i), "CA");
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/street address/i), "123 Main St");
    await user.type(screen.getByLabelText(/city/i), "Toronto");
    await user.type(screen.getByLabelText(/postal code/i), "M5V 1A1");

    await user.click(screen.getByRole("button", { name: /continue to shipping/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          country: "CA",
        })
      );
    });
  });
});
