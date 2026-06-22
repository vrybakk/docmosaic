'use client';

import { Check, Copy, FileText } from 'lucide-react';
import { useState } from 'react';

interface MarkdownActionsProps {
    /** Slug of the page relative to /docs, e.g. `get-started/introduction`. */
    slug: string;
}

const actionClass =
    'inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-2.5 py-1 text-xs text-fd-foreground transition-colors hover:bg-fd-accent';

/**
 * "Copy as Markdown" + "View as Markdown" for the current doc page. Both point
 * at the page's clean Markdown export at `/docs/<slug>.md` - the same source an
 * LLM gets from `llms.txt`.
 */
export function MarkdownActions({ slug }: MarkdownActionsProps) {
    const [copied, setCopied] = useState(false);
    const href = `/docs/${slug}.md`;

    async function handleCopy() {
        try {
            const res = await fetch(href);
            if (!res.ok) throw new Error(`Failed to fetch markdown: ${res.status}`);
            await navigator.clipboard.writeText(await res.text());
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('MarkdownActions:', err);
        }
    }

    return (
        <div className="mb-6 flex items-center gap-2">
            <button type="button" onClick={handleCopy} className={actionClass}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied' : 'Copy as Markdown'}
            </button>
            <a href={href} target="_blank" rel="noreferrer" className={actionClass}>
                <FileText className="size-3.5" />
                View as Markdown
            </a>
        </div>
    );
}
