'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface CopyPageButtonProps {
    /** Slug of the page relative to /docs, e.g. `get-started/introduction`. */
    slug: string;
}

/**
 * Copies the raw MDX source of the current page to the clipboard. Pages
 * include `<CopyPageButton slug="..." />` at the top.
 */
export function CopyPageButton({ slug }: CopyPageButtonProps) {
    const [copied, setCopied] = useState(false);

    async function handleClick() {
        try {
            const res = await fetch(`/api/raw/${slug}`);
            if (!res.ok) throw new Error(`Failed to fetch raw: ${res.status}`);
            const text = await res.text();
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('CopyPageButton:', err);
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-2.5 py-1 text-xs text-fd-foreground transition-colors hover:bg-fd-accent"
        >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy as Markdown'}
        </button>
    );
}
