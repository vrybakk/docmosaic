import Header from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';
import { routing, type Locale } from '@/i18n/routing';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Montserrat } from 'next/font/google';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import type React from 'react';
import { AnalyticsBridge } from '../analytics-bridge';

const montserrat = Montserrat({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-montserrat',
});

// hreflang alternates — shared across locales so every page advertises all of
// its translations. `as-needed` keeps the default locale (en) at the root.
const languageAlternates = {
    'en-US': '/',
    'es-ES': '/es',
    'uk-UA': '/uk',
    'x-default': '/',
};

const ogLocales: Record<Locale, string> = {
    en: 'en_US',
    es: 'es_ES',
    uk: 'uk_UA',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: '#381D2A',
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale: locale as Locale, namespace: 'Metadata' });
    const canonical = locale === routing.defaultLocale ? '/' : `/${locale}`;

    return {
        metadataBase: new URL('https://docmosaic.com'),
        title: {
            default: t('title'),
            template: '%s | DocMosaic',
        },
        description: t('description'),
        keywords: [
            'pdf creator',
            'document mosaic',
            'free pdf tool',
            'open source pdf',
            'visual document creator',
            'image arrangement',
            'id document scanner',
            'pdf editor',
            'photo collage maker',
            'document organizer',
            'react pdf editor',
            'headless pdf editor',
            'pdf editor library',
            'embed pdf editor',
            'pdf sdk',
            'creador de pdf',
            'herramienta pdf gratuita',
            'створення pdf',
            'безкоштовний інструмент pdf',
        ],
        authors: [{ name: 'nerd-stud.io', url: 'https://nerd-stud.io' }],
        creator: 'nerd-stud.io',
        publisher: 'DocMosaic',
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        alternates: {
            canonical,
            languages: languageAlternates,
        },
        openGraph: {
            title: t('ogTitle'),
            description: t('ogDescription'),
            url: 'https://docmosaic.com',
            siteName: 'DocMosaic',
            locale: ogLocales[locale as Locale],
            type: 'website',
            images: [
                {
                    url: '/seo/og-image.png',
                    width: 1080,
                    height: 700,
                    alt: 'DocMosaic - Visual PDF Creation Tool',
                },
                {
                    url: '/seo/linkedIn.png',
                    width: 1200,
                    height: 627,
                    alt: 'DocMosaic - Visual PDF Creation Tool (LinkedIn)',
                },
                {
                    url: '/seo/instagram.png',
                    width: 1080,
                    height: 1080,
                    alt: 'DocMosaic - Visual PDF Creation Tool (Instagram)',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: t('ogTitle'),
            description: t('ogDescription'),
            creator: '@nerdstudio',
            images: ['/seo/twitter-card.png'],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        category: 'technology',
    };
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    // Enable static rendering for this locale.
    setRequestLocale(locale);

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://github.com" />
                <link rel="preconnect" href="https://nerd-stud.io" />
                <link rel="preconnect" href="https://buymeacoffee.com" />
                <link rel="preconnect" href="https://forms.clickup.com" />
                <link rel="preconnect" href="https://www.googletagmanager.com" />
                <link rel="preconnect" href="https://www.google-analytics.com" />

                <link rel="icon" href="/favicon-16x16.ico" sizes="16x16" type="image/x-icon" />
                <link rel="icon" href="/favicon-48x48.ico" sizes="48x48" type="image/x-icon" />
                <link rel="icon" href="/icon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/seo/apple-touch.png" />
                <link rel="manifest" href="/manifest.json" />

                {/* Primary OpenGraph image - this is what social platforms will use */}
                <meta property="og:image" content="/seo/og-image.png" />
                <meta property="og:image:width" content="1080" />
                <meta property="og:image:height" content="700" />
                <meta property="og:image:type" content="image/png" />
                <meta property="og:image:alt" content="DocMosaic - Visual PDF Creation Tool" />

                {/* Additional mobile and device specific meta tags */}
                <meta name="theme-color" content="#381D2A" />
                <meta name="msapplication-TileColor" content="#381D2A" />
                <meta name="msapplication-TileImage" content="/seo/manifest-192x192.png" />
                <meta name="msapplication-config" content="/browserconfig.xml" />

                {/* Additional social media meta tags for better sharing */}
                <meta property="og:site_name" content="DocMosaic" />
                <meta property="og:locale" content={ogLocales[locale]} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://docmosaic.com" />

                {/* Twitter additional meta tags */}
                <meta name="twitter:site" content="@nerdstudio" />
                <meta name="twitter:creator" content="@nerdstudio" />
                <meta name="twitter:title" content="DocMosaic - Visual PDF Creation Tool" />
                <meta
                    name="twitter:description"
                    content="Create beautiful PDFs by arranging images like a mosaic. Free and open source."
                />

                {/* Additional mobile and device specific meta tags */}
                <meta name="format-detection" content="telephone=no" />
                <meta name="format-detection" content="date=no" />
                <meta name="format-detection" content="address=no" />
                <meta name="format-detection" content="email=no" />

                {/* Additional social media meta tags for better sharing */}
                <meta
                    property="og:image:secure_url"
                    content="https://docmosaic.com/seo/og-image.png"
                />
                <meta
                    property="og:image:secure_url"
                    content="https://docmosaic.com/seo/linkedIn.png"
                />
                <meta
                    property="og:image:secure_url"
                    content="https://docmosaic.com/seo/instagram.png"
                />

                {/* Additional social media meta tags for better sharing */}
                <meta property="og:image:alt" content="DocMosaic - Visual PDF Creation Tool" />
                <meta
                    property="og:image:alt"
                    content="DocMosaic - Visual PDF Creation Tool (LinkedIn)"
                />
                <meta
                    property="og:image:alt"
                    content="DocMosaic - Visual PDF Creation Tool (Instagram)"
                />

                <meta property="og:image:type" content="image/png" />
                <Script
                    id="schema-org"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebApplication',
                            name: 'DocMosaic',
                            applicationCategory: 'UtilityApplication',
                            operatingSystem: 'Any',
                            offers: {
                                '@type': 'Offer',
                                price: '0',
                                priceCurrency: 'USD',
                            },
                            description:
                                'Free and open source tool for creating structured PDF documents with arranged images',
                            browserRequirements: 'Requires JavaScript. Requires HTML5.',
                            softwareVersion: '1.0.0',
                            author: {
                                '@type': 'Organization',
                                name: 'nerd-stud.io',
                                url: 'https://nerd-stud.io',
                            },
                            creator: {
                                '@type': 'Organization',
                                name: 'nerd-stud.io',
                                url: 'https://nerd-stud.io',
                            },
                            screenshot: {
                                '@type': 'ImageObject',
                                url: 'https://docmosaic.com/seo/schema.png',
                                caption: 'DocMosaic PDF Editor Interface',
                            },
                            featureList: [
                                'Visual Document Building',
                                'Instant Results',
                                'Free & Open Source',
                                'Browser-Only Processing',
                            ],
                        }),
                    }}
                />
            </head>
            <body className={`${montserrat.variable} font-sans`}>
                <GoogleTagManager gtmId={'GTM-WFRMPQ7Q'} />
                <GoogleAnalytics gaId={'G-9GLFL0DT7W'} />

                <NextIntlClientProvider>
                    <ThemeProvider>
                        <Header />
                        {children}
                    </ThemeProvider>
                </NextIntlClientProvider>
                <AnalyticsBridge />
            </body>
        </html>
    );
}
