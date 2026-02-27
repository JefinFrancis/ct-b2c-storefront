import { Injectable, BadRequestException } from "@nestjs/common";
import type { CommercetoolsService } from "../commercetools/commercetools.service";
import type { CartService } from "../cart/cart.service";

@Injectable()
export class OrdersService {
  constructor(
    private readonly ct: CommercetoolsService,
    private readonly cartService: CartService,
  ) {}

  async findByCustomer(customerId: string) {
    const api = this.ct.getApiRoot();

    const response = await api
      .orders()
      .get({
        queryArgs: {
          where: `customerId="${customerId}"`,
          sort: "createdAt desc",
          limit: 50,
        },
      })
      .execute();

    return response.body.results;
  }

  /**
   * Create an order from a cart.
   * The cart must have a shipping address and shipping method set.
   * Associates the cart with the customer before creating the order.
   */
  async createFromCart(
    cartId: string,
    customerId: string,
    customerEmail: string,
  ) {
    const api = this.ct.getApiRoot();

    // Associate cart with customer (sets customerId + customerEmail on cart)
    await this.cartService.setCustomerId(cartId, customerId, customerEmail);

    // Re-fetch cart after customer association to get updated version
    const cart = await this.cartService.findById(cartId);

    // Validate cart is ready for checkout
    if (!cart.shippingAddress) {
      throw new BadRequestException(
        "Cart must have a shipping address before creating an order",
      );
    }

    if (!cart.shippingInfo) {
      throw new BadRequestException(
        "Cart must have a shipping method before creating an order",
      );
    }

    if (!cart.lineItems || cart.lineItems.length === 0) {
      throw new BadRequestException("Cart must have at least one item");
    }

    // Create the order from the cart
    const response = await api
      .orders()
      .post({
        body: {
          cart: {
            id: cartId,
            typeId: "cart",
          },
          version: cart.version,
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Get an order by ID.
   */
  async findById(orderId: string) {
    const api = this.ct.getApiRoot();

    const response = await api.orders().withId({ ID: orderId }).get().execute();

    return response.body;
  }
}
