//client/src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    console.log("Reset password request body:", {
      token: token ? "present" : "missing",
      password: password ? "present" : "missing",
    });

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    const payload = {
      token,
      password,
      newPassword: password,
    };

    console.log("Sending to backend:", {
      url: `${process.env.BACKEND_URL}/auth/reset-password`,
      payload: {
        token: "present",
        password: "present",
        newPassword: "present",
      },
    });

    const response = await fetch(
      `${process.env.BACKEND_URL}/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    console.log("Backend response:", { status: response.status, data });

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to reset password" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Your password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
