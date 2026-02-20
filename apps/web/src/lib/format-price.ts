/**
 * format-price.ts — shared price formatting utility.
 * Converts commercetools centAmount to a localised currency string.
 */

/**
 * Format a centAmount (e.g. 4999) to a display string (e.g. "$49.99").
 */
export function formatPrice(centAmount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(centAmount / 100);
}
