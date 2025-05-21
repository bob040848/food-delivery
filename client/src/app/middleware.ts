import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that should be accessible without authentication
const publicPaths = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
];

// List of paths that should redirect to the dashboard if user is already authenticated
const authPaths = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip for API routes and public assets
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const token = request.cookies.get('token')?.value;
  const isAuthenticated = !!token;

  // If trying to access an authentication page while already logged in, redirect to dashboard
  if (isAuthenticated && authPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If trying to access a protected page without authentication, redirect to login
  if (!isAuthenticated && !publicPaths.some(path => pathname.startsWith(path)) && pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  return NextResponse.next();
}

// Matcher configurations to specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - API routes (/api/*)
     * - Static files (e.g., /favicon.ico, /images/*)
     * - Next.js internals (/_next/*)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};