import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CommercetoolsService } from "../commercetools/commercetools.service";

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly ct: CommercetoolsService,
    private readonly jwtService: JwtService,
  ) {}

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

  async validateToken(payload: { sub: string; email: string }) {
    // Token payload contains customer ID and email
    return { id: payload.sub, email: payload.email };
  }
}
