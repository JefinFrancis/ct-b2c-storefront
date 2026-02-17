/**
 * Shared constants across the monorepo.
 */

/** Supported locales */
export const LOCALES = ["en-US", "en-GB", "de-DE"] as const;
export type Locale = (typeof LOCALES)[number];

/** Default locale */
export const DEFAULT_LOCALE: Locale = "en-US";

/** Currency codes */
export const CURRENCIES = ["USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Default currency */
export const DEFAULT_CURRENCY: Currency = "USD";

/** Default country */
export const DEFAULT_COUNTRY = "US";

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/** Cache TTLs (seconds) */
export const CACHE_TTL = {
  PRODUCTS: 60 * 5, // 5 minutes
  CATEGORIES: 60 * 15, // 15 minutes
  CART: 60 * 60 * 24, // 24 hours
  SESSION: 60 * 60 * 24 * 7, // 7 days
} as const;

/** API endpoints */
export const API_PREFIX = "/api/v1";
