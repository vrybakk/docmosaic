import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { source } from '@/lib/source';
import { absoluteUrl, siteConfig } from '@/lib/metadata';

/**
 * LLM-facing exports for the docs site: the `llms.txt` index, the
 * `llms-full.txt` dump, and per-page Markdown. Built on the same on-disk MDX
 * read the "Copy as Markdown" button uses, because the pinned fumadocs-mdx
 * (v11) predates the `getText('processed')` API the official recipe relies on.
 */

type DocPage = ReturnType<typeof source.getPages>[number];

/** Ordered top-level sections, mirroring the nav order in `content/meta.json`. */
const SECTIONS: { slug: string; label: string }[] = [
    { slug: 'get-started', label: 'Getting Started' },
    { slug: 'concepts', label: 'Concepts' },
    { slug: 'primitives', label: 'Primitives' },
    { slug: 'recipes', label: 'Recipes' },
    { slug: 'reference', label: 'API Reference' },
    { slug: 'examples', label: 'Examples' },
    { slug: 'migration', label: 'Migration' },
];

/** Heading for pages that live at the docs root (e.g. theming, changelog). */
const OTHER_LABEL = 'More';

interface TreeNode {
    type: string;
    url?: string;
    index?: { url?: string };
    children?: TreeNode[];
}

/** Collect page URLs from the page tree in navigation (meta.json) order. */
function flattenTree(nodes: TreeNode[], urls: string[] = []): string[] {
    for (const node of nodes) {
        if (node.type === 'page' && node.url) urls.push(node.url);
        if (node.type === 'folder') {
            if (node.index?.url) urls.push(node.index.url);
            if (node.children) flattenTree(node.children, urls);
        }
    }
    return urls;
}

/** All pages in nav order; any page missing from the tree is appended. */
export function orderedPages(): DocPage[] {
    const pages = source.getPages();
    const byUrl = new Map(pages.map((page) => [page.url, page]));
    const ordered = flattenTree((source.pageTree.children ?? []) as TreeNode[])
        .map((url) => byUrl.get(url))
        .filter((page): page is DocPage => Boolean(page));

    const seen = new Set(ordered.map((page) => page.url));
    for (const page of pages) if (!seen.has(page.url)) ordered.push(page);
    return ordered;
}

/** Strip the leading YAML frontmatter block from raw MDX. */
function stripFrontmatter(raw: string): string {
    return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n*/, '').trim();
}

/**
 * Read a page's MDX body from disk. Handles both `foo.mdx` and folder index
 * pages `foo/index.mdx`. Returns null when no source file matches.
 */
async function readPageBody(slugs: string[]): Promise<string | null> {
    const safe = slugs.map((slug) => slug.replace(/[^a-zA-Z0-9_-]/g, ''));
    const base = path.join(process.cwd(), 'content', ...safe);
    for (const candidate of [`${base}.mdx`, path.join(base, 'index.mdx')]) {
        try {
            return stripFrontmatter(await readFile(candidate, 'utf-8'));
        } catch {
            // not this candidate — try the next
        }
    }
    return null;
}

/** Absolute Markdown URL for a page, e.g. `…/docs/get-started/introduction.md`. */
export function markdownUrl(page: DocPage): string {
    return absoluteUrl(`${page.url}.md`);
}

/** Full LLM text for one page: title, summary, canonical source, then body. */
export async function pageToLLMText(page: DocPage): Promise<string | null> {
    const body = await readPageBody(page.slugs);
    if (body === null) return null;

    const parts = [`# ${page.data.title}`];
    if (page.data.description) parts.push(`> ${page.data.description}`);
    parts.push(`Source: ${absoluteUrl(page.url)}`);
    return `${parts.join('\n\n')}\n\n${body}\n`;
}

function linkLine(page: DocPage): string {
    const description = page.data.description ? `: ${page.data.description}` : '';
    return `- [${page.data.title}](${markdownUrl(page)})${description}`;
}

/** Build the `llms.txt` index: H1, summary, then grouped links per section. */
export function buildLlmsIndex(): string {
    const pages = orderedPages();
    const bySection = new Map<string, DocPage[]>();
    const other: DocPage[] = [];

    for (const page of pages) {
        const section = SECTIONS.find((entry) => entry.slug === page.slugs[0]);
        if (section) {
            const list = bySection.get(section.slug) ?? [];
            list.push(page);
            bySection.set(section.slug, list);
        } else {
            other.push(page);
        }
    }

    const blocks = [
        `# ${siteConfig.docsName}`,
        `> ${siteConfig.description}`,
        `Each link below points to a Markdown version of the page. The full documentation is also available as a single file at ${absoluteUrl('/llms-full.txt')}. This file follows the llms.txt convention (https://llmstxt.org).`,
    ];

    for (const section of SECTIONS) {
        const list = bySection.get(section.slug);
        if (!list?.length) continue;
        blocks.push(`## ${section.label}`, list.map(linkLine).join('\n'));
    }

    if (other.length) {
        blocks.push(`## ${OTHER_LABEL}`, other.map(linkLine).join('\n'));
    }

    blocks.push(
        '## Links',
        [
            `- [DocMosaic app](${siteConfig.appUrl}): the hosted visual PDF editor`,
            `- [GitHub](${siteConfig.githubUrl}): source code and issues`,
            '- [@docmosaic/react on npm](https://www.npmjs.com/package/@docmosaic/react): compound Editor.* primitives + the headless useDocumentState hook',
            '- [@docmosaic/core on npm](https://www.npmjs.com/package/@docmosaic/core): framework-agnostic document model, history, and the jsPDF pipeline',
            `- [Storybook](${siteConfig.storybookUrl}): interactive component playground`,
        ].join('\n'),
    );

    return `${blocks.join('\n\n')}\n`;
}

/** Build `llms-full.txt`: a banner followed by every page in nav order. */
export async function buildLlmsFull(): Promise<string> {
    const texts = await Promise.all(orderedPages().map(pageToLLMText));
    const body = texts.filter((text): text is string => text !== null).join('\n\n---\n\n');
    const header = `# ${siteConfig.docsName}: Full Documentation\n\n> ${siteConfig.description}`;
    return `${header}\n\n---\n\n${body}\n`;
}
