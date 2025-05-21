'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ 
  children,
  allowedRoles = ['User', 'Admin'],
}: { 
  children: React.ReactNode,
  allowedRoles?: string[]
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
    
    // Check for role-based access if user is authenticated
    if (!isLoading && isAuthenticated && user && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to unauthorized page or dashboard
        router.push('/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, router, user, allowedRoles]);

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If authenticated and authorized, render children
  return isAuthenticated ? <>{children}</> : null;
}