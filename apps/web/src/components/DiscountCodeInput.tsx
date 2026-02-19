/**
 * DiscountCodeInput — allows users to apply/remove discount codes on cart.
 */
"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

export default function DiscountCodeInput() {
  const { cart, addDiscountCode, removeDiscountCode } = useCart();
  const [code, setCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsApplying(true);
    setError(null);
    setSuccess(null);

    try {
      await addDiscountCode(code.trim());
      setSuccess(`Discount code "${code.trim()}" applied!`);
      setCode("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to apply discount code"
      );
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = async (discountCodeId: string) => {
    try {
      await removeDiscountCode(discountCodeId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove discount code"
      );
    }
  };

  const appliedCodes = cart?.discountCodes ?? [];

  return (
    <div className="space-y-3">
      <form onSubmit={handleApply} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
            setSuccess(null);
          }}
          placeholder="Enter discount code"
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isApplying}
        />
        <button
          type="submit"
          disabled={isApplying || !code.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isApplying ? "Applying..." : "Apply"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      {/* Applied discount codes */}
      {appliedCodes.length > 0 && (
        <div className="space-y-2">
          {appliedCodes.map((dc) => (
            <div
              key={dc.discountCode.id}
              className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  Discount applied
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    dc.state === "MatchesCart"
                      ? "bg-green-200 text-green-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {dc.state === "MatchesCart" ? "Active" : dc.state}
                </span>
              </div>
              <button
                onClick={() => handleRemove(dc.discountCode.id)}
                className="text-red-600 hover:text-red-700 text-xs font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
