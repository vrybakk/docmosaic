import { BouncyCardsFeatures } from '@/components/blocks/bouncy-cards';
import ForDevelopers from '@/components/blocks/for-developers';
import Hero from '@/components/blocks/hero';
import PdfHeroSection from '@/components/blocks/pdf-hero-section';
import ProductShowcase from '@/components/blocks/product-showcase';
import { SpringCards } from '@/components/blocks/spring-cards';
import StackedCards from '@/components/blocks/stacked-cards';
import VerticalSlideFeatures from '@/components/blocks/vertical-slide-features';
import Typography from '@/components/common/typography';
import DonateButton from '@/components/donate-button';
import Footer from '@/components/layout/footer';
import { CustomLink } from '@/components/ui/core/link';
import { Code, Github, MessageSquareText, Shield } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('Home');

    const transparencyFeatures = [
        {
            icon: Github,
            title: t('transparency1Title'),
            description: t('transparency1Desc'),
        },
        {
            icon: Shield,
            title: t('transparency2Title'),
            description: t('transparency2Desc'),
        },
        {
            icon: Code,
            title: t('transparency3Title'),
            description: t('transparency3Desc'),
        },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow pt-16">
                {/* Hero Section */}
                <section className="container mx-auto px-4 pt-10 pb-4">
                    <Hero />
                </section>

                {/* Product showcase */}
                <section className="container mx-auto px-4 pb-10">
                    <ProductShowcase />
                </section>

                <section className="container mx-auto px-4 py-10">
                    <Typography variant="h2" tag="h2" className="text-center">
                        {t.rich('needHeading', {
                            orange: (chunks) => (
                                <span className="text-docmosaic-orange">{chunks}</span>
                            ),
                        })}
                    </Typography>

                    <SpringCards />
                </section>

                <section className="container mx-auto px-4 py-10">
                    <VerticalSlideFeatures />
                </section>

                {/* For developers — the open-source headless library */}
                <section className="container mx-auto px-4 py-10">
                    <ForDevelopers />
                </section>

                <section className="container mx-auto px-4 py-10">
                    <StackedCards />
                </section>

                <section className="container mx-auto px-4 py-10">
                    <BouncyCardsFeatures />
                </section>

                <section className="container mx-auto px-4 py-10">
                    <Typography variant="h2" tag="h2" className="mb-10">
                        {t.rich('transparencyHeading', {
                            orange: (chunks) => (
                                <span className="text-docmosaic-orange">{chunks}</span>
                            ),
                        })}
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
                            <Typography variant="h3" tag="h4">
                                {t('supportTitle')}
                            </Typography>
                            <Typography>{t('supportDesc')}</Typography>
                            <DonateButton size="lg" />
                        </div>
                        <div className="flex flex-col gap-3 md:items-end md:text-right">
                            <Typography variant="h3" tag="h4">
                                {t('helpTitle')}
                            </Typography>
                            <Typography>{t('helpDesc')}</Typography>
                            <div className="flex flex-col md:flex-row gap-4">
                                <CustomLink
                                    variant="sage"
                                    href="https://forms.clickup.com/2179724/f/22gmc-41632/XPTXPPQYXACUBJLSRP"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="your-input-click-trigger"
                                    icon={<MessageSquareText className="w-4 h-4" />}
                                >
                                    {t('yourInput')}
                                </CustomLink>
                                <CustomLink
                                    variant="cream"
                                    href="https://github.com/vrybakk/docmosaic"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="report-issues-click-trigger"
                                    icon={<Github className="w-4 h-4" />}
                                >
                                    {t('reportGithub')}
                                </CustomLink>
                            </div>
                        </div>
                    </div>
                </section>

                <PdfHeroSection />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
