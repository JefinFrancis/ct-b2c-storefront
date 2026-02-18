import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { CommercetoolsService } from "../commercetools/commercetools.service";

describe("CustomersService", () => {
  let service: CustomersService;
  let ctService: jest.Mocked<CommercetoolsService>;

  const mockCustomer = {
    id: "customer-123",
    version: 1,
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
  };

  const createMockApiRoot = (customerResponse: unknown) => ({
    customers: jest.fn().mockReturnValue({
      withId: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue({
          execute: jest.fn().mockResolvedValue({ body: customerResponse }),
        }),
        post: jest.fn().mockReturnValue({
          execute: jest.fn().mockResolvedValue({ body: customerResponse }),
        }),
      }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: CommercetoolsService,
          useValue: {
            getApiRoot: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    ctService = module.get(CommercetoolsService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findById", () => {
    it("should return customer for valid ID", async () => {
      const mockApi = createMockApiRoot(mockCustomer);
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.findById("customer-123");

      expect(result).toEqual(mockCustomer);
    });

    it("should throw NotFoundException when customer not found", async () => {
      const mockApi = {
        customers: jest.fn().mockReturnValue({
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

  describe("update", () => {
    it("should update firstName when provided", async () => {
      const updatedCustomer = { ...mockCustomer, firstName: "Jane", version: 2 };
      const postMock = jest
        .fn()
        .mockReturnValue({
          execute: jest.fn().mockResolvedValue({ body: updatedCustomer }),
        });

      const mockApi = {
        customers: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockResolvedValue({ body: mockCustomer }),
            }),
            post: postMock,
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.update("customer-123", { firstName: "Jane" });

      expect(result).toEqual(updatedCustomer);
      expect(postMock).toHaveBeenCalledWith({
        body: expect.objectContaining({
          version: 1,
          actions: [{ action: "setFirstName", firstName: "Jane" }],
        }),
      });
    });

    it("should update lastName when provided", async () => {
      const updatedCustomer = { ...mockCustomer, lastName: "Smith", version: 2 };
      const postMock = jest
        .fn()
        .mockReturnValue({
          execute: jest.fn().mockResolvedValue({ body: updatedCustomer }),
        });

      const mockApi = {
        customers: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockResolvedValue({ body: mockCustomer }),
            }),
            post: postMock,
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.update("customer-123", { lastName: "Smith" });

      expect(result).toEqual(updatedCustomer);
      expect(postMock).toHaveBeenCalledWith({
        body: expect.objectContaining({
          actions: [{ action: "setLastName", lastName: "Smith" }],
        }),
      });
    });

    it("should update both names when both provided", async () => {
      const updatedCustomer = {
        ...mockCustomer,
        firstName: "Jane",
        lastName: "Smith",
        version: 2,
      };
      const postMock = jest
        .fn()
        .mockReturnValue({
          execute: jest.fn().mockResolvedValue({ body: updatedCustomer }),
        });

      const mockApi = {
        customers: jest.fn().mockReturnValue({
          withId: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({
              execute: jest.fn().mockResolvedValue({ body: mockCustomer }),
            }),
            post: postMock,
          }),
        }),
      };
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.update("customer-123", {
        firstName: "Jane",
        lastName: "Smith",
      });

      expect(result).toEqual(updatedCustomer);
      expect(postMock).toHaveBeenCalledWith({
        body: expect.objectContaining({
          actions: [
            { action: "setFirstName", firstName: "Jane" },
            { action: "setLastName", lastName: "Smith" },
          ],
        }),
      });
    });

    it("should return existing customer when no updates provided", async () => {
      const mockApi = createMockApiRoot(mockCustomer);
      ctService.getApiRoot.mockReturnValue(mockApi as never);

      const result = await service.update("customer-123", {});

      expect(result).toEqual(mockCustomer);
    });
  });
});
