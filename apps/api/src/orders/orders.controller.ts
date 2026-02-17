import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Request } from "express";

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: AuthenticatedRequest) {
    return this.ordersService.findByCustomer(req.user.id);
  }
}
