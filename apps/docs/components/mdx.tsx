import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { PropTable } from './prop-table';
import { StorybookEmbed } from './storybook-embed';
import { ExamplesGrid } from './examples-grid';

/**
 * Register custom MDX components alongside Fumadocs defaults.
 *
 * - `PropTable` - renders auto-generated prop tables from `_props.json`.
 * - `StorybookEmbed` - iframe to a Storybook story (live primitive preview).
 * - `ExamplesGrid` - card grid for the /examples landing page.
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
    return {
        ...defaultMdxComponents,
        PropTable,
        StorybookEmbed,
        ExamplesGrid,
        ...components,
    };
}
