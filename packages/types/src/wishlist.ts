/**
 * Wishlist types (CT Shopping Lists).
 */
import type { LocalizedString, Image, Money } from "./common";

/** Wishlist line item (product in the wishlist) */
export interface WishlistLineItem {
  id: string;
  productId: string;
  variantId?: number;
  name: LocalizedString;
  productSlug?: LocalizedString;
  variant?: {
    id: number;
    sku?: string;
    images?: Image[];
    prices?: Array<{
      id: string;
      value: Money;
    }>;
  };
  quantity: number;
  addedAt: string;
}

/** Wishlist (CT Shopping List) */
export interface Wishlist {
  id: string;
  version: number;
  name: LocalizedString;
  lineItems: WishlistLineItem[];
  customer?: { id: string; typeId: "customer" };
  createdAt: string;
  lastModifiedAt: string;
}
