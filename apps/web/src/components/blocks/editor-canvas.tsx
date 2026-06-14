'use client';

import { motion } from 'framer-motion';
import { Check, MousePointer2, UploadCloud } from 'lucide-react';
import Typography from '../common/typography';

export type CanvasVariant = 'arrange' | 'upload' | 'download';

/**
 * Distinct mock layouts. `frames` shows the v2 feature (selected container
 * frame + image-frame) and powers the hero/how-it-works/desktop mocks. The
 * remaining scenes give each use-case card its own document silhouette so a row
 * of cards doesn't read as the same picture repeated.
 */
export type CanvasScene = 'frames' | 'id-scan' | 'report' | 'gallery' | 'worksheet';

const handle = 'absolute h-2 w-2 rounded-full border border-white bg-docmosaic-orange';

type CursorPath = { left: string[]; top: string[]; duration: number };

const SCENE_CURSOR: Record<Exclude<CanvasScene, 'frames'>, CursorPath> = {
    'id-scan': {
        left: ['24%', '64%', '30%', '24%'],
        top: ['30%', '44%', '60%', '30%'],
        duration: 6.5,
    },
    report: {
        left: ['28%', '30%', '58%', '28%'],
        top: ['30%', '58%', '72%', '30%'],
        duration: 7.5,
    },
    gallery: { left: ['30%', '66%', '44%', '30%'], top: ['36%', '34%', '64%', '36%'], duration: 6 },
    worksheet: {
        left: ['26%', '26%', '46%', '26%'],
        top: ['32%', '60%', '46%', '32%'],
        duration: 8,
    },
};

function Cursor({ path, delay = 0 }: { path: CursorPath; delay?: number }) {
    return (
        <motion.div
            className="absolute z-20"
            initial={{ left: path.left[0], top: path.top[0] }}
            animate={{ left: path.left, top: path.top, scale: [1, 0.82, 1, 1] }}
            transition={{
                duration: path.duration,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, 0.4, 0.75, 1],
            }}
        >
            <MousePointer2 className="h-4 w-4 fill-docmosaic-purple text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
        </motion.div>
    );
}

const line = 'rounded-full bg-docmosaic-black/15';

/**
 * Reusable, on-brand mock of the editor page - built from DOM/CSS (no
 * screenshot) so it never drifts from the real design. Scales to fill its
 * parent via percentage layout. `cursorDelay` de-synchronises rows of cards.
 */
