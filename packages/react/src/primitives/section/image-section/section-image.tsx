'use client';

import type { ImageSection } from '@docmosaic/core';
import { RefreshCw } from 'lucide-react';
import type { Ref } from 'react';
import { useEditorConfig } from '../../../context/editor-config';
import { cn } from '../../../internal/utils';
import { Button } from '../../../ui/button';

interface SectionImageProps {
    section: ImageSection;
    imageRef: Ref<HTMLImageElement>;
    isDroppingFile: boolean;
    onReplaceClick: (e: React.MouseEvent) => void;
}

/**
 * Renders the section's image plus the hover overlay with the Replace button.
 * `imageRef` is forwarded so the orchestrator can read `naturalWidth/Height`
 * for the resize-to-proportion action.
 *
 * When `section.crop` is set, the image is scaled and translated so only the
 * crop region falls inside the section box — mirrors the PDF render path so
 * the editor preview matches export.
 */
export function SectionImage({
    section,
    imageRef,
    isDroppingFile,
    onReplaceClick,
}: SectionImageProps) {
    const { imageRenderer: Image } = useEditorConfig();

    const crop = section.crop;
    // Reuse the same math as the PDF generator: scale by `section.dim/crop.dim`
    // and translate so the crop's origin lines up with the section's origin.
    // Percent-based transforms keep this scale-agnostic — no need to know the
    // display pixels here.
    const cropStyle: React.CSSProperties | undefined = crop
        ? {
              position: 'absolute',
              left: `${(-crop.x / crop.width) * 100}%`,
              top: `${(-crop.y / crop.height) * 100}%`,
              width: `${(section.width / crop.width) * 100}%`,
              height: `${(section.height / crop.height) * 100}%`,
          }
        : undefined;

    return (
        <>
            {crop ? (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <Image
                        ref={imageRef}
                        src={section.imageUrl ?? ''}
                        alt="Section content"
                        className="object-contain pointer-events-none"
                        fill
                        draggable={false}
                        style={cropStyle}
                    />
                </div>
            ) : (
                <Image
                    ref={imageRef}
                    src={section.imageUrl ?? ''}
                    alt="Section content"
                    className="w-full h-full object-contain pointer-events-none"
                    fill
                    draggable={false}
                />
            )}
            <div
                className={cn(
                    'absolute inset-0 rounded-lg pointer-events-none z-20',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    isDroppingFile && 'opacity-100 bg-primary/40',
                    !isDroppingFile && 'bg-black/40',
                )}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 h-8 px-2 bg-white/20 hover:bg-white/30 text-white pointer-events-auto"
                    onClick={onReplaceClick}
                >
                    <RefreshCw className="h-4 w-4" />
                    {section.width >= 150 && (
                        <span className="ml-1.5 text-xs">
                            {isDroppingFile ? 'Drop to Replace' : 'Replace'}
                        </span>
                    )}
                </Button>
            </div>
        </>
    );
}
