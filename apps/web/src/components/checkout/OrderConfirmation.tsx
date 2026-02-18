/**
 * OrderConfirmation — success message after order is placed.
 */
"use client";

import Link from "next/link";
import type { Order } from "@ct-b2c/types";

interface OrderConfirmationProps {
  order: Order;
}

/**
 * Format cents to display price.
 */
function formatPrice(centAmount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(centAmount / 100);
}

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  return (
    <div className="text-center py-8">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h2>
        <p className="text-gray-600">Thank you for your purchase.</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-medium">
              {order.orderNumber || order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium capitalize">{order.orderState}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium">
              {formatPrice(
                order.totalPrice.centAmount,
                order.totalPrice.currencyCode
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Items:</span>
            <span className="font-medium">{order.lineItems.length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/account/orders"
          className="block w-full max-w-md mx-auto bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
        >
          View My Orders
        </Link>
        <Link
          href="/products"
          className="block w-full max-w-md mx-auto border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
