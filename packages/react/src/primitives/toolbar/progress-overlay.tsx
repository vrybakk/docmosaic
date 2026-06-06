'use client';

import { Loader2, X } from 'lucide-react';
import { Button } from '../../ui/button';

interface ProgressOverlayProps {
    /** Current generation progress (0-100). */
    progress?: number;
    /** Cancel the in-flight generation. */
    onCancel: () => void;
}

/**
 * Inline progress UI shown while a PDF is being generated. Includes a
 * cancel button wired to the generation hook's `abort()`.
 */
export function ProgressOverlay({ progress, onCancel }: ProgressOverlayProps) {
    return (
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <div className="flex items-center gap-2 min-w-[160px] bg-editor-accent text-editor-accent-soft px-4 py-2 rounded-md relative">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{progress ? `Generating (${progress}%)` : 'Generating...'}</span>
                {progress && (
                    <div
                        className="absolute bottom-0 left-0 h-1 bg-editor-accent-soft/20"
                        style={{ width: `${progress}%` }}
                    />
                )}
            </div>
            <Button
                variant="white"
                size="sm"
                onClick={onCancel}
                className="text-red-600 hover:text-red-700 border-red-200"
                icon={<X className="h-4 w-4" />}
            >
                Cancel
            </Button>
        </div>
    );
}
