import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import type { WishlistService } from "./wishlist.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { Request } from "express";

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

@Controller("wishlist")
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  /**
   * Get the customer's wishlist.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  getWishlist(@Req() req: AuthenticatedRequest) {
    return this.wishlistService.getOrCreateWishlist(req.user.id);
  }

  /**
   * Add a product to the customer's wishlist.
   */
  @Post("items")
  @UseGuards(JwtAuthGuard)
  addItem(
    @Req() req: AuthenticatedRequest,
    @Body() body: { productId: string; variantId?: number },
  ) {
    return this.wishlistService.addItem(
      req.user.id,
      body.productId,
      body.variantId,
    );
  }

  /**
   * Remove an item from the customer's wishlist.
   */
  @Delete("items/:lineItemId")
  @UseGuards(JwtAuthGuard)
  removeItem(
    @Req() req: AuthenticatedRequest,
    @Param("lineItemId") lineItemId: string,
  ) {
    return this.wishlistService.removeItem(req.user.id, lineItemId);
  }
}
