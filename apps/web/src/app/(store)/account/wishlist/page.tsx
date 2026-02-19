/**
 * Wishlist page — displays items saved to the customer's wishlist (CT Shopping List).
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { wishlistApi } from "@/lib/api-client";
import type { Wishlist, WishlistLineItem } from "@ct-b2c/types";

function formatPrice(centAmount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(centAmount / 100);
}

export default function WishlistPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await wishlistApi.get(token);
      setWishlist(data);
    } catch {
      // Wishlist might not exist yet
      setWishlist(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/account/login?redirect=/account/wishlist");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (token) fetchWishlist();
  }, [token, fetchWishlist]);

  const handleRemove = async (lineItemId: string) => {
    if (!token) return;
    setRemovingId(lineItemId);
    try {
      await wishlistApi.removeItem(token, lineItemId);
      await fetchWishlist();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove from wishlist"
      );
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (item: WishlistLineItem) => {
    setAddingToCartId(item.id);
    try {
      await addItem(item.productId, item.variantId ?? 1, 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setAddingToCartId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Wishlist</h1>
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  const items = wishlist?.lineItems ?? [];

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">
          My Wishlist {items.length > 0 && `(${items.length})`}
        </h1>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <svg
              className="mx-auto w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className="text-gray-600 text-lg mb-4">
              Your wishlist is empty
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const name =
                item.name["en-US"] ?? Object.values(item.name)[0] ?? "Product";
              const image = item.variant?.images?.[0]?.url;
              const slug = item.productSlug?.["en-US"] ?? item.productId;
              const price = item.variant?.prices?.[0];
              const isRemoving = removingId === item.id;
              const isAddingToCart = addingToCartId === item.id;

              return (
                <div
                  key={item.id}
                  className={`border rounded-lg overflow-hidden transition-opacity ${
                    isRemoving ? "opacity-50" : ""
                  }`}
                >
                  {/* Image */}
                  <Link
                    href={`/products/${slug}`}
                    className="block aspect-square bg-gray-100 relative"
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-12 h-12"
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
                    )}
                  </Link>

                  {/* Details */}
                  <div className="p-4">
                    <Link
                      href={`/products/${slug}`}
                      className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                    >
                      {name}
                    </Link>

                    {price && (
                      <p className="text-sm text-gray-700 mt-1">
                        {formatPrice(
                          price.value.centAmount,
                          price.value.currencyCode
                        )}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      Added{" "}
                      {new Date(item.addedAt).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={isAddingToCart || isRemoving}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {isAddingToCart ? "Adding..." : "Add to Cart"}
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isRemoving}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove from wishlist"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
