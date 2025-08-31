'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FileDown, Monitor, TabletSmartphone } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import Typography from '../common/typography';
import { CustomLink } from '../ui/core/link';

interface Card {
    Icon: React.ElementType;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    buttonClass: string;
}

const cards = [
    // {
    //     Icon: SquareMousePointer,
    //     title: 'Touch-Optimized Interface',
    //     description: 'Drag, resize, and arrange with natural touch gestures on any device.',
    //     buttonText: 'TRY MOBILE APP',
    //     buttonLink: '/',
    //     buttonClass: 'mobile-app-access-trigger',
    // },
    {
        Icon: Monitor,
        title: 'Seamless Desktop Experience',
        description: 'Full functionality on larger screens with keyboard shortcuts.',
        buttonText: 'TRY Docmosaic',
        buttonLink: '/',
        buttonClass: 'web-app-access-trigger',
    },
    {
        Icon: TabletSmartphone,
        title: 'Works on All Devices',
        description: 'No app needed. Just open in your browser and start editing.',
        buttonText: 'TRY WEB APP',
        buttonLink: '/',
        buttonClass: 'web-app-access-trigger',
    },
    {
        Icon: FileDown,
        title: 'Instant Export Anywhere',
        description: "Download your PDFs instantly, whether you're on phone or desktop.",
        buttonText: 'TRY Docmosaic',
        buttonLink: '/',
        buttonClass: 'web-app-access-trigger',
    },
];

const StackedCards = () => {
    const [selected, setSelected] = useState(0);

    return (
        <section className="bg-white py-24 px-4 lg:px-8 grid items-center grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 overflow-hidden">
            <div className="p-4">
                <Typography variant="h2" tag="h2">
                    Works on Desktop & Mobile – Edit{' '}
                    <span className="text-docmosaic-sage">PDFs</span> Anywhere!
                </Typography>
                <Typography className="my-4">
                    No need for a computer. Edit PDFs right from your phone - drag, arrange, and
                    export in seconds.
                </Typography>
                <SelectBtns
                    numTracks={cards.length}
                    setSelected={setSelected}
                    selected={selected}
                />
            </div>
            <Cards cards={cards} setSelected={setSelected} selected={selected} />
        </section>
    );
};

const SelectBtns = ({
    numTracks,
    setSelected,
    selected,
}: {
    numTracks: number;
    setSelected: Dispatch<SetStateAction<number>>;
    selected: number;
}) => {
    return (
        <div className="flex gap-1 mt-8">
            {Array.from(Array(numTracks).keys()).map((n) => {
                return (
                    <button
                        key={n}
                        onClick={() => setSelected(n)}
                        className="h-1.5 w-full bg-slate-300 relative"
                        aria-label={`View ${cards[n]?.title || `slide ${n + 1}`}`}
                    >
                        {selected === n ? (
                            <motion.span
                                className="absolute top-0 left-0 bottom-0 bg-docmosaic-cream"
                                initial={{
                                    width: '0%',
                                }}
                                animate={{
                                    width: '100%',
                                }}
                                transition={{
                                    duration: 5,
                                }}
                                onAnimationComplete={() => {
                                    setSelected(selected === numTracks - 1 ? 0 : selected + 1);
                                }}
                            />
                        ) : (
                            <span
                                className="absolute top-0 left-0 bottom-0 bg-docmosaic-cream"
                                style={{
                                    width: selected > n ? '100%' : '0%',
                                }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

const Cards = ({
    cards,
    selected,
    setSelected,
}: {
    cards: Card[];
    selected: number;
    setSelected: Dispatch<SetStateAction<number>>;
}) => {
    return (
        <div className="p-4 relative min-h-[250px] lg:min-h-[350px]">
            {cards.map((t, i) => {
                return (
                    <Card
                        {...t}
                        key={i}
                        position={i}
                        selected={selected}
                        setSelected={setSelected}
                    />
                );
            })}
        </div>
    );
};

const Card = ({
    Icon,
    title,
    description,
    buttonText,
    buttonLink,
    position,
    selected,
    setSelected,
}: Card & {
    position: number;
    selected: number;
    setSelected: Dispatch<SetStateAction<number>>;
}) => {
    const scale = position <= selected ? 1 : 1 + 0.015 * (position - selected);
    const offset = position <= selected ? 0 : 95 + (position - selected) * 3;

    return (
        <motion.div
            initial={false}
            style={{
                zIndex: position,
                transformOrigin: 'left bottom',
            }}
            animate={{
                x: `${offset}%`,
                scale,
            }}
            whileHover={{
                translateX: position === selected ? 0 : -3,
            }}
            transition={{
                duration: 0.25,
                ease: 'easeOut',
            }}
            onClick={() => setSelected(position)}
            className={cn(
                `absolute top-0 left-0 w-full min-h-full p-8 lg:p-10 cursor-pointer flex flex-col justify-between rounded-l-3xl shadow-[2px_0px_10px_0px_#0000001A] overflow-hidden transition-all duration-300`,
                position % 2 ? 'bg-white' : 'bg-docmosaic-black',
            )}
        >
            <div className="title flex items-center gap-2">
                <Icon
                    className={cn('text-7xl', position % 2 ? 'text-docmosaic-black' : 'text-white')}
                />

                <Typography
                    variant="h3"
                    tag="h3"
                    className={position % 2 ? 'text-docmosaic-black' : 'text-white'}
                >
                    {title}
                </Typography>
            </div>
            <div
                className={cn(
                    'my-6 h-[1px] w-full',
                    position % 2 ? 'bg-docmosaic-black/15' : 'bg-gradient',
                )}
            />
            <Typography
                variant="h4"
                tag={'p'}
                className={position % 2 ? 'text-docmosaic-black' : 'text-white'}
            >
                {description}
            </Typography>
            <div className="mt-auto flex items-center gap-2">
                <CustomLink
                    href={buttonLink}
                    variant={position % 2 ? 'sage' : 'white'}
                    className={cn('w-full', cards[position].buttonClass)}
                >
                    {buttonText}
                </CustomLink>
            </div>
        </motion.div>
    );
};

export default StackedCards;
