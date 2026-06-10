import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

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
                url: 'https://storybook.docmosaic.com',
                external: true,
            },
            {
                text: 'App',
                url: 'https://docmosaic.com/pdf-editor',
                external: true,
            },
        ],
        githubUrl: 'https://github.com/vrybakk/docmosaic',
    };
}
