import Link from "next/link";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // TODO: Fetch product from API
  // const product = await productsApi.getBySlug(slug);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/products"
          className="text-blue-600 hover:underline mb-8 inline-block"
        >
          ← Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 rounded-lg" />

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold mb-4">Product: {slug}</h1>
            <p className="text-2xl font-medium text-gray-800 mb-6">$XX.XX</p>
            <p className="text-gray-600 mb-8">
              Product description will be loaded from commercetools API.
            </p>

            <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
