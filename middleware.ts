// middleware.ts
import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from "next/server";
import { routing } from './i18n/routing';
import { extractLocale, getRouteType } from './lib/routeConfig';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

// Supported platforms for API redirects
const SUPPORTED_PLATFORMS = ['youtube', 'instagram', 'facebook', 'tiktok', 'google-maps', 'amazon'] as const;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { locale, pathnameWithoutLocale } = extractLocale(pathname, routing.defaultLocale);

  // Handle platform API routes (these will always be locale-prefixed now)
  // Example: /en/instagram/ALjmGE -> /api/instagram/ALjmGE
  const pathSegments = pathnameWithoutLocale.split('/').filter(Boolean);
  if (pathSegments.length === 2) {
    const [platform, code] = pathSegments;
    if (SUPPORTED_PLATFORMS.includes(platform as any)) {
      const url = request.nextUrl.clone();
      url.pathname = `/api/${platform}/${code}`;
      console.log(`🔄 Rewriting ${pathname} to ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
  }

  // Process internationalization first
  let response = intlMiddleware(request);

  // Create Supabase client for auth checking
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

  try {
    // Get user session
    const { data: { user } } = await supabase.auth.getUser();

    // Determine route type
    const routeType = getRouteType(pathname);

    // Handle route protection logic
    switch (routeType) {
      case 'protected':
        if (!user) {
          const loginUrl = new URL(`/${locale}/login`, request.url);
          loginUrl.searchParams.set('redirect', pathname);
          console.log(`🔒 Redirecting unauthenticated user from ${pathname} to login`);
          return NextResponse.redirect(loginUrl);
        }
        break;

      case 'public':
        if (user) {
          const redirectTo = request.nextUrl.searchParams.get('redirect');
          if (redirectTo && redirectTo !== pathname) {
            console.log(`🔄 Redirecting authenticated user to: ${redirectTo}`);
            return NextResponse.redirect(new URL(redirectTo, request.url));
          }
          // Redirect to dashboard instead of /protected
          const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
          console.log(`🔄 Redirecting authenticated user to dashboard: ${dashboardUrl.pathname}`);
          return NextResponse.redirect(dashboardUrl);
        }
        break;

      case 'open':
        // Open routes - no auth restrictions, just update session
        break;
    }

    // Update session for all requests
    return await updateSession(request, response);

  } catch (error) {
    console.error('Middleware error:', error);
    return await updateSession(request, response);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
