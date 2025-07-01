import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

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
            ? "default-src 'self' blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' vercel.live *.vercel.app *.com va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' *.vercel.app *.com vitals.vercel-insights.com; object-src blob:;"
            : "default-src 'self' blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' vitals.vercel-insights.com; object-src blob:;",
    );
    response.headers.set('X-DNS-Prefetch-Control', 'on');

    // Cache control
    if (request.nextUrl.pathname.startsWith('/api/')) {
        response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    } else if (request.nextUrl.pathname.match(/\.(jpg|jpeg|gif|png|svg|ico|webp)$/i)) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (request.nextUrl.pathname.match(/\.(css|js)$/i)) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
        response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
