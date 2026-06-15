'use client';

import { Loader2, X } from 'lucide-react';
import { useEditor } from '../../context/editor';
import { Button } from '../../ui/button';

/**
 * Inline progress UI shown while a PDF is being generated. Renders nothing
 * unless `pdfApi.state.isGenerating` is true. Reads progress + abort from
 * the editor context.
 */
export function GenerationProgress() {
    const { pdfApi } = useEditor();
    const { state, abort } = pdfApi;

    if (!state.isGenerating) return null;

    const { progress } = state;

    return (
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <div className="flex items-center gap-2 min-w-[160px] bg-primary text-primary-foreground px-4 py-2 rounded-md relative">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{progress ? `Generating (${progress}%)` : 'Generating...'}</span>
                {progress && (
                    <div
                        className="absolute bottom-0 left-0 h-1 bg-primary-foreground/20"
                        style={{ width: `${progress}%` }}
                    />
                )}
            </div>
            <Button
                variant="white"
                size="sm"
                onClick={abort}
                className="text-red-600 hover:text-red-700 border-red-200"
                icon={<X className="h-4 w-4" />}
            >
                Cancel
            </Button>
        </div>
    );
}
