/**
 * Homepage — Server Component that assembles the storefront landing page.
 * Fetches categories and trending products server-side for instant load.
 */
import { productsApi } from "@/lib/api-client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import TrendingProducts from "@/components/home/TrendingProducts";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import NewsletterSection from "@/components/home/NewsletterSection";

export default async function HomePage() {
  let categories: Array<{ id: string; name: Record<string, string>; slug: Record<string, string>; parent?: string }> = [];
  let trendingProducts: Awaited<ReturnType<typeof productsApi.list>>["results"] = [];

  try {
    const [catRes, prodRes] = await Promise.all([
      productsApi.getCategories(),
      productsApi.list({ limit: 10, offset: 0 }),
    ]);
    categories = catRes;
    trendingProducts = prodRes.results;
  } catch {
    // Non-fatal — page renders with empty sections
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header categories={categories} />
      <main className="flex-1">
        <HeroSection />
        <FeaturedCategories categories={categories} />
        <TrendingProducts products={trendingProducts} />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
