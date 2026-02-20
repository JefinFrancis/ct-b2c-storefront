import type { ReactNode } from "react";
import { productsApi } from "@/lib/api-client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  // Fetch top-level categories for the nav (cached by API layer)
  let categories: Array<{ id: string; name: Record<string, string>; slug: Record<string, string>; parent?: string }> = [];
  try {
    categories = await productsApi.getCategories();
  } catch {
    // Non-fatal — nav will render without category links
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
