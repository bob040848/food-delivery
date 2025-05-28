// lib/auth-middleware.ts
import { NextRequest, NextResponse } from "next/server";

type UserPayload = {
  id: string;
  email: string;
  role: string;
  exp: number;
};

type AuthResult = {
  user: UserPayload;
  token: string;
};

function decodeJWT(token: string): UserPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];

    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);

    const decoded = JSON.parse(
      atob(paddedPayload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.warn("🔐 Token expired");
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
  if (process.env.NODE_ENV === "development") {
    console.log("🍪 Cookie token:", token ? "present" : "missing");
    console.log(
      "🍪 All cookies:",
      req.cookies.getAll().map((c) => c.name)
    );
  }

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
  return (req: NextRequest): NextResponse | AuthResult => {
    const authResult = validateAuth(req);

    if (!authResult.isValid) {
      console.warn("🚫 Authentication failed:", authResult.error);
      return NextResponse.json({ message: authResult.error }, { status: 401 });
    }

    if (requiredRole && authResult.user?.role !== requiredRole) {
      console.warn(
        `🚫 Authorization failed: Required role "${requiredRole}", got "${authResult.user?.role}"`
      );
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { message: "Authentication token not found" },
        { status: 401 }
      );
    }

    return {
      user: authResult.user as UserPayload,
      token,
    };
  };
}

export async function makeBackendRequest(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<any> {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("BACKEND_URL environment variable is not configured");
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const fullUrl = `${backendUrl}${normalizedEndpoint}`;

  try {
    console.log(
      `🌐 Making backend request: ${options.method || "GET"} ${fullUrl}`
    );

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: `Request failed with status ${response.status}`,
            status: response.status,
          };
        }
      } else {
        errorData = {
          message: `Request failed with status ${response.status}`,
          status: response.status,
        };
      }

      console.error(`❌ Backend request failed:`, errorData);

      const errorWithStatus = {
        ...errorData,
        status: response.status,
      };

      throw new Error(JSON.stringify(errorWithStatus));
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const text = await response.text();
      return text ? { message: text } : { success: true };
    }
  } catch (error) {
    console.error(`💥 Backend request error for ${fullUrl}:`, error);

    if (error instanceof Error && error.message.startsWith("{")) {
      throw error;
    }

    throw new Error(
      JSON.stringify({
        message:
          error instanceof Error ? error.message : "Network error occurred",
        status: 500,
      })
    );
  }
}

export function hasRole(user: UserPayload | null, role: string): boolean {
  return user?.role === role;
}

export function isAdmin(user: UserPayload | null): boolean {
  return hasRole(user, "Admin");
}

export function getUserId(req: NextRequest): string | null {
  const authResult = validateAuth(req);
  return authResult.isValid ? authResult.user?.id || null : null;
}
