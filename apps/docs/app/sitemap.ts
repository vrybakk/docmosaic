import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { absoluteUrl, siteConfig } from '@/lib/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    const docs: MetadataRoute.Sitemap = source.getPages().map((page) => ({
        url: absoluteUrl(page.url),
        lastModified,
        changeFrequency: 'weekly',
        priority: page.url === '/docs/get-started/introduction' ? 0.9 : 0.7,
    }));

    return [{ url: siteConfig.url, lastModified, changeFrequency: 'weekly', priority: 1 }, ...docs];
}