export function EditorCanvas({
    variant = 'arrange',
    scene = 'frames',
    showLabels = true,
    animateCursor = true,
    cursorDelay = 0,
}: {
    variant?: CanvasVariant;
    scene?: CanvasScene;
    showLabels?: boolean;
    animateCursor?: boolean;
    cursorDelay?: number;
}) {
    const dimmed = variant === 'upload';

    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(56,29,42,0.06)_1px,_transparent_1px)] [background-size:14px_14px]" />

            {scene === 'frames' && (
                <>
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
                        <div className={`h-1.5 w-full ${line}`} />
                        <div className="h-1.5 w-3/4 rounded-full bg-docmosaic-black/10" />
                    </div>

                    {animateCursor && variant === 'arrange' && (
                        <Cursor
                            path={{
                                left: ['32%', '74%', '20%', '32%'],
                                top: ['34%', '66%', '26%', '34%'],
                                duration: 7,
                            }}
                            delay={cursorDelay}
                        />
                    )}

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

                    {variant === 'download' && (
                        <div className="absolute right-[8%] top-[8%] inline-flex items-center gap-1.5 rounded-full bg-docmosaic-sage px-3 py-1 shadow-sm">
                            <Check className="h-3.5 w-3.5 text-docmosaic-purple" />
                            <Typography variant="extraSmall" className="font-semibold uppercase">
                                PDF ready
                            </Typography>
                        </div>
                    )}
                </>
            )}

            {/* Expats & Officials - scanned ID + passport documents */}
            {scene === 'id-scan' && (
                <>
                    <div className="absolute left-[9%] top-[13%] h-[72%] w-[36%] rounded-md border border-docmosaic-black/10 bg-white p-2 shadow-sm">
                        <div className="h-[34%] w-[44%] rounded bg-gradient-to-br from-docmosaic-sage to-docmosaic-cream" />
                        <div className="mt-2 space-y-1.5">
                            <div className={`h-1.5 w-4/5 ${line}`} />
                            <div className="h-1.5 w-2/3 rounded-full bg-docmosaic-black/10" />
                            <div className="h-1.5 w-3/5 rounded-full bg-docmosaic-black/10" />
                            <div className="h-1.5 w-2/4 rounded-full bg-docmosaic-black/10" />
                        </div>
                    </div>
                    <div className="absolute right-[11%] top-[22%] h-[56%] w-[30%] space-y-1.5 rounded-md border border-docmosaic-black/10 bg-gradient-to-br from-docmosaic-cream/40 to-white p-2 shadow-sm">
                        <div className="h-1.5 w-full rounded-full bg-docmosaic-black/12" />
                        <div className="h-1.5 w-5/6 rounded-full bg-docmosaic-black/10" />
                        <div className="h-1.5 w-3/4 rounded-full bg-docmosaic-black/10" />
                        <div className="mt-2 h-[40%] w-full rounded bg-gradient-to-br from-docmosaic-caramel/40 to-docmosaic-orange/30" />
                    </div>
                </>
            )}

            {/* Businesses & Freelancers - text-heavy report with a mini chart */}
            {scene === 'report' && (
                <div className="absolute inset-[9%] rounded-md border border-docmosaic-black/10 bg-white p-3 shadow-sm">
                    <div className="h-2.5 w-1/2 rounded bg-docmosaic-caramel/70" />
                    <div className="mt-3 space-y-2">
                        <div className="h-1.5 w-full rounded-full bg-docmosaic-black/12" />
                        <div className="h-1.5 w-11/12 rounded-full bg-docmosaic-black/10" />
                        <div className="h-1.5 w-full rounded-full bg-docmosaic-black/10" />
                        <div className="h-1.5 w-2/3 rounded-full bg-docmosaic-black/10" />
                    </div>
                    <div className="absolute bottom-3 right-3 flex h-[26%] items-end gap-1.5">
                        <div className="h-1/2 w-3 rounded-sm bg-docmosaic-sage" />
                        <div className="h-full w-3 rounded-sm bg-docmosaic-caramel" />
                        <div className="h-2/3 w-3 rounded-sm bg-docmosaic-orange" />
                        <div className="h-5/6 w-3 rounded-sm bg-docmosaic-cream" />
                    </div>
                </div>
            )}

            {/* Marketers & Designers - image masonry / print-ready layout */}
            {scene === 'gallery' && (
                <div className="absolute inset-[9%] grid grid-cols-3 grid-rows-2 gap-2">
                    <div className="col-span-2 row-span-2 rounded-md bg-gradient-to-br from-docmosaic-sage to-docmosaic-cream shadow-sm" />
                    <div className="rounded-md bg-gradient-to-br from-docmosaic-cream to-docmosaic-caramel shadow-sm" />
                    <div className="rounded-md bg-gradient-to-br from-docmosaic-caramel to-docmosaic-orange shadow-sm" />
                </div>
            )}

            {/* Teachers & Students - annotated, reorderable pages */}
            {scene === 'worksheet' && (
                <>
                    <div className="absolute left-[18%] top-[16%] h-[68%] w-[56%] rotate-3 rounded-md border border-docmosaic-black/10 bg-white shadow-sm" />
                    <div className="absolute left-[12%] top-[12%] h-[68%] w-[56%] space-y-2.5 rounded-md border border-docmosaic-black/10 bg-white p-3 shadow-md">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-docmosaic-sage">
                                    <Check className="h-2.5 w-2.5 text-docmosaic-purple" />
                                </span>
                                <div
                                    className="h-1.5 rounded-full bg-docmosaic-black/12"
                                    style={{ width: `${70 - i * 12}%` }}
                                />
                            </div>
                        ))}
                        <div className="mt-1 h-[26%] w-2/3 rounded bg-gradient-to-br from-docmosaic-cream/50 to-docmosaic-caramel/30" />
                    </div>
                </>
            )}

            {animateCursor && scene !== 'frames' && (
                <Cursor path={SCENE_CURSOR[scene]} delay={cursorDelay} />
            )}
        </div>
    );
}
