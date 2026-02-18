/**
 * ProductsService — handles product fetching with Redis cache-aside pattern.
 * Caches product projections for 5 minutes to reduce CT API calls.
 */
import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { CommercetoolsService } from "../commercetools/commercetools.service";
import { RedisService } from "../redis/redis.service";

interface FindAllParams {
  limit?: number;
  offset?: number;
  category?: string;
  sort?: string;
  search?: string;
}

const CACHE_TTL = 300; // 5 minutes

/** Response type for findAll - exported for controller */
export interface ProductListResponse {
  results: unknown[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly ct: CommercetoolsService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Fetch paginated product list with optional filters.
   * Uses Redis cache-aside pattern.
   */
  async findAll(params: FindAllParams): Promise<ProductListResponse> {
    const { limit = 20, offset = 0, category, sort, search } = params;

    // Build cache key from query params
    const cacheKey = `products:list:${JSON.stringify({ limit, offset, category, sort, search })}`;

    // Try cache first
    const cached = await this.redis.get<ProductListResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const api = this.ct.getApiRoot();

      const filter: string[] = [];
      if (category) {
        filter.push(`categories.id:"${category}"`);
      }

      // Build query args with proper typing
      const queryArgs: {
        limit: number;
        offset: number;
        filter?: string[];
        sort?: string;
        "text.en-US"?: string;
      } = {
        limit,
        offset,
      };

      if (filter.length) {
        queryArgs.filter = filter;
      }

      // Add text search if provided
      if (search) {
        queryArgs["text.en-US"] = search;
      }

      // Add sorting
      if (sort) {
        queryArgs.sort = sort;
      }

      const response = await api
        .productProjections()
        .search()
        .get({ queryArgs })
        .execute();

      const result: ProductListResponse = {
        results: response.body.results,
        total: response.body.total ?? 0,
        limit,
        offset,
      };

      // Cache the result
      await this.redis.set(cacheKey, result, CACHE_TTL);

      return result;
    } catch (error) {
      this.handleCtError(error, "Failed to fetch products");
    }
  }

  /**
   * Fetch single product by slug with Redis caching.
   */
  async findBySlug(slug: string) {
    const cacheKey = `product:${slug}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const api = this.ct.getApiRoot();

      const response = await api
        .productProjections()
        .search()
        .get({
          queryArgs: {
            filter: [`slug.en-US:"${slug}"`],
            limit: 1,
          },
        })
        .execute();

      const product = response.body.results[0];
      if (!product) {
        throw new NotFoundException(`Product with slug "${slug}" not found`);
      }

      // Cache the product
      await this.redis.set(cacheKey, product, CACHE_TTL);

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.handleCtError(error, `Failed to fetch product: ${slug}`);
    }
  }

  /**
   * Convert CT API errors to HttpException with appropriate status.
   */
  private handleCtError(error: unknown, fallbackMessage: string): never {
    const ctError = error as { statusCode?: number; message?: string };
    throw new HttpException(
      ctError.message ?? fallbackMessage,
      ctError.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Fetch all categories with Redis caching.
   */
  async getCategories() {
    const cacheKey = "categories:all";

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const api = this.ct.getApiRoot();

      const response = await api
        .categories()
        .get({
          queryArgs: {
            limit: 100,
            sort: "orderHint asc",
          },
        })
        .execute();

      const categories = response.body.results.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parent: cat.parent?.id,
      }));

      // Cache for 10 minutes (categories change less frequently)
      await this.redis.set(cacheKey, categories, 600);

      return categories;
    } catch (error) {
      this.handleCtError(error, "Failed to fetch categories");
    }
  }
}
