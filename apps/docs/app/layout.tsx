import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { siteConfig } from '@/lib/metadata';
import { JsonLd, organizationSchema, websiteSchema } from '@/components/structured-data';
import './global.css';

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: `${siteConfig.docsName} — Headless PDF editor for React`,
        template: `%s | ${siteConfig.docsName}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.docsName,
    keywords: [...siteConfig.keywords],
    authors: [siteConfig.org],
    creator: siteConfig.org.name,
    publisher: siteConfig.name,
    category: 'technology',
    formatDetection: { email: false, address: false, telephone: false },
    alternates: { canonical: '/' },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: siteConfig.url,
        siteName: siteConfig.docsName,
        title: `${siteConfig.docsName} — Headless PDF editor for React`,
        description: siteConfig.description,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1080,
                height: 700,
                alt: `${siteConfig.docsName} — Headless PDF editor for React`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: siteConfig.twitter,
        creator: siteConfig.twitter,
        title: `${siteConfig.docsName} — Headless PDF editor for React`,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
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
    other: {
        'msapplication-TileColor': siteConfig.themeColor,
        'msapplication-config': '/browserconfig.xml',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: siteConfig.themeColor },
    ],
};

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://www.googletagmanager.com" />
                <JsonLd data={websiteSchema} />
                <JsonLd data={organizationSchema} />
            </head>
            <body className="flex min-h-screen flex-col">
                <RootProvider>{children}</RootProvider>

                <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaId}`}
                    strategy="afterInteractive"
                />
                <Script id="ga-init" strategy="afterInteractive">
                    {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${siteConfig.gaId}');`}
                </Script>
            </body>
        </html>
    );
}
