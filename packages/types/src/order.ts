/**
 * Order-related types.
 */
import type { Money } from "./common";
import type { Address, LineItem } from "./cart";

/** Order status */
export type OrderState =
  | "Open"
  | "Confirmed"
  | "Complete"
  | "Cancelled";

/** Payment status */
export type PaymentState = "BalanceDue" | "Failed" | "Pending" | "CreditOwed" | "Paid";

/** Shipment status */
export type ShipmentState = "Shipped" | "Delivered" | "Ready" | "Pending" | "Delayed" | "Partial" | "Backorder";

/** Order */
export interface Order {
  id: string;
  version: number;
  orderNumber?: string;
  customerId?: string;
  customerEmail?: string;
  lineItems: LineItem[];
  totalPrice: Money;
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
  orderState: OrderState;
  paymentState?: PaymentState;
  shipmentState?: ShipmentState;
  createdAt: string;
  lastModifiedAt: string;
}
