'use client';

import { ArrowBigRight } from 'lucide-react';
import { MotionConfig, motion } from 'motion/react';
import { twMerge } from 'tailwind-merge';
import Typography from '../common/typography';

export const SpringCards = () => {
    return (
        <section className="bg-white px-8 py-20">
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
                <Card
                    title="No Sign-Up Needed"
                    subtitle="Just open & start. No accounts, no waiting, no hassle."
                    className="bg-docmosaic-sage"
                />
                <Card
                    title="100% Private"
                    subtitle="Everything stays on your device. No uploads, no personal data collection."
                    className="bg-docmosaic-cream sm:-translate-y-6"
                />
                <Card
                    title="Faster than Online Editors"
                    subtitle="No waiting for uploads or processing. Edit instantly."
                    className="bg-docmosaic-caramel"
                />
                <Card
                    title="Completely Free"
                    subtitle="No hidden fees, no premium features, no limits. Everything included."
                    className="[&_h3]:text-white [&_*]:text-white bg-docmosaic-orange sm:-translate-y-6"
                />
            </div>
        </section>
    );
};

const Card = ({
    title,
    subtitle,
    className,
}: {
    title: string;
    subtitle: string;
    className?: string;
}) => {
    return (
        <MotionConfig
            transition={{
                type: 'spring',
                bounce: 0.5,
            }}
        >
            <motion.div
                whileHover="hovered"
                className={twMerge(
                    'group w-full border-2 border-docmosaic-black rounded-[20px]',
                    className,
                )}
            >
                <motion.div
                    initial={{
                        x: 0,
                        y: 0,
                    }}
                    variants={{
                        hovered: {
                            x: -8,
                            y: -8,
                        },
                    }}
                    className={twMerge(
                        '-m-0.5 border-2 border-docmosaic-black rounded-[20px]',
                        className,
                    )}
                >
                    <motion.div
                        initial={{
                            x: 0,
                            y: 0,
                        }}
                        variants={{
                            hovered: {
                                x: -8,
                                y: -8,
                            },
                        }}
                        className={twMerge(
                            'relative -m-0.5 flex h-52 flex-col justify-between overflow-hidden border-2 border-docmosaic-black p-8 rounded-[20px]',
                            className,
                        )}
                    >
                        <div className="flex items-center">
                            <ArrowBigRight className="-ml-8 mr-2 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-0 group-hover:opacity-100" />
                            <Typography variant="h3" tag="h3">
                                {title.split(/[\s-]+/).map((word, idx) => (
                                    <span key={idx}>
                                        {word}
                                        {(idx + 1) % 3 === 0 &&
                                            idx !== title.split(/[\s-]+/).length - 1 && <br />}{' '}
                                    </span>
                                ))}
                            </Typography>
                        </div>
                        <div>
                            <Typography className="transition-[margin] duration-300 ease-in-out group-hover:mb-10">
                                {subtitle}
                            </Typography>
                            <button className="absolute bottom-2 left-2 right-2 translate-y-full bg-white px-4 py-2 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100 rounded-lg">
                                <Typography variant="h4" tag="h6" className="!text-docmosaic-black">
                                    LET&apos;S GO
                                </Typography>
                            </button>
                        </div>

                        <motion.svg
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 25,
                                repeat: Infinity,
                                repeatType: 'loop',
                                ease: 'linear',
                            }}
                            style={{
                                top: '0',
                                right: '0',
                                x: '50%',
                                y: '-50%',
                                scale: 0.75,
                            }}
                            width="200"
                            height="200"
                            className="pointer-events-none absolute z-10 rounded-full"
                        >
                            <path
                                id="circlePath"
                                d="M100,100 m-100,0 a100,100 0 1,0 200,0 a100,100 0 1,0 -200,0"
                                fill="none"
                            />
                            <text>
                                <textPath
                                    href="#circlePath"
                                    fill="black"
                                    className="fill-docmosaic-black text-2xl font-medium uppercase opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
                                >
                                    LEARN MORE • LEARN MORE • LEARN MORE • LEARN MORE •
                                </textPath>
                            </text>
                        </motion.svg>
                    </motion.div>
                </motion.div>
            </motion.div>
        </MotionConfig>
    );
};
