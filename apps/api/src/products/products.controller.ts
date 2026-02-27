/**
 * ProductsController — handles product listing and detail endpoints.
 * GET /api/v1/products — paginated product list with optional filters
 * GET /api/v1/products/categories — all categories
 * GET /api/v1/products/:slug — single product by slug
 */
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("category") category?: string,
    @Query("sort") sort?: string,
    @Query("search") search?: string,
  ) {
    return this.productsService.findAll({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      category,
      sort,
      search,
    });
  }

  /**
   * Get all categories for navigation/filtering.
   */
  @Get("categories")
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
