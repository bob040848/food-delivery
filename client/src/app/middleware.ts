import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify",
  "/unauthorized",
];

const authPaths = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
];

const protectedPaths = ["/dashboard", "/admin"];
const adminPaths = ["/admin"];

function decodeJWTPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded;
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const isAuthenticated = !!token;

  if (isAuthenticated && adminPaths.some((path) => pathname.startsWith(path))) {
    const payload = decodeJWTPayload(token);

    if (!payload || payload.role !== "Admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (isAuthenticated && authPaths.some((path) => pathname.startsWith(path))) {
    const payload = decodeJWTPayload(token);

    if (payload && payload.role === "Admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (
    !isAuthenticated &&
    !publicPaths.some((path) => pathname.startsWith(path)) &&
    (protectedPaths.some((path) => pathname.startsWith(path)) ||
      pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (pathname === "/") {
    if (isAuthenticated) {
      const payload = decodeJWTPayload(token);

      if (payload && payload.role === "Admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } else {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
