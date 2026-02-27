import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import type { CustomersService } from "./customers.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { Request } from "express";

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
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
      companyName?: string;
    },
  ) {
    return this.customersService.update(req.user.id, body);
  }

  // ─────────────────────────────────────────────────────────────
  // Address endpoints
  // ─────────────────────────────────────────────────────────────

  /**
   * Add a new address to the customer.
   */
  @Post("me/addresses")
  @UseGuards(JwtAuthGuard)
  addAddress(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      streetName?: string;
      streetNumber?: string;
      additionalStreetInfo?: string;
      city?: string;
      region?: string;
      postalCode?: string;
      country: string;
      phone?: string;
      email?: string;
    },
  ) {
    return this.customersService.addAddress(req.user.id, body);
  }

  /**
   * Update an existing address.
   */
  @Patch("me/addresses/:addressId")
  @UseGuards(JwtAuthGuard)
  updateAddress(
    @Req() req: AuthenticatedRequest,
    @Param("addressId") addressId: string,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      streetName?: string;
      streetNumber?: string;
      additionalStreetInfo?: string;
      city?: string;
      region?: string;
      postalCode?: string;
      country: string;
      phone?: string;
      email?: string;
    },
  ) {
    return this.customersService.updateAddress(req.user.id, addressId, body);
  }

  /**
   * Remove an address.
   */
  @Delete("me/addresses/:addressId")
  @UseGuards(JwtAuthGuard)
  removeAddress(
    @Req() req: AuthenticatedRequest,
    @Param("addressId") addressId: string,
  ) {
    return this.customersService.removeAddress(req.user.id, addressId);
  }

  /**
   * Set default shipping address.
   */
  @Post("me/addresses/:addressId/default-shipping")
  @UseGuards(JwtAuthGuard)
  setDefaultShippingAddress(
    @Req() req: AuthenticatedRequest,
    @Param("addressId") addressId: string,
  ) {
    return this.customersService.setDefaultShippingAddress(
      req.user.id,
      addressId,
    );
  }

  /**
   * Set default billing address.
   */
  @Post("me/addresses/:addressId/default-billing")
  @UseGuards(JwtAuthGuard)
  setDefaultBillingAddress(
    @Req() req: AuthenticatedRequest,
    @Param("addressId") addressId: string,
  ) {
    return this.customersService.setDefaultBillingAddress(
      req.user.id,
      addressId,
    );
  }

  /**
   * Change customer password.
   */
  @Post("me/password")
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.customersService.changePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
  }
}
