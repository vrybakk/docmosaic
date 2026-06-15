'use client';

import { motion } from 'framer-motion';
import {
    Download,
    Frame as FrameIcon,
    Image as ImageIcon,
    MousePointer2,
    Square,
    Type,
} from 'lucide-react';
import Typography from '../common/typography';
import { EditorCanvas } from './editor-canvas';

const ease = [0.22, 1, 0.36, 1] as const;

const tools = [MousePointer2, ImageIcon, Type, Square, FrameIcon];

/**
 * Landing-page showcase: the editor chrome (top bar + tool rail) wrapped around
 * the shared {@link EditorCanvas}. Built from DOM/CSS - no screenshot - so it
 * tracks the current design and frames the v2 feature (container + image frames).
 */
const ProductShowcase = () => {
    return (
        <motion.div
            className="mx-auto w-full max-w-4xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease }}
        >
            <div className="overflow-hidden rounded-[20px] border border-docmosaic-black/10 bg-white shadow-[0px_20px_60px_-20px_rgba(56,29,42,0.35)]">
                {/* Editor top bar */}
                <div className="flex items-center gap-3 border-b border-docmosaic-black/10 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-docmosaic-caramel" />
                        <span className="h-3 w-3 rounded-full bg-docmosaic-cream" />
                        <span className="h-3 w-3 rounded-full bg-docmosaic-sage" />
                    </div>
                    <Typography variant="small" className="text-docmosaic-black/50">
                        visa-application.pdf
                    </Typography>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="rounded-md bg-docmosaic-cream/40 px-2 py-1">
                            <Typography variant="extraSmall" className="text-docmosaic-black/70">
                                100%
                            </Typography>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-docmosaic-purple px-2.5 py-1 text-white">
                            <Download className="h-3 w-3" />
                            <Typography variant="extraSmall" className="!text-inherit uppercase">
                                Download PDF
                            </Typography>
                        </span>
                    </div>
                </div>

                <div className="flex">
                    {/* Tool rail */}
                    <div className="hidden flex-col items-center gap-4 border-r border-docmosaic-black/10 px-3 py-5 sm:flex">
                        {tools.map((Tool, i) => (
                            <span
                                key={i}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                    i === 4
                                        ? 'bg-docmosaic-orange text-white'
                                        : 'text-docmosaic-black/55'
                                }`}
                            >
                                <Tool className="h-4 w-4" />
                            </span>
                        ))}
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 bg-docmosaic-cream/10 p-5 sm:p-8">
                        <div className="relative mx-auto aspect-[1.1/1] w-full max-w-md rounded-md shadow-[0px_2px_18px_rgba(56,29,42,0.12)]">
                            <EditorCanvas variant="arrange" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductShowcase;
