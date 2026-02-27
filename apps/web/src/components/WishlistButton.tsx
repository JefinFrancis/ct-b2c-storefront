/**
 * WishlistButton — heart icon to add/remove products from wishlist.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { wishlistApi } from "@/lib/api-client";

interface WishlistButtonProps {
  productId: string;
  variantId?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function WishlistButton({
  productId,
  variantId,
  className = "",
  size = "md",
}: WishlistButtonProps) {
  const { token, isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [lineItemId, setLineItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  // Check if product is in wishlist
  const checkWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const wishlist = await wishlistApi.get(token);
      const item = wishlist.lineItems.find(
        (li) => li.productId === productId
      );
      if (item) {
        setIsInWishlist(true);
        setLineItemId(item.id);
      } else {
        setIsInWishlist(false);
        setLineItemId(null);
      }
    } catch {
      // Silently fail — wishlist might not exist yet
    }
  }, [token, productId]);

  useEffect(() => {
    if (isAuthenticated) {
      checkWishlist();
    }
  }, [isAuthenticated, checkWishlist]);

  const handleToggle = async () => {
    if (!token || !isAuthenticated) return;
    setIsLoading(true);

    try {
      if (isInWishlist && lineItemId) {
        await wishlistApi.removeItem(token, lineItemId);
        setIsInWishlist(false);
        setLineItemId(null);
      } else {
        const wishlist = await wishlistApi.addItem(token, { productId, variantId });
        const newItem = wishlist.lineItems.find(
          (li) => li.productId === productId
        );
        setIsInWishlist(true);
        setLineItemId(newItem?.id ?? null);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-1.5 rounded-full transition-colors ${
        isInWishlist
          ? "text-red-500 hover:text-red-600"
          : "text-gray-400 hover:text-red-400"
      } disabled:opacity-50 ${className}`}
      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        className={sizeClasses[size]}
        fill={isInWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
