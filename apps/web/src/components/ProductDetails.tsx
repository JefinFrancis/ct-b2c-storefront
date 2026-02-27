/**
 * ProductDetails — client component that manages variant selection and add to cart.
 * Wraps VariantSelector and AddToCartButton with shared state.
 */
"use client";

import { useState, useMemo } from "react";
import type { Product, ProductVariant } from "@ct-b2c/types";
import ImageGallery from "./ImageGallery";
import VariantSelector from "./VariantSelector";
import AddToCartButton from "./AddToCartButton";

interface ProductDetailsProps {
  product: Product;
  locale?: string;
}

/**
 * Format price from centAmount to display string.
 */
function formatPrice(centAmount: number, currencyCode: string): string {
  const amount = centAmount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

/**
 * Get the best available price from a variant.
 */
function getVariantPrice(
  variant: ProductVariant
): { centAmount: number; currencyCode: string; discounted?: number } | null {
  const prices = variant.prices;
  if (!prices || prices.length === 0) return null;

  const usdPrice = prices.find((p) => p.value.currencyCode === "USD");
  const price = usdPrice ?? prices[0];
  if (!price) return null;

  return {
    centAmount: price.value.centAmount,
    currencyCode: price.value.currencyCode,
    discounted: price.discounted?.value.centAmount,
  };
}

export default function ProductDetails({
  product,
  locale = "en-US",
}: ProductDetailsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.masterVariant.id
  );

  // All variants including master
  const allVariants = useMemo(
    () => [product.masterVariant, ...product.variants],
    [product.masterVariant, product.variants]
  );

  // Get selected variant
  const selectedVariant = useMemo(
    () =>
      allVariants.find((v) => v.id === selectedVariantId) ??
      product.masterVariant,
    [allVariants, selectedVariantId, product.masterVariant]
  );

  // Get images for selected variant (fallback to master variant images)
  const images = useMemo(() => {
    const variantImages = selectedVariant.images;
    if (variantImages && variantImages.length > 0) {
      return variantImages;
    }
    // Fallback to master variant images
    return product.masterVariant.images ?? [];
  }, [selectedVariant, product.masterVariant]);

  // Get price for selected variant
  const price = getVariantPrice(selectedVariant);

  // Check availability
  const isAvailable =
    selectedVariant.availability?.isOnStock !== false;

  // Get product name
  const name =
    product.name[locale] ??
    product.name["en-US"] ??
    Object.values(product.name)[0] ??
    "Unnamed Product";

  // Get product description
  const description = product.description
    ? product.description[locale] ??
      product.description["en-US"] ??
      Object.values(product.description)[0]
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Gallery */}
      <div>
        <ImageGallery images={images} productName={name} />
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Name */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {name}
        </h1>

        {/* SKU */}
        {selectedVariant.sku && (
          <p className="text-sm text-gray-500">SKU: {selectedVariant.sku}</p>
        )}

        {/* Price */}
        <div className="space-y-1">
          {price ? (
            price.discounted ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-red-600">
                  {formatPrice(price.discounted, price.currencyCode)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(price.centAmount, price.currencyCode)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(price.centAmount, price.currencyCode)}
              </span>
            )
          ) : (
            <span className="text-lg text-gray-500">Price unavailable</span>
          )}
        </div>

        {/* Description */}
        {description && (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </div>
        )}

        {/* Variant Selector */}
        <div className="pt-4 border-t border-gray-200">
          <VariantSelector
            masterVariant={product.masterVariant}
            variants={product.variants}
            selectedVariantId={selectedVariantId}
            onVariantChange={setSelectedVariantId}
            locale={locale}
          />
        </div>

        {/* Add to Cart */}
        <div className="pt-4">
          <AddToCartButton
            productId={product.id}
            variantId={selectedVariantId}
            disabled={!isAvailable}
          />
        </div>

        {/* Additional Info */}
        <div className="pt-6 border-t border-gray-200 space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Free shipping on orders over $50
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            30-day return policy
          </div>
        </div>
      </div>
    </div>
  );
}
