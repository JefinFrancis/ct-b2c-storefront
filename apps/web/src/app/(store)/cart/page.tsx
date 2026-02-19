/**
 * Cart page — displays full cart with line items and totals.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import DiscountCodeInput from "@/components/DiscountCodeInput";

/**
 * Format price from centAmount to display string.
 */
function formatPrice(centAmount: number, currencyCode: string): string {
  const amount = centAmount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

export default function CartPage() {
  const { cart, isLoading, error, updateQuantity, removeItem, itemCount } =
    useCart();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleQuantityChange = async (lineItemId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdatingId(lineItemId);
    try {
      await updateQuantity(lineItemId, quantity);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (lineItemId: string) => {
    setRemovingId(lineItemId);
    try {
      await removeItem(lineItemId);
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setRemovingId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="flex items-center justify-center py-16">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="text-center py-16 border rounded-lg bg-red-50">
            <p className="text-red-600 mb-4">Failed to load cart: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Empty cart state
  if (!cart || cart.lineItems.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="text-center py-16 border rounded-lg">
            <svg
              className="mx-auto w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
          Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
        </h1>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Line Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.lineItems.map((item) => {
              const name =
                item.name["en-US"] ?? Object.values(item.name)[0] ?? "Product";
              const image = item.variant.images?.[0]?.url;
              const slug =
                item.productSlug?.["en-US"] ??
                (item.productSlug
                  ? Object.values(item.productSlug)[0]
                  : item.productId);
              const isUpdating = updatingId === item.id;
              const isRemoving = removingId === item.id;
              const isDisabled = isUpdating || isRemoving;

              return (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 transition-opacity ${
                    isRemoving ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link
                      href={`/products/${slug}`}
                      className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded overflow-hidden flex-shrink-0"
                    >
                      {image ? (
                        <Image
                          src={image}
                          alt={name}
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-10 h-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${slug}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                      >
                        {name}
                      </Link>

                      {item.variant.sku && (
                        <p className="text-sm text-gray-500 mt-1">
                          SKU: {item.variant.sku}
                        </p>
                      )}

                      <p className="text-sm text-gray-700 mt-1">
                        {formatPrice(
                          item.price.value.centAmount,
                          item.price.value.currencyCode
                        )}{" "}
                        each
                      </p>

                      {/* Quantity Controls (mobile) */}
                      <div className="flex items-center gap-3 mt-3 sm:hidden">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            disabled={isDisabled || item.quantity <= 1}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 font-medium min-w-[40px] text-center">
                            {isUpdating ? "..." : item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            disabled={isDisabled}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isDisabled}
                          className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity Controls (desktop) */}
                    <div className="hidden sm:flex flex-col items-end gap-2">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(
                          item.totalPrice.centAmount,
                          item.totalPrice.currencyCode
                        )}
                      </p>

                      <div className="flex items-center border rounded">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={isDisabled || item.quantity <= 1}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 font-medium min-w-[40px] text-center">
                          {isUpdating ? "..." : item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={isDisabled}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isDisabled}
                        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Line Total (mobile) */}
                  <div className="flex justify-end mt-3 sm:hidden">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(
                        item.totalPrice.centAmount,
                        item.totalPrice.currencyCode
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(
                      cart.totalPrice.centAmount,
                      cart.totalPrice.currencyCode
                    )}
                  </span>
                </div>

                {cart.taxedPrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(
                        cart.taxedPrice.totalTax?.centAmount ?? 0,
                        cart.totalPrice.currencyCode
                      )}
                    </span>
                  </div>
                )}

                {cart.shippingInfo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(
                        cart.shippingInfo.price.centAmount,
                        cart.shippingInfo.price.currencyCode
                      )}
                    </span>
                  </div>
                )}

                {cart.discountOnTotalPrice && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      -
                      {formatPrice(
                        cart.discountOnTotalPrice.discountedAmount.centAmount,
                        cart.discountOnTotalPrice.discountedAmount.currencyCode
                      )}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(
                        cart.taxedPrice?.totalGross.centAmount ??
                          cart.totalPrice.centAmount,
                        cart.totalPrice.currencyCode
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/checkout"
                  className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/products"
                  className="block w-full py-3 px-4 bg-gray-100 text-gray-900 text-center rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Discount Code */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Discount Code
                </h3>
                <DiscountCodeInput />
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Secure checkout
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <svg
                    className="w-5 h-5 text-green-600"
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
                  Free shipping on orders over $50
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
