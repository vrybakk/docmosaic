import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
    title: {
        default: 'DocMosaic Docs',
        template: '%s | DocMosaic Docs',
    },
    description:
        'The headless PDF editor for the web. Open source. Open code. Compound React primitives + a framework-agnostic core.',
    metadataBase: new URL('https://docs.docmosaic.com'),
};

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="flex min-h-screen flex-col">
                <RootProvider>{children}</RootProvider>
            </body>
        </html>
    );
}
