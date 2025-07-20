'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Typography from '../common/typography';

const VerticalSlideFeatures = () => {
    const [selected, setSelected] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.5 },
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            setSelected((prev) => (prev + 1) % FEATURES.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isVisible]);

    return (
        <section
            ref={sectionRef}
            className="mx-auto flex max-w-5xl flex-col-reverse items-center gap-6 bg-white px-4 py-12 md:flex-row md:gap-12 md:px-8"
        >
            <div className="w-full p-4 shadow-[0px_0px_8px_0px_#00000026] rounded-[20px]">
                <div className="w-full border-b pb-4 border-docmosaic-black/5 flex justify-between items-center">
                    <div className="flex gap-1.5 rounded-t-xl">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex gap-2 items-center">
                        <Image src="/logo.svg" alt="Logo" width={21} height={21} />
                        <Typography variant="h6" tag="h6">
                            DocMosaic
                        </Typography>
                    </div>
                </div>
                <div className="relative h-[300px] md:h-[400px]">
                    {FEATURES.map((tab, index) => (
                        <motion.div
                            key={index}
                            initial={false}
                            animate={{
                                opacity: selected === index ? 1 : 0,
                                zIndex: selected === index ? 1 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={tab.image}
                                alt={tab.title}
                                width={500}
                                height={400}
                                className="w-full h-full object-cover"
                                priority={index === 0}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
            <Tabs selected={selected} setSelected={setSelected} />
        </section>
    );
};

interface TabsProps {
    selected: number;
    setSelected: Dispatch<SetStateAction<number>>;
}

const Tabs = ({ selected, setSelected }: TabsProps) => {
    return (
        <div className="w-full shrink-0 overflow-scroll scrollbar-hide md:w-fit">
            <Typography variant="h2" tag="h6" className="mb-10">
                Finally, a <span className="text-docmosaic-caramel">Tool</span>
                <br />
                That Just Works
            </Typography>
            {FEATURES.map((tab, index) => {
                return (
                    <Tab
                        key={index}
                        setSelected={setSelected}
                        selected={selected === index}
                        title={tab.title}
                        tabNum={index}
                    />
                );
            })}
        </div>
    );
};

interface TabProps {
    selected: boolean;
    title: string;
    setSelected: (tabNum: number) => void;
    tabNum: number;
}

const Tab = ({ selected, title, setSelected, tabNum }: TabProps) => {
    return (
        <div className="group relative w-full md:w-fit">
            <button
                onClick={() => setSelected(tabNum)}
                className="relative z-0 flex w-full border-l-[6px] border-docmosaic-black/5 p-4 transition-colors group-hover:border-docmosaic-sage/50 md:flex-col md:border-l-8 md:p-6"
            >
                <Typography variant="h3" tag="h6" className="min-w-[150px] max-w-[200px] text-left">
                    {title}
                </Typography>
            </button>
            {selected && (
                <motion.span
                    layoutId="vertical-slide-feature-slider"
                    className="absolute bottom-0 left-0 top-0 z-10 w-[6px] bg-docmosaic-sage md:w-2"
                />
            )}
        </div>
    );
};

export default VerticalSlideFeatures;

const FEATURES = [
    {
        title: 'Upload images',
        image: '/showcases/upload.png',
    },
    {
        title: 'Arrange',
        image: '/showcases/arrange.png',
    },
    {
        title: 'Download',
        image: '/showcases/download.png',
    },
];
