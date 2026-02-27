/**
 * ShippingMethodSelector — displays available shipping methods for selection.
 */
"use client";

import { useState } from "react";
import type { ShippingMethod } from "@ct-b2c/types";

interface ShippingMethodSelectorProps {
  methods: ShippingMethod[];
  selectedMethodId: string | null;
  onSelect: (methodId: string) => Promise<void>;
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

export function ShippingMethodSelector({
  methods,
  selectedMethodId,
  onSelect,
  onBack,
  isLoading = false,
}: ShippingMethodSelectorProps) {
  const [localSelected, setLocalSelected] = useState<string | null>(
    selectedMethodId
  );
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (methodId: string) => {
    setLocalSelected(methodId);
    setError(null);
  };

  const handleContinue = async () => {
    if (!localSelected) {
      setError("Please select a shipping method");
      return;
    }

    try {
      await onSelect(localSelected);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to set shipping method"
      );
    }
  };

  if (methods.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">
          No shipping methods available for your address.
        </p>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Edit shipping address
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Select Shipping Method</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {methods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              localSelected === method.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              type="radio"
              name="shippingMethod"
              value={method.id}
              checked={localSelected === method.id}
              onChange={() => handleSelect(method.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">{method.name}</span>
                <span className="font-semibold">
                  {formatPrice(
                    method.price.centAmount,
                    method.price.currencyCode
                  )}
                </span>
              </div>
              {method.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {method.description}
                </p>
              )}
              {method.deliveryTime && (
                <p className="text-sm text-gray-500">
                  Estimated delivery: {method.deliveryTime} days
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!localSelected || isLoading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Saving..." : "Continue to Review"}
        </button>
      </div>
    </div>
  );
}
