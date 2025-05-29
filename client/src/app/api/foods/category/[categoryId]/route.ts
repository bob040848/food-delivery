// app/api/foods/category/[categoryId]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ categoryId: string } >}
) {
  try {
    const { categoryId } = await context.params;

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = req.headers.get("authorization");

    const response = await fetch(`${backendUrl}/food/category/${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
      signal: AbortSignal.timeout(10000),
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { message: "Invalid response from server" },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch foods by category" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Failed to connect to server" },
      { status: 503 }
    );
  }
}