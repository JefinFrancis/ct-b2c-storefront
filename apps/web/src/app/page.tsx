import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">CT B2C Storefront</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        commercetools-powered headless commerce storefront built with Next.js
        and NestJS.
      </p>
      <div className="flex gap-4">
        <Link
          href="/products"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Browse Products
        </Link>
        <Link
          href="/account/login"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}
