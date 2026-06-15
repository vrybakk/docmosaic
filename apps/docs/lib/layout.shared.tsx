import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { externalLinks, siteConfig } from '@/lib/metadata';

/**
 * Shared layout options for the docs site. Used by both the docs and home layouts
 * so the nav stays consistent across the site.
 */
export function baseOptions(): BaseLayoutProps {
    return {
        nav: {
            title: (
                <>
                    <span className="font-semibold tracking-tight">DocMosaic</span>
                    <span className="ml-1 text-xs text-fd-muted-foreground">docs</span>
                </>
            ),
            url: '/',
        },
        links: [
            {
                text: 'Docs',
                url: '/docs/get-started/introduction',
                active: 'nested-url',
            },
            {
                text: 'Storybook',
                url: externalLinks.storybook,
                external: true,
            },
            {
                text: 'App',
                url: `${externalLinks.app}/pdf-editor`,
                external: true,
            },
        ],
        githubUrl: siteConfig.githubUrl,
    };
}
