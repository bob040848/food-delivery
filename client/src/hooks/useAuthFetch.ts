// // client/src/hooks/useAuthFetch.ts
// 'use client';

// import { useCallback } from 'react';
// import { useAuth } from '@/contexts/AuthContext';

// export const useAuthFetch = () => {
//   const { token, refreshToken, logout } = useAuth();

//   const authFetch = useCallback(async (
//     url: string,
//     options: RequestInit = {}
//   ): Promise<Response> => {
//     if (!token) {
//       throw new Error('No authentication token available');
//     }

//     // Add authorization header
//     const headers = {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`,
//       ...options.headers,
//     };

//     try {
//       // Make the initial request
//       let response = await fetch(url, {
//         ...options,
//         headers,
//       });

//       // If token is expired, try to refresh it
//       if (response.status === 401) {
//         const refreshSuccess = await refreshToken();

//         if (refreshSuccess) {
//           // Retry the request with the new token
//           response = await fetch(url, {
//             ...options,
//             headers: {
//               ...headers,
//               'Authorization': `Bearer ${token}`,
//             },
//           });
//         } else {
//           // Refresh failed, logout user
//           logout();
//           throw new Error('Authentication failed');
//         }
//       }

//       return response;
//     } catch (error) {
//       console.error('Auth fetch error:', error);
//       throw error;
//     }
//   }, [token, refreshToken, logout]);

//   return authFetch;
// };
