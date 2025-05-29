// client/src/app/api/food-orders/user/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, makeBackendRequest } from "@/lib/auth-middleware";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const authResult = requireAuth()(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { token } = authResult;
    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const data = await makeBackendRequest(`/food-order/${userId}`, token, {
      method: "GET",
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error fetching user food orders:", error);

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