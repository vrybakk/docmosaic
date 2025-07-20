import Hero from '@/components/blocks/hero';
import { SpringCards } from '@/components/blocks/spring-cards';
import StackedCards from '@/components/blocks/stacked-cards';
import VerticalSlideFeatures from '@/components/blocks/vertical-slide-features';
import Typography from '@/components/common/typography';
import DonateButton from '@/components/donate-button';
import FeedbackModal from '@/components/feedback/feedback-modal';
import Footer from '@/components/layout/footer';
import { ArrowRight, Code, Coffee, Github, Lock, MessageSquare, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow pt-16">
                {/* Hero Section */}
                <section className="container mx-auto px-4 py-10">
                    <Hero />
                </section>

                <section className="container mx-auto px-4 py-10">
                    <Typography variant="h2" tag="h2" className="text-center">
                        Everything You <span className="text-docmosaic-orange">Need</span> — Nothing
                        You Don’t
                    </Typography>

                    <SpringCards />
                </section>

                <section className="container mx-auto px-4 py-10">
                    <VerticalSlideFeatures />
                </section>

                <section className="py-20">
                    <StackedCards />
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
