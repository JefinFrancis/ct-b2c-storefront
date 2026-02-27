/**
 * TestimonialsSection — social proof section with customer reviews.
 */
const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    role: "Verified Buyer",
    avatar: "SM",
    rating: 5,
    text: "Absolutely love the quality! The furniture arrived quickly and looks even better in person. Will definitely be ordering again.",
  },
  {
    id: 2,
    name: "James K.",
    role: "Verified Buyer",
    avatar: "JK",
    rating: 5,
    text: "Fast shipping, great communication, and the product exceeded my expectations. The checkout process was super smooth.",
  },
  {
    id: 3,
    name: "Priya R.",
    role: "Verified Buyer",
    avatar: "PR",
    rating: 4,
    text: "Really impressed with the selection and variety. Found exactly what I was looking for at a great price. Highly recommend!",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-amber-400" : "text-gray-200 dark:text-gray-700"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Our Customers Say</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Join thousands of happy shoppers who love our products
        </p>
        {/* Aggregate rating */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">4.9</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">from 2,400+ reviews</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <StarRating rating={t.rating} />
            <p className="mt-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-bold">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
