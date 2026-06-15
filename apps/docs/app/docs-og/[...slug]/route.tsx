import { generateOGImage } from 'fumadocs-ui/og';
import { notFound } from 'next/navigation';
import { source } from '@/lib/source';
import { siteConfig } from '@/lib/metadata';

/**
 * Per-page OpenGraph image. The catch-all slug ends with the literal
 * `image.png`; the preceding segments identify the docs page. Rendered on
 * demand and cached at the edge — rather than pre-rendering one image per page
 * at build time — to keep docs builds fast and avoid OOM on the OG render step.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const page = source.getPage(slug.slice(0, -1));
    if (!page) notFound();

    return generateOGImage({
        title: page.data.title,
        description: page.data.description,
        site: siteConfig.docsName,
        primaryColor: '#5b3a4d',
        primaryTextColor: '#fcde9c',
    });
}
