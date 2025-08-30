import { BouncyCardsFeatures } from '@/components/blocks/bouncy-cards';
import Hero from '@/components/blocks/hero';
import { SpringCards } from '@/components/blocks/spring-cards';
import StackedCards from '@/components/blocks/stacked-cards';
import VerticalSlideFeatures from '@/components/blocks/vertical-slide-features';
import Typography from '@/components/common/typography';
import DonateButton from '@/components/donate-button';
import Footer from '@/components/layout/footer';
import { CustomLink } from '@/components/ui/core/link';
import { ArrowBigRight, Code, Github, Lock, MessageSquareText, Shield } from 'lucide-react';

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

                <section className="container mx-auto px-4 py-10">
                    <StackedCards />
                </section>

                <section className="container mx-auto px-4 py-10">
                    <BouncyCardsFeatures />
                </section>

                <section className="container mx-auto px-4 py-10">
                    <Typography variant="h2" tag="h2" className="mb-10">
                        Built for Transparency &{' '}
                        <span className="text-docmosaic-orange">Community</span>
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {transparencyFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="p-5 rounded-[18px] bg-white shadow-[0px_0px_10px_0px_#00000040]"
                            >
                                <feature.icon className="w-6 h-6 text-docmosaic-purple mb-4" />
                                <Typography variant="h4" tag="h6" className="mb-4">
                                    {feature.title}
                                </Typography>
                                <Typography>{feature.description}</Typography>
                            </div>
                        ))}
                    </div>
                    <hr className="my-8 border-docmosaic-black/15" />
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex flex-col gap-3">
                            <Typography variant="h3" tag="h6">
                                Support This Project
                            </Typography>
                            <Typography>
                                DocMosaic is free, open-source, and privacy-friendly. If you find it
                                useful, consider supporting its development to keep it running fast
                                and free for everyone.
                            </Typography>
                            <DonateButton size="lg" />
                        </div>
                        <div className="flex flex-col gap-3 md:items-end md:text-right">
                            <Typography variant="h3" tag="h6">
                                Help Us Improve
                            </Typography>
                            <Typography>
                                This tool is open-source & free to use. If you have ideas, feedback,
                                or found a bug, let us know!
                            </Typography>
                            <div className="flex flex-col md:flex-row gap-4">
                                <CustomLink
                                    variant="sage"
                                    href="https://forms.clickup.com/2179724/f/22gmc-41632/XPTXPPQYXACUBJLSRP"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="your-input-click-trigger"
                                    icon={<MessageSquareText className="w-4 h-4" />}
                                >
                                    YOUR INPUT
                                </CustomLink>
                                <CustomLink
                                    variant="cream"
                                    href="https://github.com/vrybakk/docmosaic"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="report-issues-click-trigger"
                                    icon={<Github className="w-4 h-4" />}
                                >
                                    Report on GitHub
                                </CustomLink>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-10 flex flex-col items-center gap-3">
                    <div className="w-fit p-1 flex items-center gap-3 shadow-[0px_0px_4px_0px_#00000066] rounded-full">
                        <span className="px-2 py-0.5 bg-docmosaic-sage rounded-full">
                            <Typography variant="h6" tag="span">
                                HEY!
                            </Typography>
                        </span>
                        <Typography variant="h6" tag="span">
                            Download our Mobile App
                        </Typography>
                        <ArrowBigRight className="text-docmosaic-black" size={18} />
                    </div>
                    <Typography variant="h2" tag="h4">
                        Tame Your <span className="text-docmosaic-caramel">PDFs</span> with Ease
                    </Typography>
                    <Typography variant="h5" tag="p" className="my-5">
                        <Lock className="w-4 h-4 mr-2 inline-block" />
                        No sign-up. No personal data collection. No limits. Just open & use.
                    </Typography>
                    <CustomLink
                        variant={'gradient'}
                        href="/pdf-editor"
                        className="max-md:w-full web-app-access-trigger"
                        icon={<ArrowBigRight size={18} />}
                    >
                        START EDITING NOW
                    </CustomLink>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}

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
