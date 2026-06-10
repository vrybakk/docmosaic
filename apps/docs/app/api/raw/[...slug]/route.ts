import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

interface RouteContext {
    params: Promise<{ slug: string[] }>;
}

/**
 * Serves the raw `.mdx` source for a docs page. Used by the
 * "Copy as Markdown" button on each page.
 */
export async function GET(_req: Request, context: RouteContext) {
    const { slug } = await context.params;
    const safe = slug.map((s) => s.replace(/[^a-zA-Z0-9_\-]/g, '')).join('/');
    const filePath = path.join(process.cwd(), 'content', `${safe}.mdx`);

    try {
        const body = await readFile(filePath, 'utf-8');
        return new NextResponse(body, {
            headers: { 'content-type': 'text/markdown; charset=utf-8' },
        });
    } catch {
        return new NextResponse('Not found', { status: 404 });
    }
}
