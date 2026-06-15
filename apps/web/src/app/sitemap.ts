import { routing } from '@/i18n/routing';
import { hreflangAlternates, localeUrl } from '@/i18n/seo';
import { MetadataRoute } from 'next';

// Public, indexable pages (un-prefixed routes). Each is emitted once per locale
// with full hreflang alternates so search engines index every translation.
const PAGES = [
    { path: '', changeFrequency: 'monthly' as const, priority: 1 },
    { path: '/pdf-editor', changeFrequency: 'monthly' as const, priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return PAGES.flatMap((page) =>
        routing.locales.map((locale) => ({
            url: localeUrl(locale, page.path),
            lastModified,
            changeFrequency: page.changeFrequency,
            priority: page.priority,
            alternates: { languages: hreflangAlternates(page.path) },
        })),
    );
}
