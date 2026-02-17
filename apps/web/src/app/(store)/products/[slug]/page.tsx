import { notFound } from "next/navigation";
import Link from "next/link";
import { productsApi } from "@/lib/api-client";
import ProductDetails from "@/components/ProductDetails";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate metadata for SEO.
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await productsApi.getBySlug(slug);
    const name =
      product.name["en-US"] ?? Object.values(product.name)[0] ?? "Product";
    const description = product.description
      ? product.description["en-US"] ??
        Object.values(product.description)[0] ??
        ""
      : "";

    // Get first image for og:image
    const image = product.masterVariant.images?.[0]?.url;

    return {
      title: `${name} | CT B2C Storefront`,
      description: description.slice(0, 160) || `Shop ${name} at CT B2C Storefront`,
      openGraph: {
        title: name,
        description: description.slice(0, 160) || `Shop ${name}`,
        images: image ? [{ url: image }] : [],
        type: "website",
      },
    };
  } catch {
    return {
      title: "Product Not Found | CT B2C Storefront",
      description: "The requested product could not be found.",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await productsApi.getBySlug(slug);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Get breadcrumb data
  const productName =
    product.name["en-US"] ?? Object.values(product.name)[0] ?? "Product";
  const categoryName = product.categories?.[0]?.name
    ? product.categories[0].name["en-US"] ??
      Object.values(product.categories[0].name)[0]
    : null;

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <Link
                href="/products"
                className="hover:text-blue-600 transition-colors"
              >
                Products
              </Link>
            </li>
            {categoryName && (
              <>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <span className="text-gray-500">{categoryName}</span>
                </li>
              </>
            )}
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium truncate max-w-[200px]">
                {productName}
              </span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link (mobile) */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mb-6 lg:hidden"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Products
        </Link>

        {/* Product Details */}
        <ProductDetails product={product} locale="en-US" />
      </div>
    </main>
  );
}
