import { Injectable, NotFoundException } from "@nestjs/common";
import { CommercetoolsService } from "../commercetools/commercetools.service";

interface CreatePaymentInput {
  amountCentAmount: number;
  currencyCode: string;
  paymentMethodInfo?: {
    paymentInterface?: string;
    method?: string;
    name?: Record<string, string>;
  };
}

@Injectable()
export class PaymentsService {
  constructor(private readonly ct: CommercetoolsService) {}

  /**
   * Create a payment object in CT (simulated payment for demo purposes).
   * In production, this would integrate with a PSP (Stripe, Adyen, etc.).
   */
  async create(input: CreatePaymentInput, customerId?: string) {
    const api = this.ct.getApiRoot();

    const response = await api
      .payments()
      .post({
        body: {
          amountPlanned: {
            currencyCode: input.currencyCode,
            centAmount: input.amountCentAmount,
          },
          paymentMethodInfo: input.paymentMethodInfo ?? {
            paymentInterface: "Mock",
            method: "CreditCard",
            name: { en: "Credit Card" },
          },
          ...(customerId
            ? { customer: { typeId: "customer", id: customerId } }
            : {}),
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Get a payment by ID.
   */
  async findById(paymentId: string) {
    const api = this.ct.getApiRoot();

    try {
      const response = await api
        .payments()
        .withId({ ID: paymentId })
        .get()
        .execute();
      return response.body;
    } catch {
      throw new NotFoundException(`Payment with id "${paymentId}" not found`);
    }
  }

  /**
   * Add a transaction to a payment (e.g., Authorization, Charge).
   */
  async addTransaction(
    paymentId: string,
    transaction: {
      type: "Authorization" | "Charge" | "Refund" | "CancelAuthorization";
      amount: { currencyCode: string; centAmount: number };
      state?: "Initial" | "Pending" | "Success" | "Failure";
    },
  ) {
    const api = this.ct.getApiRoot();
    const payment = await this.findById(paymentId);

    const response = await api
      .payments()
      .withId({ ID: paymentId })
      .post({
        body: {
          version: payment.version,
          actions: [
            {
              action: "addTransaction",
              transaction: {
                type: transaction.type,
                amount: transaction.amount,
                state: transaction.state ?? "Success",
                timestamp: new Date().toISOString(),
              },
            },
          ],
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Add payment reference to a cart.
   */
  async addPaymentToCart(cartId: string, paymentId: string) {
    const api = this.ct.getApiRoot();

    // Get current cart version
    const cartResponse = await api
      .carts()
      .withId({ ID: cartId })
      .get()
      .execute();

    const response = await api
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: cartResponse.body.version,
          actions: [
            {
              action: "addPayment",
              payment: {
                typeId: "payment",
                id: paymentId,
              },
            },
          ],
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Process a mock payment for checkout.
   * Creates a payment, adds a successful charge transaction, and adds it to the cart.
   * In production, this would be replaced with actual PSP integration.
   */
  async processCheckoutPayment(
    cartId: string,
    amountCentAmount: number,
    currencyCode: string,
    customerId?: string,
    paymentMethod?: string,
  ) {
    // 1. Create the payment
    const payment = await this.create(
      {
        amountCentAmount,
        currencyCode,
        paymentMethodInfo: {
          paymentInterface: "Mock",
          method: paymentMethod ?? "CreditCard",
          name: { en: paymentMethod ?? "Credit Card" },
        },
      },
      customerId,
    );

    // 2. Add a successful charge transaction
    await this.addTransaction(payment.id, {
      type: "Charge",
      amount: { currencyCode, centAmount: amountCentAmount },
      state: "Success",
    });

    // 3. Add payment to cart
    const updatedCart = await this.addPaymentToCart(cartId, payment.id);

    return { payment, cart: updatedCart };
  }
}
