import Header from '@/components/layout/header';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import { Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import Script from 'next/script';
import type React from 'react';
import './globals.css';

const montserrat = Montserrat({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-montserrat',
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: '#381D2A',
};

export const metadata = {
    metadataBase: new URL('https://docmosaic.com'),
    title: {
        default: 'DocMosaic - Free Open Source Tool for Visual PDF Creation',
        template: '%s | DocMosaic',
    },
    description:
        'Free and open source tool for creating structured PDF documents with arranged images. Create beautiful PDFs by arranging images like a mosaic. Perfect for ID documents, photo collections, and business documents.',
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
        canonical: '/',
        languages: {
            'en-US': '/',
            // 'es-ES': '/es',
            // 'uk-UA': '/uk',
        },
    },
    openGraph: {
        title: 'DocMosaic - Visual PDF Creation Tool',
        description:
            'Create beautiful PDFs by arranging images like a mosaic. Free and open source.',
        url: 'https://docmosaic.com',
        siteName: 'DocMosaic',
        locale: 'en_US',
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
        title: 'DocMosaic - Visual PDF Creation Tool',
        description:
            'Create beautiful PDFs by arranging images like a mosaic. Free and open source.',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
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
                <meta property="og:locale" content="en_US" />
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
                    content="DocMosaic - Visual PDF Creation Tool (1280x720)"
                />
                <meta
                    property="og:image:alt"
                    content="DocMosaic - Visual PDF Creation Tool (640x480)"
                />
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

                <Header />
                {children}
                <Analytics />
            </body>
        </html>
    );
}
