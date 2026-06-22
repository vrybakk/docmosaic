import { SITE_URL } from '@/i18n/seo';

const DOCS_URL = 'https://docs.docmosaic.com';
const GITHUB_URL = 'https://github.com/vrybakk/docmosaic';
const STORYBOOK_URL = 'https://storybook.docmosaic.com';

/**
 * `llms.txt` for the marketing site (https://docmosaic.com). A concise,
 * machine-readable overview of the product plus links to the deeper docs
 * `llms.txt`/`llms-full.txt`. Follows the llms.txt convention (llmstxt.org).
 *
 * Lives outside `[locale]` so the next-intl middleware leaves it alone (its
 * matcher skips any path containing a dot).
 */
const CONTENT = `# DocMosaic

> Free, open-source, fully client-side visual PDF builder. Arrange images, text, shapes, drawings, and frames into clean PDFs right in the browser - no sign-up, no uploads, no server. Also a headless React library (@docmosaic/core + @docmosaic/react) to embed a PDF editor in your own app.

DocMosaic runs entirely in the browser: files never leave the device. The document model lives in React state and renders to a PDF client-side via jsPDF. It is available both as a hosted editor and as two npm packages for developers.

## Product
- [Home](${SITE_URL}/): what DocMosaic is and who it is for
- [PDF Editor](${SITE_URL}/pdf-editor): the free in-browser editor - drop in images, arrange them on a virtual page, export a PDF

## Documentation
- [Documentation](${DOCS_URL}/): primitives, hooks, concepts, recipes, and API reference
- [Docs llms.txt](${DOCS_URL}/llms.txt): machine-readable index of the full documentation
- [Docs llms-full.txt](${DOCS_URL}/llms-full.txt): the entire documentation as a single Markdown file

## For developers
- [@docmosaic/react on npm](https://www.npmjs.com/package/@docmosaic/react): compound Editor.* primitives + the headless useDocumentState hook
- [@docmosaic/core on npm](https://www.npmjs.com/package/@docmosaic/core): framework-agnostic document model, history, and the jsPDF pipeline
- [GitHub](${GITHUB_URL}): source code, issues, and contributions
- [Storybook](${STORYBOOK_URL}): interactive component playground

## Who it is for
- Expats & officials: arrange scanned IDs, passports, and visa documents into compliant PDFs
- Businesses & admins: assemble contracts, reports, and internal documents without heavy software
- Freelancers & designers: build image-heavy proposals, portfolios, and print-ready layouts
- Teachers & students: merge, annotate, and reorder images and scans for assignments

## Key facts
- 100% client-side: no backend, no uploads, no account required
- Free and open source (MIT)
- Works on desktop and mobile
- Self-hostable
`;

export function GET() {
    return new Response(CONTENT, {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
}
