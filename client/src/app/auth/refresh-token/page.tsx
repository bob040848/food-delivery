// // client/src/app/auth/refresh-token/page.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useAuth } from "@/contexts/AuthContext";
// import { Loader2, CheckCircle, XCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// const RefreshToken = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { user, token, login, logout } = useAuth();
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const redirectUrl = searchParams.get("redirect") || "/dashboard";

//   useEffect(() => {
//     if (token && user) {
//       handleRefreshToken();
//     }
//   }, []);

//   const handleRefreshToken = async () => {
//     if (!token) {
//       setError("No token available to refresh");
//       return;
//     }

//     setIsRefreshing(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const response = await fetch("/api/auth/refresh-token", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ token }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to refresh token");
//       }

//       if (user) {
//         login(data.token, user);
//       }

//       setSuccess("Token refreshed successfully!");

//       setTimeout(() => {
//         router.push(redirectUrl);
//       }, 2000);
//     } catch (err: any) {
//       console.error("Token refresh error:", err);
//       setError(err.message);

//       setTimeout(() => {
//         logout();
//       }, 3000);
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const handleManualRefresh = () => {
//     handleRefreshToken();
//   };

//   const handleGoToDashboard = () => {
//     router.push(redirectUrl);
//   };

//   const handleSignOut = () => {
//     logout();
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-slate-50">
//       <Card className="w-full max-w-md shadow-lg">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold text-center">
//             Token Refresh
//           </CardTitle>
//           <CardDescription className="text-center">
//             {isRefreshing
//               ? "Refreshing your session..."
//               : "Manage your authentication token"}
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {isRefreshing && (
//             <div className="flex items-center justify-center space-x-2">
//               <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
//               <span className="text-sm text-gray-600">
//                 Refreshing your session...
//               </span>
//             </div>
//           )}

//           {error && (
//             <Alert variant="destructive">
//               <XCircle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           {success && (
//             <Alert className="bg-green-50 border-green-200">
//               <CheckCircle className="h-4 w-4 text-green-600" />
//               <AlertTitle className="text-green-800">Success</AlertTitle>
//               <AlertDescription className="text-green-700">
//                 {success}
//               </AlertDescription>
//             </Alert>
//           )}

//           {user && (
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="text-sm font-medium text-gray-700 mb-2">
//                 Current Session
//               </h3>
//               <p className="text-sm text-gray-600">Email: {user.email}</p>
//               <p className="text-sm text-gray-600">Role: {user.role}</p>
//             </div>
//           )}

//           <div className="space-y-3">
//             {!isRefreshing && !success && (
//               <Button
//                 onClick={handleManualRefresh}
//                 className="w-full"
//                 disabled={!token}
//               >
//                 Refresh Token
//               </Button>
//             )}

//             {success && (
//               <Button onClick={handleGoToDashboard} className="w-full">
//                 Continue to Dashboard
//               </Button>
//             )}

//             {!isRefreshing && (
//               <Button
//                 variant="outline"
//                 onClick={handleSignOut}
//                 className="w-full"
//               >
//                 Sign Out
//               </Button>
//             )}
//           </div>

//           {!token && (
//             <div className="text-center">
//               <p className="text-sm text-gray-500 mb-4">
//                 You don't appear to be signed in.
//               </p>
//               <Button
//                 variant="outline"
//                 onClick={() => router.push("/auth/sign-in")}
//                 className="w-full"
//               >
//                 Go to Sign In
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default RefreshToken;
