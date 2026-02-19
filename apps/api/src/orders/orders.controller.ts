import { Controller, Get, Post, Param, Body, UseGuards, Req } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Request } from "express";

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Create an order from a cart.
   * Cart must have shipping address and shipping method set.
   * Requires authentication — associates the order with the logged-in customer.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  createOrder(
    @Body() body: { cartId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.ordersService.createFromCart(
      body.cartId,
      req.user.id,
      req.user.email,
    );
  }

  /**
   * Get all orders for authenticated customer.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: AuthenticatedRequest) {
    return this.ordersService.findByCustomer(req.user.id);
  }

  /**
   * Get an order by ID.
   */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordersService.findById(id);
  }
}
