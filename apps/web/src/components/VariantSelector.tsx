/**
 * VariantSelector — displays product variant options (color, size, etc.)
 * Allows selecting a variant and shows availability status.
 * Handles color-code attributes with actual color swatches.
 */
"use client";

import { useMemo } from "react";
import type { ProductVariant } from "@ct-b2c/types";

interface VariantSelectorProps {
  masterVariant: ProductVariant;
  variants: ProductVariant[];
  selectedVariantId: number;
  onVariantChange: (variantId: number) => void;
  locale?: string;
}

// Attributes that should be hidden (shown via color swatch instead)
const HIDDEN_ATTRIBUTES = ["color-code", "search-color", "productspec"];

// Attribute names that indicate color
const COLOR_ATTRIBUTES = ["color-label", "color", "colorFinish"];

/**
 * Check if a value looks like a hex color code.
 */
function isHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
}

/**
 * Get color code from variant attributes.
 */
function getColorCode(variant: ProductVariant): string | null {
  const colorCodeAttr = variant.attributes?.find((a) => a.name === "color-code");
  if (colorCodeAttr && typeof colorCodeAttr.value === "string" && isHexColor(colorCodeAttr.value)) {
    return colorCodeAttr.value;
  }
  return null;
}

/**
 * Extract attribute value as a displayable string.
 */
function getAttributeDisplayValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value && typeof value === "object") {
    // Handle localized string or label
    if ("label" in value && typeof (value as { label: unknown }).label === "object") {
      const labelObj = (value as { label: Record<string, string> }).label;
      return labelObj["en-US"] || labelObj["en-GB"] || Object.values(labelObj)[0] || "";
    }
    if ("label" in value && typeof (value as { label: string }).label === "string") {
      return (value as { label: string }).label;
    }
    if ("en-US" in value) {
      return (value as { "en-US": string })["en-US"];
    }
    if ("en" in value) {
      return (value as { en: string })["en"];
    }
  }
  return String(value);
}

/**
 * Get unique attribute values across all variants.
 */
