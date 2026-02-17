/**
 * Products Page (PLP) — Server Component that fetches products from API.
 * Supports pagination via URL query params (?limit=20&offset=0).
 */
import Link from "next/link";
import { productsApi } from "@/lib/api-client";
import { ProductCard, Pagination } from "@/components";
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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const limit = params.limit ? parseInt(params.limit, 10) : 20;
  const offset = params.offset ? parseInt(params.offset, 10) : 0;

  let products: Product[] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const response = await productsApi.list({
      limit,
      offset,
      category: params.category,
      search: params.search,
    });
    products = response.results;
    total = response.total;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load products";
    console.error("Failed to fetch products:", e);
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
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
