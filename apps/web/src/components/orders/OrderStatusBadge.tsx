/**
 * OrderStatusBadge — displays order, payment, or shipment status as a colored badge.
 */
"use client";

import type { OrderState, PaymentState, ShipmentState } from "@ct-b2c/types";

type StatusType = "order" | "payment" | "shipment";

interface OrderStatusBadgeProps {
  type: StatusType;
  status: OrderState | PaymentState | ShipmentState;
}

const ORDER_COLORS: Record<OrderState, string> = {
  Open: "bg-blue-100 text-blue-800",
  Confirmed: "bg-green-100 text-green-800",
  Complete: "bg-gray-100 text-gray-800",
  Cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<PaymentState, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  BalanceDue: "bg-orange-100 text-orange-800",
  Paid: "bg-green-100 text-green-800",
  Failed: "bg-red-100 text-red-800",
  CreditOwed: "bg-purple-100 text-purple-800",
};

const SHIPMENT_COLORS: Record<ShipmentState, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Ready: "bg-blue-100 text-blue-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Delayed: "bg-orange-100 text-orange-800",
  Partial: "bg-purple-100 text-purple-800",
  Backorder: "bg-red-100 text-red-800",
};

export function OrderStatusBadge({ type, status }: OrderStatusBadgeProps) {
  let colorClass = "bg-gray-100 text-gray-800";

  if (type === "order") {
    colorClass = ORDER_COLORS[status as OrderState] ?? colorClass;
  } else if (type === "payment") {
    colorClass = PAYMENT_COLORS[status as PaymentState] ?? colorClass;
  } else if (type === "shipment") {
    colorClass = SHIPMENT_COLORS[status as ShipmentState] ?? colorClass;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      data-testid={`${type}-status-badge`}
    >
      {status}
    </span>
  );
}
