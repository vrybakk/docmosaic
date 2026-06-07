# Theming

`@docmosaic/react` reads every accent color, radius, and shadow from CSS custom properties. The token surface comes in two flavors:

1. **shadcn-aligned semantic tokens** (recommended) — the same `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius` every shadcn-based app already exposes. Rebrand the editor with the same variable an app uses for the rest of its UI.
2. **legacy `--editor-color-*` aliases** — `--editor-color-accent`, `--editor-color-accent-soft`, `--editor-color-success`, `--editor-color-warning`, `--editor-color-warning-soft`, `--editor-color-surface`, `--editor-color-text`. Soft-deprecated; resolve to the semantic surface by default. Kept for one major so existing consumers don't break.

No JavaScript-side theme provider, no runtime config — just CSS.

## Mental model

The package ships its styles split into layers so you can swap colors without reinventing the structural defaults:

- **`styles/base.css`** — brand-agnostic structural tokens (`--editor-radius-section`, `--editor-shadow-section`, `--radius`) and the cascade-layer order declaration.
- **`styles/themes/docmosaic.css`** — the DocMosaic brand colors as shadcn semantic tokens (+ legacy aliases). **Default.**
- **`styles/themes/minimal-dark.css`** — shadcn-inspired neutral grays on a dark surface.
- **`styles/themes/minimal-light.css`** — shadcn-inspired neutral grays on a white surface.
- **`styles.css`** — convenience bundle that imports `base` + the DocMosaic brand theme.

All token values land in a `@layer docmosaic` cascade layer. `base.css` declares the layer order as `docmosaic, base, components, utilities` — so any consumer that already has a shadcn `:root { --background: ... }` block in `@layer base` (the default Tailwind `@tailwind base` layer) wins automatically. Apps that don't redefine the tokens get the bundled theme's values.

You pick one of these layering patterns at import time:

```text
1. Default DocMosaic look      →  import '@docmosaic/react/styles.css';
2. Custom theme on shared base →  import '@docmosaic/react/styles/base.css';
                                  import './my-theme.css';
3. Explicit DocMosaic theme    →  import '@docmosaic/react/styles/base.css';
                                  import '@docmosaic/react/styles/themes/docmosaic.css';
4. Minimal dark (shadcn-ish)   →  import '@docmosaic/react/styles/base.css';
                                  import '@docmosaic/react/styles/themes/minimal-dark.css';
5. Minimal light (shadcn-ish)  →  import '@docmosaic/react/styles/base.css';
                                  import '@docmosaic/react/styles/themes/minimal-light.css';
```

Pattern 3 is functionally identical to pattern 1 — it exists for cases where you want to opt the brand theme in or out conditionally (per-route, per-tenant, per-experiment).

## Available themes

| Theme           | Surface | Accent              | Import path                                                |
| --------------- | ------- | ------------------- | ---------------------------------------------------------- |
| DocMosaic       | white   | deep aubergine      | `@docmosaic/react/styles/themes/docmosaic.css` *(default)* |
| Minimal Dark    | zinc-950| near-white          | `@docmosaic/react/styles/themes/minimal-dark.css`          |
| Minimal Light   | white   | near-black          | `@docmosaic/react/styles/themes/minimal-light.css`         |

The DocMosaic theme stays the default — it's the brand. The minimal variants are opt-in and exist to make the editor blend into existing shadcn-ish app surfaces.

## Token reference

Color tokens are stored as **space-separated RGB triplets** so they compose with the modern `rgb(R G B / <alpha-value>)` syntax that Tailwind v3 and modern CSS expect.

### Semantic surface (shadcn-aligned)

