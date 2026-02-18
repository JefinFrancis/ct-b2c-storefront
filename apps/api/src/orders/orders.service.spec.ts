import { Test, TestingModule } from "@nestjs/testing";
import { OrdersService } from "./orders.service";
import { CommercetoolsService } from "../commercetools/commercetools.service";

describe("OrdersService", () => {
  let service: OrdersService;
  let ctService: jest.Mocked<CommercetoolsService>;

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
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ctService = module.get(CommercetoolsService);

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
});
