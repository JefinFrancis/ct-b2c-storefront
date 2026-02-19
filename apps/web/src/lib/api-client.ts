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
  Wishlist,
  Payment,
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

/** Category type for navigation */
interface Category {
  id: string;
  name: Record<string, string>;
  slug: Record<string, string>;
  parent?: string;
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
  getCategories: () => apiFetch<Category[]>(`/products/categories`),
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
  setBillingAddress: (id: string, address: SetShippingAddressInput) =>
    apiFetch<Cart>(`/cart/${id}/billing-address`, {
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
  // Discount codes
  addDiscountCode: (id: string, code: string) =>
    apiFetch<Cart>(`/cart/${id}/discount-codes`, {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  removeDiscountCode: (id: string, discountCodeId: string) =>
    apiFetch<Cart>(`/cart/${id}/discount-codes/${discountCodeId}`, {
      method: "DELETE",
    }),
  // Recalculate
  recalculate: (id: string) =>
    apiFetch<Cart>(`/cart/${id}/recalculate`, { method: "POST" }),
};

export const authApi = {
  login: (body: { email: string; password: string; anonymousCartId?: string }) =>
    apiFetch<{ token: string; customer: Customer; cart: Cart | null }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    anonymousCartId?: string;
  }) =>
    apiFetch<{ token: string; customer: Customer; cart: Cart | null }>(`/auth/register`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getMe: (token: string) =>
    apiFetch<Customer>(`/auth/me`, { token }),
  forgotPassword: (email: string) =>
    apiFetch<{ message: string; tokenValue?: string }>(`/auth/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (tokenValue: string, newPassword: string) =>
    apiFetch<{ message: string }>(`/auth/reset-password`, {
      method: "POST",
      body: JSON.stringify({ tokenValue, newPassword }),
    }),
};

export const ordersApi = {
  list: (token: string) => apiFetch<Order[]>(`/orders`, { token }),
  get: (id: string) => apiFetch<Order>(`/orders/${id}`),
  create: (cartId: string, token: string) =>
    apiFetch<Order>(`/orders`, {
      method: "POST",
      body: JSON.stringify({ cartId }),
      token,
    }),
};

export const customersApi = {
  getMe: (token: string) => apiFetch<Customer>(`/customers/me`, { token }),
  updateMe: (
    token: string,
    body: { firstName?: string; lastName?: string; dateOfBirth?: string; companyName?: string },
  ) =>
    apiFetch<Customer>(`/customers/me`, {
      token,
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  // Address management
  addAddress: (
    token: string,
    address: {
      firstName?: string;
      lastName?: string;
      streetName?: string;
      streetNumber?: string;
      additionalStreetInfo?: string;
      city?: string;
      region?: string;
      postalCode?: string;
      country: string;
      phone?: string;
      email?: string;
    },
  ) =>
    apiFetch<Customer>(`/customers/me/addresses`, {
      token,
      method: "POST",
      body: JSON.stringify(address),
    }),
  updateAddress: (
    token: string,
    addressId: string,
    address: {
      firstName?: string;
      lastName?: string;
      streetName?: string;
      streetNumber?: string;
      additionalStreetInfo?: string;
      city?: string;
      region?: string;
      postalCode?: string;
      country: string;
      phone?: string;
      email?: string;
    },
  ) =>
    apiFetch<Customer>(`/customers/me/addresses/${addressId}`, {
      token,
      method: "PATCH",
      body: JSON.stringify(address),
    }),
  removeAddress: (token: string, addressId: string) =>
    apiFetch<Customer>(`/customers/me/addresses/${addressId}`, {
      token,
      method: "DELETE",
    }),
  setDefaultShippingAddress: (token: string, addressId: string) =>
    apiFetch<Customer>(`/customers/me/addresses/${addressId}/default-shipping`, {
      token,
      method: "POST",
    }),
  setDefaultBillingAddress: (token: string, addressId: string) =>
    apiFetch<Customer>(`/customers/me/addresses/${addressId}/default-billing`, {
      token,
      method: "POST",
    }),
  changePassword: (
    token: string,
    body: { currentPassword: string; newPassword: string },
  ) =>
    apiFetch<Customer>(`/customers/me/password`, {
      token,
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const paymentsApi = {
  processCheckout: (
    token: string,
    body: {
      cartId: string;
      amountCentAmount: number;
      currencyCode: string;
      paymentMethod?: string;
    },
  ) =>
    apiFetch<{ payment: Payment; cart: Cart }>(`/payments/checkout`, {
      token,
      method: "POST",
      body: JSON.stringify(body),
    }),
  get: (id: string) => apiFetch<Payment>(`/payments/${id}`),
};

export const wishlistApi = {
  get: (token: string) => apiFetch<Wishlist>(`/wishlist`, { token }),
  addItem: (token: string, body: { productId: string; variantId?: number }) =>
    apiFetch<Wishlist>(`/wishlist/items`, {
      token,
      method: "POST",
      body: JSON.stringify(body),
    }),
  removeItem: (token: string, lineItemId: string) =>
    apiFetch<Wishlist>(`/wishlist/items/${lineItemId}`, {
      token,
      method: "DELETE",
    }),
};
