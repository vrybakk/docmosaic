import { externalLinks } from '@/lib/metadata';

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
 * deployed Storybook in production and `http://localhost:6006` in local dev
 * (see {@link externalLinks}); pass `base` to override.
 */
export function StorybookEmbed({
    id,
    height = 480,
    base = externalLinks.storybook,
}: StorybookEmbedProps) {
    // `v` busts browsers that cached the old permanent (301) redirect from when
    // Storybook was served with `cleanUrls` on (`iframe.html` -> `/iframe`, which
    // now 404s). Bump it if that ever recurs.
    const src = `${base}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&v=2`;
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
