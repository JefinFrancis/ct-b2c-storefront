/**
 * Cart-related types.
 */
import type { Money, Price, LocalizedString, Image } from "./common";

/** Line item in cart */
export interface LineItem {
  id: string;
  productId: string;
  productKey?: string;
  name: LocalizedString;
  productSlug?: LocalizedString;
  variant: {
    id: number;
    sku?: string;
    images?: Image[];
    attributes?: Array<{
      name: string;
      value: unknown;
    }>;
  };
  price: Price;
  quantity: number;
  totalPrice: Money;
  discountedPricePerQuantity?: Array<{
    quantity: number;
    discountedPrice: {
      value: Money;
      includedDiscounts: Array<{
        discount: { id: string };
        discountedAmount: Money;
      }>;
    };
  }>;
}

/** Shopping cart */
export interface Cart {
  id: string;
  version: number;
  customerId?: string;
  anonymousId?: string;
  lineItems: LineItem[];
  totalPrice: Money;
  totalLineItemQuantity?: number;
  taxedPrice?: {
    totalNet: Money;
    totalGross: Money;
    totalTax?: Money;
  };
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingInfo?: {
    shippingMethodName: string;
    price: Money;
  };
  cartState: "Active" | "Merged" | "Ordered" | "Frozen";
  country?: string;
  currency?: string;
}

/** Address (shipping/billing) */
export interface Address {
  id?: string;
  firstName?: string;
  lastName?: string;
  streetName?: string;
  streetNumber?: string;
  additionalStreetInfo?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
}
