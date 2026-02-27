/**
 * PaymentForm — mock payment step for checkout.
 * In production, this would integrate with a real PSP (Stripe, Adyen, etc.).
 */
"use client";

import { useState } from "react";

interface PaymentFormProps {
  onSubmit: (paymentMethod: string) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
  totalAmount?: string;
}

const PAYMENT_METHODS = [
  {
    id: "credit-card",
    label: "Credit Card",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
      </svg>
    ),
  },
  {
    id: "paypal",
    label: "PayPal",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
    ),
  },
  {
    id: "bank-transfer",
    label: "Bank Transfer",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>
    ),
  },
];

export function PaymentForm({
  onSubmit,
  onBack,
  isLoading = false,
  totalAmount,
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState("credit-card");
  const [error, setError] = useState<string | null>(null);

  // Mock credit card fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedMethod === "credit-card") {
      if (!cardNumber || !expiry || !cvc) {
        setError("Please fill in all card details");
        return;
      }
    }

    try {
      await onSubmit(selectedMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Payment</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded" role="alert">
          {error}
        </div>
      )}

      {totalAmount && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Amount to pay: <span className="font-semibold">{totalAmount}</span>
          </p>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Payment Method
        </label>
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.id}
            className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedMethod === method.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => setSelectedMethod(method.id)}
              className="text-blue-600"
            />
            <span className="text-gray-500">{method.icon}</span>
            <span className="font-medium">{method.label}</span>
          </label>
        ))}
      </div>

      {/* Credit Card Fields (mock) */}
      {selectedMethod === "credit-card" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              maxLength={19}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                maxLength={5}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVC
              </label>
              <input
                type="text"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                maxLength={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            This is a demo payment form. No real charges will be made.
          </p>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Processing..." : "Pay & Continue"}
            </button>
          </div>
        </form>
      )}

      {/* Non-credit-card submit */}
      {selectedMethod !== "credit-card" && (
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
            onClick={() => onSubmit(selectedMethod)}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Processing..." : "Pay & Continue"}
          </button>
        </div>
      )}
    </div>
  );
}
