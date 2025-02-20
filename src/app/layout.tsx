import Header from '@/components/Header';
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
    metadataBase: new URL('https://docmosaic.vercel.app'),
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
        url: 'https://docmosaic.vercel.app',
        siteName: 'DocMosaic',
        locale: 'en_US',
        type: 'website',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'DocMosaic - Visual PDF Creation Tool',
            },
            {
                url: '/og-image-square.png',
                width: 600,
                height: 600,
                alt: 'DocMosaic - Visual PDF Creation Tool',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DocMosaic - Visual PDF Creation Tool',
        description:
            'Create beautiful PDFs by arranging images like a mosaic. Free and open source.',
        creator: '@nerdstudio',
        images: ['/twitter-image.png'],
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
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" href="/icon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />
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
                                url: 'https://docmosaic.vercel.app/screenshot-1.png',
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
                <Header />
                {children}
                <Analytics />
            </body>
        </html>
    );
}
