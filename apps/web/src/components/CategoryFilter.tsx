/**
 * CategoryFilter — client-side category filter dropdown for PLP.
 * Updates URL parameter for server-side category filtering.
 */
"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Category {
  id: string;
  name: Record<string, string>;
  slug: Record<string, string>;
  parent?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  locale?: string;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  locale = "en-US",
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Build category tree (top-level only for simplicity)
  const rootCategories = categories.filter((cat) => !cat.parent);

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (categoryId) {
        params.set("category", categoryId);
      } else {
        params.delete("category");
      }

      // Reset to first page when changing category
      params.delete("offset");

      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router]
  );

  const getCategoryName = (cat: Category): string => {
    return cat.name[locale] || cat.name["en-US"] || cat.name["en-GB"] || Object.values(cat.name)[0] || "Unknown";
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="category-filter" className="text-sm font-medium text-gray-700">
        Category:
      </label>
      <select
        id="category-filter"
        value={selectedCategory || ""}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        data-testid="category-filter"
      >
        <option value="">All Categories</option>
        {rootCategories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {getCategoryName(cat)}
          </option>
        ))}
      </select>
    </div>
  );
}
