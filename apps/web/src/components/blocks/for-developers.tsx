'use client';

import { motion } from 'framer-motion';
import { ArrowBigRight, Boxes, Code2, Cpu, Github, Lock, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { InstallCommand } from '../common/install-command';
import Typography from '../common/typography';
import { CustomLink } from '../ui/core/link';

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Marketing band that surfaces the developer story: DocMosaic is not only a
 * hosted editor but an open-source, headless React + core library. Mirrors the
 * positioning from docs.docmosaic.com.
 */
const ForDevelopers = () => {
    const t = useTranslations('ForDevelopers');

    const points = [
        {
            icon: Boxes,
            title: t('point1Title'),
            body: t('point1Body'),
        },
        {
            icon: Cpu,
            title: t('point2Title'),
            body: t('point2Body'),
        },
        {
            icon: Lock,
            title: t('point3Title'),
            body: t('point3Body'),
        },
    ];

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
                <Typography
                    variant="small"
                    className="text-docmosaic-sage uppercase tracking-wider"
                >
                    {t('eyebrow')}
                </Typography>
            </span>

            <Typography variant="h2" tag="h2" className="mt-4 max-w-2xl text-white">
                {t.rich('title', {
                    caramel: (chunks) => <span className="text-docmosaic-caramel">{chunks}</span>,
                })}
            </Typography>

            <Typography
                variant="paragraph"
                className="mt-3 max-w-2xl !text-base text-docmosaic-cream/75"
            >
                {t.rich('description', {
                    token: '<Editor.*>',
                    code: (chunks) => (
                        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-docmosaic-cream">
                            {chunks}
                        </code>
                    ),
                })}
            </Typography>

            <InstallCommand
                packages="@docmosaic/react @docmosaic/core"
                copyLabel={t('copyLabel')}
                copiedLabel={t('copiedLabel')}
            />

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
                    {t('readDocs')}
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
