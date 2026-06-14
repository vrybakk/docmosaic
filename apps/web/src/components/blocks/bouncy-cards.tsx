'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowBigRight } from 'lucide-react';
import { ReactNode } from 'react';
import Typography from '../common/typography';
import { CustomLink } from '../ui/core/link';
import { EditorCanvas, type CanvasScene } from './editor-canvas';

const features = [
    {
        title: '⚖️ For Expats & Officials',
        subtitle: 'Simplify Document Processing',
        description:
            'Perfect for <b>visa applications, ID & passport scans,</b> and <b>administrative paperwork</b>. Arrange multiple scanned documents into professional PDFs that meet official requirements.',
        backgroundColor: 'bg-gradient-to-br from-[#C4D6B0] to-[#67705C]',
        scene: 'id-scan',
    },
    {
        title: ['🏢 For Businesses & Admins', '💼 For Freelancers'],
        subtitle: [
            'Easily Create Internal & Client Documents',
            'Create Branded Reports & Deliverables',
        ],
        description: [
            'For companies, HR teams, and professionals who need quick document handling without expensive software. Generate <b>contracts, reports,</b> and <b>business documents</b> effortlessly.',
            'Assemble <b>portfolio samples, image-heavy proposals,</b> and <b>invoice layouts</b> visually. Perfect for client deliverables.',
        ],
        backgroundColor: 'bg-gradient-to-br from-[#FCDE9C] to-[#96845D]',
        scene: 'report',
    },
    {
        title: ['🎯 For Marketers', '🎨 For Designers'],
        subtitle: ['Create Professional-Looking PDFs Fast', 'Quickly Arrange Image-Based PDFs'],
        description: [
            'Create <b>ad mockups, campaign reports,</b> and simple PDF-based visuals without spending hours in Canva or Adobe.',
            'Place, resize, and align images easily to create <b>print-ready layouts.</b> Perfect for <b>visual portfolios</b> and <b>client presentations.</b>',
        ],
        backgroundColor: 'bg-gradient-to-br from-[#FFA552] to-[#996331]',
        scene: 'gallery',
    },
    {
        title: '🎓 For Teachers & Students',
        subtitle: 'Annotate & Organize PDFs for Projects',
        description:
            'Merge images into PDFs, annotate scanned <b>documents</b>, and reorder pages for <b>assignments</b> with ease.',
        backgroundColor: 'bg-gradient-to-br from-[#BA5624] to-[#542710] [&_*]:text-white',
        scene: 'worksheet',
    },
];

export const BouncyCardsFeatures = () => {
    return (
        <section className="mx-auto max-w-7xl md:px-4 py-4 md:py-12 text-slate-800">
            <div className="w-full mb-8 flex flex-col items-start justify-between gap-4 md:px-8">
                <Typography variant="h2" tag="h2">
                    Built-In <span className="text-docmosaic-cream">Solutions</span> for Everyday
                    Tasks
                </Typography>
                <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <Typography variant="small">
                        <b>Who Is This For?</b>
                        <br />
                        From designers to teachers, DocMosaic helps anyone who needs to quickly{' '}
                        <b>create professional PDF documents.</b>
                    </Typography>
                    <CustomLink
                        href="/"
                        variant="gradient"
                        className="whitespace-nowrap web-app-access-trigger"
                        icon={<ArrowBigRight size={18} />}
                    >
                        TRY DOCMOSAIC
                    </CustomLink>
                </div>
            </div>
            <div className="mb-4 grid grid-cols-12 gap-4">
                {features.map((feature, index) => (
                    <BounceCard
                        key={index}
                        className={cn(
                            'col-span-12 md:col-span-4',
                            Array.isArray(feature.title) && 'md:col-span-8',
                            feature.backgroundColor,
                        )}
                    >
                        {typeof feature.title === 'string' ? (
                            <>
                                <CardTitle>{feature.title}</CardTitle>
                                <CardSubtitle>{feature.subtitle}</CardSubtitle>
                                <CardDescription
                                    dangerouslySetInnerHTML={{
                                        __html: feature.description as string,
                                    }}
                                />
                            </>
                        ) : (
                            <div className="grid flex-shrink-0 grid-cols-1 md:grid-cols-2 md:gap-4">
                                {feature.title.map((title, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            index === 0 &&
                                                'md:pr-6 md:mr-3 md:border-r border-docmosaic-black/15 max-md:mb-4 max-md:border-b max-md:border-docmosaic-purple/15',
                                        )}
                                    >
                                        <CardTitle>{title}</CardTitle>
                                        <CardSubtitle>
                                            {Array.isArray(feature.subtitle)
                                                ? feature.subtitle[index]
                                                : feature.subtitle}
                                        </CardSubtitle>
                                        <CardDescription
                                            dangerouslySetInnerHTML={{
                                                __html: Array.isArray(feature.description)
                                                    ? feature.description[index]
                                                    : feature.description,
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="relative mt-5 min-h-[150px] flex-1 overflow-hidden rounded-xl border border-docmosaic-black/10 bg-white shadow-[0px_10px_28px_-14px_rgba(56,29,42,0.4)] transition-transform duration-300 group-hover:scale-[1.015]">
                            <EditorCanvas
                                scene={feature.scene as CanvasScene}
                                showLabels={false}
                                cursorDelay={index * 0.7}
                            />
                        </div>
                    </BounceCard>
                ))}
            </div>
        </section>
    );
};

const BounceCard = ({ className, children }: { className: string; children: ReactNode }) => {
    return (
        <motion.div
            whileHover={{ scale: 0.98 }}
            className={`group relative flex min-h-[360px] cursor-pointer flex-col overflow-hidden rounded-[20px] p-5 shadow-[0px_0px_5px_0px_#0000004D] ${className}`}
        >
            {children}
        </motion.div>
    );
};

const CardTitle = ({ children }: { children: ReactNode }) => {
    return (
        <Typography variant="h3" tag="h3" className="mb-2">
            {children}
        </Typography>
    );
};

const CardSubtitle = ({ children }: { children: ReactNode }) => {
    return (
        <Typography variant="h6" tag="h6" className="mb-5">
            {children}
        </Typography>
    );
};

const CardDescription = ({
    dangerouslySetInnerHTML,
}: {
    dangerouslySetInnerHTML?: { __html: string };
}) => {
    return (
        <Typography variant="small" tag="p">
            <span dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
        </Typography>
    );
};
