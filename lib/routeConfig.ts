// lib/route-config.ts
export const ROUTE_CONFIG = {
    protected: [
        '/dashboard',
        '/account',
        '/billing',
        '/create-link',
        '/my-links',
        '/analytics',
        '/faq',
        '/support'
    ],
    public: [
        '/login',
        '/signup',
        '/reset-password'
    ],
    open: [
        '/',
        '/email-verified',
        '/auth-code'
    ]
} as const;

export type RouteType = 'protected' | 'public' | 'open' | 'none';

// Helper function to determine route type
export function getRouteType(pathname: string): RouteType {
    // Remove locale prefix for route matching
    const cleanPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

    const isProtected = ROUTE_CONFIG.protected.some(route =>
        cleanPath.startsWith(route)
    );

    const isPublic = ROUTE_CONFIG.public.some(route =>
        cleanPath.startsWith(route)
    );

    const isOpen = ROUTE_CONFIG.open.some(route =>
        cleanPath === route || (route !== '/' && cleanPath.startsWith(route))
    );

    if (isProtected) return 'protected';
    if (isPublic) return 'public';
    if (isOpen) return 'open';
    return 'none';
}

// Helper to extract locale from pathname
export function extractLocale(pathname: string, defaultLocale: string = 'en'): {
    locale: string;
    pathnameWithoutLocale: string;
} {
    const localeMatch = pathname.match(/^\/([a-z]{2})(?=\/|$)/);
    const locale = localeMatch ? localeMatch[1] : defaultLocale;
    const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

    return { locale, pathnameWithoutLocale };
}
