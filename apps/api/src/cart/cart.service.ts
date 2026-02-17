import { Injectable, NotFoundException } from "@nestjs/common";
import { CommercetoolsService } from "../commercetools/commercetools.service";
import { RedisService } from "../redis/redis.service";

interface AddItemInput {
  productId: string;
  variantId: number;
  quantity: number;
}

// Session-to-cart mapping TTL: 30 days
const SESSION_CART_TTL = 30 * 24 * 60 * 60;

@Injectable()
export class CartService {
  constructor(
    private readonly ct: CommercetoolsService,
    private readonly redis: RedisService,
  ) {}

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

  // ─────────────────────────────────────────────────────────────
  // Session storage methods: associate sessionId → cartId in Redis
  // ─────────────────────────────────────────────────────────────

  /**
   * Store cartId for a session (30-day TTL).
   */
  async setCartIdForSession(sessionId: string, cartId: string): Promise<void> {
    await this.redis.set(`session:${sessionId}`, cartId, SESSION_CART_TTL);
  }

  /**
   * Get cartId associated with a session.
   */
  async getCartIdForSession(sessionId: string): Promise<string | null> {
    return this.redis.get<string>(`session:${sessionId}`);
  }

  /**
   * Get or create a cart for a session.
   * If session has existing cart, return it. Otherwise, create new cart and associate.
   */
  async getOrCreateCartForSession(sessionId: string) {
    const existingCartId = await this.getCartIdForSession(sessionId);

    if (existingCartId) {
      try {
        const cart = await this.findById(existingCartId);
        // Only return active carts
        if (cart.cartState === "Active") {
          return cart;
        }
      } catch {
        // Cart not found or invalid, create new one
      }
    }

    // Create new cart and associate with session
    const newCart = await this.create();
    await this.setCartIdForSession(sessionId, newCart.id);
    return newCart;
  }
}
