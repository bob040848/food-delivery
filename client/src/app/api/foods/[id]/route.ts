// app/api/foods/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context:{ params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = req.headers.get("authorization");

    const response = await fetch(`${backendUrl}/food/${id}`, {
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
        { message: data.message || "Failed to fetch food" },
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

export async function PATCH(
  req: NextRequest,
  context:{ params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

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

    const response = await fetch(`${backendUrl}/food/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
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
        { message: data.message || "Failed to update food" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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

    const response = await fetch(`${backendUrl}/food/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
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
        { message: data.message || "Failed to delete food" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}