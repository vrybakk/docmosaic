import { siteConfig } from '@/lib/metadata';

/**
 * Renders a `application/ld+json` script. Next streams `<script>` tags in the
 * body fine for SEO crawlers; keeping it a component avoids repeating the
 * `dangerouslySetInnerHTML` dance at every call site.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            // Schema.org payload is fully static / author-controlled - no user input.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

/** Publisher organization, referenced by the other entities via `@id`. */
export const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.org.name,
    url: siteConfig.org.url,
    sameAs: [siteConfig.githubUrl],
};

/** The docs site itself. */
export const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.docsName,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'en',
    publisher: { '@id': `${siteConfig.url}/#organization` },
};

/** The product the docs describe - a free, open-source developer tool. */
export const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    description: siteConfig.description,
    url: siteConfig.appUrl,
    softwareVersion: '1.0.0',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@id': `${siteConfig.url}/#organization` },
    isAccessibleForFree: true,
    license: 'https://opensource.org/licenses/MIT',
    codeRepository: siteConfig.githubUrl,
};

/** Per-article schema for a single docs page. */
export function articleSchema(input: {
    title: string;
    description?: string;
    url: string;
}): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: input.title,
        description: input.description,
        url: input.url,
        inLanguage: 'en',
        isPartOf: { '@id': `${siteConfig.url}/#website` },
        author: { '@id': `${siteConfig.url}/#organization` },
        publisher: { '@id': `${siteConfig.url}/#organization` },
    };
}

/** Breadcrumb trail for a docs page. `crumbs` are ordered root → leaf. */
export function breadcrumbSchema(crumbs: { name: string; url: string }[]): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url,
        })),
    };
}
