'use client';

import { motion } from 'framer-motion';
import { ArrowBigRight, Boxes, Code2, Cpu, Github, Lock, Package, Terminal } from 'lucide-react';
import Link from 'next/link';
import Typography from '../common/typography';
import { CustomLink } from '../ui/core/link';

const ease = [0.22, 1, 0.36, 1] as const;

const points = [
    {
        icon: Boxes,
        title: 'Compound primitives',
        body: 'A flat Editor.* namespace that snaps together - no prop drilling.',
    },
    {
        icon: Cpu,
        title: 'Framework-agnostic core',
        body: 'Document model, history, and the PDF pipeline. Bring your own UI.',
    },
    {
        icon: Lock,
        title: '100% client-side',
        body: 'No backend, no uploads. State lives in React - privacy by default.',
    },
];

/**
 * Marketing band that surfaces the developer story: DocMosaic is not only a
 * hosted editor but an open-source, headless React + core library. Mirrors the
 * positioning from docs.docmosaic.com.
 */
const ForDevelopers = () => {
    return (
        <motion.div
            className="rounded-[20px] bg-docmosaic-purple p-8 text-docmosaic-cream md:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
        >
            <span className="inline-flex items-center gap-2 rounded-full border border-docmosaic-sage/40 bg-docmosaic-sage/20 px-3 py-1.5">
                <Code2 className="h-4 w-4 text-docmosaic-sage" />
                <Typography variant="small" className="text-docmosaic-sage uppercase tracking-wider">
                    For developers
                </Typography>
            </span>

            <Typography variant="h2" tag="h2" className="mt-4 max-w-2xl text-white">
                Not just an editor - a{' '}
                <span className="text-docmosaic-caramel">library you build with</span>
            </Typography>

            <Typography
                variant="paragraph"
                className="mt-3 max-w-2xl !text-base text-docmosaic-cream/75"
            >
                DocMosaic is open source and headless: compound{' '}
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-docmosaic-cream">
                    &lt;Editor.*&gt;
                </code>{' '}
                React primitives on a framework-agnostic core. Drop in the full editor, or compose
                your own UI.
            </Typography>

            <div className="mt-6 flex max-w-xl items-center gap-3 rounded-lg border border-docmosaic-cream/15 bg-black/20 px-4 py-3">
                <Terminal className="h-4 w-4 shrink-0 text-docmosaic-sage" />
                <code className="overflow-x-auto font-mono text-sm text-docmosaic-cream">
                    bun add @docmosaic/react @docmosaic/core
                </code>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
                {points.map((point) => (
                    <div key={point.title}>
                        <point.icon className="h-5 w-5 text-docmosaic-caramel" />
                        <Typography variant="h6" tag="h3" className="mb-1 mt-2 text-white">
                            {point.title}
                        </Typography>
                        <Typography variant="small" className="text-docmosaic-cream/60">
                            {point.body}
                        </Typography>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
                <CustomLink
                    href="https://docs.docmosaic.com"
                    external
                    variant="caramel"
                    className="documentation-click-trigger"
                    icon={<ArrowBigRight size={18} />}
                >
                    Read the Docs
                </CustomLink>
                <Link
                    href="https://github.com/vrybakk/docmosaic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-source-button-click-trigger inline-flex items-center gap-2 rounded-lg border border-docmosaic-cream/35 px-5 py-2 text-docmosaic-cream transition-colors hover:bg-white/10"
                >
                    <Github className="h-4 w-4" />
                    <Typography variant="h5" className="!text-inherit uppercase">
                        GitHub
                    </Typography>
                </Link>
                <Link
                    href="https://www.npmjs.com/package/@docmosaic/react"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="npm-package-click-trigger inline-flex items-center gap-2 rounded-lg border border-docmosaic-cream/35 px-5 py-2 text-docmosaic-cream transition-colors hover:bg-white/10"
                >
                    <Package className="h-4 w-4" />
                    <Typography variant="h5" className="!text-inherit uppercase">
                        npm
                    </Typography>
                </Link>
            </div>
        </motion.div>
    );
};

export default ForDevelopers;
