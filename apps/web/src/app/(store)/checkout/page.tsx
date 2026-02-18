"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts";
import { CheckoutProvider, useCheckout } from "@/contexts/CheckoutContext";
import {
  AddressForm,
  ShippingMethodSelector,
  OrderReview,
  OrderConfirmation,
  CheckoutSteps,
} from "@/components/checkout";

function CheckoutContent() {
  const router = useRouter();
  const { cart: cartFromContext, refreshCart } = useCart();
  const {
    currentStep,
    cart,
    shippingMethods,
    selectedShippingMethodId,
    order,
    isLoading,
    setCart,
    setShippingAddress,
    loadShippingMethods,
    selectShippingMethod,
    placeOrder,
    goToStep,
  } = useCheckout();

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
        <a href="/products" className="text-blue-600 hover:underline">
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CheckoutSteps currentStep={currentStep} />

      {currentStep === "address" && (
        <AddressForm
          onSubmit={setShippingAddress}
          isLoading={isLoading}
          initialAddress={cart.shippingAddress ?? undefined}
        />
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

      {currentStep === "review" && (
        <OrderReview
          cart={cart}
          onPlaceOrder={async () => {
            const createdOrder = await placeOrder();
            // Refresh the cart context after order is placed
            refreshCart();
            return createdOrder;
          }}
          onBack={() => goToStep("shipping")}
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
