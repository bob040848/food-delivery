// // client/app/api/auth/refresh-token/route.ts
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const authHeader = req.headers.get("authorization");
//     const body = await req.json().catch(() => ({}));

//     let token = body.token;
//     if (!token && authHeader) {
//       token = authHeader.split(" ")[1];
//     }

//     if (!token) {
//       return NextResponse.json(
//         { message: "No token provided" },
//         { status: 401 }
//       );
//     }

//     const backendUrl = process.env.BACKEND_URL;
//     if (!backendUrl) {
//       console.error("BACKEND_URL environment variable is not set");
//       return NextResponse.json(
//         { message: "Server configuration error" },
//         { status: 500 }
//       );
//     }

//     console.log(`Attempting to refresh token at: ${backendUrl}/auth/refresh`);

//     try {
//       const response = await fetch(`${backendUrl}/auth/refresh`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },

//         signal: AbortSignal.timeout(10000),
//       });

//       const responseText = await response.text();

//       let data;
//       try {
//         data = JSON.parse(responseText);
//       } catch (parseError) {
//         console.error(
//           "Failed to parse response as JSON:",
//           responseText.substring(0, 200)
//         );
//         return NextResponse.json(
//           { message: "Invalid response from server" },
//           { status: 502 }
//         );
//       }

//       if (!response.ok) {
//         return NextResponse.json(
//           { message: data.message || "Token refresh failed" },
//           { status: response.status }
//         );
//       }

//       return NextResponse.json({
//         message: "Token refreshed successfully",
//         token: data.token,
//       });
//     } catch (fetchError) {
//       console.error("Fetch error:", fetchError);
//       return NextResponse.json(
//         { message: "Failed to connect to authentication server" },
//         { status: 503 }
//       );
//     }
//   } catch (error) {
//     console.error("Token refresh error:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
