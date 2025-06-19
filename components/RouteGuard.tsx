// components/RouteGuard.tsx
"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RouteGuard({ children, fallback }: RouteGuardProps) {
  const { session, loading, routeType } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (loading) return;

    // Handle route protection based on auth status and route type
    if (routeType === 'protected' && !session) {
      console.log('RouteGuard: Redirecting to login from protected route');
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (routeType === 'public' && session) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');

      if (redirectTo && redirectTo !== pathname) {
        console.log('RouteGuard: Redirecting to:', redirectTo);
        router.push(redirectTo);
      } else {
        console.log('RouteGuard: Redirecting to dashboard');
        router.push(`/${locale}/dashboard`);
      }
      return;
    }
  }, [session, loading, routeType, router, pathname, locale]);

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  // Don't render if we're redirecting
  if ((routeType === 'protected' && !session) || (routeType === 'public' && session)) {
    return null;
  }

  return <>{children}</>;
}
