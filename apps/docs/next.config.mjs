import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    transpilePackages: ['@docmosaic/react', '@docmosaic/core'],
    // Serve every doc page as clean Markdown at `/docs/<slug>.md` for LLMs and
    // the "Copy as Markdown" workflow. The handler lives under `/api/content`.
    async rewrites() {
        return [{ source: '/docs/:path*.md', destination: '/api/content/:path*' }];
    },
};

const withMDX = createMDX();

export default withMDX(config);
