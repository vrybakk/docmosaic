'use client';

import { motion } from 'framer-motion';
import {
    ArrowBigRight,
    ArrowRight,
    BookOpen,
    FileKey2,
    HandCoins,
    HardDrive,
    Lock,
    Shield,
    Sparkles,
} from 'lucide-react';
import Typography from '../common/typography';
import { CustomLink } from '../ui/core/link';

const ease = [0.22, 1, 0.36, 1] as const;

const Hero = () => {
    return (
        <div className="relative flex flex-col items-center text-center pt-6 pb-12 md:pt-10 md:pb-16">
            <motion.a
                href="https://docs.docmosaic.com/changelog"
                target="_blank"
                rel="noopener noreferrer"
                className="changelog-click-trigger group mb-6 inline-flex items-center gap-2 rounded-full border border-docmosaic-sage bg-docmosaic-sage/25 py-1 pl-1.5 pr-3.5 transition-colors hover:bg-docmosaic-sage/40"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
            >
                <span className="inline-flex items-center gap-1 rounded-full bg-docmosaic-purple px-2 py-0.5 text-docmosaic-cream">
                    <Sparkles className="h-3 w-3" />
                    <Typography variant="extraSmall" className="!text-inherit font-semibold uppercase">
                        v2
                    </Typography>
                </span>
                <Typography variant="small" className="text-docmosaic-purple">
                    New — Frames are here
                </Typography>
                <ArrowRight className="h-4 w-4 text-docmosaic-orange transition-transform group-hover:translate-x-0.5" />
            </motion.a>

            <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease }}
            >
                <Typography
                    variant="h2"
                    tag="h1"
                    className="mx-auto max-w-3xl !text-[2rem] !leading-[1.12] sm:!text-[2.75rem] lg:!text-[3.25rem]"
                >
                    <span className="text-docmosaic-caramel">PDF</span> Editing Shouldn&apos;t Be
                    This <span className="text-docmosaic-orange">Hard</span> — So We{' '}
                    <span className="text-docmosaic-caramel">Fixed It</span>
                </Typography>

                <Typography
                    variant="paragraph"
                    className="mx-auto max-w-xl !text-base text-docmosaic-black/70"
                >
                    Drop in images, arrange them on a virtual page, and export a clean PDF — right in
                    your browser.{' '}
                    <span className="font-medium text-docmosaic-black">
                        Fast, simple, DONE in seconds.
                    </span>
                </Typography>

                <div className="flex flex-wrap justify-center gap-3">
                    {keyFeatures.map((feature) => (
                        <div
                            key={feature.text}
                            className="inline-flex items-center rounded-full bg-docmosaic-sage px-3 py-1 uppercase"
                        >
                            <feature.icon className="mr-2 h-4 w-4" />
                            <Typography variant="small">{feature.text}</Typography>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <CustomLink
                            href="/pdf-editor"
                            variant="gradient"
                            className="web-app-access-trigger"
                            icon={
                                <ArrowBigRight
                                    className="transition-transform group-hover:translate-x-1"
                                    size={18}
                                />
                            }
                        >
                            Try It Instantly
                        </CustomLink>
                        <CustomLink
                            href="https://docs.docmosaic.com"
                            external
                            variant="outline"
                            className="documentation-click-trigger !border-docmosaic-purple/25 bg-white hover:bg-docmosaic-cream/40"
                            icon={<BookOpen size={18} />}
                        >
                            Read the Docs
                        </CustomLink>
                    </div>
                    <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <Typography variant="small">
                            <b className="font-semibold">Privacy-First:</b> Your files never leave
                            your device.
                        </Typography>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Hero;

const keyFeatures = [
    { icon: FileKey2, text: 'No Sign-Up' },
    { icon: Shield, text: 'Privacy-First' },
    { icon: HandCoins, text: 'Always Free' },
    { icon: HardDrive, text: 'No Server' },
];
