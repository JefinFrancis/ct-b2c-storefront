import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CommercetoolsService } from "../commercetools/commercetools.service";
import { RedisService } from "../redis/redis.service";

describe("CartService", () => {
  let service: CartService;
  let ctService: jest.Mocked<CommercetoolsService>;
  let redisService: jest.Mocked<RedisService>;

  const mockCart = {
    id: "cart-123",
    version: 1,
    cartState: "Active",
    lineItems: [],
    totalPrice: { centAmount: 0, currencyCode: "USD" },
  };

  const createMockApiRoot = () => {
    const mockApi = {
      carts: jest.fn().mockReturnValue({
        post: jest.fn().mockReturnValue({
          execute: jest.fn().mockResolvedValue({ body: mockCart }),
        }),
        withId: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue({ body: mockCart }),
          }),
          post: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue({ body: mockCart }),
          }),
        }),
      }),
    };
    return mockApi;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CommercetoolsService,
          useValue: {
            getApiRoot: jest.fn(),
            getAnonymousApiRoot: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    ctService = module.get(CommercetoolsService);
    redisService = module.get(RedisService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new cart with USD currency", async () => {
      const mockApi = createMockApiRoot();
      ctService.getAnonymousApiRoot.mockReturnValue(mockApi as never);

      const result = await service.create();

      expect(result).toEqual(mockCart);
      expect(ctService.getAnonymousApiRoot).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return cart for valid ID", async () => {
      const mockApi = createMockApiRoot();
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.findById("cart-123");

      expect(result).toEqual(mockCart);
    });

    it("should throw NotFoundException when cart not found", async () => {
      const mockApi = {
        carts: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockRejectedValue({ statusCode: 404 }),
            }),
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      await expect(service.findById("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("addItem", () => {
    it("should add line item to cart", async () => {
      const updatedCart = { ...mockCart, version: 2 };
      const mockApi = {
        carts: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockResolvedValue({ body: mockCart }),
            }),
            post: jest.fn().mockReturnValue({
              execute: jest.fn().mockResolvedValue({ body: updatedCart }),
            }),
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.addItem("cart-123", {
        productId: "prod-1",
        variantId: 1,
        quantity: 2,
      });

      expect(result).toEqual(updatedCart);
    });

    it("should use current cart version for update", async () => {
      const postExecuteMock = jest
        .fn()
        .mockResolvedValue({ body: { ...mockCart, version: 2 } });
      const postMock = jest.fn().mockReturnValue({ execute: postExecuteMock });
      const mockApi = {
        carts: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockResolvedValue({ body: mockCart }),
            }),
            post: postMock,
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      await service.addItem("cart-123", {
        productId: "prod-1",
        variantId: 1,
        quantity: 1,
      });

      expect(postMock).toHaveBeenCalledWith({
        body: expect.objectContaining({
          version: 1,
          actions: [
            expect.objectContaining({
              action: "addLineItem",
              productId: "prod-1",
              variantId: 1,
              quantity: 1,
            }),
          ],
        }),
      });
    });
  });

  describe("updateItem", () => {
    it("should update line item quantity", async () => {
      const updatedCart = { ...mockCart, version: 2 };
      const postMock = jest
        .fn()
        .mockReturnValue({
          execute: jest.fn().mockResolvedValue({ body: updatedCart }),
        });
      const mockApi = {
        carts: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockResolvedValue({ body: mockCart }),
            }),
            post: postMock,
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.updateItem("cart-123", "line-item-1", 5);

      expect(result).toEqual(updatedCart);
      expect(postMock).toHaveBeenCalledWith({
        body: expect.objectContaining({
          actions: [
            expect.objectContaining({
              action: "changeLineItemQuantity",
              lineItemId: "line-item-1",
              quantity: 5,
            }),
          ],
        }),
      });
    });
  });

  describe("removeItem", () => {
    it("should remove line item from cart", async () => {
      const updatedCart = { ...mockCart, version: 2 };
      const postMock = jest
        .fn()
        .mockReturnValue({
          execute: jest.fn().mockResolvedValue({ body: updatedCart }),
        });
      const mockApi = {
        carts: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockResolvedValue({ body: mockCart }),
            }),
            post: postMock,
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.removeItem("cart-123", "line-item-1");

      expect(result).toEqual(updatedCart);
      expect(postMock).toHaveBeenCalledWith({
        body: expect.objectContaining({
          actions: [
            expect.objectContaining({
              action: "removeLineItem",
              lineItemId: "line-item-1",
            }),
          ],
        }),
      });
    });
  });

  describe("setCartIdForSession", () => {
    it("should store cartId in Redis with 30-day TTL", async () => {
      await service.setCartIdForSession("session-abc", "cart-123");

      expect(redisService.set).toHaveBeenCalledWith(
        "session:session-abc",
        "cart-123",
        30 * 24 * 60 * 60,
      );
    });
  });

  describe("getCartIdForSession", () => {
    it("should return cartId from Redis", async () => {
      redisService.get.mockResolvedValue("cart-123");

      const result = await service.getCartIdForSession("session-abc");

      expect(result).toBe("cart-123");
      expect(redisService.get).toHaveBeenCalledWith("session:session-abc");
    });

    it("should return null when no cart for session", async () => {
      redisService.get.mockResolvedValue(null);

      const result = await service.getCartIdForSession("unknown-session");

      expect(result).toBeNull();
    });
  });

  describe("getOrCreateCartForSession", () => {
    it("should return existing active cart", async () => {
      redisService.get.mockResolvedValue("cart-123");
      const mockApi = createMockApiRoot();
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.getOrCreateCartForSession("session-abc");

      expect(result).toEqual(mockCart);
      expect(ctService.getAnonymousApiRoot).not.toHaveBeenCalled();
    });

    it("should create new cart when session has no cart", async () => {
      redisService.get.mockResolvedValue(null);
      const mockApi = createMockApiRoot();
      ctService.getAnonymousApiRoot.mockReturnValue(mockApi as never);
      redisService.set.mockResolvedValue(undefined);

      const result = await service.getOrCreateCartForSession("new-session");

      expect(result).toEqual(mockCart);
      expect(redisService.set).toHaveBeenCalledWith(
        "session:new-session",
        mockCart.id,
        30 * 24 * 60 * 60,
      );
    });

    it("should create new cart when existing cart not found", async () => {
      redisService.get.mockResolvedValue("deleted-cart-id");

      const mockApi = {
        carts: jest.fn().mockReturnValue({
          post: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue({ body: mockCart }),
          }),
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockRejectedValue({ statusCode: 404 }),
            }),
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);
      ctService.getAnonymousApiRoot.mockReturnValue(mockApi as never);

      const result = await service.getOrCreateCartForSession("session-abc");

      expect(result).toEqual(mockCart);
    });

    it("should create new cart when existing cart is not active", async () => {
      redisService.get.mockResolvedValue("ordered-cart-id");

      const orderedCart = { ...mockCart, cartState: "Ordered" };
      const mockGetApi = {
        carts: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockResolvedValue({ body: orderedCart }),
            }),
          }),
        }),
      };
      const mockCreateApi = {
        carts: jest.fn().mockReturnValue({
          post: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue({ body: mockCart }),
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockGetApi as never);
      ctService.getAnonymousApiRoot.mockReturnValue(mockCreateApi as never);

      const result = await service.getOrCreateCartForSession("session-abc");

      expect(result).toEqual(mockCart);
    });
  });

  describe("setCustomerId", () => {
    it("should set customerId and customerEmail on cart", async () => {
      const updatedCart = {
        ...mockCart,
        customerId: "customer-123",
        customerEmail: "john@example.com",
      };
      const postMock = jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue({ body: updatedCart }),
      });
      const mockApi = {
        carts: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockResolvedValue({ body: mockCart }),
            }),
            post: postMock,
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.setCustomerId(
        "cart-123",
        "customer-123",
        "john@example.com",
      );

      expect(result).toEqual(updatedCart);
      expect(postMock).toHaveBeenCalledWith({
        body: {
          version: 1,
          actions: [
            { action: "setCustomerId", customerId: "customer-123" },
            { action: "setCustomerEmail", email: "john@example.com" },
          ],
        },
      });
    });

    it("should skip actions when customerId and email already match", async () => {
      const existingCart = {
        ...mockCart,
        customerId: "customer-123",
        customerEmail: "john@example.com",
      };
      const mockApi = {
        carts: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockResolvedValue({ body: existingCart }),
            }),
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.setCustomerId(
        "cart-123",
        "customer-123",
        "john@example.com",
      );

      // Should return existing cart without making a POST
      expect(result).toEqual(existingCart);
    });

    it("should only set customerEmail when customerId already matches", async () => {
      const existingCart = {
        ...mockCart,
        customerId: "customer-123",
        customerEmail: "old@example.com",
      };
      const updatedCart = {
        ...existingCart,
        customerEmail: "new@example.com",
      };
      const postMock = jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue({ body: updatedCart }),
      });
      const mockApi = {
        carts: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockResolvedValue({ body: existingCart }),
            }),
            post: postMock,
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.setCustomerId(
        "cart-123",
        "customer-123",
        "new@example.com",
      );

      expect(result).toEqual(updatedCart);
      expect(postMock).toHaveBeenCalledWith({
        body: {
          version: 1,
          actions: [
            { action: "setCustomerEmail", email: "new@example.com" },
          ],
        },
      });
    });
  });
});
