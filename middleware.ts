import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from "next/server";
import { routing } from './i18n/routing';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  ...routing,
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle platform/code redirects BEFORE internationalization
  const supportedPlatforms = ['youtube', 'instagram', 'facebook', 'tiktok', 'google-maps', 'amazon'];
  const pathSegments = pathname.split('/').filter(Boolean);

  // Check if this is a platform/code pattern (e.g., /instagram/ALjmGE)
  if (pathSegments.length === 2) {
    const [platform, code] = pathSegments;

    if (supportedPlatforms.includes(platform)) {
      // Rewrite to API route
      const url = request.nextUrl.clone();
      url.pathname = `/api/${platform}/${code}`;

      console.log(`🔄 Rewriting ${pathname} to ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
  }

  // Check if this is a localized platform/code pattern (e.g., /en/instagram/ALjmGE)
  if (pathSegments.length === 3) {
    const [locale, platform, code] = pathSegments;

    // Check if first segment is a locale and second is a supported platform
    if (routing.locales.includes(locale as any) && supportedPlatforms.includes(platform)) {
      // Rewrite to API route (without locale since API routes don't need localization)
      const url = request.nextUrl.clone();
      url.pathname = `/api/${platform}/${code}`;

      console.log(`🔄 Rewriting ${pathname} to ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
  }

  // Continue with your existing middleware logic...
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
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
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
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

  // Your existing protected routes logic...
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

  const publicRoutes = [
    '/login',
    '/signup',
    '/reset-password',
  ];

  const openRoutes = [
    '/',
    '/email-verified',
    '/auth-code'
  ];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  );

  const isPublicRoute = publicRoutes.some(route =>
    pathnameWithoutLocale.startsWith(route)
  );

  const isOpenRoute = openRoutes.some(route =>
    pathnameWithoutLocale === route ||
    (route !== '/' && pathnameWithoutLocale.startsWith(route))
  );

  // Handle protected routes
  if (isProtectedRoute && !session) {
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle public routes
  if (isPublicRoute && session) {
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
    const redirectTo = request.nextUrl.searchParams.get('redirect');

    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (isOpenRoute) {
    return await updateSession(request, response);
  }

  return await updateSession(request, response);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
