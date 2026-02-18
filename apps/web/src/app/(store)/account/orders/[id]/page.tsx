/**
 * Order details page — displays full order information.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Order } from "@ct-b2c/types";
import { ordersApi } from "@/lib/api-client";
import { OrderStatusBadge } from "@/components/orders";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(cents: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(cents / 100);
}

/** Extract string value from LocalizedString (preferring 'en' locale) */
function getLocalizedString(
  localized: { [locale: string]: string } | undefined
): string {
  if (!localized) return "";
  return localized.en ?? localized["en-US"] ?? Object.values(localized)[0] ?? "";
}

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    ordersApi
      .get(orderId)
      .then((data) => {
        setOrder(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message ?? "Failed to load order");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId]);

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
              data-testid="loading-spinner"
            />
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/account/orders"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Back to Orders
          </Link>
          <div
            className="bg-red-50 text-red-700 p-4 rounded-lg"
            data-testid="error-message"
          >
            {error ?? "Order not found"}
          </div>
        </div>
      </main>
    );
  }

  const orderNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();
  const itemCount = order.lineItems.reduce((sum, li) => sum + li.quantity, 0);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Link
          href="/account/orders"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Orders
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold" data-testid="order-number">
              Order #{orderNumber}
            </h1>
            <p className="text-gray-500" data-testid="order-date">
              Placed on {formatDate(order.createdAt)}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line items */}
          <div className="lg:col-span-2 border rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-4">
              Items ({itemCount})
            </h2>
            <div className="divide-y">
              {order.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0"
                  data-testid="order-line-item"
                >
                  {item.variant?.images?.[0]?.url ? (
                    <img
                      src={item.variant.images[0].url}
                      alt={getLocalizedString(item.name)}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                      ?
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{getLocalizedString(item.name)}</p>
                    {item.variant?.sku && (
                      <p className="text-sm text-gray-500">
                        SKU: {item.variant.sku}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatPrice(
                        item.price.value.centAmount * item.quantity,
                        item.price.value.currencyCode,
                      )}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-500">
                        {formatPrice(
                          item.price.value.centAmount,
                          item.price.value.currencyCode,
                        )}{" "}
                        each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            {/* Shipping address */}
            {order.shippingAddress && (
              <div className="border rounded-lg p-4">
                <h2 className="font-semibold mb-2">Shipping Address</h2>
                <address className="not-italic text-sm text-gray-600">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                  <br />
                  {order.shippingAddress.streetName}
                  {order.shippingAddress.streetNumber && (
                    <> {order.shippingAddress.streetNumber}</>
                  )}
                  <br />
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.region}{" "}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </address>
              </div>
            )}

            {/* Shipping method */}
            {order.shippingInfo && (
              <div className="border rounded-lg p-4">
                <h2 className="font-semibold mb-2">Shipping Method</h2>
                <p className="text-sm text-gray-600">
                  {order.shippingInfo.shippingMethodName}
                </p>
                <p className="text-sm font-medium">
                  {formatPrice(
                    order.shippingInfo.price.centAmount,
                    order.shippingInfo.price.currencyCode,
                  )}
                </p>
              </div>
            )}

            {/* Payment summary */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-2">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>
                    {order.taxedPrice
                      ? formatPrice(
                          order.taxedPrice.totalNet.centAmount,
                          order.taxedPrice.totalNet.currencyCode,
                        )
                      : formatPrice(
                          order.totalPrice.centAmount,
                          order.totalPrice.currencyCode,
                        )}
                  </span>
                </div>
                {order.shippingInfo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {formatPrice(
                        order.shippingInfo.price.centAmount,
                        order.shippingInfo.price.currencyCode,
                      )}
                    </span>
                  </div>
                )}
                {order.taxedPrice?.totalTax && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>
                      {formatPrice(
                        order.taxedPrice.totalTax.centAmount,
                        order.taxedPrice.totalTax.currencyCode,
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span data-testid="order-total">
                    {formatPrice(
                      order.totalPrice.centAmount,
                      order.totalPrice.currencyCode,
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
