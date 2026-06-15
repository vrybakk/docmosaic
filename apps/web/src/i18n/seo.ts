import { routing, type Locale } from './routing';

/** Canonical production origin (no trailing slash). */
export const SITE_URL = 'https://docmosaic.com';

/** Locale -> BCP-47 hreflang code used in `<link rel="alternate">` and sitemaps. */
export const localeToHreflang: Record<Locale, string> = {
    en: 'en-US',
    es: 'es-ES',
    uk: 'uk-UA',
    de: 'de-DE',
    fr: 'fr-FR',
    'pt-BR': 'pt-BR',
    pl: 'pl-PL',
    it: 'it-IT',
};

/** Locale -> Open Graph `og:locale` value. */
export const ogLocale: Record<Locale, string> = {
    en: 'en_US',
    es: 'es_ES',
    uk: 'uk_UA',
    de: 'de_DE',
    fr: 'fr_FR',
    'pt-BR': 'pt_BR',
    pl: 'pl_PL',
    it: 'it_IT',
};

/**
 * Path for a locale + page. The default locale is un-prefixed (`localePrefix:
 * 'as-needed'`), every other locale is served from `/<locale>`.
 * `page` is the un-prefixed route, e.g. '' (home) or '/pdf-editor'.
 */
export function localePath(locale: Locale, page = ''): string {
    const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
    return `${prefix}${page}` || '/';
}

/** Absolute URL for a locale + page. */
export function localeUrl(locale: Locale, page = ''): string {
    return `${SITE_URL}${localePath(locale, page)}`;
}

/**
 * hreflang alternates for a page across every locale (+ `x-default` -> default
 * locale). Shape matches Next.js metadata `alternates.languages` and the
 * sitemap `alternates.languages` field.
 */
export function hreflangAlternates(page = ''): Record<string, string> {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
        languages[localeToHreflang[locale]] = localeUrl(locale, page);
    }
    languages['x-default'] = localeUrl(routing.defaultLocale, page);
    return languages;
}
