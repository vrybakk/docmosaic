import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

// Derive the request type from next-intl's middleware so the `next` version it
// resolves (hoisted root) matches ours — avoids the monorepo dual-package type
// clash that importing `NextRequest` from `next/server` directly would trigger.
export function middleware(request: Parameters<typeof handleI18nRouting>[0]) {
    // next-intl handles locale detection, redirects (`/` -> default locale) and
    // rewrites first; we then decorate the resulting response with the same
    // CORS / security / cache headers the site shipped before.
    const response = handleI18nRouting(request);

    // CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
        'Access-Control-Allow-Headers',
        'X-Requested-With, Content-Type, Authorization',
    );

    // Security headers
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Content-Security-Policy',
        process.env.NODE_ENV === 'production'
            ? "default-src 'self' blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' vercel.live *.vercel.app *.com va.vercel-scripts.com *.googletagmanager.com *.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' *.vercel.app *.com vitals.vercel-insights.com *.googletagmanager.com *.google-analytics.com *.google.com; frame-src 'self' *.googletagmanager.com; object-src blob:;"
            : "default-src 'self' blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' va.vercel-scripts.com *.googletagmanager.com *.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' vitals.vercel-insights.com *.googletagmanager.com *.google-analytics.com *.google.com; frame-src 'self' *.googletagmanager.com; object-src blob:;",
    );
    response.headers.set('X-DNS-Prefetch-Control', 'on');

    // Cache control
    if (request.nextUrl.pathname.startsWith('/api/')) {
        response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    } else {
        response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    }

    return response;
}

export const config = {
    // Match all pathnames except API routes, Next internals and files with an
    // extension (e.g. `/favicon.ico`, `/seo/og-image.png`). `/` is matched so
    // the locale redirect runs on the landing page.
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/'],
};
