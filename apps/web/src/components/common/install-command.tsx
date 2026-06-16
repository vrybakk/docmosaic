'use client';

import { cn } from '@/lib/utils';
import { Check, Copy, Terminal } from 'lucide-react';
import { useState } from 'react';

const PACKAGE_MANAGERS = [
    { id: 'bun', install: 'bun add' },
    { id: 'npm', install: 'npm install' },
    { id: 'pnpm', install: 'pnpm add' },
    { id: 'yarn', install: 'yarn add' },
] as const;

type PackageManager = (typeof PACKAGE_MANAGERS)[number]['id'];

type InstallCommandProps = {
    /** Space-separated package list, e.g. "@docmosaic/react @docmosaic/core". */
    packages: string;
    copyLabel: string;
    copiedLabel: string;
};

/**
 * Install snippet with a package-manager switcher (bun / npm / pnpm / yarn) and
 * a copy-to-clipboard button. Used on the marketing "For developers" band.
 */
export function InstallCommand({ packages, copyLabel, copiedLabel }: InstallCommandProps) {
    const [manager, setManager] = useState<PackageManager>('bun');
    const [copied, setCopied] = useState(false);

    const active = PACKAGE_MANAGERS.find((pm) => pm.id === manager) ?? PACKAGE_MANAGERS[0];
    const command = `${active.install} ${packages}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API unavailable (denied permission / insecure context).
        }
    };

    return (
        <div className="mt-6 max-w-xl overflow-hidden rounded-lg border border-docmosaic-cream/15 bg-black/20">
            <div className="flex items-center gap-1 border-b border-docmosaic-cream/10 px-2 pt-2">
                {PACKAGE_MANAGERS.map((pm) => (
                    <button
                        key={pm.id}
                        type="button"
                        onClick={() => setManager(pm.id)}
                        aria-pressed={pm.id === manager}
                        className={cn(
                            'rounded-t-md px-3 py-1.5 font-mono text-xs transition-colors',
                            pm.id === manager
                                ? 'bg-white/10 text-docmosaic-cream'
                                : 'text-docmosaic-cream/50 hover:text-docmosaic-cream/80',
                        )}
                    >
                        {pm.id}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
                <Terminal className="h-4 w-4 shrink-0 text-docmosaic-sage" />
                <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-docmosaic-cream">
                    {command}
                </code>
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={copied ? copiedLabel : copyLabel}
                    title={copied ? copiedLabel : copyLabel}
                    className="shrink-0 rounded-md p-1.5 text-docmosaic-cream/60 transition-colors hover:bg-white/10 hover:text-docmosaic-cream"
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-docmosaic-sage" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );
}
