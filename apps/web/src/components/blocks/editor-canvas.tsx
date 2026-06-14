'use client';

import { Check, MousePointer2, UploadCloud } from 'lucide-react';
import Typography from '../common/typography';

export type CanvasVariant = 'arrange' | 'upload' | 'download';

/**
 * Reusable, on-brand mock of the editor page — built from DOM/CSS (no
 * screenshot) so it never drifts from the real design. Scales to fill its
 * parent via percentage layout, and deliberately frames the v2 feature: a
 * container frame holding images plus a circle image-frame.
 *
 * `variant` shifts the page between the three "how it works" beats; `showLabels`
 * hides the frame tags in tight spaces (small peeks, mobile mocks).
 */
export function EditorCanvas({
    variant = 'arrange',
    showLabels = true,
}: {
    variant?: CanvasVariant;
    showLabels?: boolean;
}) {
    const dimmed = variant === 'upload';

    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-white">
            <div className="absolute inset-0 bg-docmosaic-cream/10" />

            {/* Container frame with image tiles */}
            <div
                className={`absolute left-[6%] top-[9%] w-[52%] rounded-xl border-2 border-dashed border-docmosaic-orange/60 p-1.5 transition-opacity ${
                    dimmed ? 'opacity-30' : 'opacity-100'
                }`}
            >
                {showLabels && (
                    <span className="absolute -top-2.5 left-2 rounded bg-docmosaic-orange px-1.5 py-0.5">
                        <Typography variant="extraSmall" className="!text-white uppercase">
                            Frame
                        </Typography>
                    </span>
                )}
                <div className="grid grid-cols-2 gap-1.5">
                    <div className="aspect-square rounded-md bg-gradient-to-br from-docmosaic-sage to-docmosaic-cream" />
                    <div className="aspect-square rounded-md bg-gradient-to-br from-docmosaic-cream to-docmosaic-caramel" />
                    <div className="col-span-2 aspect-[2.6/1] rounded-md bg-gradient-to-r from-docmosaic-caramel/70 to-docmosaic-orange/60" />
                </div>
            </div>

            {/* Circle image-frame */}
            <div
                className={`absolute bottom-[14%] right-[8%] transition-opacity ${
                    dimmed ? 'opacity-30' : 'opacity-100'
                }`}
            >
                {showLabels && (
                    <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-docmosaic-purple px-1.5 py-0.5">
                        <Typography variant="extraSmall" className="!text-white uppercase">
                            Image frame
                        </Typography>
                    </span>
                )}
                <div className="aspect-square w-[22%] min-w-[60px] rounded-full bg-gradient-to-br from-docmosaic-orange via-docmosaic-caramel to-docmosaic-cream ring-2 ring-white" />
            </div>

            {/* Caption text lines */}
            <div
                className={`absolute bottom-[17%] left-[8%] w-[38%] space-y-1.5 transition-opacity ${
                    dimmed ? 'opacity-30' : 'opacity-100'
                }`}
            >
                <div className="h-1.5 w-full rounded-full bg-docmosaic-black/15" />
                <div className="h-1.5 w-3/4 rounded-full bg-docmosaic-black/10" />
            </div>

            {/* Upload overlay */}
            {variant === 'upload' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-docmosaic-sage bg-white/80 px-6 py-5">
                        <UploadCloud className="h-7 w-7 text-docmosaic-orange" />
                        <Typography variant="small" className="text-docmosaic-black/70">
                            Drop images here
                        </Typography>
                    </div>
                </div>
            )}

            {/* Download success badge */}
            {variant === 'download' && (
                <div className="absolute right-[8%] top-[8%] inline-flex items-center gap-1.5 rounded-full bg-docmosaic-sage px-3 py-1">
                    <Check className="h-3.5 w-3.5 text-docmosaic-purple" />
                    <Typography variant="extraSmall" className="font-semibold uppercase">
                        PDF ready
                    </Typography>
                </div>
            )}

            {/* Cursor accent on the arrange beat */}
            {variant === 'arrange' && (
                <MousePointer2 className="absolute left-[40%] top-[46%] h-4 w-4 fill-docmosaic-purple text-docmosaic-purple" />
            )}
        </div>
    );
}
