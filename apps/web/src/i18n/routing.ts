import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    // Locales the marketing site is translated into. `uk` matches the
    // language switcher that already shipped in the header.
    locales: ['en', 'es', 'uk'],

    // Used when no locale matches (and the un-prefixed canonical locale).
    defaultLocale: 'en',

    // Keep English at `/` (no `/en` prefix) so existing URLs / SEO are
    // untouched; other locales are served from `/es`, `/uk`.
    localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
