/**
 * OrderCard — displays a single order's summary with status badges.
 */
"use client";

import Link from "next/link";
import type { Order } from "@ct-b2c/types";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderCardProps {
  order: Order;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(cents: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(cents / 100);
}

export function OrderCard({ order }: OrderCardProps) {
  const orderNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();
  const itemCount = order.lineItems.reduce((sum, li) => sum + li.quantity, 0);

  return (
    <div
      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
      data-testid="order-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-lg" data-testid="order-number">
            Order #{orderNumber}
          </h3>
          <p className="text-sm text-gray-500" data-testid="order-date">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge type="order" status={order.orderState} />
          {order.paymentState && (
            <OrderStatusBadge type="payment" status={order.paymentState} />
          )}
          {order.shipmentState && (
            <OrderStatusBadge type="shipment" status={order.shipmentState} />
          )}
        </div>
      </div>

      {/* Line items preview */}
      <div className="border-t pt-4 mb-4">
        <div className="flex flex-col gap-2">
          {order.lineItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3"
              data-testid="order-line-item"
            >
              {item.variant?.images?.[0]?.url ? (
                <img
                  src={item.variant.images[0].url}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                  ?
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">
                {formatPrice(
                  item.price.value.centAmount,
                  item.price.value.currencyCode,
                )}
              </p>
            </div>
          ))}
          {order.lineItems.length > 3 && (
            <p className="text-sm text-gray-500">
              + {order.lineItems.length - 3} more item
              {order.lineItems.length - 3 > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-4">
        <div>
          <p className="text-sm text-gray-500">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </p>
          <p className="font-semibold" data-testid="order-total">
            Total:{" "}
            {formatPrice(
              order.totalPrice.centAmount,
              order.totalPrice.currencyCode,
            )}
          </p>
        </div>
        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
          data-testid="view-order-link"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
