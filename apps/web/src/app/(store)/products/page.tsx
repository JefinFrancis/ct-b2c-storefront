/**
 * Products Page (PLP) — Server Component that fetches products from API.
 * Supports pagination via URL query params (?limit=20&offset=0).
 * Supports search and category filtering.
 */
import { Suspense } from "react";
import Link from "next/link";
import { productsApi } from "@/lib/api-client";
import { ProductCard, Pagination, ProductSearch, CategoryFilter } from "@/components";
import type { Product } from "@ct-b2c/types";

interface SearchParams {
  limit?: string;
  offset?: string;
  category?: string;
  search?: string;
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>;
}

interface Category {
  id: string;
  name: Record<string, string>;
  slug: Record<string, string>;
  parent?: string;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const limit = params.limit ? parseInt(params.limit, 10) : 20;
  const offset = params.offset ? parseInt(params.offset, 10) : 0;

  let products: Product[] = [];
  let total = 0;
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      productsApi.list({
        limit,
        offset,
        category: params.category,
        search: params.search,
      }),
      productsApi.getCategories(),
    ]);
    products = productsResponse.results;
    total = productsResponse.total;
    categories = categoriesResponse;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load products";
    console.error("Failed to fetch products:", e);
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            {!error && (
              <p className="text-gray-600 mt-1">
                Showing {offset + 1}–{Math.min(offset + limit, total)} of {total} products
              </p>
            )}
          </div>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Suspense fallback={<div className="h-10 bg-gray-200 rounded animate-pulse" />}>
                <ProductSearch initialQuery={params.search || ""} />
              </Suspense>
            </div>
            <Suspense fallback={<div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />}>
              <CategoryFilter
                categories={categories}
                selectedCategory={params.category}
              />
            </Suspense>
          </div>
          {(params.search || params.category) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span>Active filters:</span>
              {params.search && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Search: &quot;{params.search}&quot;
                </span>
              )}
              {params.category && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Category: {categories.find(c => c.id === params.category)?.name["en-US"] || params.category}
                </span>
              )}
              <Link
                href="/products"
                className="text-red-600 hover:underline ml-2"
              >
                Clear all
              </Link>
            </div>
          )}
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">Error loading products</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <p className="text-gray-600 text-sm mt-4">
              Make sure the API server is running at{" "}
              <code className="bg-gray-100 px-1 rounded">localhost:8080</code>
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600">No products found.</p>
            {(params.search || params.category) && (
              <Link
                href="/products"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <Pagination
              total={total}
              limit={limit}
              offset={offset}
              baseUrl="/products"
            />
          </>
        )}
      </div>
    </main>
  );
}
