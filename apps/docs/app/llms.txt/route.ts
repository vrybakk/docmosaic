import { buildLlmsIndex } from '@/lib/llms';

// Static: regenerated at build time from the MDX content.
export const revalidate = false;

export function GET() {
    return new Response(buildLlmsIndex(), {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
}
