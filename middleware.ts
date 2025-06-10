import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from "next/server";
import { routing } from './i18n/routing';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  ...routing,
  // localePrefix: 'as-needed',
});

export async function middleware(request: NextRequest) {
  // First, handle the internationalization
  let response = intlMiddleware(request);

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Set cookie on both request and response
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          // Remove cookie from both request and response
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();

  // Get the pathname without locale prefix for route matching
  const pathname = request.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

  // Define protected routes (routes that require authentication)
  const protectedRoutes = [
    '/dashboard',
    '/account',
    '/billing',
    '/create-link',
    '/my-links',
    '/analytics',
    '/faq',
    '/support',
  ];

  // Define public routes that should redirect authenticated users
  const publicRoutes = [
    '/login',
    '/signup',
    '/reset-password',
  ];

  // Define completely public routes (accessible to everyone)
  const openRoutes = [
    '/',
    '/email-verified',
    '/auth-code-error',
  ];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  );

  // Check if current path is a public auth route
  const isPublicRoute = publicRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  );

  // Check if current path is completely open
  const isOpenRoute = openRoutes.some(route =>
    pathnameWithoutLocale === route ||
    (route !== '/' && pathnameWithoutLocale.startsWith(route))
  );

  // Handle protected routes
  if (isProtectedRoute && !session) {
    // Extract locale from current path
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

    // Redirect to login with locale prefix
    const loginUrl = new URL(`/${locale}/login`, request.url);

    // Add redirect parameter to return to original page after login
    loginUrl.searchParams.set('redirect', pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Handle public routes (redirect authenticated users to dashboard)
  if (isPublicRoute && session) {
    // Extract locale from current path
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

    // Check if there's a redirect parameter
    const redirectTo = request.nextUrl.searchParams.get('redirect');

    if (redirectTo) {
      // Redirect to the original requested page
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Default redirect to dashboard
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // For open routes, allow access regardless of auth status
  if (isOpenRoute) {
    return await updateSession(request, response);
  }

  // For all other routes, update session and continue
  return await updateSession(request, response);
}

// Combine both matchers to ensure all necessary paths are covered
export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes, trpc, Next.js internals, Vercel internals
    // - Files with extensions
    '/((?!api|trpc|_next|_vercel|.*\\..*).*))',

    // Also include the Supabase matcher to ensure session is updated everywhere needed
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
