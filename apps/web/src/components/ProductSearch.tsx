/**
 * ProductSearch — client-side search box component for PLP.
 * Submits search query as URL parameter for server-side filtering.
 */
"use client";

import type { FormEvent } from "react";
import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ProductSearchProps {
  initialQuery?: string;
}

export default function ProductSearch({ initialQuery = "" }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      
      if (query.trim()) {
        params.set("search", query.trim());
      } else {
        params.delete("search");
      }
      
      // Reset to first page when searching
      params.delete("offset");
      
      router.push(`/products?${params.toString()}`);
    },
    [query, searchParams, router]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("offset");
    router.push(`/products?${params.toString()}`);
  }, [searchParams, router]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          data-testid="search-input"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            data-testid="clear-search"
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        data-testid="search-button"
      >
        Search
      </button>
    </form>
  );
}
