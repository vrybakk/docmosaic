'use client';

import Loader from '@/components/ui/loader';
import { ArrowRight, Github, Layout, Shield, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const { ref: statsRef, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow pt-16">
                <section className="container mx-auto px-4 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <h1 className="text-5xl lg:text-7xl font-semibold leading-tight text-docmosaic-purple">
                                Visual PDF <br />
                                Creation Made <br />
                                <span className="text-docmosaic-sage">Simple</span>
                            </h1>
                            <p className="text-xl max-w-lg text-docmosaic-purple">
                                Free and open source tool for creating structured PDF documents with
                                arranged images.
                            </p>
                            <div ref={statsRef} className="grid grid-cols-3 gap-8">
                                {stats.map((stat, index) => (
                                    <div key={index}>
                                        <div className="stats-value">
                                            {inView ? (
                                                <AnimatedNumber
                                                    value={stat.value}
                                                    duration={2000}
                                                />
                                            ) : (
                                                '0+'
                                            )}
                                        </div>
                                        <div className="stats-label">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/pdf-editor" className="btn-primary group">
                                    Try DocMosaic Now
                                    <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                                <a href="#how-it-works" className="btn-secondary group">
                                    Learn More
                                    <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                </a>
                            </div>
                        </div>
                        <div className="flex justify-center lg:justify-end">
                            <Image
                                src="/logo.svg"
                                alt="DocMosaic Logo"
                                width={400}
                                height={400}
                                className="w-full max-w-lg"
                            />
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-semibold text-center text-docmosaic-purple mb-16">
                            How DocMosaic Works
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-8">
                                <h3 className="text-3xl font-semibold text-docmosaic-purple mb-8">
                                    Why Choose DocMosaic?
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {features.map((feature, index) => (
                                        <div
                                            key={index}
                                            className="bg-white bg-opacity-30 backdrop-blur-sm rounded-lg p-6 shadow-md transition-all duration-300"
                                        >
                                            <div className="w-12 h-12 mb-4 bg-[#381D2A] rounded-lg flex items-center justify-center">
                                                <feature.icon className="w-6 h-6 text-[#ffffff]" />
                                            </div>
                                            <h4 className="text-xl font-semibold text-docmosaic-purple mb-2">
                                                {feature.title}
                                            </h4>
                                            <p className="text-docmosaic-purple">
                                                {feature.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-3xl font-semibold text-docmosaic-purple mb-8">
                                    The DocMosaic Process
                                </h3>
                                <div className="space-y-6">
                                    {steps.map((step, index) => (
                                        <div key={index} className="flex items-start space-x-4">
                                            <div className="w-10 h-10 bg-[#381D2A] rounded-full flex items-center justify-center text-[#ffffff] font-semibold text-xl flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="text-xl font-semibold text-docmosaic-purple mb-2">
                                                    {step.title}
                                                </h4>
                                                <p className="text-docmosaic-purple">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-20">
                            <h3 className="text-3xl font-semibold text-center text-docmosaic-purple mb-12">
                                Perfect For
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {useCases.map((useCase, index) => (
                                    <div
                                        key={index}
                                        className="bg-white bg-opacity-30 backdrop-blur-sm rounded-lg p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 text-center"
                                    >
                                        <div className="text-5xl mb-4">{useCase.emoji}</div>
                                        <h4 className="text-xl font-semibold text-docmosaic-purple mb-2">
                                            {useCase.title}
                                        </h4>
                                        <p className="text-docmosaic-purple">
                                            {useCase.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <Image
                                src="/logo.svg"
                                alt="DocMosaic Logo"
                                width={80}
                                height={80}
                                className="mb-4"
                            />
                            <h3 className="text-lg font-semibold mb-4 text-docmosaic-purple">
                                DocMosaic
                            </h3>
                            <p className="text-docmosaic-purple">
                                Free and open source tool for creating structured PDF documents with
                                arranged images.
                            </p>
                        </div>
                        <div className="flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-docmosaic-purple">
                                    Join Our Open Source Community
                                </h3>
                                <p className="mb-4 text-docmosaic-purple">
                                    Explore the code, contribute to development, share ideas, and
                                    report issues.
                                </p>
                                <Link
                                    href="https://github.com/yourusername/docmosaic"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary inline-flex items-center group"
                                >
                                    View on GitHub
                                    <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 flex justify-between items-center text-docmosaic-purple">
                        <p>&copy; {new Date().getFullYear()} DocMosaic. All rights reserved.</p>
                        <p>
                            created by{' '}
                            <Link
                                href="https://nerd-stud.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                            >
                                nerd-stud.io
                            </Link>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const features = [
    {
        title: 'Visual Document Building',
        description: 'Arrange images efficiently with intuitive controls.',
        icon: Layout,
    },
    {
        title: 'Instant Results',
        description: 'See your document take shape in real-time as you work.',
        icon: Zap,
    },
    {
        title: 'Free & Open Source',
        description: 'No hidden costs. Use and contribute freely.',
        icon: Github,
    },
    {
        title: 'Browser-Only',
        description: 'Your files never leave your device, ensuring privacy.',
        icon: Shield,
    },
];

const steps = [
    { title: 'Start Your Document', description: 'Choose your page size and orientation.' },
    { title: 'Add Your Images', description: 'Upload and place your images onto the layout.' },
    {
        title: 'Arrange to Perfection',
        description: 'Fine-tune positioning and sizing for the perfect look.',
    },
    {
        title: 'Download PDF',
        description: 'Generate and download your finished document instantly.',
    },
];

const useCases = [
    {
        emoji: '🪪',
        title: 'Identity Documents',
        description: 'Combine both sides of your ID on one page with precise alignment.',
    },
    {
        emoji: '📸',
        title: 'Photo Collections',
        description: 'Organize multiple photos in a structured layout.',
    },
    {
        emoji: '🧾',
        title: 'Business Documents',
        description: 'Compile receipts, business cards, or documents efficiently.',
    },
    {
        emoji: '📑',
        title: 'Visual Documentation',
        description: 'Create visual documentation with accurate image placement.',
    },
];

const stats = [
    { value: 5, label: 'Layout Options' },
    { value: 10, label: 'Features' },
    { value: 100, label: 'Happy Users' },
];

function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [value, duration]);

    return <>{count}+</>;
}
