/**
 * Checkout-related types.
 */
import type { Money } from "./common";
import type { Address } from "./cart";

/** Shipping method available for selection */
export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: Money;
  /** Estimated delivery time in days (e.g., "3-5") */
  deliveryTime?: string;
}

/** Input for setting shipping address on cart */
export interface SetShippingAddressInput {
  firstName: string;
  lastName: string;
  streetName: string;
  streetNumber?: string;
  additionalStreetInfo?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

/** Input for setting shipping method on cart */
export interface SetShippingMethodInput {
  shippingMethodId: string;
}

/** Response after setting shipping address */
export interface SetShippingAddressResponse {
  cartId: string;
  shippingAddress: Address;
}

/** Response after setting shipping method */
export interface SetShippingMethodResponse {
  cartId: string;
  shippingMethodName: string;
  shippingPrice: Money;
}

/** Input for creating an order from cart */
export interface CreateOrderInput {
  cartId: string;
}

/** Summary of checkout state */
export interface CheckoutState {
  cartId: string;
  hasShippingAddress: boolean;
  hasShippingMethod: boolean;
  canPlaceOrder: boolean;
  shippingAddress?: Address;
  shippingMethod?: {
    name: string;
    price: Money;
  };
  totalPrice: Money;
  itemCount: number;
}

/** Step in multi-step checkout */
export type CheckoutStep = "address" | "shipping" | "review";
