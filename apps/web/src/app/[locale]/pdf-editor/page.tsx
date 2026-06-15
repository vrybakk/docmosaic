import Loader from '@/components/ui/data-display/loader';
import { type Locale } from '@/i18n/routing';
import { hreflangAlternates, localeUrl, ogLocale } from '@/i18n/seo';
import { Metadata, Viewport } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { EditorMount } from './editor-mount';

// Define viewport metadata
// The editor implements its own pinch-zoom and pan on the canvas, so browser
// page-zoom is disabled here to keep the two from fighting; `viewport-fit` lets
// the canvas extend under device notches.
export const viewport: Viewport = {
    themeColor: '#381D2A',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale: locale as Locale, namespace: 'PdfEditor' });
    const url = localeUrl(locale as Locale, '/pdf-editor');

    return {
        // The locale layout's title template appends " | DocMosaic".
        title: t('title'),
        description: t('description'),
        applicationName: 'DocMosaic PDF Editor',
        authors: [{ name: 'nerd-stud.io', url: 'https://nerd-stud.io' }],
        generator: 'Next.js',
        keywords: [
            'pdf editor',
            'image arrangement',
            'document creation',
            'online pdf tool',
            'free pdf editor',
            'document mosaic',
            'visual pdf creator',
        ],
        referrer: 'origin-when-cross-origin',
        creator: 'nerd-stud.io',
        publisher: 'DocMosaic',
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        category: 'productivity',
        openGraph: {
            title: t('ogTitle'),
            description: t('ogDescription'),
            url,
            siteName: 'DocMosaic',
            images: [
                {
                    url: '/pdf-editor-preview.png',
                    width: 1200,
                    height: 630,
                    alt: 'DocMosaic PDF Editor Interface',
                },
            ],
            locale: ogLocale[locale as Locale],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('ogDescription'),
            images: ['/pdf-editor-preview.png'],
            creator: '@nerdstudio',
        },
        alternates: {
            canonical: url,
            languages: hreflangAlternates('/pdf-editor'),
        },
    };
}

export default async function PDFEditorPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'DocMosaic PDF Editor',
        headline: 'Free Online PDF Editor for Image Arrangement',
        description:
            'Create, edit, and arrange images in PDF documents with our intuitive visual editor. Perfect for ID documents, photo collections, and business documents.',
        applicationCategory: 'DocumentEditor',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        url: 'https://docmosaic.com/pdf-editor',
        image: 'https://docmosaic.com/pdf-editor-preview.png',
        screenshot: 'https://docmosaic.com/pdf-editor-preview.png',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
        },
        featureList: [
            'Drag and Drop Interface',
            'Image Upload and Arrangement',
            'Multiple Page Support',
            'PDF Export',
            'Browser-based Processing',
            'Privacy-focused - No Server Upload',
        ],
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
        publisher: {
            '@type': 'Organization',
            name: 'DocMosaic',
            url: 'https://docmosaic.com',
        },
        keywords: [
            'pdf editor',
            'image arrangement',
            'document creation',
            'online pdf tool',
            'free pdf editor',
        ],
        inLanguage: locale,
        isAccessibleForFree: true,
        license: 'https://opensource.org/licenses/MIT',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': 'https://docmosaic.com/pdf-editor',
        },
        accessibilityFeature: [
            'highContrastDisplay',
            'readingOrder',
            'structuralNavigation',
            'tableOfContents',
            'alternativeText',
        ],
        accessibilityHazard: 'none',
        accessMode: ['visual', 'textual'],
    };

    return (
        <main className="h-screen overflow-hidden">
            {/* Add JSON-LD structured data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Add descriptive heading for accessibility */}
            <h1 className="sr-only">DocMosaic PDF Editor - Create and Edit PDFs Online</h1>

            {/* Main editor component */}
            <Suspense
                fallback={
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader />
                        <span className="sr-only">Loading PDF Editor...</span>
                    </div>
                }
            >
                <EditorMount />
            </Suspense>
        </main>
    );
}
