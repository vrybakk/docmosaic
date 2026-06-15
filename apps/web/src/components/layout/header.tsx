'use client';

import type React from 'react';

import DonateButton from '@/components/donate-button';
import { CustomLink } from '@/components/ui/core/link';
import { Link as LocaleLink, usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import {
    ArrowBigRight,
    BookOpen,
    Bug,
    ChevronDown,
    Code,
    Github,
    LayoutList,
    Menu,
    MessageSquareText,
    Sparkles,
    SquareDashedMousePointer,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Typography from '../common/typography';

export default function Header() {
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [isHowItWorksMenuOpen, setIsHowItWorksMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('Nav');
    const isLandingPage = pathname === '/';

    // The /pdf-editor route is a full-screen editor with its own top bar; the
    // marketing header would double up the chrome, so it is omitted there.
    if (pathname?.startsWith('/pdf-editor')) {
        return null;
    }

    const localeLabels: Record<string, string> = {
        en: 'EN',
        es: 'ES',
        uk: 'UA',
        de: 'DE',
        fr: 'FR',
        'pt-BR': 'PT',
        pl: 'PL',
        it: 'IT',
    };
    const localeNames: Record<string, string> = {
        en: 'English',
        es: 'Español',
        uk: 'Українська',
        de: 'Deutsch',
        fr: 'Français',
        'pt-BR': 'Português (BR)',
        pl: 'Polski',
        it: 'Italiano',
    };

    const changeLanguage = (nextLocale: string) => {
        setIsLanguageMenuOpen(false);
        router.replace(pathname, { locale: nextLocale });
    };

    const toggleLanguageMenu = () => {
        setIsLanguageMenuOpen(!isLanguageMenuOpen);
    };

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        if (isLandingPage) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
                setIsHowItWorksMenuOpen(false);
            }
        } else {
            router.push(`/#${sectionId}`);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4 py-5">
                <div className="flex items-center justify-between">
                    <LocaleLink href="/" className="flex items-center space-x-2">
                        <Image src="/logo.svg" alt="DocMosaic Logo" width={32} height={32} />
                        <Typography variant="h3">DocMosaic</Typography>
                    </LocaleLink>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <div
                            onMouseEnter={() => setIsHowItWorksMenuOpen(true)}
                            onMouseLeave={() => setIsHowItWorksMenuOpen(false)}
                            className="relative w-fit h-fit"
                        >
                            <button className="relative text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors">
                                <Typography variant="h4" className="!text-inherit uppercase">
                                    {t('howItWorks')}
                                </Typography>
                                <span
                                    style={{
                                        transform: isHowItWorksMenuOpen ? 'scaleX(1)' : 'scaleX(0)',
                                    }}
                                    className="absolute -bottom-1 -left-1 -right-1 h-[3px] origin-left scale-x-0 rounded-full bg-docmosaic-sage transition-transform duration-300 ease-out"
                                />
                            </button>
                            <AnimatePresence>
                                {isHowItWorksMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 15 }}
                                        style={{ translateX: '-50%' }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        className="absolute left-1/2 top-12 bg-white text-black z-50"
                                    >
                                        <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
                                        <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white border-l border-t border-gray-100" />
                                        <div className="w-64 bg-white shadow-xl rounded-lg border border-gray-100 p-4">
                                            <div className="mb-4">
                                                <Typography
                                                    variant="h4"
                                                    className="text-docmosaic-purple mb-3 uppercase"
                                                >
                                                    {t('product')}
                                                </Typography>
                                                <div className="space-y-2">
                                                    <LocaleLink
                                                        href="/pdf-editor"
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full"
                                                    >
                                                        <SquareDashedMousePointer
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('pdfWebEditor')}
                                                        </Typography>
                                                    </LocaleLink>
                                                    <Link
                                                        href="#features"
                                                        onClick={(e) =>
                                                            scrollToSection(e, 'features')
                                                        }
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full features-button-click-trigger"
                                                    >
                                                        <LayoutList
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('features')}
                                                        </Typography>
                                                    </Link>
                                                    <Link
                                                        href="https://docs.docmosaic.com"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full documentation-click-trigger"
                                                    >
                                                        <BookOpen
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('documentation')}
                                                        </Typography>
                                                    </Link>
                                                    <Link
                                                        href="https://docs.docmosaic.com/changelog"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full changelog-click-trigger"
                                                    >
                                                        <Sparkles
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('whatsNew')}
                                                        </Typography>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <Typography
                                                    variant="h4"
                                                    className="text-docmosaic-purple mb-3 uppercase"
                                                >
                                                    {t('openSourceCommunity')}
                                                </Typography>
                                                <div className="space-y-2">
                                                    <Link
                                                        href="https://github.com/vrybakk/docmosaic"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full view-source-button-click-trigger"
                                                    >
                                                        <Github
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('viewSource')}
                                                        </Typography>
                                                    </Link>
                                                    <Link
                                                        href="https://github.com/vrybakk/docmosaic/issues"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full report-issues-click-trigger"
                                                    >
                                                        <Bug
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('reportIssues')}
                                                        </Typography>
                                                    </Link>
                                                    <Link
                                                        href="https://github.com/vrybakk/docmosaic/blob/main/CONTRIBUTING.md"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full contribute-button-click-trigger"
                                                    >
                                                        <Code
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('contribute')}
                                                        </Typography>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-100 pt-3">
                                                <Typography
                                                    variant="h4"
                                                    className="text-docmosaic-purple mb-3 uppercase"
                                                >
                                                    {t('supportFeedback')}
                                                </Typography>
                                                <div className="space-y-3">
                                                    <CustomLink
                                                        variant="sage"
                                                        size="sm"
                                                        href="https://forms.clickup.com/2179724/f/22gmc-41632/XPTXPPQYXACUBJLSRP"
                                                        external={true}
                                                        className="w-full your-input-click-trigger"
                                                        icon={
                                                            <MessageSquareText className="w-4 h-4" />
                                                        }
                                                    >
                                                        {t('yourInput')}
                                                    </CustomLink>
                                                    <DonateButton
                                                        variant="coffee"
                                                        size="sm"
                                                        className="w-full buy-me-a-coffee-click-trigger"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <Link
                            href="https://docs.docmosaic.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative w-fit documentation-click-trigger text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors"
                        >
                            <Typography variant="h4" className="!text-inherit uppercase">
                                {t('docs')}
                            </Typography>
                            <span className="absolute -bottom-1 -left-1 -right-1 h-[3px] origin-left scale-x-0 rounded-full bg-docmosaic-sage transition-transform duration-300 ease-out group-hover:scale-x-100" />
                        </Link>
                        <CustomLink
                            href="/pdf-editor"
                            className="group web-app-access-trigger"
                            variant={'gradient'}
                            icon={
                                <ArrowBigRight
                                    className="group-hover:translate-x-1 transition-transform"
                                    size={18}
                                />
                            }
                        >
                            <span className="uppercase">{t('tryDocmosaic')}</span>
                        </CustomLink>

                        <div className="hidden md:flex relative">
                            <button
                                onClick={toggleLanguageMenu}
                                className="flex items-center text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors"
                            >
                                {localeLabels[locale]}
                                <ChevronDown
                                    className={`ml-1 w-4 h-4 transition-transform ${
                                        isLanguageMenuOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {isLanguageMenuOpen && (
                                <div className="absolute right-0 mt-2 min-w-24 bg-white rounded-md shadow-lg py-1 z-10">
                                    {routing.locales.map((loc) => (
                                        <button
                                            key={loc}
                                            onClick={() => changeLanguage(loc)}
                                            className="block w-full text-left px-4 py-2 text-sm text-docmosaic-purple/80 hover:bg-docmosaic-sage/10 hover:text-docmosaic-purple"
                                        >
                                            {localeNames[loc]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex md:hidden items-center space-x-4">
                        <div className="relative">
                            <button
                                onClick={toggleLanguageMenu}
                                className="flex items-center text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors"
                            >
                                {localeLabels[locale]}
                                <ChevronDown
                                    className={`ml-1 w-4 h-4 transition-transform ${
                                        isLanguageMenuOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {isLanguageMenuOpen && (
                                <div className="absolute right-0 mt-2 min-w-24 bg-white rounded-md shadow-lg py-1 z-10">
                                    {routing.locales.map((loc) => (
                                        <button
                                            key={loc}
                                            onClick={() => changeLanguage(loc)}
                                            className="block w-full text-left px-4 py-2 text-sm text-docmosaic-purple/80 hover:bg-docmosaic-sage/10 hover:text-docmosaic-purple"
                                        >
                                            {localeNames[loc]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsHowItWorksMenuOpen(!isHowItWorksMenuOpen)}
                                className="text-docmosaic-purple p-2"
                                aria-label="Open menu"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <AnimatePresence>
                                {isHowItWorksMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 15 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        className="absolute right-0 top-12 bg-white text-black z-50"
                                    >
                                        <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
                                        <div className="absolute right-4 top-0 h-4 w-4 -translate-y-1/2 rotate-45 bg-white border-l border-t border-gray-100" />
                                        <div className="w-72 bg-white shadow-xl rounded-lg border border-gray-100 p-4">
                                            <div className="mb-4">
                                                <Typography
                                                    variant="h4"
                                                    className="text-docmosaic-purple mb-3 uppercase"
                                                >
                                                    {t('product')}
                                                </Typography>
                                                <div className="space-y-2">
                                                    <LocaleLink
                                                        href="/pdf-editor"
                                                        onClick={() =>
                                                            setIsHowItWorksMenuOpen(false)
                                                        }
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full"
                                                    >
                                                        <SquareDashedMousePointer
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('pdfWebEditor')}
                                                        </Typography>
                                                    </LocaleLink>
                                                    <Link
                                                        href="#features"
                                                        onClick={(e) => {
                                                            scrollToSection(e, 'features');
                                                            setIsHowItWorksMenuOpen(false);
                                                        }}
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full features-button-click-trigger"
                                                    >
                                                        <LayoutList
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('features')}
                                                        </Typography>
                                                    </Link>
                                                    <Link
                                                        href="https://docs.docmosaic.com"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() =>
                                                            setIsHowItWorksMenuOpen(false)
                                                        }
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full documentation-click-trigger"
                                                    >
                                                        <BookOpen
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('documentation')}
                                                        </Typography>
                                                    </Link>
                                                    <Link
                                                        href="https://docs.docmosaic.com/changelog"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() =>
                                                            setIsHowItWorksMenuOpen(false)
                                                        }
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full changelog-click-trigger"
                                                    >
                                                        <Sparkles
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('whatsNew')}
                                                        </Typography>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <Typography
                                                    variant="h4"
                                                    className="text-docmosaic-purple mb-3 uppercase"
                                                >
                                                    {t('openSourceCommunity')}
                                                </Typography>
                                                <div className="space-y-2">
                                                    <Link
                                                        href="https://github.com/vrybakk/docmosaic"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() =>
                                                            setIsHowItWorksMenuOpen(false)
                                                        }
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full view-source-button-click-trigger"
                                                    >
                                                        <Github
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('viewSource')}
                                                        </Typography>
                                                    </Link>
                                                    <Link
                                                        href="https://github.com/vrybakk/docmosaic/issues"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() =>
                                                            setIsHowItWorksMenuOpen(false)
                                                        }
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full report-issues-click-trigger"
                                                    >
                                                        <Bug
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('reportIssues')}
                                                        </Typography>
                                                    </Link>
                                                    <Link
                                                        href="https://github.com/vrybakk/docmosaic/blob/main/CONTRIBUTING.md"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() =>
                                                            setIsHowItWorksMenuOpen(false)
                                                        }
                                                        className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black w-full contribute-button-click-trigger"
                                                    >
                                                        <Code
                                                            className="w-4 h-4 mr-2"
                                                            strokeWidth={1}
                                                        />
                                                        <Typography
                                                            variant="small"
                                                            className="text-inherit"
                                                        >
                                                            {t('contribute')}
                                                        </Typography>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div>
                                                <Typography
                                                    variant="h4"
                                                    className="text-docmosaic-purple mb-3 uppercase"
                                                >
                                                    {t('supportFeedback')}
                                                </Typography>
                                                <div className="space-y-3">
                                                    <CustomLink
                                                        variant="sage"
                                                        size="sm"
                                                        href="https://forms.clickup.com/2179724/f/22gmc-41632/XPTXPPQYXACUBJLSRP"
                                                        external={true}
                                                        className="w-full your-input-click-trigger"
                                                        icon={
                                                            <MessageSquareText className="w-4 h-4" />
                                                        }
                                                        onClick={() =>
                                                            setIsHowItWorksMenuOpen(false)
                                                        }
                                                    >
                                                        {t('yourInput')}
                                                    </CustomLink>
                                                    <DonateButton
                                                        variant="coffee"
                                                        size="sm"
                                                        className="w-full buy-me-a-coffee-click-trigger"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
