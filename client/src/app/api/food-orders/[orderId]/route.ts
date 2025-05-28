// client/src/app/api/food-orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, makeBackendRequest } from "@/lib/auth-middleware";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const authResult = requireAuth("Admin")(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { token } = authResult;
    const body = await req.json();
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    if (
      body.status &&
      !["Pending", "Canceled", "Delivered"].includes(body.status)
    ) {
      return NextResponse.json(
        { message: "Valid status required (Pending, Canceled, or Delivered)" },
        { status: 400 }
      );
    }

    const data = await makeBackendRequest(`/food-order/${orderId}`, token, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating food order:", error);

    let errorMessage = { message: "Internal server error" };
    let statusCode = 500;

    try {
      if (error.message) {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError;
        statusCode = parsedError.status || 500;
      }
    } catch (parseError) {
      errorMessage = { message: error.message || "Internal server error" };
    }

    return NextResponse.json(errorMessage, { status: statusCode });
  }
}

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { orderId: string } }
// ) {
//   try {
//     const authResult = requireAuth("Admin")(req);
//     if (authResult instanceof NextResponse) {
//       return authResult;
//     }

//     const { token } = authResult;
//     const { orderId } = params;

//     if (!orderId) {
//       return NextResponse.json(
//         { message: "Order ID is required" },
//         { status: 400 }
//       );
//     }

//     const data = await makeBackendRequest(`/food-order/${orderId}`, token, {
//       method: "DELETE",
//     });

//     return NextResponse.json(data);
//   } catch (error: any) {
//     console.error("Error deleting food order:", error);

//     let errorMessage = { message: "Internal server error" };
//     let statusCode = 500;

//     try {
//       if (error.message) {
//         const parsedError = JSON.parse(error.message);
//         errorMessage = parsedError;
//         statusCode = parsedError.status || 500;
//       }
//     } catch (parseError) {
//       errorMessage = { message: error.message || "Internal server error" };
//     }

//     return NextResponse.json(errorMessage, { status: statusCode });
//   }
// }
