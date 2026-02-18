/**
 * api-client.ts — typed fetch wrapper for all NestJS API calls.
 * The ONLY file in apps/web that makes HTTP requests to the backend.
 *
 * Uses INTERNAL_API_URL for server-side calls (within Docker network)
 * and NEXT_PUBLIC_API_URL for client-side calls (browser).
 */
import type {
  Product,
  Cart,
  Order,
  Customer,
  ShippingMethod,
  SetShippingAddressInput,
} from "@ct-b2c/types";

// Server-side: use internal Docker hostname; browser: use public URL
const getApiBase = () => {
  if (typeof window === "undefined") {
    // Server-side
    return process.env.INTERNAL_API_URL ?? "http://localhost:8080";
  }
  // Client-side
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
};

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string; sessionId?: string },
): Promise<T> {
  const url = `${getApiBase()}/api/v1${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options?.sessionId ? { "X-Session-Id": options.sessionId } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const productsApi = {
  list: (p?: { limit?: number; offset?: number; category?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (p?.limit) params.set("limit", String(p.limit));
    if (p?.offset !== undefined) params.set("offset", String(p.offset));
    if (p?.category) params.set("category", p.category);
    if (p?.search) params.set("search", p.search);
    const query = params.toString();
    return apiFetch<{ results: Product[]; total: number }>(
      `/products${query ? `?${query}` : ""}`,
    );
  },
  getBySlug: (slug: string) => apiFetch<Product>(`/products/${slug}`),
};

export const cartApi = {
  get: (id: string) => apiFetch<Cart>(`/cart/${id}`),
  create: (sessionId?: string) =>
    apiFetch<Cart>(`/cart`, { method: "POST", sessionId }),
  getSessionCart: (sessionId: string) =>
    apiFetch<Cart>(`/cart/session/current`, { sessionId }),
  addItem: (
    id: string,
    body: { productId: string; variantId: number; quantity: number },
  ) =>
    apiFetch<Cart>(`/cart/${id}/items`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateItem: (id: string, lineItemId: string, body: { quantity: number }) =>
    apiFetch<Cart>(`/cart/${id}/items/${lineItemId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  removeItem: (id: string, lineItemId: string) =>
    apiFetch<Cart>(`/cart/${id}/items/${lineItemId}`, { method: "DELETE" }),
  // Checkout methods
  setShippingAddress: (id: string, address: SetShippingAddressInput) =>
    apiFetch<Cart>(`/cart/${id}/shipping-address`, {
      method: "POST",
      body: JSON.stringify(address),
    }),
  getShippingMethods: (id: string) =>
    apiFetch<ShippingMethod[]>(`/cart/${id}/shipping-methods`),
  setShippingMethod: (id: string, shippingMethodId: string) =>
    apiFetch<Cart>(`/cart/${id}/shipping-method`, {
      method: "POST",
      body: JSON.stringify({ shippingMethodId }),
    }),
};

export const authApi = {
  login: (body: { email: string; password: string }) =>
    apiFetch<{ token: string; customer: Customer }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) =>
    apiFetch<{ token: string; customer: Customer }>(`/auth/register`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getMe: (token: string) =>
    apiFetch<Customer>(`/auth/me`, { token }),
};

export const ordersApi = {
  list: (token: string) => apiFetch<Order[]>(`/orders`, { token }),
  get: (id: string) => apiFetch<Order>(`/orders/${id}`),
  create: (cartId: string) =>
    apiFetch<Order>(`/orders`, {
      method: "POST",
      body: JSON.stringify({ cartId }),
    }),
};

export const customersApi = {
  getMe: (token: string) => apiFetch<Customer>(`/customers/me`, { token }),
  updateMe: (
    token: string,
    body: { firstName?: string; lastName?: string },
  ) =>
    apiFetch<Customer>(`/customers/me`, {
      token,
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};
