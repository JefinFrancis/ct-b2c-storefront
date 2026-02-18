/**
 * AuthContext — manages authentication state across the application.
 * Handles login, register, logout, and token management.
 */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Customer } from "@ct-b2c/types";
import { authApi } from "@/lib/api-client";

// Storage keys
const AUTH_TOKEN_KEY = "ct_auth_token";
const AUTH_COOKIE_NAME = "auth-token";

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthContextValue {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Get token from localStorage.
 */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Store token in localStorage and set cookie for middleware.
 */
function storeToken(token: string): void {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  
  // Set cookie for middleware (7 days, matching JWT expiry)
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

/**
 * Clear token from localStorage and cookie.
 */
function clearToken(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(AUTH_TOKEN_KEY);
  
  // Clear cookie by setting expiry in the past
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token and fetch customer on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchedCustomer = await authApi.getMe(storedToken);
        setCustomer(fetchedCustomer);
        setToken(storedToken);
      } catch (err) {
        console.error("Failed to fetch customer:", err);
        // Token is invalid, clear it
        clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { token: authToken, customer: loggedInCustomer } = await authApi.login({
        email,
        password,
      });
      
      storeToken(authToken);
      setToken(authToken);
      setCustomer(loggedInCustomer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { token: authToken, customer: registeredCustomer } = await authApi.register(data);
      
      storeToken(authToken);
      setToken(authToken);
      setCustomer(registeredCustomer);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setCustomer(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      token,
      isAuthenticated: !!customer,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [customer, token, isLoading, error, login, register, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Export token key for use in other modules (e.g., API client).
 */
export { AUTH_TOKEN_KEY };
