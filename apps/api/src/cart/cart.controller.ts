import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Headers,
  BadRequestException,
} from "@nestjs/common";
import { CartService } from "./cart.service";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Create a new cart. If X-Session-Id header is provided, associate cart with session.
   */
  @Post()
  async create(@Headers("x-session-id") sessionId?: string) {
    const cart = await this.cartService.create();

    // Associate cart with session if provided
    if (sessionId) {
      await this.cartService.setCartIdForSession(sessionId, cart.id);
    }

    return cart;
  }

  /**
   * Get cart by ID.
   */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.cartService.findById(id);
  }

  /**
   * Get or create cart for session. Requires X-Session-Id header.
   */
  @Get("session/current")
  async getSessionCart(@Headers("x-session-id") sessionId?: string) {
    if (!sessionId) {
      throw new BadRequestException("X-Session-Id header is required");
    }
    return this.cartService.getOrCreateCartForSession(sessionId);
  }

  @Post(":id/items")
  addItem(
    @Param("id") id: string,
    @Body() body: { productId: string; variantId: number; quantity: number },
  ) {
    return this.cartService.addItem(id, body);
  }

  @Patch(":id/items/:lineItemId")
  updateItem(
    @Param("id") id: string,
    @Param("lineItemId") lineItemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateItem(id, lineItemId, body.quantity);
  }

  @Delete(":id/items/:lineItemId")
  removeItem(@Param("id") id: string, @Param("lineItemId") lineItemId: string) {
    return this.cartService.removeItem(id, lineItemId);
  }

  // ─────────────────────────────────────────────────────────────
  // Checkout endpoints
  // ─────────────────────────────────────────────────────────────

  /**
   * Set shipping address on cart.
   */
  @Post(":id/shipping-address")
  setShippingAddress(
    @Param("id") id: string,
    @Body()
    body: {
      firstName: string;
      lastName: string;
      streetName: string;
      streetNumber?: string;
      additionalStreetInfo?: string;
      city: string;
      region?: string;
      postalCode: string;
      country: string;
      phone?: string;
      email?: string;
    },
  ) {
    return this.cartService.setShippingAddress(id, body);
  }

  /**
   * Set billing address on cart.
   */
  @Post(":id/billing-address")
  setBillingAddress(
    @Param("id") id: string,
    @Body()
    body: {
      firstName: string;
      lastName: string;
      streetName: string;
      streetNumber?: string;
      additionalStreetInfo?: string;
      city: string;
      region?: string;
      postalCode: string;
      country: string;
      phone?: string;
      email?: string;
    },
  ) {
    return this.cartService.setBillingAddress(id, body);
  }

  /**
   * Get available shipping methods for cart.
   */
  @Get(":id/shipping-methods")
  getShippingMethods(@Param("id") id: string) {
    return this.cartService.getShippingMethods(id);
  }

  /**
   * Set shipping method on cart.
   */
  @Post(":id/shipping-method")
  setShippingMethod(
    @Param("id") id: string,
    @Body() body: { shippingMethodId: string },
  ) {
    return this.cartService.setShippingMethod(id, body.shippingMethodId);
  }

  // ─────────────────────────────────────────────────────────────
  // Discount code endpoints
  // ─────────────────────────────────────────────────────────────

  /**
   * Add a discount code to the cart.
   */
  @Post(":id/discount-codes")
  addDiscountCode(
    @Param("id") id: string,
    @Body() body: { code: string },
  ) {
    return this.cartService.addDiscountCode(id, body.code);
  }

  /**
   * Remove a discount code from the cart.
   */
  @Delete(":id/discount-codes/:discountCodeId")
  removeDiscountCode(
    @Param("id") id: string,
    @Param("discountCodeId") discountCodeId: string,
  ) {
    return this.cartService.removeDiscountCode(id, discountCodeId);
  }

  /**
   * Recalculate cart (refresh prices, taxes, discounts).
   */
  @Post(":id/recalculate")
  recalculate(@Param("id") id: string) {
    return this.cartService.recalculate(id);
  }
}
