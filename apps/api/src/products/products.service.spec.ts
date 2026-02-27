import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { NotFoundException, HttpException } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CommercetoolsService } from "../commercetools/commercetools.service";
import { RedisService } from "../redis/redis.service";

describe("ProductsService", () => {
  let service: ProductsService;
  let ctService: jest.Mocked<CommercetoolsService>;
  let redisService: jest.Mocked<RedisService>;

  const mockApiRoot = {
    productProjections: jest.fn().mockReturnThis(),
    search: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: CommercetoolsService,
          useValue: {
            getApiRoot: jest.fn(() => mockApiRoot),
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

    service = module.get<ProductsService>(ProductsService);
    ctService = module.get(CommercetoolsService);
    redisService = module.get(RedisService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    const mockProducts = {
      body: {
        results: [
          { id: "prod-1", name: { "en-US": "Product 1" } },
          { id: "prod-2", name: { "en-US": "Product 2" } },
        ],
        total: 2,
      },
    };

    it("should return cached data if available", async () => {
      const cachedData = {
        results: [{ id: "cached-prod" }],
        total: 1,
        limit: 20,
        offset: 0,
      };
      redisService.get.mockResolvedValue(cachedData);

      const result = await service.findAll({});

      expect(result).toEqual(cachedData);
      expect(redisService.get).toHaveBeenCalledWith(
        expect.stringContaining("products:list:"),
      );
      expect(mockApiRoot.execute).not.toHaveBeenCalled();
    });

    it("should fetch from CT API and cache when no cache exists", async () => {
      redisService.get.mockResolvedValue(null);
      mockApiRoot.execute.mockResolvedValue(mockProducts);

      const result = await service.findAll({ limit: 20, offset: 0 });

      expect(result).toEqual({
        results: mockProducts.body.results,
        total: 2,
        limit: 20,
        offset: 0,
      });
      expect(ctService.getApiRoot).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining("products:list:"),
        expect.objectContaining({ total: 2 }),
        300,
      );
    });

    it("should apply category filter when provided", async () => {
      redisService.get.mockResolvedValue(null);
      mockApiRoot.execute.mockResolvedValue(mockProducts);

      await service.findAll({ category: "cat-123" });

      expect(mockApiRoot.get).toHaveBeenCalledWith({
        queryArgs: expect.objectContaining({
          filter: ['categories.id:"cat-123"'],
        }),
      });
    });

    it("should apply text search when provided", async () => {
      redisService.get.mockResolvedValue(null);
      mockApiRoot.execute.mockResolvedValue(mockProducts);

      await service.findAll({ search: "laptop" });

      expect(mockApiRoot.get).toHaveBeenCalledWith({
        queryArgs: expect.objectContaining({
          "text.en-US": "laptop",
        }),
      });
    });

    it("should apply sorting when provided", async () => {
      redisService.get.mockResolvedValue(null);
      mockApiRoot.execute.mockResolvedValue(mockProducts);

      await service.findAll({ sort: "name.en-US asc" });

      expect(mockApiRoot.get).toHaveBeenCalledWith({
        queryArgs: expect.objectContaining({
          sort: "name.en-US asc",
        }),
      });
    });

    it("should use default pagination values", async () => {
      redisService.get.mockResolvedValue(null);
      mockApiRoot.execute.mockResolvedValue(mockProducts);

      const result = await service.findAll({});

      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it("should throw HttpException on CT API error", async () => {
      redisService.get.mockResolvedValue(null);
      const ctError = { statusCode: 500, message: "CT Error" };
      mockApiRoot.execute.mockRejectedValue(ctError);

      await expect(service.findAll({})).rejects.toThrow(HttpException);
    });
  });

  describe("findBySlug", () => {
    const mockProduct = { id: "prod-1", slug: { "en-US": "test-product" } };

    it("should return cached product if available", async () => {
      redisService.get.mockResolvedValue(mockProduct);

      const result = await service.findBySlug("test-product");

      expect(result).toEqual(mockProduct);
      expect(redisService.get).toHaveBeenCalledWith("product:test-product");
      expect(mockApiRoot.execute).not.toHaveBeenCalled();
    });

    it("should fetch from CT API and cache when no cache exists", async () => {
      redisService.get.mockResolvedValue(null);
      mockApiRoot.execute.mockResolvedValue({
        body: { results: [mockProduct] },
      });

      const result = await service.findBySlug("test-product");

      expect(result).toEqual(mockProduct);
      expect(redisService.set).toHaveBeenCalledWith(
        "product:test-product",
        mockProduct,
        300,
      );
    });

    it("should throw NotFoundException when product not found", async () => {
      redisService.get.mockResolvedValue(null);
      mockApiRoot.execute.mockResolvedValue({
        body: { results: [] },
      });

      await expect(service.findBySlug("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should filter by slug in query", async () => {
      redisService.get.mockResolvedValue(null);
      mockApiRoot.execute.mockResolvedValue({
        body: { results: [mockProduct] },
      });

      await service.findBySlug("my-slug");

      expect(mockApiRoot.get).toHaveBeenCalledWith({
        queryArgs: expect.objectContaining({
          filter: ['slug.en-US:"my-slug"'],
          limit: 1,
        }),
      });
    });

    it("should throw HttpException on CT API error", async () => {
      redisService.get.mockResolvedValue(null);
      const ctError = { statusCode: 503, message: "Service unavailable" };
      mockApiRoot.execute.mockRejectedValue(ctError);

      await expect(service.findBySlug("any-slug")).rejects.toThrow(
        HttpException,
      );
    });
  });
});
