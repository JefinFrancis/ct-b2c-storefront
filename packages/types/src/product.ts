/**
 * Product-related types.
 */
import type { LocalizedString, Price, Image, Category } from "./common";

/** Product variant */
export interface ProductVariant {
  id: number;
  sku?: string;
  key?: string;
  prices?: Price[];
  images?: Image[];
  attributes?: Array<{
    name: string;
    value: unknown;
  }>;
  availability?: {
    isOnStock?: boolean;
    availableQuantity?: number;
  };
}

/** Product (projection) */
export interface Product {
  id: string;
  key?: string;
  version: number;
  name: LocalizedString;
  slug: LocalizedString;
  description?: LocalizedString;
  categories?: Category[];
  masterVariant: ProductVariant;
  variants: ProductVariant[];
  searchKeywords?: {
    [locale: string]: Array<{ text: string }>;
  };
}

/** Product list response */
export interface ProductListResponse {
  results: Product[];
  total: number;
  limit: number;
  offset: number;
}
