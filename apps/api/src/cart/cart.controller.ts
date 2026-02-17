import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { CartService } from "./cart.service";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create() {
    return this.cartService.create();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.cartService.findById(id);
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
