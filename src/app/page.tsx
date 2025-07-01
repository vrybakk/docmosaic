'use client';

import DonateButton from '@/components/donate-button';
import FeedbackModal from '@/components/feedback/feedback-modal';
import Footer from '@/components/layout/footer';
import Loader from '@/components/ui/data-display/loader';
import {
    ArrowRight,
    Code,
    Coffee,
    Download,
    Github,
    Lock,
    MessageSquare,
    Monitor,
    Shield,
    Smartphone,
    TabletSmartphone,
    Users,
    Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);

    const { ref: demoRef, inView: demoInView } = useInView({
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
                {/* Hero Section */}
                <section className="container mx-auto px-4 py-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <h1 className="text-3xl md:text-5xl lg:text-6xl leading-tight text-docmosaic-purple">
                                        PDF Editing Shouldn&apos;t Be This Hard – So We Fixed It
                                    </h1>
                                    <p className="text-xl text-docmosaic-purple/80 max-w-xl">
                                        Whether you&apos;re preparing visa documents, printing IDs,
                                        or creating professional layouts - existing tools made it
                                        complicated. So I built this -{' '}
                                        <span className="font-medium text-docmosaic-purple">
                                            fast, simple, DONE in seconds!
                                        </span>
                                    </p>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        {keyFeatures.map((feature, index) => (
                                            <div
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full bg-docmosaic-sage/20 text-sm text-docmosaic-purple"
                                            >
                                                <feature.icon className="w-4 h-4 mr-2" />
                                                {feature.text}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link
                                            href="/pdf-editor"
                                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-docmosaic-purple text-white rounded-lg hover:bg-docmosaic-purple/90 transition-all duration-300 group"
                                        >
                                            Try It Instantly – No Sign-Up
                                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                        <Link
                                            href="https://github.com/vrybakk/docmosaic"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium border-2 border-docmosaic-purple text-docmosaic-purple rounded-lg hover:bg-docmosaic-purple/5 transition-all duration-300 group"
                                        >
                                            <Github className="w-5 h-5 mr-2" />
                                            View on GitHub
                                        </Link>
                                    </div>
                                    <div className="flex items-center text-docmosaic-purple/70 text-sm">
                                        <Lock className="w-4 h-4 mr-2" />
                                        <p>Privacy-First: Your files never leave your device.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-docmosaic-sage/20 to-docmosaic-cream/30 rounded-3xl transform rotate-3"></div>
                                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                                    <div className="aspect-[4/3]">
                                        <Image
                                            src="/placeholder.svg?height=600&width=800"
                                            alt="DocMosaic Demo"
                                            width={800}
                                            height={600}
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm font-medium text-docmosaic-purple">
                                                    Live Demo
                                                </span>
                                            </div>
                                            <p className="text-sm text-docmosaic-purple/70">
                                                Drag. Arrange. Export. Done.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {whyFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <feature.icon className="w-8 h-8 text-docmosaic-purple mb-4" />
                                    <h3 className="font-medium text-lg text-docmosaic-purple mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-docmosaic-purple/70">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Demo Section */}
                <section ref={demoRef} className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div
                                className={`relative rounded-xl overflow-hidden shadow-2xl transition-all duration-1000 transform ${
                                    demoInView
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-10'
                                }`}
                            >
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full"
                                    poster="/placeholder.svg?height=600&width=800"
                                >
                                    <source src="/demo.mp4" type="video/mp4" />
                                </video>
                            </div>
                            <div className="text-center mt-8">
                                <p className="text-2xl font-medium text-docmosaic-purple mb-6">
                                    Drag. Arrange. Export. That&apos;s it.
                                </p>
                                <Link
                                    href="/pdf-editor"
                                    className="inline-flex items-center px-6 py-3 bg-docmosaic-sage text-docmosaic-purple rounded-lg hover:bg-docmosaic-sage/80 transition-all duration-300 group"
                                >
                                    Start Editing Now
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Comparison */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-4xl font-medium text-center text-docmosaic-purple mb-12">
                                Why Use This Instead of Canva or Adobe?
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <feature.icon className="w-8 h-8 text-docmosaic-purple mb-4" />
                                        <h3 className="text-xl font-medium text-docmosaic-purple mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-docmosaic-purple/80">
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mobile-Friendly Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-medium text-docmosaic-purple">
                                        Works on Desktop & Mobile – Edit PDFs Anywhere!
                                    </h2>
                                    <p className="text-xl text-docmosaic-purple/80">
                                        No need for a computer. Edit PDFs right from your phone -
                                        drag, arrange, and export in seconds.
                                    </p>
                                    <ul className="space-y-4">
                                        {deviceFeatures.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <div className="flex-shrink-0 w-5 h-5 mt-1">
                                                    <feature.icon className="w-5 h-5 text-docmosaic-purple" />
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="font-medium text-docmosaic-purple">
                                                        {feature.title}
                                                    </h3>
                                                    <p className="text-docmosaic-purple/70">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="pt-4">
                                        <Link
                                            href="/pdf-editor"
                                            className="inline-flex items-center px-6 py-3 bg-docmosaic-purple text-white rounded-lg hover:bg-docmosaic-purple/90 transition-all duration-300 group"
                                        >
                                            Try It Now on Any Device
                                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-docmosaic-sage/20 to-docmosaic-cream/30 rounded-3xl transform -rotate-3"></div>
                                    <div className="relative">
                                        {/* Desktop */}
                                        <div className="relative z-30 bg-white rounded-lg shadow-xl p-2 max-w-[80%] mx-auto">
                                            <Image
                                                src="/placeholder.svg?height=400&width=600"
                                                alt="Desktop version"
                                                width={600}
                                                height={400}
                                                className="rounded-md"
                                            />
                                        </div>
                                        {/* Tablet */}
                                        <div className="absolute bottom-0 left-0 z-20 bg-white rounded-lg shadow-xl p-2 w-[40%] transform -translate-x-8 translate-y-12">
                                            <Image
                                                src="/placeholder.svg?height=300&width=200"
                                                alt="Tablet version"
                                                width={200}
                                                height={300}
                                                className="rounded-md"
                                            />
                                        </div>
                                        {/* Mobile */}
                                        <div className="absolute bottom-0 right-0 z-10 bg-white rounded-lg shadow-xl p-2 w-[30%] transform translate-x-8 translate-y-24">
                                            <Image
                                                src="/placeholder.svg?height=400&width=200"
                                                alt="Mobile version"
                                                width={200}
                                                height={400}
                                                className="rounded-md"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Use Cases */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-medium text-center text-docmosaic-purple mb-4">
                            Who Is This For?
                        </h2>
                        <p className="text-xl text-center text-docmosaic-purple/70 mb-12 max-w-3xl mx-auto">
                            From designers to teachers, DocMosaic helps anyone who needs to quickly
                            create professional PDF documents.
                        </p>
                        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                            {useCases.map((useCase, index) => (
                                <div
                                    key={index}
                                    className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="text-4xl p-3 bg-docmosaic-sage/10 rounded-lg group-hover:scale-110 transition-transform">
                                            {useCase.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-medium text-docmosaic-purple">
                                                {useCase.title}
                                            </h3>
                                            <p className="text-docmosaic-purple/90 font-medium mb-2">
                                                {useCase.subtitle}
                                            </p>
                                            <p className="text-docmosaic-purple/70 mb-4">
                                                {useCase.description}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {useCase.features.map((feature, featureIndex) => (
                                                    <div
                                                        key={featureIndex}
                                                        className="flex items-center text-sm text-docmosaic-purple/60"
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full bg-docmosaic-sage mr-2"></div>
                                                        {feature}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link
                                href="/pdf-editor"
                                className="inline-flex items-center px-6 py-3 bg-docmosaic-purple text-white rounded-lg hover:bg-docmosaic-purple/90 transition-all duration-300 group"
                            >
                                Start Creating Now
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Transparency Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <h3 className="text-3xl font-medium text-center text-docmosaic-purple mb-8">
                                Built for Transparency & Community
                            </h3>
                            <div className="grid md:grid-cols-3 gap-6 mb-12">
                                {transparencyFeatures.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <feature.icon className="w-6 h-6 text-docmosaic-purple mb-3" />
                                        <h4 className="font-medium text-docmosaic-purple mb-2">
                                            {feature.title}
                                        </h4>
                                        <p className="text-sm text-docmosaic-purple/70">
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Support and Feedback Section */}
                            <div className="mt-12 grid md:grid-cols-2 gap-6">
                                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex flex-col items-center text-center">
                                        <Coffee className="w-8 h-8 text-[#FFDD00] mb-4" />
                                        <h4 className="text-xl font-medium text-docmosaic-purple mb-3">
                                            Support This Project
                                        </h4>
                                        <p className="text-docmosaic-purple/70 mb-6">
                                            DocMosaic is free, open-source, and privacy-friendly. If
                                            you find it useful, consider supporting its development
                                            to keep it running fast and free for everyone.
                                        </p>
                                        <DonateButton size="lg" />
                                    </div>
                                </div>

                                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex flex-col items-center text-center">
                                        <MessageSquare className="w-8 h-8 text-docmosaic-purple mb-4" />
                                        <h4 className="text-xl font-medium text-docmosaic-purple mb-3">
                                            Help Us Improve
                                        </h4>
                                        <p className="text-docmosaic-purple/70 mb-6">
                                            This tool is open-source & free to use. If you have
                                            ideas, feedback, or found a bug, let us know!
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-4">
                                            <FeedbackModal
                                                customButton={
                                                    <button className="inline-flex items-center px-6 py-3 bg-docmosaic-purple text-white rounded-lg hover:bg-docmosaic-purple/90 transition-all duration-300 group text-base">
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        Feedback
                                                    </button>
                                                }
                                            />
                                            <Link
                                                href="https://github.com/vrybakk/docmosaic/issues"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-4 py-2 rounded-md border border-docmosaic-purple text-docmosaic-purple hover:bg-docmosaic-purple/5"
                                            >
                                                <Github className="w-4 h-4 mr-2" />
                                                Report on GitHub
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-4xl font-medium text-docmosaic-purple mb-6">
                                Ready to Edit Your PDF in Seconds?
                            </h2>
                            <Link
                                href="/pdf-editor"
                                className="inline-flex items-center px-8 py-4 text-lg font-medium bg-docmosaic-purple text-white rounded-lg hover:bg-docmosaic-purple/90 transition-all duration-300 group"
                            >
                                Start Editing Now
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <div className="flex items-center justify-center mt-4 text-docmosaic-purple/70">
                                <Lock className="w-4 h-4 mr-2" />
                                <p className="text-sm">
                                    No sign-up. No personal data collection. No limits. Just open &
                                    use.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}

const keyFeatures = [
    { icon: Zap, text: 'No Sign-Up' },
    { icon: Shield, text: 'Privacy-First' },
    { icon: Lock, text: 'No File Uploads' },
    { icon: Users, text: 'Always Free' },
];

const whyFeatures = [
    {
        icon: Zap,
        title: 'Skip the Hassle',
        description: 'No more complicated software. Just open and start editing instantly.',
    },
    {
        icon: Shield,
        title: 'Privacy First',
        description: 'Everything stays on your device. No uploads, no personal data collection.',
    },
    {
        icon: Lock,
        title: 'No Limits',
        description: 'Free forever, no premium features, no hidden fees. Just open & use.',
    },
];

const features = [
    {
        icon: Zap,
        title: 'No Sign-Up Needed',
        description: 'Just open & start. No accounts, no waiting, no hassle.',
    },
    {
        icon: Shield,
        title: '100% Private',
        description: 'Everything stays on your device. No uploads, no personal data collection.',
    },
    {
        icon: Lock,
        title: 'Faster than Online Editors',
        description: 'No waiting for uploads or processing. Edit instantly.',
    },
    {
        icon: Users,
        title: 'Completely Free',
        description: 'No hidden fees, no premium features, no limits. Everything included.',
    },
];

const useCases = [
    {
        icon: '🛂',
        title: 'For Expats & Officials',
        subtitle: 'Simplify Document Processing',
        description:
            'Perfect for visa applications, ID documents, and administrative paperwork. Arrange multiple scanned documents into professional PDFs that meet official requirements.',
        features: [
            'ID & passport scans',
            'Visa applications',
            'Multiple page layouts',
            'Official document prep',
        ],
    },
    {
        icon: '🏢',
        title: 'For Businesses & Admins',
        subtitle: 'Easily Create Internal & Client Documents',
        description:
            'For companies, HR teams, and professionals who need quick document handling without expensive software. Generate contracts, reports, and business documents effortlessly.',
        features: [
            'Business reports',
            'HR documents',
            'Meeting notes & presentations',
            'Policy & legal documents',
        ],
    },
    {
        icon: '👨‍🎨',
        title: 'For Designers',
        subtitle: 'Quickly Arrange Image-Based PDFs',
        description:
            'Place, resize, and align images easily to create print-ready layouts. Perfect for visual portfolios and client presentations.',
        features: [
            'Print-ready layouts',
            'Multiple image arrangement',
            'Precise alignment tools',
            'Quick export to PDF',
        ],
    },
    {
        icon: '📢',
        title: 'For Marketers',
        subtitle: 'Create Professional-Looking PDFs Fast',
        description:
            'Create ad mockups, campaign reports, and simple PDF-based visuals without spending hours in Canva or Adobe.',
        features: ['Ad mockups', 'Campaign reports', 'Visual presentations', 'Quick iterations'],
    },
    {
        icon: '🎓',
        title: 'For Teachers & Students',
        subtitle: 'Annotate & Organize PDFs for Projects',
        description:
            'Merge images into PDFs, annotate scanned documents, and reorder pages for assignments with ease.',
        features: [
            'Document organization',
            'Image merging',
            'Page reordering',
            'Assignment preparation',
        ],
    },
    {
        icon: '💼',
        title: 'For Freelancers',
        subtitle: 'Create Branded Reports & Deliverables',
        description:
            'Assemble portfolio samples, image-heavy proposals, and invoice layouts visually. Perfect for client deliverables.',
        features: [
            'Portfolio samples',
            'Client proposals',
            'Invoice layouts',
            'Visual documentation',
        ],
    },
];

const transparencyFeatures = [
    {
        icon: Github,
        title: '100% Open Source',
        description: 'Anyone can audit the code. Security through transparency.',
    },
    {
        icon: Shield,
        title: 'Files Stay Private',
        description: 'Everything stays on your computer. Only anonymous usage statistics.',
    },
    {
        icon: Code,
        title: 'Self-Hostable',
        description: 'Use our hosted version or run it yourself.',
    },
];

const deviceFeatures = [
    {
        icon: Smartphone,
        title: 'Touch-Optimized Interface',
        description: 'Drag, resize, and arrange with natural touch gestures on any device.',
    },
    {
        icon: Monitor,
        title: 'Seamless Desktop Experience',
        description: 'Full functionality on larger screens with keyboard shortcuts.',
    },
    {
        icon: TabletSmartphone,
        title: 'Works on All Devices',
        description: 'No app needed. Just open in your browser and start editing.',
    },
    {
        icon: Download,
        title: 'Instant Export Anywhere',
        description: "Download your PDFs instantly, whether you're on phone or desktop.",
    },
];
