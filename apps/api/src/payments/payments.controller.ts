import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import type { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { Request } from "express";

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Process payment for checkout.
   * Creates payment, charges it, and adds to cart.
   */
  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  processCheckoutPayment(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      cartId: string;
      amountCentAmount: number;
      currencyCode: string;
      paymentMethod?: string;
    },
  ) {
    return this.paymentsService.processCheckoutPayment(
      body.cartId,
      body.amountCentAmount,
      body.currencyCode,
      req.user.id,
      body.paymentMethod,
    );
  }

  /**
   * Get a payment by ID.
   */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.paymentsService.findById(id);
  }
}
