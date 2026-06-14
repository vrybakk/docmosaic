'use client';

import { motion } from 'framer-motion';
import { Check, MousePointer2, UploadCloud } from 'lucide-react';
import Typography from '../common/typography';

export type CanvasVariant = 'arrange' | 'upload' | 'download';

const handle = 'absolute h-2 w-2 rounded-full border border-white bg-docmosaic-orange';

/**
 * Reusable, on-brand mock of the editor page - built from DOM/CSS (no
 * screenshot) so it never drifts from the real design. Scales to fill its
 * parent via percentage layout, and deliberately frames the v2 feature: a
 * selected container frame holding images plus a circle image-frame.
 *
 * `variant` shifts the page between the three "how it works" beats; `showLabels`
 * hides the frame tags in tight spaces; `animateCursor` loops a pointer across
 * the canvas to suggest live editing.
 */
export function EditorCanvas({
    variant = 'arrange',
    showLabels = true,
    animateCursor = true,
}: {
    variant?: CanvasVariant;
    showLabels?: boolean;
    animateCursor?: boolean;
}) {
    const dimmed = variant === 'upload';

    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(56,29,42,0.06)_1px,_transparent_1px)] [background-size:14px_14px]" />

            {/* Selected container frame with image tiles */}
            <div
                className={`absolute left-[7%] top-[10%] w-[50%] rounded-lg p-1.5 ring-2 ring-docmosaic-orange transition-opacity ${
                    dimmed ? 'opacity-30' : 'opacity-100'
                }`}
            >
                {showLabels && (
                    <span className="absolute -top-3 left-0 rounded bg-docmosaic-orange px-1.5 py-0.5">
                        <Typography variant="extraSmall" className="!text-white uppercase">
                            Frame
                        </Typography>
                    </span>
                )}
                <span className={`${handle} -left-1 -top-1`} />
                <span className={`${handle} -right-1 -top-1`} />
                <span className={`${handle} -bottom-1 -left-1`} />
                <span className={`${handle} -bottom-1 -right-1`} />
                <div className="grid grid-cols-2 gap-1.5">
                    <div className="aspect-square rounded-md bg-gradient-to-br from-docmosaic-sage to-docmosaic-cream shadow-sm" />
                    <div className="aspect-square rounded-md bg-gradient-to-br from-docmosaic-cream to-docmosaic-caramel shadow-sm" />
                    <div className="col-span-2 aspect-[2.6/1] rounded-md bg-gradient-to-r from-docmosaic-caramel/80 to-docmosaic-orange/70 shadow-sm" />
                </div>
            </div>

            {/* Circle image-frame */}
            <div
                className={`absolute bottom-[15%] right-[9%] transition-opacity ${
                    dimmed ? 'opacity-30' : 'opacity-100'
                }`}
            >
                {showLabels && (
                    <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-docmosaic-purple px-1.5 py-0.5">
                        <Typography variant="extraSmall" className="!text-white uppercase">
                            Image frame
                        </Typography>
                    </span>
                )}
                <div className="aspect-square w-[22%] min-w-[58px] rounded-full bg-gradient-to-br from-docmosaic-orange via-docmosaic-caramel to-docmosaic-cream shadow-md ring-2 ring-white" />
            </div>

            {/* Caption text lines */}
            <div
                className={`absolute bottom-[18%] left-[9%] w-[36%] space-y-1.5 transition-opacity ${
                    dimmed ? 'opacity-30' : 'opacity-100'
                }`}
            >
                <div className="h-1.5 w-full rounded-full bg-docmosaic-black/15" />
                <div className="h-1.5 w-3/4 rounded-full bg-docmosaic-black/10" />
            </div>

            {/* Animated editing cursor */}
            {animateCursor && variant === 'arrange' && (
                <motion.div
                    className="absolute z-20"
                    initial={{ left: '32%', top: '34%' }}
                    animate={{
                        left: ['32%', '74%', '20%', '32%'],
                        top: ['34%', '66%', '26%', '34%'],
                        scale: [1, 0.82, 1, 1],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        times: [0, 0.4, 0.75, 1],
                    }}
                >
                    <MousePointer2 className="h-4 w-4 fill-docmosaic-purple text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
                </motion.div>
            )}

            {/* Upload overlay */}
            {variant === 'upload' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-docmosaic-sage bg-white/85 px-6 py-5">
                        <UploadCloud className="h-7 w-7 text-docmosaic-orange" />
                        <Typography variant="small" className="text-docmosaic-black/70">
                            Drop images here
                        </Typography>
                    </div>
                </div>
            )}

            {/* Download success badge */}
            {variant === 'download' && (
                <div className="absolute right-[8%] top-[8%] inline-flex items-center gap-1.5 rounded-full bg-docmosaic-sage px-3 py-1 shadow-sm">
                    <Check className="h-3.5 w-3.5 text-docmosaic-purple" />
                    <Typography variant="extraSmall" className="font-semibold uppercase">
                        PDF ready
                    </Typography>
                </div>
            )}
        </div>
    );
}
