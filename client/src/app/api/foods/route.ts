// app/api/foods/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = req.headers.get("authorization");

    const response = await fetch(`${backendUrl}/food`, {
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
    } catch (_parseError) {
      return NextResponse.json(
        { message: "Invalid response from server" },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch foods" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json(
      { message: "Failed to connect to server" },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { foodName, price, image, ingredients, category } = body;

    if (!foodName || !price || !image || !ingredients || !category) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = req.headers.get("authorization");
    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${backendUrl}/food`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ foodName, price, image, ingredients, category }),
      signal: AbortSignal.timeout(10000),
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (_parseError) {
      return NextResponse.json(
        { message: "Invalid response from server" },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to create food" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}