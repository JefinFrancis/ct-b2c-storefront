import { Controller, Get, Patch, Body, UseGuards, Req } from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Request } from "express";

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.customersService.findById(req.user.id);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: { firstName?: string; lastName?: string },
  ) {
    return this.customersService.update(req.user.id, body);
  }
}
