/**
 * Payment types.
 */
import type { Money } from "./common";

/** Payment transaction */
export interface PaymentTransaction {
  id: string;
  type: "Authorization" | "Charge" | "Refund" | "CancelAuthorization";
  amount: Money;
  state: "Initial" | "Pending" | "Success" | "Failure";
  timestamp?: string;
}

/** Payment */
export interface Payment {
  id: string;
  version: number;
  amountPlanned: Money;
  paymentMethodInfo?: {
    paymentInterface?: string;
    method?: string;
    name?: Record<string, string>;
  };
  paymentStatus?: {
    interfaceCode?: string;
    interfaceText?: string;
    state?: { typeId: "state"; id: string };
  };
  transactions: PaymentTransaction[];
  customer?: { id: string; typeId: "customer" };
  createdAt: string;
  lastModifiedAt: string;
}
