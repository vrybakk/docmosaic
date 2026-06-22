import { source } from '@/lib/source';
import { pageToLLMText } from '@/lib/llms';
import { notFound } from 'next/navigation';

interface RouteContext {
    params: Promise<{ slug?: string[] }>;
}

// Static: one Markdown file per page, regenerated at build time. Reached via the
// `/docs/<slug>.md` rewrite in `next.config.mjs` so each doc page has a clean,
// LLM-friendly Markdown URL.
export const revalidate = false;

export async function GET(_req: Request, context: RouteContext) {
    const { slug } = await context.params;
    const page = source.getPage(slug);
    if (!page) notFound();

    const text = await pageToLLMText(page);
    if (text === null) notFound();

    return new Response(text, {
        // Plain text so `/docs/<slug>.md` renders in the browser (the
        // "View as Markdown" link) instead of triggering a download.
        headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
}

export function generateStaticParams() {
    return source.generateParams();
}
