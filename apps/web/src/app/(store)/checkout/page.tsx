"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts";
import { CheckoutProvider, useCheckout } from "@/contexts/CheckoutContext";
import {
  AddressForm,
  ShippingMethodSelector,
  OrderReview,
  OrderConfirmation,
  CheckoutSteps,
  PaymentForm,
} from "@/components/checkout";

/**
 * Format cents to display price.
 */
function formatPrice(centAmount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(centAmount / 100);
}

function CheckoutContent() {
  const router = useRouter();
  const { cart: cartFromContext, refreshCart, clearCart } = useCart();
  const {
    currentStep,
    cart,
    shippingMethods,
    selectedShippingMethodId,
    billingAddressSameAsShipping,
    order,
    isLoading,
    setCart,
    setShippingAddress,
    setBillingAddress,
    setBillingAddressSameAsShipping,
    loadShippingMethods,
    selectShippingMethod,
    processPayment,
    placeOrder,
    goToStep,
  } = useCheckout();

  const [showBillingForm, setShowBillingForm] = useState(false);

  // Sync cart from CartContext to CheckoutContext
  useEffect(() => {
    if (cartFromContext) {
      setCart(cartFromContext);
    }
  }, [cartFromContext, setCart]);

  // Load shipping methods when entering shipping step
  useEffect(() => {
    if (currentStep === "shipping" && cart?.shippingAddress) {
      loadShippingMethods();
    }
  }, [currentStep, cart?.shippingAddress, loadShippingMethods]);

  // Redirect to cart if empty
  useEffect(() => {
    if (cart && cart.lineItems.length === 0 && !order) {
      router.push("/cart");
    }
  }, [cart, order, router]);

  // Show confirmation if order is placed
  if (order) {
    return (
      <div className="max-w-2xl mx-auto">
        <CheckoutSteps currentStep={currentStep} hasOrder={true} />
        <OrderConfirmation order={order} />
      </div>
    );
  }

  // Show loading while cart is being fetched
  if (!cart) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Empty cart message
  if (cart.lineItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Your cart is empty.</p>
        <Link href="/products" className="text-blue-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CheckoutSteps currentStep={currentStep} />

      {currentStep === "address" && (
        <div className="space-y-6">
          <AddressForm
            onSubmit={setShippingAddress}
            isLoading={isLoading}
            initialAddress={cart.shippingAddress ?? undefined}
          />

          {/* Billing address toggle */}
          <div className="border rounded-lg p-4 mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={billingAddressSameAsShipping}
                onChange={(e) => {
                  setBillingAddressSameAsShipping(e.target.checked);
                  setShowBillingForm(!e.target.checked);
                }}
                className="rounded text-blue-600"
              />
              <span className="text-sm font-medium">
                Billing address same as shipping
              </span>
            </label>

            {showBillingForm && !billingAddressSameAsShipping && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-3">Billing Address</h3>
                <AddressForm
                  onSubmit={setBillingAddress}
                  isLoading={isLoading}
                  initialAddress={cart.billingAddress ?? undefined}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {currentStep === "shipping" && (
        <ShippingMethodSelector
          methods={shippingMethods}
          selectedMethodId={selectedShippingMethodId}
          onSelect={selectShippingMethod}
          onBack={() => goToStep("address")}
          isLoading={isLoading}
        />
      )}

      {currentStep === "payment" && (
        <PaymentForm
          onSubmit={processPayment}
          onBack={() => goToStep("shipping")}
          isLoading={isLoading}
          totalAmount={formatPrice(
            cart.totalPrice.centAmount,
            cart.totalPrice.currencyCode
          )}
        />
      )}

      {currentStep === "review" && (
        <OrderReview
          cart={cart}
          onPlaceOrder={async () => {
            const createdOrder = await placeOrder();
            // Clear cart after order is placed
            clearCart();
            refreshCart();
            return createdOrder;
          }}
          onBack={() => goToStep("payment")}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
        <CheckoutProvider>
          <CheckoutContent />
        </CheckoutProvider>
      </div>
    </main>
  );
}
