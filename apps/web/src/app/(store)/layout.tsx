import type { ReactNode } from "react";
import Link from "next/link";
import { CartProvider } from "@/contexts/CartContext";
import MiniCart from "@/components/MiniCart";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
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
              <MiniCart />
              <Link
                href="/account/login"
                className="text-gray-600 hover:text-gray-900"
              >
                Account
              </Link>
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
  );
}
