import propsData from '@/generated/props.json';

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
        <div className="my-6 overflow-x-auto rounded-lg border border-fd-border">
            <table className="w-full text-sm">
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
                                {row.defaultValue ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-fd-foreground">{row.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
