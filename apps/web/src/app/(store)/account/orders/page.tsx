/**
 * Orders page — displays customer order history.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order } from "@ct-b2c/types";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi } from "@/lib/api-client";
import { OrderCard } from "@/components/orders";

export default function OrdersPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setIsLoading(false);
      return;
    }

    ordersApi
      .list(token)
      .then((data) => {
        setOrders(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message ?? "Failed to load orders");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, authLoading]);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Order History</h1>
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
              data-testid="loading-spinner"
            />
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Order History</h1>
          <div
            className="bg-red-50 text-red-700 p-4 rounded-lg"
            data-testid="error-message"
          >
            {error}
          </div>
        </div>
      </main>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Order History</h1>
          <div
            className="text-center py-16 border rounded-lg"
            data-testid="empty-state"
          >
            <p className="text-gray-600 mb-4">No orders yet</p>
            <Link href="/products" className="text-blue-600 hover:underline">
              Start Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Orders list
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        <div className="space-y-4" data-testid="orders-list">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </main>
  );
}
