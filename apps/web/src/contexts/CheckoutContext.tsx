/**
 * CheckoutContext — manages multi-step checkout flow.
 * Handles shipping address, shipping method selection, and order creation.
 */
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  Cart,
  Order,
  ShippingMethod,
  SetShippingAddressInput,
  CheckoutStep,
} from "@ct-b2c/types";
import { cartApi, ordersApi } from "@/lib/api-client";

interface CheckoutContextValue {
  // Current state
  currentStep: CheckoutStep;
  cart: Cart | null;
  shippingMethods: ShippingMethod[];
  selectedShippingMethodId: string | null;
  order: Order | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCart: (cart: Cart) => void;
  setShippingAddress: (address: SetShippingAddressInput) => Promise<void>;
  loadShippingMethods: () => Promise<void>;
  selectShippingMethod: (methodId: string) => Promise<void>;
  placeOrder: () => Promise<Order>;
  goToStep: (step: CheckoutStep) => void;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

interface CheckoutProviderProps {
  children: ReactNode;
  initialCart?: Cart | null;
}

export function CheckoutProvider({
  children,
  initialCart = null,
}: CheckoutProviderProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [cart, setCartState] = useState<Cart | null>(initialCart);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<
    string | null
  >(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCart = useCallback((newCart: Cart) => {
    setCartState(newCart);
  }, []);

  /**
   * Set shipping address on the cart.
   */
  const setShippingAddress = useCallback(
    async (address: SetShippingAddressInput) => {
      if (!cart) {
        throw new Error("No cart available");
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedCart = await cartApi.setShippingAddress(cart.id, address);
        setCartState(updatedCart);
        setCurrentStep("shipping");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to set shipping address";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart]
  );

  /**
   * Load available shipping methods for the cart.
   */
  const loadShippingMethods = useCallback(async () => {
    if (!cart) {
      throw new Error("No cart available");
    }

    setIsLoading(true);
    setError(null);

    try {
      const methods = await cartApi.getShippingMethods(cart.id);
      setShippingMethods(methods);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load shipping methods";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  /**
   * Select a shipping method for the cart.
   */
  const selectShippingMethod = useCallback(
    async (methodId: string) => {
      if (!cart) {
        throw new Error("No cart available");
      }

      setIsLoading(true);
      setError(null);

      try {
        const updatedCart = await cartApi.setShippingMethod(cart.id, methodId);
        setCartState(updatedCart);
        setSelectedShippingMethodId(methodId);
        setCurrentStep("review");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to set shipping method";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [cart]
  );

  /**
   * Place the order.
   */
  const placeOrder = useCallback(async () => {
    if (!cart) {
      throw new Error("No cart available");
    }

    setIsLoading(true);
    setError(null);

    try {
      const createdOrder = await ordersApi.create(cart.id);
      setOrder(createdOrder);
      return createdOrder;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to place order";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  /**
   * Navigate to a specific step.
   */
  const goToStep = useCallback((step: CheckoutStep) => {
    setCurrentStep(step);
    setError(null);
  }, []);

  /**
   * Reset checkout state.
   */
  const resetCheckout = useCallback(() => {
    setCurrentStep("address");
    setShippingMethods([]);
    setSelectedShippingMethodId(null);
    setOrder(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      currentStep,
      cart,
      shippingMethods,
      selectedShippingMethodId,
      order,
      isLoading,
      error,
      setCart,
      setShippingAddress,
      loadShippingMethods,
      selectShippingMethod,
      placeOrder,
      goToStep,
      resetCheckout,
    }),
    [
      currentStep,
      cart,
      shippingMethods,
      selectedShippingMethodId,
      order,
      isLoading,
      error,
      setCart,
      setShippingAddress,
      loadShippingMethods,
      selectShippingMethod,
      placeOrder,
      goToStep,
      resetCheckout,
    ]
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout(): CheckoutContextValue {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
