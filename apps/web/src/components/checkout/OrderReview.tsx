/**
 * OrderReview — final checkout step showing order summary before placing order.
 */
"use client";

import { useState } from "react";
import type { Cart, Order } from "@ct-b2c/types";

interface OrderReviewProps {
  cart: Cart;
  onPlaceOrder: () => Promise<Order>;
  onBack: () => void;
  isLoading?: boolean;
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

export function OrderReview({
  cart,
  onPlaceOrder,
  onBack,
  isLoading = false,
}: OrderReviewProps) {
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    setError(null);
    try {
      await onPlaceOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    }
  };

  const address = cart.shippingAddress;
  const shippingInfo = cart.shippingInfo;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded" role="alert">
          {error}
        </div>
      )}

      {/* Shipping Address */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
        {address ? (
          <div className="text-sm text-gray-600">
            <p>
              {address.firstName} {address.lastName}
            </p>
            <p>{address.streetName}</p>
            {address.streetNumber && <p>{address.streetNumber}</p>}
            <p>
              {address.city}, {address.region} {address.postalCode}
            </p>
            <p>{address.country}</p>
            {address.phone && <p>Phone: {address.phone}</p>}
            {address.email && <p>Email: {address.email}</p>}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No address set</p>
        )}
      </div>

      {/* Shipping Method */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Shipping Method</h3>
        {shippingInfo ? (
          <div className="flex justify-between text-sm">
            <span>{shippingInfo.shippingMethodName}</span>
            <span className="font-medium">
              {formatPrice(
                shippingInfo.price.centAmount,
                shippingInfo.price.currencyCode
              )}
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No shipping method selected</p>
        )}
      </div>

      {/* Order Items */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
        <div className="space-y-3">
          {cart.lineItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center text-sm"
            >
              <div className="flex items-center gap-3">
                {item.variant.images?.[0] && (
                  <img
                    src={item.variant.images[0].url}
                    alt={item.name["en-US"] || item.name["en"] || "Product"}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium">
                    {item.name["en-US"] || item.name["en"] || "Product"}
                  </p>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-medium">
                {formatPrice(
                  item.totalPrice.centAmount,
                  item.totalPrice.currencyCode
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Total */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span>
            {formatPrice(
              cart.totalPrice.centAmount -
                (shippingInfo?.price.centAmount ?? 0),
              cart.totalPrice.currencyCode
            )}
          </span>
        </div>
        {shippingInfo && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Shipping</span>
            <span>
              {formatPrice(
                shippingInfo.price.centAmount,
                shippingInfo.price.currencyCode
              )}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total</span>
          <span>
            {formatPrice(
              cart.totalPrice.centAmount,
              cart.totalPrice.currencyCode
            )}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
