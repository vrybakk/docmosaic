import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    output: 'standalone',
    outputFileTracingRoot: path.join(path.dirname(fileURLToPath(import.meta.url)), '../..'),
    transpilePackages: ['@docmosaic/react', '@docmosaic/core'],
    // Serve every doc page as clean Markdown at `/docs/<slug>.md` for LLMs and
    // the "Copy as Markdown" workflow. The handler lives under `/api/content`.
    async rewrites() {
        return [{ source: '/docs/:path*.md', destination: '/api/content/:path*' }];
    },
};

const withMDX = createMDX();

export default withMDX(config);
