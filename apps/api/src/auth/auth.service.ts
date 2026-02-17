import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CommercetoolsService } from "../commercetools/commercetools.service";

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
   * Login existing customer using CT password flow.
   * Returns customer data and JWT token.
   */
  async login(email: string, password: string) {
    try {
      const api = this.ct.getCustomerApiRoot(email, password);

      // Fetch the customer profile to validate credentials
      const response = await api.me().get().execute();

      const customer = response.body;
      const token = this.jwtService.sign({
        sub: customer.id,
        email: customer.email,
      });

      return { token, customer };
    } catch {
      throw new UnauthorizedException("Invalid email or password");
    }
  }

  /**
   * Register new customer and auto-login.
   * Returns customer data and JWT token.
   */
  async register(input: RegisterInput) {
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
          },
        })
        .execute();

      const customer = response.body.customer;
      const token = this.jwtService.sign({
        sub: customer.id,
        email: customer.email,
      });

      return { token, customer };
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
}
