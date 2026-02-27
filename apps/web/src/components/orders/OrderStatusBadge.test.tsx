/**
 * Unit tests for OrderStatusBadge component.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderStatusBadge } from "./OrderStatusBadge";

describe("OrderStatusBadge", () => {
  describe("order status", () => {
    it("renders Open status with blue styling", () => {
      render(<OrderStatusBadge type="order" status="Open" />);
      const badge = screen.getByTestId("order-status-badge");
      expect(badge).toHaveTextContent("Open");
      expect(badge).toHaveClass("bg-blue-100", "text-blue-800");
    });

    it("renders Confirmed status with green styling", () => {
      render(<OrderStatusBadge type="order" status="Confirmed" />);
      const badge = screen.getByTestId("order-status-badge");
      expect(badge).toHaveTextContent("Confirmed");
      expect(badge).toHaveClass("bg-green-100", "text-green-800");
    });

    it("renders Cancelled status with red styling", () => {
      render(<OrderStatusBadge type="order" status="Cancelled" />);
      const badge = screen.getByTestId("order-status-badge");
      expect(badge).toHaveTextContent("Cancelled");
      expect(badge).toHaveClass("bg-red-100", "text-red-800");
    });

    it("renders Complete status with gray styling", () => {
      render(<OrderStatusBadge type="order" status="Complete" />);
      const badge = screen.getByTestId("order-status-badge");
      expect(badge).toHaveTextContent("Complete");
      expect(badge).toHaveClass("bg-gray-100", "text-gray-800");
    });
  });

  describe("payment status", () => {
    it("renders Paid status with green styling", () => {
      render(<OrderStatusBadge type="payment" status="Paid" />);
      const badge = screen.getByTestId("payment-status-badge");
      expect(badge).toHaveTextContent("Paid");
      expect(badge).toHaveClass("bg-green-100", "text-green-800");
    });

    it("renders Pending status with yellow styling", () => {
      render(<OrderStatusBadge type="payment" status="Pending" />);
      const badge = screen.getByTestId("payment-status-badge");
      expect(badge).toHaveTextContent("Pending");
      expect(badge).toHaveClass("bg-yellow-100", "text-yellow-800");
    });

    it("renders Failed status with red styling", () => {
      render(<OrderStatusBadge type="payment" status="Failed" />);
      const badge = screen.getByTestId("payment-status-badge");
      expect(badge).toHaveTextContent("Failed");
      expect(badge).toHaveClass("bg-red-100", "text-red-800");
    });
  });

  describe("shipment status", () => {
    it("renders Shipped status with indigo styling", () => {
      render(<OrderStatusBadge type="shipment" status="Shipped" />);
      const badge = screen.getByTestId("shipment-status-badge");
      expect(badge).toHaveTextContent("Shipped");
      expect(badge).toHaveClass("bg-indigo-100", "text-indigo-800");
    });

    it("renders Delivered status with green styling", () => {
      render(<OrderStatusBadge type="shipment" status="Delivered" />);
      const badge = screen.getByTestId("shipment-status-badge");
      expect(badge).toHaveTextContent("Delivered");
      expect(badge).toHaveClass("bg-green-100", "text-green-800");
    });

    it("renders Delayed status with orange styling", () => {
      render(<OrderStatusBadge type="shipment" status="Delayed" />);
      const badge = screen.getByTestId("shipment-status-badge");
      expect(badge).toHaveTextContent("Delayed");
      expect(badge).toHaveClass("bg-orange-100", "text-orange-800");
    });
  });
});
