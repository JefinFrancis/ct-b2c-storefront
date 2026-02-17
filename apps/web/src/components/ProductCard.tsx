/**
 * ProductCard — displays a product tile with image, name, and price.
 * Used on the Product Listing Page (PLP).
 */
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@ct-b2c/types";

interface ProductCardProps {
  product: Product;
  locale?: string;
}

/**
 * Format price from commercetools centAmount to display string.
 */
function formatPrice(centAmount: number, currencyCode: string): string {
  const amount = centAmount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
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
      className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {isPlaceholder ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
        <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          {price ? formatPrice(price.centAmount, price.currencyCode) : "Price unavailable"}
        </p>
      </div>
    </Link>
  );
}
