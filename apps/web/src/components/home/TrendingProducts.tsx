/**
 * TrendingProducts — horizontal product grid showcasing featured/trending items.
 */
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@ct-b2c/types";
import { formatPrice } from "@/lib/format-price";

interface TrendingProductsProps {
  products: Product[];
}

function getPrice(product: Product): { centAmount: number; currencyCode: string } | null {
  const prices = product.masterVariant.prices;
  if (!prices || prices.length === 0) return null;
  const usdPrice = prices.find((p) => p.value.currencyCode === "USD");
  const price = usdPrice ?? prices[0];
  if (!price) return null;
  return { centAmount: price.value.centAmount, currencyCode: price.value.currencyCode };
}

export default function TrendingProducts({ products }: TrendingProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Our most popular products right now</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => {
            const name = product.name["en-US"] ?? Object.values(product.name)[0] ?? "Product";
            const slug = product.slug["en-US"] ?? Object.values(product.slug)[0] ?? product.id;
            const price = getPrice(product);
            const imageUrl = product.masterVariant.images?.[0]?.url;

            return (
              <Link
                key={product.id}
                href={`/products/${slug}`}
                className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {price ? formatPrice(price.centAmount, price.currencyCode) : "—"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400"
          >
            View all products →
          </Link>
        </div>
      </div>
    </section>
  );
}
