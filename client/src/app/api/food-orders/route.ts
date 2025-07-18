// client/src/app/api/food-orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, makeBackendRequest } from "@/lib/auth-middleware";

export async function GET(req: NextRequest) {
  try {
    const authResult = requireAuth("Admin")(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { token } = authResult;
    const data = await makeBackendRequest("/food-order", token, {
      method: "GET",
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error fetching food orders:", error);

    let errorMessage = { message: "Internal server error" };
    let statusCode = 500;

    if (error && typeof error === 'object' && 'message' in error) {
      try {
        const parsedError = JSON.parse(error.message as string);
        errorMessage = parsedError;
        statusCode = parsedError.status || 500;
      } catch (parseError) {
        console.error("Failed to parse error message:", parseError);
        errorMessage = { 
          message: typeof error.message === 'string' ? error.message : "Internal server error" 
        };
      }
    }

    return NextResponse.json(errorMessage, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = requireAuth()(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { token } = authResult;
    const body = await req.json();

    if (
      !body.userId ||
      !body.foodOrderItems ||
      !Array.isArray(body.foodOrderItems)
    ) {
      return NextResponse.json(
        { message: "User ID and food order items are required" },
        { status: 400 }
      );
    }

    const data = await makeBackendRequest("/food-order", token, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating food order:", error);

    let errorMessage = { message: "Internal server error" };
    let statusCode = 500;

    if (error && typeof error === 'object' && 'message' in error) {
      try {
        const parsedError = JSON.parse(error.message as string);
        errorMessage = parsedError;
        statusCode = parsedError.status || 500;
      } catch (parseError) {
        console.error("Failed to parse error message:", parseError);
        errorMessage = { 
          message: typeof error.message === 'string' ? error.message : "Internal server error" 
        };
      }
    }

    return NextResponse.json(errorMessage, { status: statusCode });
  }
}