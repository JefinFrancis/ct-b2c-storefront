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
}
