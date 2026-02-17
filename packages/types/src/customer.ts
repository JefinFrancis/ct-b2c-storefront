/**
 * Customer-related types.
 */
import type { Address } from "./cart";

/** Customer */
export interface Customer {
  id: string;
  version: number;
  email: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  title?: string;
  dateOfBirth?: string;
  companyName?: string;
  vatId?: string;
  addresses: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  shippingAddressIds?: string[];
  billingAddressIds?: string[];
  isEmailVerified: boolean;
  customerGroup?: { id: string };
  createdAt: string;
  lastModifiedAt: string;
}

/** Auth response (login/register) */
export interface AuthResponse {
  token: string;
  customer: Customer;
}
