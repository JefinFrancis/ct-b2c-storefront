import { Test, TestingModule } from "@nestjs/testing";
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthService, JwtPayload } from "./auth.service";
import { CommercetoolsService } from "../commercetools/commercetools.service";

describe("AuthService", () => {
  let service: AuthService;
  let ctService: jest.Mocked<CommercetoolsService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockCustomer = {
    id: "customer-123",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    version: 1,
  };

  const mockToken = "mock.jwt.token";

  const createMockApiRoot = (responseFn: () => unknown) => ({
    me: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue({
        execute: responseFn,
      }),
    }),
    customers: jest.fn().mockReturnValue({
      post: jest.fn().mockReturnValue({
        execute: responseFn,
      }),
      withId: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue({
          execute: responseFn,
        }),
      }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: CommercetoolsService,
          useValue: {
            getApiRoot: jest.fn(),
            getCustomerApiRoot: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue(mockToken),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    ctService = module.get(CommercetoolsService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("login", () => {
    it("should return token and customer on valid credentials", async () => {
      const mockApi = createMockApiRoot(() =>
        Promise.resolve({ body: mockCustomer }),
      );
      ctService.getCustomerApiRoot.mockReturnValue(mockApi as never);

      const result = await service.login("test@example.com", "password123");

      expect(ctService.getCustomerApiRoot).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
      expect(result).toEqual({
        token: mockToken,
        customer: mockCustomer,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockCustomer.id,
        email: mockCustomer.email,
      });
    });

    it("should throw UnauthorizedException on invalid credentials", async () => {
      const mockApi = createMockApiRoot(() =>
        Promise.reject(new Error("Invalid credentials")),
      );
      ctService.getCustomerApiRoot.mockReturnValue(mockApi as never);

      await expect(
        service.login("test@example.com", "wrongpassword"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when CT API fails", async () => {
      const mockApi = createMockApiRoot(() =>
        Promise.reject({ statusCode: 401 }),
      );
      ctService.getCustomerApiRoot.mockReturnValue(mockApi as never);

      await expect(
        service.login("test@example.com", "password"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("register", () => {
    it("should create customer and return token on success", async () => {
      const mockApi = createMockApiRoot(() =>
        Promise.resolve({ body: { customer: mockCustomer } }),
      );
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.register({
        email: "new@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      });

      expect(result).toEqual({
        token: mockToken,
        customer: mockCustomer,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockCustomer.id,
        email: mockCustomer.email,
      });
    });

    it("should throw ConflictException when email already exists", async () => {
      const mockApi = createMockApiRoot(() =>
        Promise.reject({ body: { statusCode: 400 } }),
      );
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      await expect(
        service.register({
          email: "existing@example.com",
          password: "password",
          firstName: "Jane",
          lastName: "Doe",
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("should rethrow other errors", async () => {
      const error = new Error("Network error");
      const mockApi = createMockApiRoot(() => Promise.reject(error));
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      await expect(
        service.register({
          email: "test@example.com",
          password: "password",
          firstName: "Jane",
          lastName: "Doe",
        }),
      ).rejects.toThrow(error);
    });
  });

  describe("getMe", () => {
    it("should return customer data for valid ID", async () => {
      const mockApi = createMockApiRoot(() =>
        Promise.resolve({ body: mockCustomer }),
      );
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.getMe("customer-123");

      expect(result).toEqual(mockCustomer);
    });

    it("should throw NotFoundException when customer not found", async () => {
      const mockApi = createMockApiRoot(() =>
        Promise.reject({ statusCode: 404 }),
      );
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      await expect(service.getMe("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("validateToken", () => {
    it("should return extracted user data from payload", async () => {
      const payload: JwtPayload = {
        sub: "customer-123",
        email: "test@example.com",
      };

      const result = await service.validateToken(payload);

      expect(result).toEqual({
        id: "customer-123",
        email: "test@example.com",
      });
    });
  });

  describe("verifyToken", () => {
    it("should return decoded payload for valid token", () => {
      const expectedPayload: JwtPayload = {
        sub: "customer-123",
        email: "test@example.com",
      };
      jwtService.verify.mockReturnValue(expectedPayload);

      const result = service.verifyToken("valid.jwt.token");

      expect(result).toEqual(expectedPayload);
      expect(jwtService.verify).toHaveBeenCalledWith("valid.jwt.token");
    });

    it("should throw when token is invalid", () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => service.verifyToken("invalid.token")).toThrow();
    });
  });
});
