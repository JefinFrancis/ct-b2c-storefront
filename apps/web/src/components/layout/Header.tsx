/**
 * Header — responsive storefront header with navigation, search, cart, and user menu.
 * Used across all store pages and the homepage.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import MiniCart from "@/components/MiniCart";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";

interface Category {
  id: string;
  name: Record<string, string>;
  slug: Record<string, string>;
  parent?: string;
}

interface HeaderProps {
  categories?: Category[];
}

export default function Header({ categories = [] }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const topLevelCategories = categories
    .filter((c) => !c.parent)
    .slice(0, 6);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Top bar */}
      <div className="bg-brand-700 text-white text-xs text-center py-1.5 px-4">
        Free shipping on orders over $75 · Use code <strong>WELCOME10</strong> for 10% off your first order
      </div>

      {/* Main header row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
            <span className="text-brand-600 dark:text-brand-400">◈</span>
            <span>CT Storefront</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/products"
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              All Products
            </Link>
            {topLevelCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug["en-US"] ?? Object.values(cat.slug)[0]}`}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {cat.name["en-US"] ?? Object.values(cat.name)[0]}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/account/wishlist"
              className="p-2 rounded-lg text-gray-600 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Wishlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>
            <MiniCart />
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-2 px-4 animate-fade-in">
          <nav className="flex flex-col gap-1">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              All Products
            </Link>
            {topLevelCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug["en-US"] ?? Object.values(cat.slug)[0]}`}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {cat.name["en-US"] ?? Object.values(cat.name)[0]}
              </Link>
            ))}
            <Link
              href="/account/wishlist"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Wishlist
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cart
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
