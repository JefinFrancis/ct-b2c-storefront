/**
 * Common/shared types used across the API contract.
 */

/** Localized string object */
export interface LocalizedString {
  [locale: string]: string;
}

/** Money value with currency */
export interface Money {
  currencyCode: string;
  centAmount: number;
  fractionDigits: number;
}

/** Price with discount info */
export interface Price {
  id: string;
  value: Money;
  discounted?: {
    value: Money;
    discount: { id: string };
  };
}

/** Product/category image */
export interface Image {
  url: string;
  label?: string;
  dimensions?: {
    w: number;
    h: number;
  };
}

/** Category reference */
export interface Category {
  id: string;
  key?: string;
  name: LocalizedString;
  slug: LocalizedString;
  description?: LocalizedString;
  parent?: { id: string };
  ancestors?: { id: string }[];
}
