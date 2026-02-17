/**
 * CartContext — manages cart state across the application.
 * Handles session ID generation, cart fetching, and cart operations.
 */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Cart } from "@ct-b2c/types";
import { cartApi } from "@/lib/api-client";

// Storage keys
const SESSION_ID_KEY = "ct_session_id";

interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addItem: (
    productId: string,
    variantId: number,
    quantity?: number
  ) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Generate a unique session ID (UUID v4).
 */
function generateSessionId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create session ID from localStorage.
 */
function getSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize session ID on mount
  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  // Fetch cart when session ID is available
  const fetchCart = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedCart = await cartApi.getSessionCart(sessionId);
      setCart(fetchedCart);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError(err instanceof Error ? err.message : "Failed to load cart");
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Fetch cart on mount and when sessionId changes
  useEffect(() => {
    if (sessionId) {
      fetchCart();
    }
  }, [sessionId, fetchCart]);

  /**
   * Add item to cart.
   */
  const addItem = useCallback(
    async (productId: string, variantId: number, quantity = 1) => {
      if (!cart) {
        throw new Error("Cart not initialized");
      }

      try {
        const updatedCart = await cartApi.addItem(cart.id, {
          productId,
          variantId,
          quantity,
        });
        setCart(updatedCart);
      } catch (err) {
        console.error("Failed to add item:", err);
        throw err;
      }
    },
    [cart]
  );

  /**
   * Update item quantity.
   */
  const updateQuantity = useCallback(
    async (lineItemId: string, quantity: number) => {
      if (!cart) {
        throw new Error("Cart not initialized");
      }

      try {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          const updatedCart = await cartApi.removeItem(cart.id, lineItemId);
          setCart(updatedCart);
        } else {
          const updatedCart = await cartApi.updateItem(cart.id, lineItemId, {
            quantity,
          });
          setCart(updatedCart);
        }
      } catch (err) {
        console.error("Failed to update quantity:", err);
        throw err;
      }
    },
    [cart]
  );

  /**
   * Remove item from cart.
   */
  const removeItem = useCallback(
    async (lineItemId: string) => {
      if (!cart) {
        throw new Error("Cart not initialized");
      }

      try {
        const updatedCart = await cartApi.removeItem(cart.id, lineItemId);
        setCart(updatedCart);
      } catch (err) {
        console.error("Failed to remove item:", err);
        throw err;
      }
    },
    [cart]
  );

  /**
   * Refresh cart from server.
   */
  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  /**
   * Calculate total item count.
   */
  const itemCount = useMemo(() => {
    if (!cart || !cart.lineItems) return 0;
    return cart.lineItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const value = useMemo(
    () => ({
      cart,
      isLoading,
      error,
      addItem,
      updateQuantity,
      removeItem,
      refreshCart,
      itemCount,
    }),
    [cart, isLoading, error, addItem, updateQuantity, removeItem, refreshCart, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to access cart context.
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
