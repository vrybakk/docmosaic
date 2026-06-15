/// <reference types="node" />
/// <reference types="bun-types" />

/**
 * AI translation generator — BYOK, pay-per-use (no SaaS subscription).
 *
 * Reads the English source catalog and (re)generates every target-locale
 * catalog with the Anthropic API. Run after editing `messages/en.json`:
 *
 *     ANTHROPIC_API_KEY=sk-ant-... bun run translate
 *
 * A full run costs a few cents on Haiku 4.5. This is the same "generate" step
 * that scales to the docs MDX (there, drive lingo.dev's `mdx` bucket instead so
 * code fences / JSX / frontmatter are preserved).
 */
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Keep in sync with `src/i18n/routing.ts`.
const SOURCE_LOCALE = 'en';
const TARGET_LOCALES = ['es', 'uk'];

const LOCALE_NAMES: Record<string, string> = {
    es: 'Spanish (Spain, European)',
    uk: 'Ukrainian',
};

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not configured');
    process.exit(1);
}

const messagesDir = join(import.meta.dir, '..', 'messages');
const source = readFileSync(join(messagesDir, `${SOURCE_LOCALE}.json`), 'utf-8');
const client = new Anthropic({ apiKey });

const systemPrompt = (language: string) =>
    [
        'You are a professional software localizer for a marketing website.',
        `Translate the VALUES of the given JSON message catalog into ${language}.`,
        'Rules:',
        '- Return ONLY the translated JSON: same structure, same keys, no commentary, no code fences.',
        '- Never translate or change the JSON keys.',
        '- Preserve inline tags EXACTLY: <caramel>…</caramel>, <orange>…</orange>, <strong>…</strong>. Translate only the text between them.',
        '- Preserve any {placeholder} tokens, URLs and punctuation/markup.',
        '- Do NOT translate brand/technical terms: DocMosaic, PDF, GitHub, React, @docmosaic/core, @docmosaic/react.',
        '- Use a natural, concise, friendly marketing tone.',
    ].join('\n');

for (const locale of TARGET_LOCALES) {
    const response = await client.messages.create({
        model: MODEL,
        max_tokens: 8192,
        system: systemPrompt(LOCALE_NAMES[locale] ?? locale),
        messages: [{ role: 'user', content: source }],
    });

    const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('')
        .trim();

    // Validate before writing so a malformed response never corrupts a catalog.
    const parsed = JSON.parse(text);
    writeFileSync(
        join(messagesDir, `${locale}.json`),
        `${JSON.stringify(parsed, null, 4)}\n`,
        'utf-8',
    );
    console.info(`✓ ${locale}.json`);
}
