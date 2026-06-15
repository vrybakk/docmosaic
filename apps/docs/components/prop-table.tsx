import type { ReactNode } from 'react';
import propsData from '@/generated/props.json';

/** Render a string with `` `inline code` `` spans wrapped in `<code>`. */
function renderInline(text: string): ReactNode[] {
    return text
        .split(/(`[^`]+`)/g)
        .filter(Boolean)
        .map((part, i) =>
            part.length > 1 && part.startsWith('`') && part.endsWith('`') ? (
                <code
                    key={i}
                    className="rounded border border-fd-border bg-fd-secondary px-1 py-0.5 font-mono text-[0.8em]"
                >
                    {part.slice(1, -1)}
                </code>
            ) : (
                <span key={i}>{part}</span>
            ),
        );
}

/**
 * Render a cleaned JSDoc summary: inline code spans become `<code>`, and a
 * collapsed `" - "` bullet list (common in multi-case prop docs) becomes a
 * real `<ul>`.
 */
function Description({ text }: { text: string }) {
    if (!text) return <span className="text-fd-muted-foreground">-</span>;

    const parts = text.split(/\s+-\s+/);
    if (parts.length > 1) {
        const [intro, ...items] = parts;
        return (
            <div className="space-y-2">
                {intro.trim() && <p>{renderInline(intro.trim())}</p>}
                <ul className="list-disc space-y-1 pl-4 marker:text-fd-muted-foreground">
                    {items.map((item, i) => (
                        <li key={i}>{renderInline(item.trim())}</li>
                    ))}
                </ul>
            </div>
        );
    }
    return <p>{renderInline(text)}</p>;
}

interface PropEntry {
    name: string;
    type: string;
    required: boolean;
    defaultValue: string | null;
    description: string;
}

interface PropTableProps {
    /** Component display name as captured by `react-docgen-typescript`, e.g. `"Root"`. */
    name: string;
    /** Override entries when auto-gen falls short. */
    rows?: PropEntry[];
}

/**
 * Per-primitive prop table. Reads from `content/primitives/_props.json` (the
 * auto-generated artifact produced by `scripts/generate-prop-tables.ts`) or
 * accepts explicit `rows` for hand-written cases.
 */
export function PropTable({ name, rows }: PropTableProps) {
    const data = (propsData as Record<string, PropEntry[]>)[name];
    const entries = rows ?? data ?? [];

    if (entries.length === 0) {
        return (
            <div className="my-4 rounded-md border border-fd-border bg-fd-card p-4 text-sm text-fd-muted-foreground">
                No props documented yet for <code>{name}</code>. Run
                <code className="mx-1">bun run generate:props</code> or pass <code>rows</code>{' '}
                explicitly.
            </div>
        );
    }

    return (
        <div className="not-prose my-6 overflow-x-auto rounded-lg border border-fd-border">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-fd-secondary text-left text-xs uppercase tracking-wide text-fd-muted-foreground">
                    <tr>
                        <th className="px-4 py-2">Prop</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Default</th>
                        <th className="px-4 py-2">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((row) => (
                        <tr key={row.name} className="border-t border-fd-border align-top">
                            <td className="px-4 py-3 font-mono text-xs">
                                {row.name}
                                {row.required && <span className="text-fd-primary"> *</span>}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-fd-muted-foreground">
                                {row.type}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-fd-muted-foreground">
                                {row.defaultValue ?? '-'}
                            </td>
                            <td className="px-4 py-3 text-fd-foreground">
                                <Description text={row.description} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
