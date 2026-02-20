/**
 * FeaturedCategories — grid of top-level category cards for the homepage.
 */
import Link from "next/link";

interface Category {
  id: string;
  name: Record<string, string>;
  slug: Record<string, string>;
  parent?: string;
}

/** Simple pastel background colors for category cards (cycles through) */
const cardColors = [
  "bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50",
  "bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50",
  "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
  "bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50",
  "bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/50",
  "bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50",
];

const iconColors = [
  "text-amber-600 dark:text-amber-400",
  "text-sky-600 dark:text-sky-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-rose-600 dark:text-rose-400",
  "text-violet-600 dark:text-violet-400",
  "text-orange-600 dark:text-orange-400",
];

interface FeaturedCategoriesProps {
  categories: Category[];
}

export default function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const topLevel = categories.filter((c) => !c.parent).slice(0, 6);

  if (topLevel.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Shop by Category</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Browse our wide selection of products</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {topLevel.map((cat, i) => {
          const name = cat.name["en-US"] ?? Object.values(cat.name)[0] ?? "Category";
          const slug = cat.slug["en-US"] ?? Object.values(cat.slug)[0] ?? cat.id;
          const color = cardColors[i % cardColors.length];
          const iconColor = iconColors[i % iconColors.length];

          return (
            <Link
              key={cat.id}
              href={`/category/${slug}`}
              className={`group flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md ${color}`}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-3 bg-white dark:bg-gray-900 shadow-sm group-hover:scale-110 transition-transform ${iconColor}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 text-center leading-snug">
                {name}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          View all categories
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
