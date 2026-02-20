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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Page header */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {params.search ? `Search: "${params.search}"` : "All Products"}
              </h1>
              {!error && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {total > 0
                    ? `Showing ${offset + 1}–${Math.min(offset + limit, total)} of ${total} products`
                    : "No products found"}
                </p>
              )}
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Suspense fallback={<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />}>
                <ProductSearch initialQuery={params.search || ""} />
              </Suspense>
            </div>
            <Suspense fallback={<div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />}>
              <CategoryFilter
                categories={categories}
                selectedCategory={params.category}
              />
            </Suspense>
          </div>

          {(params.search || params.category) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Active filters:</span>
              {params.search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200 text-xs font-medium">
                  Search: &quot;{params.search}&quot;
                </span>
              )}
              {params.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
                  {categories.find(c => c.id === params.category)?.name["en-US"] || params.category}
                </span>
              )}
              <Link
                href="/products"
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                Clear all
              </Link>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium">Error loading products</p>
            <p className="text-red-500 dark:text-red-500 text-sm mt-1">{error}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
              Make sure the API server is running at{" "}
              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">localhost:8080</code>
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No products found</p>
            {(params.search || params.category) && (
              <Link
                href="/products"
                className="mt-3 inline-flex items-center text-brand-600 dark:text-brand-400 hover:underline text-sm"
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
      </main>
    </div>
  );
}
