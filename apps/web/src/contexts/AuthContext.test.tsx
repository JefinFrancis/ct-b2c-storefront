import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";
import { authApi } from "@/lib/api-client";
import type { Customer } from "@ct-b2c/types";

// Mock the api-client
vi.mock("@/lib/api-client", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
  },
}));

const mockAuthApi = vi.mocked(authApi);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock document.cookie
let cookieStore = "";
Object.defineProperty(document, "cookie", {
  get: () => cookieStore,
  set: (value: string) => {
    cookieStore = value;
  },
});

const mockCustomer: Customer = {
  id: "customer-123",
  version: 1,
  createdAt: "2024-01-01T00:00:00.000Z",
  lastModifiedAt: "2024-01-01T00:00:00.000Z",
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  addresses: [],
  isEmailVerified: true,
  // authenticationMode removed - not present in current Customer type
};

// Test component to access context
function TestConsumer({
  onLogin,
  onRegister,
  onLogout,
}: {
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => void;
}) {
  const { customer, isAuthenticated, isLoading, error, login, register, logout, clearError } =
    useAuth();

  return (
    <div>
      <span data-testid="loading">{isLoading ? "loading" : "loaded"}</span>
      <span data-testid="authenticated">{isAuthenticated ? "yes" : "no"}</span>
      <span data-testid="customer">{customer?.email || "none"}</span>
      <span data-testid="error">{error || "no-error"}</span>
      <button
        data-testid="login-btn"
        onClick={async () => {
          try {
            await login("test@example.com", "password123");
            onLogin?.();
          } catch {
            // Error is expected in some tests, handled by AuthContext
          }
        }}
      >
        Login
      </button>
      <button
        data-testid="register-btn"
        onClick={async () => {
          try {
            await register({
              email: "new@example.com",
              password: "password123",
              firstName: "Jane",
              lastName: "Doe",
            });
            onRegister?.();
          } catch {
            // Error is expected in some tests, handled by AuthContext
          }
        }}
      >
        Register
      </button>
      <button
        data-testid="logout-btn"
        onClick={() => {
          logout();
          onLogout?.();
        }}
      >
        Logout
      </button>
      <button data-testid="clear-error-btn" onClick={clearError}>
        Clear Error
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    cookieStore = "";
  });

  describe("AuthProvider", () => {
    it("starts with loading state and no customer", async () => {
      mockAuthApi.getMe.mockRejectedValue(new Error("No token"));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      // Should eventually show loaded
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
      expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
      expect(screen.getByTestId("customer")).toHaveTextContent("none");
    });

    it("restores session from stored token on mount", async () => {
      localStorageMock.setItem("ct_auth_token", "stored-token");
      mockAuthApi.getMe.mockResolvedValue(mockCustomer);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("customer")).toHaveTextContent("test@example.com");
      });

      expect(mockAuthApi.getMe).toHaveBeenCalledWith("stored-token");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
    });

    it("clears invalid token when getMe fails", async () => {
      localStorageMock.setItem("ct_auth_token", "invalid-token");
      mockAuthApi.getMe.mockRejectedValue(new Error("Invalid token"));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("ct_auth_token");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
    });
  });

  describe("login", () => {
    it("stores token and sets customer on successful login", async () => {
      mockAuthApi.login.mockResolvedValue({
        token: "new-token",
        customer: mockCustomer,
        cart: null,
      });

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      await user.click(screen.getByTestId("login-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("customer")).toHaveTextContent("test@example.com");
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith("ct_auth_token", "new-token");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
    });

    it("sets error on login failure", async () => {
      mockAuthApi.login.mockRejectedValue(new Error("Invalid credentials"));

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      await user.click(screen.getByTestId("login-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Invalid credentials");
      });

      expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
    });
  });

  describe("register", () => {
    it("stores token and sets customer on successful registration", async () => {
      const newCustomer = { ...mockCustomer, email: "new@example.com" };
      mockAuthApi.register.mockResolvedValue({
        token: "new-token",
        customer: newCustomer,
        cart: null,
      });

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      await user.click(screen.getByTestId("register-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("customer")).toHaveTextContent("new@example.com");
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith("ct_auth_token", "new-token");
    });

    it("sets error on registration failure", async () => {
      mockAuthApi.register.mockRejectedValue(new Error("Email already exists"));

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      await user.click(screen.getByTestId("register-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Email already exists");
      });
    });
  });

  describe("logout", () => {
    it("clears customer and token on logout", async () => {
      localStorageMock.setItem("ct_auth_token", "stored-token");
      mockAuthApi.getMe.mockResolvedValue(mockCustomer);

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("customer")).toHaveTextContent("test@example.com");
      });

      await user.click(screen.getByTestId("logout-btn"));

      expect(screen.getByTestId("customer")).toHaveTextContent("none");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("ct_auth_token");
    });
  });

  describe("clearError", () => {
    it("clears error state", async () => {
      mockAuthApi.login.mockRejectedValue(new Error("Error"));

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      await user.click(screen.getByTestId("login-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).not.toHaveTextContent("no-error");
      });

      await user.click(screen.getByTestId("clear-error-btn"));

      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
    });
  });

  describe("useAuth hook", () => {
    it("throws error when used outside provider", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<TestConsumer />)).toThrow(
        "useAuth must be used within an AuthProvider"
      );

      consoleError.mockRestore();
    });
  });
});
