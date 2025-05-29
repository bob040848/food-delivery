// app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL environment variable is not set");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log(
      `Attempting to connect to backend at: ${backendUrl}/auth/sign-in`
    );

    try {
      const response = await fetch(`${backendUrl}/auth/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000),
      });

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "Failed to parse response as JSON:",
          parseError,
          "Response text:",
          responseText.substring(0, 200)
        );
        return NextResponse.json(
          { message: "Invalid response from server" },
          { status: 502 }
        );
      }

      if (!response.ok) {
        return NextResponse.json(
          { message: data.message || "Authentication failed" },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json(
        { message: "Failed to connect to authentication server" },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}