| Token                      | Purpose                                       | DocMosaic value      |
| -------------------------- | --------------------------------------------- | -------------------- |
| `--background`             | Editor canvas surround                        | `255 255 255`        |
| `--foreground`             | Default text on `--background`                | `56 29 42` (#381D2A) |
| `--card`                   | Elevated surfaces — sidebars, inspector       | `255 255 255`        |
| `--card-foreground`        | Text on `--card`                              | `56 29 42`           |
| `--primary`                | Primary accent — buttons, active borders      | `56 29 42`           |
| `--primary-foreground`     | Text/icons on `--primary`                     | `252 222 156`        |
| `--secondary`              | Soft accent — hover states, subtle fills      | `252 222 156`        |
| `--secondary-foreground`   | Text on `--secondary`                         | `56 29 42`           |
| `--muted`                  | Placeholder / disabled background             | `244 244 245`        |
| `--muted-foreground`       | Placeholder / disabled text                   | `113 113 122`        |
| `--accent`                 | Selection highlight                           | `196 214 176`        |
| `--accent-foreground`      | Text on `--accent`                            | `56 29 42`           |
| `--destructive`            | Errors, destructive actions, warnings         | `186 86 36`          |
| `--destructive-foreground` | Text on `--destructive`                       | `255 255 255`        |
| `--border`                 | Default border color                          | `228 228 231`        |
| `--input`                  | Input border color                            | `228 228 231`        |
| `--ring`                   | Focus ring                                    | `56 29 42`           |
| `--radius`                 | Default border radius                         | `0.5rem`             |

### Legacy `--editor-color-*` aliases (back-compat)

| Token                         | Resolves to              | DocMosaic value     |
| ----------------------------- | ------------------------ | ------------------- |
| `--editor-color-accent`       | `var(--primary)`         | `56 29 42`          |
| `--editor-color-accent-soft`  | `var(--secondary)`       | `252 222 156`       |
| `--editor-color-success`      | `var(--accent)`          | `196 214 176`       |
| `--editor-color-warning`      | `var(--destructive)`     | `186 86 36`         |
| `--editor-color-warning-soft` | (preserved historic)     | `255 165 82`        |
| `--editor-color-surface`      | `var(--background)`      | `255 255 255`       |
| `--editor-color-text`         | `var(--foreground)`      | `56 29 42`          |

Soft-deprecated. Continue to work unchanged; will be removed in a future major.

### Structural tokens

| Token                     | Purpose                          | Default                          |
| ------------------------- | -------------------------------- | -------------------------------- |
| `--editor-radius-section` | Border radius for image sections | `6px`                            |
| `--editor-shadow-section` | Shadow for image sections        | `0 1px 3px rgba(0, 0, 0, 0.1)`   |
| `--radius`                | Default border radius            | `0.5rem`                         |

## Pattern 1 — default DocMosaic look

```ts
import '@docmosaic/react/styles.css';
```

That single import is the whole story for most apps. The bundle pulls in base + brand in the right order.

## Pattern 2 — custom theme on shared base

Bring your own brand colors, keep the structural defaults. The fastest path is the **one-variable rebrand**: override `--primary` and let everything else inherit:

```css
:root {
    --primary: 79 70 229; /* indigo-600 */
    --primary-foreground: 255 255 255;
}
```

For a full custom theme — every accent, surface, and border — supply the whole semantic surface:

```ts
import '@docmosaic/react/styles/base.css';
import './my-theme.css';
```

```css
/* my-theme.css — a "Croni" accent example */
:root {
    --background: 250 250 252;
    --foreground: 15 23 42;
    --card: 255 255 255;
    --card-foreground: 15 23 42;
    --primary: 79 70 229; /* indigo-600 */
    --primary-foreground: 255 255 255;
    --secondary: 224 231 255; /* indigo-100 */
    --secondary-foreground: 15 23 42;
    --muted: 244 244 245;
    --muted-foreground: 113 113 122;
    --accent: 34 197 94; /* green-500 */
    --accent-foreground: 255 255 255;
    --destructive: 220 38 38;
    --destructive-foreground: 255 255 255;
    --border: 228 228 231;
    --input: 228 228 231;
    --ring: 79 70 229;
    --radius: 0.5rem;
}
```

Every button, focus ring, and selected section reflects the new accent without touching the React tree.

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

A minimum viable theme is "every semantic token in the table." Anything you omit falls back to the previous layer in the cascade (typically `base.css`, which defines the structural tokens but not the colors).

```css
/* themes/my-brand.css */
:root {
    --background: 255 255 255;
    --foreground: 15 23 42;
    --card: 255 255 255;
    --card-foreground: 15 23 42;
    --primary: 16 185 129; /* emerald-500 */
    --primary-foreground: 255 255 255;
    --secondary: 209 250 229;
    --secondary-foreground: 15 23 42;
    --muted: 244 244 245;
    --muted-foreground: 113 113 122;
    --accent: 16 185 129;
    --accent-foreground: 255 255 255;
    --destructive: 234 88 12;
    --destructive-foreground: 255 255 255;
    --border: 228 228 231;
    --input: 228 228 231;
    --ring: 16 185 129;
    --radius: 0.5rem;

    /* Optional structural overrides. */
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
        --background: 9 9 11;
        --foreground: 250 250 250;
        --primary: 250 250 250;
        --primary-foreground: 9 9 11;
        /* ... */
    }
}
```

No JS toggle needed. The editor reads the variables on every paint.

## See also

- [Designer](./designer.md) — how primitives consume these tokens
- [`@docmosaic/react` README — Theming](../../packages/react/README.md#theming) — the canonical token table
- [`packages/react/src/styles/`](../../packages/react/src/styles) — source for `base.css` and `themes/*.css`
