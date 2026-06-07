'use client';

import { Toaster as HotToaster, type ToasterProps as HotToasterProps } from 'react-hot-toast';

export interface ToasterProps extends Omit<HotToasterProps, 'toastOptions'> {
    /**
     * Override the default toast styling. Defaults to a theme-token-styled
     * card matching `bg-card` / `text-card-foreground`. Anything you pass
     * deep-merges into the bundled defaults, so consumers only need to set the
     * fields they want to change.
     */
    toastOptions?: HotToasterProps['toastOptions'];
}

/**
 * `Editor.Toaster` mounts a `react-hot-toast` toaster styled with the
 * editor's semantic theme tokens (`bg-card`, `text-card-foreground`,
 * `border-border`). Drop one anywhere inside `Editor.Root` (or at the app
 * root) and fire toasts with the re-exported {@link toast} helper.
 *
 * @example
 * ```tsx
 * import { Editor, toast } from '@docmosaic/react';
 *
 * <Editor.Root>
 *   <Editor.Toolbar />
 *   <Editor.Canvas><Editor.Section /></Editor.Canvas>
 *   <Editor.Toaster />
 * </Editor.Root>
 *
 * toast.success('Section deleted');
 * toast.error('Upload failed');
 * ```
 *
 * @remarks
 * The bundled style uses inline CSS variables (`rgb(var(--card))` etc.)
 * because `react-hot-toast` accepts a flat style object — Tailwind class
 * names are not honoured on its container. The variables themselves are
 * defined by the editor's theme files, so dark mode flips automatically.
 */
export function Toaster({
    position = 'bottom-right',
    toastOptions,
    ...rest
}: ToasterProps = {}) {
    return (
        <HotToaster
            position={position}
            toastOptions={{
                duration: 4000,
                ...toastOptions,
                style: {
                    background: 'rgb(var(--card))',
                    color: 'rgb(var(--card-foreground))',
                    border: '1px solid rgb(var(--border))',
                    boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
                    fontSize: '0.875rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius, 0.5rem)',
                    ...(toastOptions?.style ?? {}),
                },
                success: {
                    iconTheme: {
                        primary: 'rgb(var(--accent))',
                        secondary: 'rgb(var(--accent-foreground))',
                    },
                    ...(toastOptions?.success ?? {}),
                },
                error: {
                    iconTheme: {
                        primary: 'rgb(var(--destructive))',
                        secondary: 'rgb(var(--destructive-foreground))',
                    },
                    ...(toastOptions?.error ?? {}),
                },
                loading: {
                    iconTheme: {
                        primary: 'rgb(var(--muted-foreground))',
                        secondary: 'rgb(var(--muted))',
                    },
                    ...(toastOptions?.loading ?? {}),
                },
            }}
            {...rest}
        />
    );
}

export { toast } from 'react-hot-toast';
