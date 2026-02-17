import Link from "next/link";

export default function OrdersPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>

        {/* Empty state */}
        <div className="text-center py-16 border rounded-lg">
          <p className="text-gray-600 mb-4">No orders yet</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            Start Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
