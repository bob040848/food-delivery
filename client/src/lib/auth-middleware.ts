// lib/auth-middleware.ts
import { NextRequest, NextResponse } from "next/server";

type UserPayload = {
  id: string;
  email: string;
  role: string;
  exp: number;
};

function decodeJWT(token: string): UserPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
}

export function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    console.log("🔑 Token found in Authorization header");
    return authHeader.split(" ")[1];
  }

  const token = req.cookies.get("token");
  console.log("🍪 Cookie token:", token ? "present" : "missing");
  console.log(
    "🍪 All cookies:",
    req.cookies.getAll().map((c) => c.name)
  );

  return token?.value || null;
}

export function validateAuth(req: NextRequest): {
  isValid: boolean;
  user: UserPayload | null;
  error?: string;
} {
  const token = getAuthToken(req);

  if (!token) {
    return {
      isValid: false,
      user: null,
      error: "No authentication token provided",
    };
  }

  const user = decodeJWT(token);

  if (!user) {
    return {
      isValid: false,
      user: null,
      error: "Invalid or expired token",
    };
  }

  return {
    isValid: true,
    user,
  };
}

export function requireAuth(requiredRole?: string) {
  return (req: NextRequest) => {
    const authResult = validateAuth(req);

    if (!authResult.isValid) {
      return NextResponse.json({ message: authResult.error }, { status: 401 });
    }

    if (requiredRole && authResult.user?.role !== requiredRole) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return { user: authResult.user, token: getAuthToken(req) };
  };
}

export async function makeBackendRequest(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("BACKEND_URL environment variable is not configured");
  }

  const response = await fetch(`${backendUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `Request failed with status ${response.status}`,
    }));
    throw new Error(JSON.stringify(errorData));
  }

  return response.json();
}
