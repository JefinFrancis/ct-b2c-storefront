/**
 * Pagination — server-side pagination component for product listings.
 * Uses URL query params for navigation (works with Server Components).
 */
import Link from "next/link";

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  baseUrl: string;
}

export default function Pagination({ total, limit, offset, baseUrl }: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Generate page numbers to show
  const pageNumbers: (number | "...")[] = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1);
    if (currentPage > 3) pageNumbers.push("...");
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    
    if (currentPage < totalPages - 2) pageNumbers.push("...");
    pageNumbers.push(totalPages);
  }

  function buildUrl(page: number): string {
    const pageOffset = (page - 1) * limit;
    const url = new URL(baseUrl, "http://localhost");
    url.searchParams.set("offset", String(pageOffset));
    url.searchParams.set("limit", String(limit));
    // Return just pathname + search
    return url.pathname + url.search;
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
      {/* Previous button */}
      {hasPrev ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Previous
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed">
          Previous
        </span>
      )}

      {/* Page numbers */}
      <div className="hidden sm:flex gap-1">
        {pageNumbers.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-3 py-2 text-sm text-gray-500">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={buildUrl(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* Mobile page indicator */}
      <span className="sm:hidden text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next button */}
      {hasNext ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Next
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed">
          Next
        </span>
      )}
    </nav>
  );
}
