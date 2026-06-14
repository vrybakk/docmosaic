import type { Metadata } from 'next';

/**
 * Single source of truth for site-wide SEO facts. Mirrors the brand surface
 * defined by the marketing site (`apps/web`) so the two properties stay in
 * sync: same theme color, same org, same social handles.
 */
export const siteConfig = {
    name: 'DocMosaic',
    docsName: 'DocMosaic Docs',
    url: 'https://docs.docmosaic.com',
    appUrl: 'https://docmosaic.com',
    storybookUrl: 'https://storybook.docmosaic.com',
    githubUrl: 'https://github.com/vrybakk/docmosaic',
    description:
        'Headless PDF editor for the web. A framework-agnostic core plus compound React primitives for building PDFs entirely client-side - open source, no backend, no uploads.',
    ogImage: '/seo/og-image.png',
    twitter: '@nerdstudio',
    gaId: 'G-9GLFL0DT7W',
    themeColor: '#381D2A',
    keywords: [
        'react pdf editor',
        'headless pdf editor',
        'pdf builder react',
        'client-side pdf generation',
        'jspdf',
        'react pdf library',
        'compound components',
        'document editor sdk',
        'open source pdf tool',
        'pdf primitives',
        'framework-agnostic pdf',
        'docmosaic',
    ],
    org: { name: 'nerd-stud.io', url: 'https://nerd-stud.io' },
} as const;

/**
 * Cross-property links for the docs nav and Storybook embeds. In local dev
 * they point at the sibling dev servers (Storybook on :6006, the app on :4001)
 * so you can click through to what's running on your machine; in production
 * they point at the deployed sites. Override the ports with `NEXT_PUBLIC_*` if
 * your local setup differs.
 *
 * Canonical/OpenGraph URLs are deliberately NOT affected - those always use the
 * production origin so SEO stays correct in preview and local builds.
 */
const isDev = process.env.NODE_ENV === 'development';

export const externalLinks = {
    storybook:
        process.env.NEXT_PUBLIC_STORYBOOK_URL ??
        (isDev ? 'http://localhost:6006' : siteConfig.storybookUrl),
    app: process.env.NEXT_PUBLIC_APP_URL ?? (isDev ? 'http://localhost:4001' : siteConfig.appUrl),
} as const;

/** Resolve an app-relative path to an absolute URL on the docs origin. */
export function absoluteUrl(path = '/'): string {
    return new URL(path, siteConfig.url).toString();
}

/** Per-page dynamic OpenGraph image route (rendered by `app/docs-og`). */
export function ogImageUrl(slugs: string[]): string {
    return `/docs-og/${slugs.join('/')}/image.png`;
}

interface CreateMetadataInput {
    title?: string;
    description?: string;
    /** Canonical path, e.g. `/docs/get-started/introduction`. */
    path?: string;
    /** OpenGraph/Twitter image. Defaults to the static brand card. */
    image?: { url: string; width: number; height: number };
    type?: 'website' | 'article';
}

const DEFAULT_OG_IMAGE = { url: siteConfig.ogImage, width: 1080, height: 700 };

/**
 * Build a page-level {@link Metadata} object with canonical URL, OpenGraph,
 * and Twitter cards pre-wired. Root-level defaults (title template, robots,
 * icons, manifest) live in the root layout and merge automatically.
 */
export function createMetadata(input: CreateMetadataInput = {}): Metadata {
    const {
        title,
        description = siteConfig.description,
        path = '/',
        image = DEFAULT_OG_IMAGE,
        type = 'website',
    } = input;

    const url = absoluteUrl(path);
    const resolvedTitle = title ?? siteConfig.docsName;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            title: resolvedTitle,
            description,
            url,
            siteName: siteConfig.docsName,
            locale: 'en_US',
            type,
            images: [
                { url: image.url, width: image.width, height: image.height, alt: resolvedTitle },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: resolvedTitle,
            description,
            site: siteConfig.twitter,
            creator: siteConfig.twitter,
            images: [image.url],
        },
    };
}