function getAttributeOptions(
  allVariants: ProductVariant[],
  attributeName: string
): Array<{ value: string; variantIds: number[] }> {
  const valueMap = new Map<string, number[]>();

  for (const variant of allVariants) {
    const attr = variant.attributes?.find((a) => a.name === attributeName);
    if (attr) {
      const displayValue = getAttributeDisplayValue(attr.value);
      const existing = valueMap.get(displayValue) ?? [];
      existing.push(variant.id);
      valueMap.set(displayValue, existing);
    }
  }

  return Array.from(valueMap.entries()).map(([value, variantIds]) => ({
    value,
    variantIds,
  }));
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

export default function VariantSelector({
  masterVariant,
  variants,
  selectedVariantId,
  onVariantChange,
}: VariantSelectorProps) {
  // Combine master variant with other variants
  const allVariants = useMemo(
    () => [masterVariant, ...variants],
    [masterVariant, variants]
  );

  // Get selected variant
  const selectedVariant = useMemo(
    () => allVariants.find((v) => v.id === selectedVariantId) ?? masterVariant,
    [allVariants, selectedVariantId, masterVariant]
  );

  // Get unique attribute names across all variants (excluding hidden ones)
  const attributeNames = useMemo(() => {
    const names = new Set<string>();
    for (const variant of allVariants) {
      variant.attributes?.forEach((attr) => {
        if (!HIDDEN_ATTRIBUTES.includes(attr.name)) {
          names.add(attr.name);
        }
      });
    }
    return Array.from(names);
  }, [allVariants]);

  // Check if variant is available
  const isVariantAvailable = (variant: ProductVariant): boolean => {
    if (!variant.availability) return true; // Assume available if not specified
    return variant.availability.isOnStock ?? true;
  };

  // Get the variant price
  const getVariantPrice = (variant: ProductVariant): string | null => {
    const prices = variant.prices;
    if (!prices || prices.length === 0) return null;

    const usdPrice = prices.find((p) => p.value.currencyCode === "USD");
    const price = usdPrice ?? prices[0];
    if (!price) return null;

    return formatPrice(price.value.centAmount, price.value.currencyCode);
  };

  // If only one variant (master), don't show selector
  if (allVariants.length === 1 && attributeNames.length === 0) {
    return null;
  }

  // If we have variants but no named attributes, show SKU selector
  if (attributeNames.length === 0 && allVariants.length > 1) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variant
          </label>
          <div className="flex flex-wrap gap-2">
            {allVariants.map((variant) => {
              const isSelected = variant.id === selectedVariantId;
              const isAvailable = isVariantAvailable(variant);
              const price = getVariantPrice(variant);

              return (
                <button
                  key={variant.id}
                  onClick={() => onVariantChange(variant.id)}
                  disabled={!isAvailable}
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : isAvailable
                        ? "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                        : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                  }`}
                  title={!isAvailable ? "Out of stock" : undefined}
                >
                  {variant.sku ?? `Variant ${variant.id}`}
                  {price && !isSelected && (
                    <span className="ml-2 text-gray-500">{price}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Group by attribute for display
  return (
    <div className="space-y-6">
      {attributeNames.map((attrName) => {
        const options = getAttributeOptions(allVariants, attrName);
        const selectedAttrValue = selectedVariant.attributes?.find(
          (a) => a.name === attrName
        );
        const selectedDisplayValue = selectedAttrValue
          ? getAttributeDisplayValue(selectedAttrValue.value)
          : null;

        // Format attribute name for display (capitalize, replace underscores)
        const displayName = attrName
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        return (
          <div key={attrName}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {displayName}
              {selectedDisplayValue && (
                <span className="ml-2 font-normal text-gray-500">
                  : {selectedDisplayValue}
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const isSelected = selectedDisplayValue === option.value;
                
                // Check if any variant with this attribute value is available
                const availableVariants = option.variantIds
                  .map((id) => allVariants.find((v) => v.id === id))
                  .filter(Boolean) as ProductVariant[];
                const isAvailable = availableVariants.some(isVariantAvailable);

                // Find the first available variant with this attribute
                const targetVariant = availableVariants.find(isVariantAvailable) 
                  ?? availableVariants[0];

                // Check if this is a color attribute and get color code
                const isColorAttr = COLOR_ATTRIBUTES.includes(attrName);
                const colorCode = targetVariant ? getColorCode(targetVariant) : null;

                // Render color swatch for color attributes
                if (isColorAttr && colorCode) {
                  return (
                    <button
                      key={option.value}
                      onClick={() => targetVariant && onVariantChange(targetVariant.id)}
                      disabled={!isAvailable}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-300"
                          : isAvailable
                            ? "border-gray-300 hover:border-gray-400"
                            : "border-gray-200 opacity-50 cursor-not-allowed"
                      }`}
                      style={{ backgroundColor: colorCode }}
                      title={isAvailable ? option.value : `${option.value} (Out of stock)`}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className={`w-5 h-5 ${
                              colorCode.toLowerCase() === "#ffffff" || colorCode.toLowerCase() === "#fff"
                                ? "text-gray-800"
                                : "text-white"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                      {!isAvailable && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-0.5 bg-red-500 rotate-45 absolute" />
                        </span>
                      )}
                    </button>
                  );
                }

                // Regular text button for non-color attributes
                return (
                  <button
                    key={option.value}
                    onClick={() => targetVariant && onVariantChange(targetVariant.id)}
                    disabled={!isAvailable}
                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : isAvailable
                          ? "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                          : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                    }`}
                    title={!isAvailable ? "Out of stock" : undefined}
                  >
                    {option.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Availability indicator */}
      <div className="flex items-center gap-2 text-sm">
        {isVariantAvailable(selectedVariant) ? (
          <>
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-green-700">In Stock</span>
            {selectedVariant.availability?.availableQuantity !== undefined && (
              <span className="text-gray-500">
                ({selectedVariant.availability.availableQuantity} available)
              </span>
            )}
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-700">Out of Stock</span>
          </>
        )}
      </div>
    </div>
  );
}
