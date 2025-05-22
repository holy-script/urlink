import { updateSession } from "@/utils/supabase/middleware";
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest } from "next/server";
import { routing } from './i18n/routing';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  ...routing,
  // localePrefix: 'as-needed',
});

export async function middleware(request: NextRequest) {
  // First, handle the internationalization
  const response = intlMiddleware(request);

  // Then, update the Supabase session using the response from intlMiddleware
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
