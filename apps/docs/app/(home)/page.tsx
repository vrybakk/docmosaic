import Link from 'next/link';
import { ArrowRight, Code2, Github, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';
import { JsonLd, softwareApplicationSchema } from '@/components/structured-data';

export const metadata: Metadata = createMetadata({ path: '/' });

export default function HomePage() {
    return (
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-16 md:py-24">
            <JsonLd data={softwareApplicationSchema} />
            <section className="flex flex-col gap-6">
                <Link
                    href="/docs/migration/v1"
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent"
                >
                    <Sparkles className="size-3.5" />
                    <span>v1.0 — see migration guide</span>
                </Link>
                <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
                    The headless PDF editor for the web.
                </h1>
                <p className="text-balance text-lg text-fd-muted-foreground md:text-xl">
                    Open source. Open code. Compound React primitives on top of a framework-agnostic
                    core — drop in the default shell or assemble your own UI.
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                    <Link
                        href="/docs/get-started/introduction"
                        className="inline-flex items-center gap-2 rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-colors hover:opacity-90"
                    >
                        Get started
                        <ArrowRight className="size-4" />
                    </Link>
                    <Link
                        href="/docs/primitives/root"
                        className="inline-flex items-center gap-2 rounded-md border border-fd-border bg-fd-card px-4 py-2 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
                    >
                        <Code2 className="size-4" />
                        Primitives
                    </Link>
                    <a
                        href="https://github.com/vrybakk/docmosaic"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-fd-border bg-fd-card px-4 py-2 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
                    >
                        <Github className="size-4" />
                        GitHub
                    </a>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <Feature
                    title="Compound primitives"
                    body="A flat Editor.* namespace — Root, Canvas, Section, Toolbar, Properties — that snaps together with no prop drilling."
                />
                <Feature
                    title="Framework-agnostic core"
                    body="Document model, reducer, history timeline, and the jspdf pipeline live in @docmosaic/core. Bring your own UI."
                />
                <Feature
                    title="Fully client-side"
                    body="No backend, no uploads. The entire document model lives in React state — privacy is the default."
                />
            </section>

            <section className="flex flex-col gap-3 rounded-lg border border-fd-border bg-fd-card p-6">
                <h2 className="text-sm font-medium text-fd-muted-foreground">Install</h2>
                <pre className="overflow-x-auto rounded-md bg-fd-secondary px-4 py-3 text-sm">
                    <code>{`bun add @docmosaic/react @docmosaic/core`}</code>
                </pre>
            </section>
        </main>
    );
}

function Feature({ title, body }: { title: string; body: string }) {
    return (
        <div className="flex flex-col gap-2 rounded-lg border border-fd-border bg-fd-card p-5">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-fd-muted-foreground">{body}</p>
        </div>
    );
}
