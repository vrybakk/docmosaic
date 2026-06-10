interface StorybookEmbedProps {
    /** Storybook story id, e.g. `editor-root--default`. */
    id: string;
    /** Optional iframe height in pixels. Defaults to 480. */
    height?: number;
    /** Override the base Storybook URL. */
    base?: string;
}

/**
 * Embed a live Storybook story as an iframe. The base URL defaults to the
 * deployed Storybook at `https://storybook.docmosaic.com`; in local dev pass
 * `base="http://localhost:6006"`.
 */
export function StorybookEmbed({
    id,
    height = 480,
    base = 'https://storybook.docmosaic.com',
}: StorybookEmbedProps) {
    const src = `${base}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`;
    return (
        <div className="my-6 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
            <iframe
                src={src}
                title={`Storybook: ${id}`}
                width="100%"
                height={height}
                loading="lazy"
                className="block w-full"
            />
        </div>
    );
}
