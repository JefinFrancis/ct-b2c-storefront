/**
 * ProductCard — displays a product tile with image, name, and price.
 * Used on the Product Listing Page (PLP) and category pages.
 */
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@ct-b2c/types";
import { formatPrice } from "@/lib/format-price";

interface ProductCardProps {
  product: Product;
  locale?: string;
}

/**
 * Get the best available price from a product variant.
 */
function getPrice(product: Product): { centAmount: number; currencyCode: string } | null {
  const prices = product.masterVariant.prices;
  if (!prices || prices.length === 0) return null;

  // Prefer USD price, otherwise take first available
  const usdPrice = prices.find((p) => p.value.currencyCode === "USD");
  const price = usdPrice ?? prices[0];

  if (!price) return null;

  return {
    centAmount: price.value.centAmount,
    currencyCode: price.value.currencyCode,
  };
}

/**
 * Get the first image URL from a product or return placeholder.
 */
function getImageUrl(product: Product): string {
  const images = product.masterVariant.images;
  const firstImage = images?.[0];
  if (firstImage) {
    return firstImage.url;
  }
  return "/placeholder-product.svg";
}

export default function ProductCard({ product, locale = "en-US" }: ProductCardProps) {
  const name = product.name[locale] ?? product.name["en-US"] ?? Object.values(product.name)[0] ?? "Unnamed Product";
  const slug = product.slug[locale] ?? product.slug["en-US"] ?? Object.values(product.slug)[0] ?? product.id;
  const price = getPrice(product);
  const imageUrl = getImageUrl(product);
  const isPlaceholder = imageUrl === "/placeholder-product.svg";

  return (
    <Link
      href={`/products/${slug}`}
      className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-lg transition-all duration-200"
    >
      <div className="aspect-square bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
        {isPlaceholder ? (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors text-sm">
          {name}
        </h3>
        <p className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
          {price ? formatPrice(price.centAmount, price.currencyCode) : "Price unavailable"}
        </p>
      </div>
    </Link>
  );
}
