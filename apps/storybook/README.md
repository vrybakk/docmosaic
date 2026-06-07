# @docmosaic/storybook

Storybook for `@docmosaic/react` primitives.

## Develop

```sh
bun run storybook
# or, from this directory:
bun dev
```

Boots Storybook on http://localhost:6006.

## Build

```sh
bun run build --filter=@docmosaic/storybook
# or, from this directory:
bun run build
```

Produces a static site in `apps/storybook/storybook-static/` ready to be
served by any static host.

## Deploy

`storybook-static/` is a plain static dir — host it on Vercel, Netlify,
GitHub Pages, Cloudflare Pages, or any static host.

Example: deploy to a per-PR preview on Vercel by adding a
`vercel.json` that points the framework at `storybook-static/`, or just
push to a branch with Vercel's auto-detection.

```sh
# Local preview of the static build:
bunx serve apps/storybook/storybook-static
```

## Layout

- `.storybook/main.ts` — framework + addons + autodocs config.
- `.storybook/preview.tsx` — global decorators (DnD provider, theme
  switcher) and parameters.
- `src/stories/*.stories.tsx` — one file per primitive group.
- `src/docs/*.mdx` — long-form documentation pages.
- `src/helpers/` — shared sample documents and mock backends.
