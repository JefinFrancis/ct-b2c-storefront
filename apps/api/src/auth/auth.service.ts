import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import type { CommercetoolsService } from "../commercetools/commercetools.service";

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly ct: CommercetoolsService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Login existing customer using CT customer sign-in endpoint.
   * Uses the admin API root (client credentials) to authenticate
   * the customer, avoiding the need for customer-specific OAuth scopes.
   * If anonymousCartId is provided, merges it with the customer's cart.
   * Returns customer data and JWT token.
   */
  async login(email: string, password: string, anonymousCartId?: string) {
    try {
      const api = this.ct.getApiRoot();

      const response = await api
        .login()
        .post({
          body: {
            email,
            password,
            ...(anonymousCartId
              ? {
                  anonymousCart: {
                    id: anonymousCartId,
                    typeId: "cart",
                  },
                  anonymousCartSignInMode:
                    "MergeWithExistingCustomerCart" as const,
                }
              : {}),
          },
        })
        .execute();

      const customer = response.body.customer;
      const cart = response.body.cart;
      const token = this.jwtService.sign({
        sub: customer.id,
        email: customer.email,
      });

      return { token, customer, cart: cart ?? null };
    } catch {
      throw new UnauthorizedException("Invalid email or password");
    }
  }

  /**
   * Register new customer and auto-login.
   * If anonymousCartId is provided, associates it with the new customer.
   * Returns customer data and JWT token.
   */
  async register(input: RegisterInput, anonymousCartId?: string) {
    const api = this.ct.getApiRoot();

    try {
      const response = await api
        .customers()
        .post({
          body: {
            email: input.email,
            password: input.password,
            firstName: input.firstName,
            lastName: input.lastName,
            ...(anonymousCartId
              ? {
                  anonymousCart: {
                    id: anonymousCartId,
                    typeId: "cart",
                  },
                  anonymousCartSignInMode:
                    "MergeWithExistingCustomerCart" as const,
                }
              : {}),
          },
        })
        .execute();

      const customer = response.body.customer;
      const cart = response.body.cart;
      const token = this.jwtService.sign({
        sub: customer.id,
        email: customer.email,
      });

      return { token, customer, cart: cart ?? null };
    } catch (error: unknown) {
      const ctError = error as { body?: { statusCode?: number } };
      if (ctError.body?.statusCode === 400) {
        throw new ConflictException("Email already exists");
      }
      throw error;
    }
  }

  /**
   * Get current customer by ID (from JWT payload).
   */
  async getMe(customerId: string) {
    const api = this.ct.getApiRoot();

    try {
      const response = await api
        .customers()
        .withId({ ID: customerId })
        .get()
        .execute();

      return response.body;
    } catch {
      throw new NotFoundException("Customer not found");
    }
  }

  /**
   * Validate JWT payload (called by JwtStrategy).
   */
  async validateToken(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }

  /**
   * Verify and decode a JWT token.
   */
  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }

  /**
   * Request a password reset token for a customer email.
   * In production, the token would be delivered via email.
   * In development, the token value is returned for manual testing.
   */
  async forgotPassword(email: string) {
    const api = this.ct.getApiRoot();

    try {
      const response = await api
        .customers()
        .passwordToken()
        .post({
          body: { email, ttlMinutes: 60 },
        })
        .execute();

      const isDev = process.env.NODE_ENV !== "production";
      return {
        message: "If an account exists for that email, a reset link has been sent.",
        // Only return token in development (no email service configured)
        ...(isDev ? { tokenValue: response.body.value } : {}),
      };
    } catch {
      // Always return success to prevent email enumeration
      return {
        message: "If an account exists for that email, a reset link has been sent.",
      };
    }
  }

  /**
   * Reset customer password using a password-reset token.
   */
  async resetPassword(tokenValue: string, newPassword: string) {
    const api = this.ct.getApiRoot();

    try {
      // Look up the customer by the password token
      const tokenResponse = await api
        .customers()
        .withPasswordToken({ passwordToken: tokenValue })
        .get()
        .execute();

      const customer = tokenResponse.body;

      // Reset password using the token
      await api
        .customers()
        .passwordReset()
        .post({
          body: {
            tokenValue,
            newPassword,
            version: customer.version,
          },
        })
        .execute();

      return { message: "Password has been reset successfully." };
    } catch {
      throw new UnauthorizedException("Invalid or expired reset token.");
    }
  }
}
