import { SITE_URL } from '@/i18n/seo';
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/private/'],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
