/**
 * Address Book page — manage customer addresses.
 * Supports CRUD operations and setting default shipping/billing addresses.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { customersApi } from "@/lib/api-client";
import type { Customer, Address } from "@ct-b2c/types";

export default function AddressBookPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    streetName: "",
    streetNumber: "",
    city: "",
    region: "",
    postalCode: "",
    country: "US",
    phone: "",
    email: "",
  });

  const fetchCustomer = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await customersApi.getMe(token);
      setCustomer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/account/login?redirect=/account/addresses");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (token) fetchCustomer();
  }, [token, fetchCustomer]);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      streetName: "",
      streetNumber: "",
      city: "",
      region: "",
      postalCode: "",
      country: "US",
      phone: "",
      email: "",
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      firstName: address.firstName ?? "",
      lastName: address.lastName ?? "",
      streetName: address.streetName ?? "",
      streetNumber: address.streetNumber ?? "",
      city: address.city ?? "",
      region: address.region ?? "",
      postalCode: address.postalCode ?? "",
      country: address.country,
      phone: address.phone ?? "",
      email: address.email ?? "",
    });
    setEditingId(address.id ?? null);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);

    try {
      if (editingId) {
        await customersApi.updateAddress(token, editingId, formData);
      } else {
        await customersApi.addAddress(token, formData);
      }
      resetForm();
      await fetchCustomer();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to remove this address?")) return;
    setError(null);

    try {
      await customersApi.removeAddress(token, addressId);
      await fetchCustomer();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete address");
    }
  };

  const handleSetDefault = async (
    addressId: string,
    type: "shipping" | "billing"
  ) => {
    if (!token) return;
    setSettingDefault(`${type}-${addressId}`);
    setError(null);

    try {
      if (type === "shipping") {
        await customersApi.setDefaultShippingAddress(token, addressId);
      } else {
        await customersApi.setDefaultBillingAddress(token, addressId);
      }
      await fetchCustomer();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to set default ${type} address`
      );
    } finally {
      setSettingDefault(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Address Book</h1>
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  const addresses = customer?.addresses ?? [];

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Address Book</h1>
          {!showAddForm && (
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Address
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 p-6 border rounded-lg bg-gray-50 space-y-4"
          >
            <h2 className="text-lg font-semibold">
              {editingId ? "Edit Address" : "Add New Address"}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Street
                </label>
                <input
                  type="text"
                  value={formData.streetName}
                  onChange={(e) =>
                    setFormData({ ...formData, streetName: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Number
                </label>
                <input
                  type="text"
                  value={formData.streetNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, streetNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  State/Region
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? "Update Address" : "Save Address"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <svg
              className="mx-auto w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-gray-600">No addresses saved yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.filter((a): a is Address & { id: string } => !!a.id).map((address) => {
              const isDefaultShipping =
                address.id === customer?.defaultShippingAddressId;
              const isDefaultBilling =
                address.id === customer?.defaultBillingAddressId;

              return (
                <div
                  key={address.id}
                  className="border rounded-lg p-4 relative"
                >
                  {/* Default badges */}
                  <div className="flex gap-2 mb-2">
                    {isDefaultShipping && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        Default Shipping
                      </span>
                    )}
                    {isDefaultBilling && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        Default Billing
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-700 space-y-0.5">
                    <p className="font-medium text-gray-900">
                      {address.firstName} {address.lastName}
                    </p>
                    <p>
                      {address.streetName}
                      {address.streetNumber ? ` ${address.streetNumber}` : ""}
                    </p>
                    <p>
                      {address.city}
                      {address.region ? `, ${address.region}` : ""}{" "}
                      {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                    {address.phone && (
                      <p className="text-gray-500">Phone: {address.phone}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                    {!isDefaultShipping && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() =>
                            handleSetDefault(address.id, "shipping")
                          }
                          disabled={
                            settingDefault === `shipping-${address.id}`
                          }
                          className="text-sm text-gray-600 hover:underline disabled:opacity-50"
                        >
                          Set as Default Shipping
                        </button>
                      </>
                    )}
                    {!isDefaultBilling && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() =>
                            handleSetDefault(address.id, "billing")
                          }
                          disabled={
                            settingDefault === `billing-${address.id}`
                          }
                          className="text-sm text-gray-600 hover:underline disabled:opacity-50"
                        >
                          Set as Default Billing
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
