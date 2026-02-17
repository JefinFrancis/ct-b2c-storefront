/**
 * Next.js Middleware — protects routes that require authentication.
 * Checks for auth-token cookie and redirects to login if not present.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;

  // Protected routes - require authentication
  const protectedPaths = ["/account/orders", "/account/profile", "/account/addresses"];
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Checkout requires authentication
  const isCheckout = request.nextUrl.pathname.startsWith("/checkout");

  if ((isProtectedRoute || isCheckout) && !token) {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages redirect is handled client-side by AuthContext
  // (avoids double redirect and provides smoother UX)

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/orders/:path*",
    "/account/profile/:path*",
    "/account/addresses/:path*",
    "/checkout/:path*",
    "/account/login",
    "/account/register",
  ],
};
