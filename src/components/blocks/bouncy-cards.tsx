'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowBigRight } from 'lucide-react';
import Image from 'next/image';
import { ReactNode } from 'react';
import Typography from '../common/typography';
import { CustomLink } from '../ui/core/link';

const features = [
    {
        title: '⚖️ For Expats & Officials',
        subtitle: 'Simplify Document Processing',
        description:
            'Perfect for <b>visa applications, ID & passport scans,</b> and <b>administrative paperwork</b>. Arrange multiple scanned documents into professional PDFs that meet official requirements.',
        backgroundColor: 'bg-gradient-to-br from-[#C4D6B0] to-[#67705C]',
        image: '/showcases/officials.png',
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
        image: '/showcases/business.png',
    },
    {
        title: ['🎯 For Marketers', '🎨 For Designers'],
        subtitle: ['Create Professional-Looking PDFs Fast', 'Quickly Arrange Image-Based PDFs'],
        description: [
            'Create <b>ad mockups, campaign reports,</b> and simple PDF-based visuals without spending hours in Canva or Adobe.',
            'Place, resize, and align images easily to create <b>print-ready layouts.</b> Perfect for <b>visual portfolios</b> and <b>client presentations.</b>',
        ],
        backgroundColor: 'bg-gradient-to-br from-[#FFA552] to-[#996331]',
        image: '/showcases/designers.png',
    },
    {
        title: '🎓 For Teachers & Students',
        subtitle: 'Annotate & Organize PDFs for Projects',
        description:
            'Merge images into PDFs, annotate scanned <b>documents</b>, and reorder pages for <b>assignments</b> with ease.',
        backgroundColor: 'bg-gradient-to-br from-[#BA5624] to-[#542710] [&_*]:text-white',
        image: '/showcases/teachers.png',
    },
];

export const BouncyCardsFeatures = () => {
    return (
        <section className="mx-auto max-w-7xl px-4 py-4 md:py-12 text-slate-800">
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
                            Array.isArray(feature.title) && 'md:col-span-8 max-md:min-h-[390px]',
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px] md:h-full">
                                {feature.title.map((title, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            index === 0 &&
                                                'md:pr-6 md:mr-3 md:border-r border-docmosaic-black/15',
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
                        <div
                            className={cn(
                                'absolute bottom-0 left-4 right-4 top-36 translate-y-8 rounded-t-[20px] p-4 transition-transform duration-[250ms] group-hover:translate-y-6 group-hover:rotate-[2deg]',
                                Array.isArray(feature.title) && 'max-md:!top-auto max-md:!bottom-4',
                            )}
                        >
                            <Image
                                src={feature.image}
                                alt={
                                    Array.isArray(feature.title) ? feature.title[0] : feature.title
                                }
                                className={cn(
                                    'object-contain',
                                    Array.isArray(feature.title) && 'max-md:!h-auto',
                                )}
                                width={800}
                                height={800}
                                loading="lazy"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
            whileHover={{ scale: 0.95, rotate: '-1deg' }}
            className={`group relative min-h-[320px] cursor-pointer overflow-hidden rounded-[20px] p-5 shadow-[0px_0px_5px_0px_#0000004D] ${className}`}
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
