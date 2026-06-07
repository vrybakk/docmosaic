# Theming

`@docmosaic/react` reads every accent color, radius, and shadow from CSS custom properties — `--editor-*` tokens you can override with a single stylesheet. The bundled brand theme is one consumer of that surface; your own theme is another. No JavaScript-side theme provider, no runtime config — just CSS.

## Mental model

The package ships its styles split into two layers so you can swap brand colors without reinventing the structural defaults:

- **`styles/base.css`** — brand-agnostic structural tokens. Section radius, section shadow. Lives at the bottom of every theme stack.
- **`styles/themes/docmosaic.css`** — the DocMosaic brand colors. Defines every `--editor-color-*` triplet.
- **`styles.css`** — convenience bundle that imports both, in order.

You pick one of three layering patterns at import time:

```text
1. Default DocMosaic look      →  import '@docmosaic/react/styles.css';
2. Custom theme on shared base →  import '@docmosaic/react/styles/base.css';
                                  import './my-theme.css';
3. Explicit DocMosaic theme    →  import '@docmosaic/react/styles/base.css';
                                  import '@docmosaic/react/styles/themes/docmosaic.css';
```

Pattern 3 is functionally identical to pattern 1 — it exists for cases where you want to opt the brand theme in or out conditionally (per-route, per-tenant, per-experiment).

## Token reference

Color tokens are stored as **space-separated RGB triplets** so they compose with the modern `rgb(R G B / <alpha-value>)` syntax that Tailwind v3 and modern CSS expect.

| Token                         | Purpose                                                       | DocMosaic value      |
| ----------------------------- | ------------------------------------------------------------- | -------------------- |
| `--editor-color-accent`       | Primary accent — buttons, active section borders, focus rings | `56 29 42` (#381D2A) |
| `--editor-color-accent-soft`  | Soft accent — hover states, subtle highlights                 | `252 222 156`        |
| `--editor-color-success`      | Success state — confirmation, completed steps                 | `196 214 176`        |
| `--editor-color-warning`      | Warning — destructive actions, alerts                         | `186 86 36`          |
| `--editor-color-warning-soft` | Soft warning — caution badges, partial states                 | `255 165 82`         |
| `--editor-color-surface`      | Editor background surface                                     | `255 255 255`        |
| `--editor-color-text`         | Default editor text color                                     | `56 29 42`           |

Structural tokens carry full CSS values (length, shorthand) — not triplets — because they're consumed directly:

| Token                     | Purpose                          | Default                         |
| ------------------------- | -------------------------------- | ------------------------------- |
| `--editor-radius-section` | Border radius for image sections | `4px`                           |
| `--editor-shadow-section` | Shadow for image sections        | `0 1px 3px rgba(0, 0, 0, 0.1)`  |

Anything not listed here is intentional — there is no `--editor-color-border`, no `--editor-spacing-*`. Add them upstream when a real consumer needs them.

## Pattern 1 — default DocMosaic look

```ts
import '@docmosaic/react/styles.css';
```

That single import is the whole story for most apps. The bundle pulls in base + brand in the right order.

## Pattern 2 — custom theme on shared base

Bring your own brand colors, keep the structural defaults. Order matters: base first so the structural tokens land, then your overrides.

```ts
import '@docmosaic/react/styles/base.css';
import './my-theme.css';
```

```css
/* my-theme.css — a "Croni" accent example */
:root {
    --editor-color-accent: 79 70 229; /* indigo-600 */
    --editor-color-accent-soft: 224 231 255; /* indigo-100 */
    --editor-color-success: 22 163 74; /* green-600 */
    --editor-color-warning: 220 38 38; /* red-600 */
    --editor-color-warning-soft: 254 202 202; /* red-200 */
    --editor-color-surface: 250 250 252;
    --editor-color-text: 17 24 39; /* gray-900 */
}
```

This is exactly the path you'd take to ship a "Croni-flavored" editor: same primitives, same structural feel, completely different accent palette. Every button, focus ring, and selected section reflects the new accent without touching the React tree.

## Pattern 3 — explicit DocMosaic theme on the base

Useful when you want to load the brand theme conditionally — e.g. behind a feature flag, or per-tenant:

```ts
import '@docmosaic/react/styles/base.css';

if (tenant.brand === 'docmosaic') {
    import('@docmosaic/react/styles/themes/docmosaic.css');
}
```

`base.css` always loads; the brand layer becomes opt-in.

## Writing your own theme

A minimum viable theme is "every token in the table." Anything you omit falls back to the previous layer in the cascade (typically `base.css`, which defines the structural tokens but not the colors).

```css
/* themes/my-brand.css */
:root {
    /* Color tokens — RGB triplets only */
    --editor-color-accent: 16 185 129; /* emerald-500 */
    --editor-color-accent-soft: 209 250 229;
    --editor-color-success: 34 197 94;
    --editor-color-warning: 234 88 12;
    --editor-color-warning-soft: 251 191 36;
    --editor-color-surface: 255 255 255;
    --editor-color-text: 15 23 42;

    /* Optional structural overrides */
    --editor-radius-section: 8px;
    --editor-shadow-section: 0 4px 12px rgba(15, 23, 42, 0.08);
}
```

Don't reach for hex values directly inside the editor's classes — use the tokens. The Tailwind config in the reference app maps these tokens into class names so app-level code stays readable.

## Dark mode

Scope the overrides under your dark-mode selector — `prefers-color-scheme`, a `data-theme` attribute, a `.dark` class — and the editor inherits the new values automatically:

```css
@media (prefers-color-scheme: dark) {
    :root {
        --editor-color-surface: 17 24 39;
        --editor-color-text: 248 250 252;
        --editor-color-accent: 244 114 182;
    }
}
```

No JS toggle needed. The editor reads the variables on every paint.

## See also

- [Designer](./designer.md) — how primitives consume these tokens
- [`@docmosaic/react` README — Theming](../../packages/react/README.md#theming) — the canonical token table
- [`packages/react/src/styles/`](../../packages/react/src/styles) — source for `base.css` and `themes/docmosaic.css`
