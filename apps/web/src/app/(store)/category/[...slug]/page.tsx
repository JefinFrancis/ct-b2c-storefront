/**
 * Category Page — server component for `/category/[...slug]`.
 * Supports nested categories e.g. /category/furniture/chairs.
 * Displays category info, sub-categories, and filtered product grid.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { productsApi } from "@/lib/api-client";
import { ProductCard, Pagination } from "@/components";

interface Category {
  id: string;
  name: Record<string, string>;
  slug: Record<string, string>;
  parent?: string;
}

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ limit?: string; offset?: string }>;
}

/**
 * Find a category by matching its slug against the full slug path.
 * The last segment of the slug array is the leaf category slug.
 */
function findCategoryBySlug(categories: Category[], slugSegments: string[]): Category | null {
  const leafSlug = slugSegments[slugSegments.length - 1] ?? "";
  return categories.find(
    (c) =>
      c.slug["en-US"] === leafSlug ||
      c.slug["en-GB"] === leafSlug ||
      Object.values(c.slug).includes(leafSlug),
  ) ?? null;
}

/**
 * Build the breadcrumb trail from the root to the current category.
 */
function buildBreadcrumbs(
  categories: Category[],
  current: Category,
): Array<{ name: string; slug: string; id: string }> {
  const trail: Array<{ name: string; slug: string; id: string }> = [];
  let node: Category | undefined = current;

  while (node) {
    trail.unshift({
      id: node.id,
      name: node.name["en-US"] ?? Object.values(node.name)[0] ?? "Category",
      slug: node.slug["en-US"] ?? Object.values(node.slug)[0] ?? node.id,
    });
    node = node.parent ? categories.find((c) => c.id === node!.parent) : undefined;
  }

  return trail;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const categories = await productsApi.getCategories();
    const category = findCategoryBySlug(categories, slug);
    if (!category) return { title: "Category Not Found" };
    const name = category.name["en-US"] ?? Object.values(category.name)[0] ?? "Category";
    return {
      title: `${name} | CT B2C Storefront`,
      description: `Shop ${name} products at CT B2C Storefront`,
    };
  } catch {
    return { title: "Category | CT B2C Storefront" };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const limit = sp.limit ? parseInt(sp.limit, 10) : 20;
  const offset = sp.offset ? parseInt(sp.offset, 10) : 0;

  let categories: Category[] = [];
  let category: Category | null = null;
  let subCategories: Category[] = [];
  let products: Awaited<ReturnType<typeof productsApi.list>>["results"] = [];
  let total = 0;

  try {
    categories = await productsApi.getCategories();
    category = findCategoryBySlug(categories, slug);

    if (!category) {
      notFound();
    }

    subCategories = categories.filter((c) => c.parent === category!.id);

    const response = await productsApi.list({
      limit,
      offset,
      category: category.id,
    });
    products = response.results;
    total = response.total;
  } catch (err) {
    // If the category lookup itself fails, show 404
    if (!category) {
      notFound();
    }
    console.error("Failed to load category page:", err);
  }

  if (!category) {
    notFound();
  }

  const categoryName = category.name["en-US"] ?? Object.values(category.name)[0] ?? "Category";
  const breadcrumbs = buildBreadcrumbs(categories, category);
  const baseUrl = `/category/${slug.join("/")}`;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 dark:from-brand-900 dark:to-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-brand-200">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.id} className="flex items-center gap-1.5">
                  <span aria-hidden="true">/</span>
                  {i < breadcrumbs.length - 1 ? (
                    <Link
                      href={`/category/${breadcrumbs
                        .slice(0, i + 1)
                        .map((c) => c.slug)
                        .join("/")}`}
                      className="hover:text-white transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="text-white font-medium" aria-current="page">
                      {crumb.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold">{categoryName}</h1>
          <p className="mt-2 text-brand-200 text-sm">
            {total} {total === 1 ? "product" : "products"} in this category
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sub-categories */}
        {subCategories.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sub-categories</h2>
            <div className="flex flex-wrap gap-3">
              {subCategories.map((sub) => {
                const subName = sub.name["en-US"] ?? Object.values(sub.name)[0] ?? "Sub-category";
                const subSlug = sub.slug["en-US"] ?? Object.values(sub.slug)[0] ?? sub.id;
                return (
                  <Link
                    key={sub.id}
                    href={`/category/${[...slug, subSlug].join("/")}`}
                    className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                  >
                    {subName}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Products grid */}
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No products in this category yet</p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center text-brand-600 dark:text-brand-400 hover:underline"
            >
              Browse all products →
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {offset + 1}–{Math.min(offset + limit, total)} of {total} products
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <Pagination
              total={total}
              limit={limit}
              offset={offset}
              baseUrl={baseUrl}
            />
          </>
        )}
      </div>
    </div>
  );
}
