import { Injectable } from "@nestjs/common";
import type { CommercetoolsService } from "../commercetools/commercetools.service";

@Injectable()
export class WishlistService {
  constructor(private readonly ct: CommercetoolsService) {}

  /**
   * Get or create a wishlist (shopping list named "Wishlist") for a customer.
   */
  async getOrCreateWishlist(customerId: string) {
    const api = this.ct.getApiRoot();

    // Try to find existing wishlist
    const response = await api
      .shoppingLists()
      .get({
        queryArgs: {
          where: `customer(id="${customerId}") and name(en="Wishlist")`,
          limit: 1,
        },
      })
      .execute();

    if (response.body.results.length > 0) {
      return response.body.results[0];
    }

    // Create new wishlist
    const createResponse = await api
      .shoppingLists()
      .post({
        body: {
          name: { en: "Wishlist" },
          customer: { typeId: "customer", id: customerId },
        },
      })
      .execute();

    return createResponse.body;
  }

  /**
   * Add a product to the wishlist.
   */
  async addItem(
    customerId: string,
    productId: string,
    variantId?: number,
  ) {
    const api = this.ct.getApiRoot();
    const wishlist = await this.getOrCreateWishlist(customerId);

    const response = await api
      .shoppingLists()
      .withId({ ID: wishlist!.id })
      .post({
        body: {
          version: wishlist!.version,
          actions: [
            {
              action: "addLineItem",
              productId,
              ...(variantId !== undefined ? { variantId } : {}),
              quantity: 1,
            },
          ],
        },
      })
      .execute();

    return response.body;
  }

  /**
   * Remove an item from the wishlist.
   */
  async removeItem(customerId: string, lineItemId: string) {
    const api = this.ct.getApiRoot();
    const wishlist = await this.getOrCreateWishlist(customerId);

    const response = await api
      .shoppingLists()
      .withId({ ID: wishlist!.id })
      .post({
        body: {
          version: wishlist!.version,
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

  /**
   * Check if a product is in the wishlist.
   */
  async isInWishlist(customerId: string, productId: string): Promise<boolean> {
    const wishlist = await this.getOrCreateWishlist(customerId);
    return wishlist!.lineItems.some(
      (item) => item.productId === productId,
    );
  }
}
