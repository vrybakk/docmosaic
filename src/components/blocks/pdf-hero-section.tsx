'use client';

import Typography from '@/components/common/typography';
import { CustomLink } from '@/components/ui/core/link';
import { motion } from 'framer-motion';
import { ArrowBigRight, Lock } from 'lucide-react';
import Image from 'next/image';

export default function PdfHeroSection() {
    return (
        <section className="overflow-hidden bg-white">
            <div className="relative flex flex-col items-center justify-center px-4 md:px-12 pb-20 pt-12 md:pt-24">
                {/* <div className="mb-1.5 rounded-full bg-zinc-600">
                    <div className="flex origin-top-left items-center rounded-full  bg-white p-0.5 text-sm transition-transform hover:-rotate-2 shadow-[0px_0px_4px_0px_#00000066]">
                        <span className="rounded-full bg-docmosaic-sage px-2 py-0.5 font-medium text-white">
                            HEY!
                        </span>
                        <span className="ml-1.5 mr-1 inline-block">Download our Mobile App</span>
                        <ArrowBigRight className="mr-2 inline-block" size={18} />
                    </div>
                </div> */}
                <Typography
                    variant="h2"
                    tag="h1"
                    className="mt-3 max-w-4xl text-center leading-[1.15]"
                >
                    Tame Your <span className="text-docmosaic-caramel">PDFs</span> with Ease
                </Typography>
                <p className="mx-auto my-4 max-w-3xl text-center text-base leading-relaxed md:my-6 md:text-xl md:leading-relaxed">
                    <Lock className="w-4 h-4 mr-2 inline-block" />
                    No sign-up. No personal data collection. No limits. Just open & use.
                </p>
                <CustomLink
                    variant={'gradient'}
                    href="/pdf-editor"
                    className="rounded-lg p-3 uppercase transition-colors max-md:w-full web-app-access-trigger mb-8"
                    icon={<ArrowBigRight size={18} />}
                >
                    START EDITING NOW
                </CustomLink>

                <div className="flex items-end gap-10 mt-8 -mb-20">
                    <div className="relative">
                        <Image
                            src="/showcases/desktop.png"
                            alt="DocMosaic Desktop Interface"
                            width={450}
                            height={272}
                            className="rounded-lg shadow-lg max-w-[450px] h-auto"
                            loading="lazy"
                            quality={85}
                            sizes="(max-width: 768px) 90vw, 450px"
                        />
                    </div>
                    <div className="relative max-md:hidden">
                        <Image
                            src="/showcases/mobile.png"
                            alt="DocMosaic Mobile Interface"
                            width={180}
                            height={299}
                            className="rounded-lg shadow-lg max-w-[180px] h-auto"
                            loading="lazy"
                            quality={85}
                            sizes="(max-width: 768px) 0px, 180px"
                        />
                    </div>
                </div>
            </div>

            <div className="relative -mt-16 md:-mt-24 -rotate-1 scale-[1.01] bg-white pb-6">
                <div
                    className="relative z-0 flex overflow-hidden"
                    style={{ boxShadow: '0px 0px 4px 0px #00000040' }}
                >
                    <TranslateWrapper>
                        <RunningTextTop />
                    </TranslateWrapper>
                    <TranslateWrapper>
                        <RunningTextTop />
                    </TranslateWrapper>
                    <TranslateWrapper>
                        <RunningTextTop />
                    </TranslateWrapper>
                </div>
                <div
                    className="relative z-0 flex overflow-hidden"
                    style={{ boxShadow: '0px 0px 4px 0px #00000040' }}
                >
                    <TranslateWrapper reverse>
                        <RunningTextBottom />
                    </TranslateWrapper>
                    <TranslateWrapper reverse>
                        <RunningTextBottom />
                    </TranslateWrapper>
                    <TranslateWrapper reverse>
                        <RunningTextBottom />
                    </TranslateWrapper>
                </div>

                <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-32 bg-gradient-to-r from-white to-white/0" />
                <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-32 bg-gradient-to-l from-white to-white/0" />
            </div>
        </section>
    );
}

const TranslateWrapper = ({
    children,
    reverse,
}: {
    children: React.ReactElement;
    reverse?: boolean;
}) => {
    return (
        <motion.div
            initial={{ translateX: reverse ? '-100%' : '0%' }}
            animate={{ translateX: reverse ? '0%' : '-100%' }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="flex"
        >
            {children}
        </motion.div>
    );
};

const separators = [
    <svg
        key="1"
        width="11"
        height="11"
        viewBox="0 0 11 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M4.7791 10.7931L10.7469 10.4951L10.4488 4.52731C10.3379 2.30734 8.44836 0.597416 6.22827 0.708295L4.28028 0.805585C2.06018 0.916465 0.350387 2.80616 0.461261 5.02613L0.55855 6.97412C0.669433 9.19428 2.55899 10.904 4.7791 10.7931Z"
            fill="#BA5624"
        />
    </svg>,
    <svg
        key="2"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M11.351 10.6328L1.36344 11.1316L0.864624 1.14404L10.8522 0.645228L11.351 10.6328ZM2.39202 9.99494L10.2143 9.60427L9.8236 1.78196L2.00134 2.17263L2.39202 9.99494Z"
            fill="#381D2A"
        />
    </svg>,
    <svg
        key="3"
        width="11"
        height="11"
        viewBox="0 0 11 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M10.0808 9.80856L0.093297 10.3074L4.5879 0.0704348L10.0808 9.80856ZM2.25692 8.70356L7.76747 8.42834L4.73697 3.05529L2.25692 8.70356Z"
            fill="#C4D6B0"
        />
    </svg>,
    <svg
        key="4"
        width="11"
        height="11"
        viewBox="0 0 11 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M5.75849 10.889C8.51649 10.7513 10.6406 8.40387 10.5028 5.64587C10.3651 2.88786 8.01768 0.763725 5.25967 0.90147C2.50167 1.03921 0.377533 3.38668 0.515278 6.14468C0.653023 8.90269 3.00049 11.0268 5.75849 10.889Z"
            fill="#FCDE9C"
        />
    </svg>,
    <svg
        key="5"
        width="11"
        height="11"
        viewBox="0 0 11 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M5.0512 0.479106L10.2943 5.22357L5.54984 10.4667L0.306776 5.7222L5.0512 0.479106Z"
            fill="#FFA552"
        />
    </svg>,
];

const TextItem = ({ text, index }: { text: string; index: number }) => {
    const separator = separators[index % separators.length];

    return (
        <>
            <span className="flex items-center justify-center gap-4 px-4 py-2 md:py-4">
                <Typography
                    variant="h6"
                    tag="span"
                    className="whitespace-nowrap font-semibold uppercase text-docmosaic-purple"
                >
                    {text}
                </Typography>
            </span>
            <span className="flex items-center justify-center px-2 py-2 md:py-4">{separator}</span>
        </>
    );
};

const RunningTextTop = () => (
    <>
        <TextItem text="Organize PDFs without limits" index={0} />
        <TextItem text="Drag, drop, done" index={1} />
        <TextItem text="PDF magic, minus the headache" index={2} />
        <TextItem text="Arrange, adjust, export" index={3} />
        <TextItem text="Rearrange pages with ease" index={4} />
    </>
);

const RunningTextBottom = () => (
    <>
        <TextItem text="Good vibes, great files" index={0} />
        <TextItem text="The PDF tool you didn't know you needed" index={1} />
        <TextItem text="Fix your PDFs in less time" index={2} />
        <TextItem text="Smooth workflows, clean exports" index={3} />
        <TextItem text="Arrange your documents in minutes" index={4} />
    </>
);
