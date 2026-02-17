/**
 * AddToCartButton — client component that handles adding products to cart.
 * Uses CartContext for cart state management.
 */
"use client";

import { useState, useCallback } from "react";
import { useCart } from "@/contexts/CartContext";

interface AddToCartButtonProps {
  productId: string;
  variantId: number;
  disabled?: boolean;
  className?: string;
}

export default function AddToCartButton({
  productId,
  variantId,
  disabled = false,
  className = "",
}: AddToCartButtonProps) {
  const { addItem, cart, isLoading: cartLoading } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleAddToCart = useCallback(async () => {
    if (disabled || isLoading || cartLoading) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      // Wait for cart to be ready if not yet initialized
      if (!cart) {
        // Cart context will handle cart creation
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      await addItem(productId, variantId, 1);

      setFeedback({
        type: "success",
        message: "Added to cart!",
      });

      // Clear success feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error("Failed to add to cart:", error);

      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to add to cart",
      });

      // Clear error feedback after 5 seconds
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [productId, variantId, disabled, isLoading, cartLoading, cart, addItem]);

  const baseClasses =
    "w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";

  const stateClasses = disabled
    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
    : isLoading
      ? "bg-blue-500 text-white cursor-wait"
      : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800";

  return (
    <div className="space-y-2">
      <button
        onClick={handleAddToCart}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${stateClasses} ${className}`}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Adding...
          </>
        ) : disabled ? (
          "Out of Stock"
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Add to Cart
          </>
        )}
      </button>

      {/* Feedback toast */}
      {feedback && (
        <div
          className={`text-sm text-center py-2 px-4 rounded-md transition-opacity ${
            feedback.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
          role="status"
          aria-live="polite"
        >
          {feedback.type === "success" ? (
            <span className="flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {feedback.message}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {feedback.message}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
