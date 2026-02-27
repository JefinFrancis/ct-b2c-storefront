import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { OrdersService } from "./orders.service";
import { CommercetoolsService } from "../commercetools/commercetools.service";
import { CartService } from "../cart/cart.service";

describe("OrdersService", () => {
  let service: OrdersService;
  let ctService: jest.Mocked<CommercetoolsService>;
  let cartService: jest.Mocked<CartService>;

  const mockOrders = [
    {
      id: "order-1",
      orderNumber: "ORD-001",
      createdAt: "2024-01-15T10:00:00Z",
      customerId: "customer-123",
      totalPrice: { centAmount: 9999, currencyCode: "USD" },
    },
    {
      id: "order-2",
      orderNumber: "ORD-002",
      createdAt: "2024-01-10T10:00:00Z",
      customerId: "customer-123",
      totalPrice: { centAmount: 4999, currencyCode: "USD" },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: CommercetoolsService,
          useValue: {
            getApiRoot: jest.fn(),
          },
        },
        {
          provide: CartService,
          useValue: {
            findById: jest.fn(),
            setCustomerId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ctService = module.get(CommercetoolsService);
    cartService = module.get(CartService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findByCustomer", () => {
    it("should return orders for a customer", async () => {
      const getMock = jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue({
          body: { results: mockOrders },
        }),
      });

      const mockApi = {
        orders: jest.fn().mockReturnValue({
          get: getMock,
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.findByCustomer("customer-123");

      expect(result).toEqual(mockOrders);
      expect(getMock).toHaveBeenCalledWith({
        queryArgs: {
          where: 'customerId="customer-123"',
          sort: "createdAt desc",
          limit: 50,
        },
      });
    });

    it("should return empty array when no orders found", async () => {
      const mockApi = {
        orders: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue({
              body: { results: [] },
            }),
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.findByCustomer("new-customer");

      expect(result).toEqual([]);
    });

    it("should sort orders by createdAt desc", async () => {
      const getMock = jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue({
          body: { results: mockOrders },
        }),
      });

      const mockApi = {
        orders: jest.fn().mockReturnValue({
          get: getMock,
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      await service.findByCustomer("customer-123");

      expect(getMock).toHaveBeenCalledWith(
        expect.objectContaining({
          queryArgs: expect.objectContaining({
            sort: "createdAt desc",
          }),
        }),
      );
    });

    it("should limit results to 50", async () => {
      const getMock = jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue({
          body: { results: mockOrders },
        }),
      });

      const mockApi = {
        orders: jest.fn().mockReturnValue({
          get: getMock,
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      await service.findByCustomer("customer-123");

      expect(getMock).toHaveBeenCalledWith(
        expect.objectContaining({
          queryArgs: expect.objectContaining({
            limit: 50,
          }),
        }),
      );
    });
  });

  describe("createFromCart", () => {
    const mockCart = {
      id: "cart-123",
      version: 1,
      shippingAddress: { country: "US", city: "New York" },
      shippingInfo: { shippingMethodName: "Standard" },
      lineItems: [{ id: "line-1", productId: "prod-1" }],
    };

    const mockOrder = {
      id: "order-new",
      orderNumber: "ORD-NEW",
      orderState: "Open",
    };

    it("should create an order from a valid cart", async () => {
      cartService.setCustomerId.mockResolvedValue(mockCart as never);
      cartService.findById.mockResolvedValue(mockCart as never);

      const postMock = jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue({ body: mockOrder }),
      });

      const mockApi = {
        orders: jest.fn().mockReturnValue({
          post: postMock,
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.createFromCart(
        "cart-123",
        "customer-123",
        "john@example.com",
      );

      expect(result).toEqual(mockOrder);
      expect(cartService.setCustomerId).toHaveBeenCalledWith(
        "cart-123",
        "customer-123",
        "john@example.com",
      );
      expect(postMock).toHaveBeenCalledWith({
        body: {
          cart: { id: "cart-123", typeId: "cart" },
          version: 1,
        },
      });
    });

    it("should throw error if cart has no shipping address", async () => {
      const cartWithoutAddress = { ...mockCart, shippingAddress: undefined };
      cartService.setCustomerId.mockResolvedValue(cartWithoutAddress as never);
      cartService.findById.mockResolvedValue(cartWithoutAddress as never);

      await expect(
        service.createFromCart("cart-123", "customer-123", "john@example.com"),
      ).rejects.toThrow(
        "Cart must have a shipping address before creating an order",
      );
    });

    it("should throw error if cart has no shipping method", async () => {
      const cartWithoutShipping = { ...mockCart, shippingInfo: undefined };
      cartService.setCustomerId.mockResolvedValue(cartWithoutShipping as never);
      cartService.findById.mockResolvedValue(cartWithoutShipping as never);

      await expect(
        service.createFromCart("cart-123", "customer-123", "john@example.com"),
      ).rejects.toThrow(
        "Cart must have a shipping method before creating an order",
      );
    });

    it("should throw error if cart is empty", async () => {
      const emptyCart = { ...mockCart, lineItems: [] };
      cartService.setCustomerId.mockResolvedValue(emptyCart as never);
      cartService.findById.mockResolvedValue(emptyCart as never);

      await expect(
        service.createFromCart("cart-123", "customer-123", "john@example.com"),
      ).rejects.toThrow(
        "Cart must have at least one item",
      );
    });
  });

  describe("findById", () => {
    it("should return an order by ID", async () => {
      const mockOrder = {
        id: "order-1",
        orderNumber: "ORD-001",
        orderState: "Open",
      };

      const getMock = jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue({ body: mockOrder }),
      });

      const mockApi = {
        orders: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: getMock,
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.findById("order-1");

      expect(result).toEqual(mockOrder);
    });
  });
});
