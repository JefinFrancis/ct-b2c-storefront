import type { ReactNode } from "react";
import Link from "next/link";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import MiniCart from "@/components/MiniCart";
import UserMenu from "@/components/UserMenu";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">
                CT Storefront
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/products"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Products
                </Link>
                <Link
                  href="/account/wishlist"
                  className="text-gray-600 hover:text-gray-900"
                  title="Wishlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </Link>
                <MiniCart />
                <UserMenu />
              </nav>
            </div>
          </header>

          {/* Main content */}
          <div className="flex-1">{children}</div>

          {/* Footer */}
          <footer className="border-t py-8 text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} CT B2C Storefront. Powered by commercetools.</p>
          </footer>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
