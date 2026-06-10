import Link from 'next/link';

export interface ExampleCard {
    /** Slug of the example .mdx — used to build the link. */
    slug: string;
    /** Card title (matches the page `title`). */
    title: string;
    /** One-sentence description. */
    description: string;
    /** Tag chips rendered under the title. */
    tags?: ReadonlyArray<string>;
}

interface ExamplesGridProps {
    items: ReadonlyArray<ExampleCard>;
}

/**
 * Card grid for the /examples landing page. Each card links to its example
 * page. Uses Fumadocs' semantic tokens (`fd-*`) so it follows the active
 * theme — light or dark — without extra wiring.
 */
export function ExamplesGrid({ items }: ExamplesGridProps) {
    return (
        <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
                <Link
                    key={item.slug}
                    href={`/docs/examples/${item.slug}`}
                    className="group flex flex-col gap-2 rounded-lg border border-fd-border bg-fd-card p-4 no-underline transition-colors hover:border-fd-primary hover:bg-fd-accent"
                >
                    <h3 className="m-0 text-base font-semibold text-fd-card-foreground group-hover:text-fd-accent-foreground">
                        {item.title}
                    </h3>
                    <p className="m-0 text-sm text-fd-muted-foreground">{item.description}</p>
                    {item.tags && item.tags.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                            {item.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full border border-fd-border bg-fd-secondary px-2 py-0.5 text-xs text-fd-secondary-foreground"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </Link>
            ))}
        </div>
    );
}
