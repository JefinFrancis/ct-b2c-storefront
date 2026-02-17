import { Injectable, NotFoundException } from "@nestjs/common";
import { CommercetoolsService } from "../commercetools/commercetools.service";

interface AddItemInput {
  productId: string;
  variantId: number;
  quantity: number;
}

@Injectable()
export class CartService {
  constructor(private readonly ct: CommercetoolsService) {}

  async create() {
    const api = this.ct.getAnonymousApiRoot();
    const response = await api
      .carts()
      .post({
        body: {
          currency: "USD",
          country: "US",
        },
      })
      .execute();
    return response.body;
  }

  async findById(id: string) {
    const api = this.ct.getApiRoot();
    try {
      const response = await api.carts().withId({ ID: id }).get().execute();
      return response.body;
    } catch (error) {
      throw new NotFoundException(`Cart with id "${id}" not found`);
    }
  }

  async addItem(cartId: string, input: AddItemInput) {
    const api = this.ct.getApiRoot();
    const cart = await this.findById(cartId);

    const response = await api
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: cart.version,
          actions: [
            {
              action: "addLineItem",
              productId: input.productId,
              variantId: input.variantId,
              quantity: input.quantity,
            },
          ],
        },
      })
      .execute();

    return response.body;
  }

  async updateItem(cartId: string, lineItemId: string, quantity: number) {
    const api = this.ct.getApiRoot();
    const cart = await this.findById(cartId);

    const response = await api
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: cart.version,
          actions: [
            {
              action: "changeLineItemQuantity",
              lineItemId,
              quantity,
            },
          ],
        },
      })
      .execute();

    return response.body;
  }

  async removeItem(cartId: string, lineItemId: string) {
    const api = this.ct.getApiRoot();
    const cart = await this.findById(cartId);

    const response = await api
      .carts()
      .withId({ ID: cartId })
      .post({
        body: {
          version: cart.version,
          actions: [
            {
              action: "removeLineItem",
              lineItemId,
            },
          ],
        },
      })
      .execute();

    return response.body;
  }
}
