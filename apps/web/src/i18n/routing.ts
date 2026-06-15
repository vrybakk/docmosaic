import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    // Locales the marketing site is translated into.
    locales: ['en', 'es', 'uk', 'de', 'fr', 'pt-BR', 'pl', 'it'],

    // Used when no locale matches (and the un-prefixed canonical locale).
    defaultLocale: 'en',

    // Keep English at `/` (no `/en` prefix) so existing URLs / SEO are
    // untouched; other locales are served from `/es`, `/uk`.
    localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
