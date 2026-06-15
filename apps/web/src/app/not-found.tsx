'use client';

import Error from 'next/error';

// Rendered for paths that can't map to a locale (e.g. `/unknown.txt`). For a
// known locale with an unknown sub-path, `app/[locale]/not-found.tsx` is shown
// instead. Provides its own <html>/<body> since the root layout passes through.
export default function GlobalNotFound() {
    return (
        <html lang="en">
            <body>
                <Error statusCode={404} />
            </body>
        </html>
    );
}
