import Header from '@/components/header';
import { Analytics } from '@vercel/analytics/next';
import { Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import type React from 'react';
import './globals.css';

const montserrat = Montserrat({
    subsets: ['latin', 'cyrillic'],
    variable: '--font-montserrat',
});

export const metadata = {
    title: {
        default: 'DocMosaic - Free Open Source Tool for Visual PDF Creation',
        template: '%s | DocMosaic',
    },
    description:
        'Free and open source tool for creating structured PDF documents with arranged images.',
    keywords: [
        'pdf creator',
        'document mosaic',
        'free pdf tool',
        'open source pdf',
        'visual document creator',
        'image arrangement',
        'id document scanner',
        'creador de pdf',
        'herramienta pdf gratuita',
        'створення pdf',
        'безкоштовний інструмент pdf',
    ],
    alternates: {
        languages: {
            'en-US': '/',
            'es-ES': '/es',
            'uk-UA': '/uk',
        },
    },
    openGraph: {
        title: 'DocMosaic - Visual PDF Creation Tool',
        description:
            'Create beautiful PDFs by arranging images like a mosaic. Free and open source.',
        type: 'website',
        url: 'https://docmosaic.vercel.app',
        images: [
            {
                url: 'https://docmosaic.vercel.app/og-image.png',
                width: 1200,
                height: 630,
                alt: 'DocMosaic Preview',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DocMosaic - Visual PDF Creation Tool',
        description:
            'Create beautiful PDFs by arranging images like a mosaic. Free and open source.',
        images: [
            {
                url: 'https://docmosaic.vercel.app/twitter-image.png',
                width: 1200,
                height: 630,
                alt: 'DocMosaic Preview',
            },
        ],
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#381D2A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} font-sans`}>
                <Header />
                {children}
                <Analytics />
            </body>
        </html>
    );
}
