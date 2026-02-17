import Link from "next/link";
// TODO: Re-enable when API is running
// import { productsApi } from "@/lib/api-client";

export default async function ProductsPage() {
  // TODO: Replace with actual API call when API is running
  // const { results: products, total } = await productsApi.list({ limit: 20 });

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Products</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <p className="text-gray-600 mb-8">
          Product listing will be populated from commercetools API.
        </p>

        {/* Placeholder product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Link
              key={i}
              href={`/products/product-${i}`}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-4" />
              <h3 className="font-medium">Product {i}</h3>
              <p className="text-gray-600">$XX.XX</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
