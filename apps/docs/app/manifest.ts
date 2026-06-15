import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/metadata';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: siteConfig.docsName,
        short_name: 'DocMosaic Docs',
        description: siteConfig.description,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: siteConfig.themeColor,
        categories: ['developer', 'productivity', 'utilities'],
        icons: [
            {
                src: '/seo/manifest-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/seo/manifest-512x-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/seo/manifest-512x-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}
