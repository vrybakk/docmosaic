'use client';

import type React from 'react';

import { CustomLink } from '@/components/ui/core/link';
import { ArrowBigRight, ChevronDown, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('EN');
    const pathname = usePathname();
    const isLandingPage = pathname === '/';

    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = () => {
            setIsMenuOpen(false);
        };

        window.addEventListener('popstate', handleRouteChange);
        return () => window.removeEventListener('popstate', handleRouteChange);
    }, []);

    const changeLanguage = (lang: string) => {
        setCurrentLanguage(lang);
        setIsLanguageMenuOpen(false);
        // todo: implement actual language change logic
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                setIsMenuOpen(false);
            }
        } else {
            router.push(`/#${sectionId}`);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image src="/logo.svg" alt="DocMosaic Logo" width={32} height={32} />
                        <span className="text-xl font-semibold text-docmosaic-purple">
                            DocMosaic
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/pdf-editor"
                            className="text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors"
                        >
                            PDF Editor
                        </Link>
                        <a
                            href="#features"
                            onClick={(e) => scrollToSection(e, 'features')}
                            className="text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#use-cases"
                            onClick={(e) => scrollToSection(e, 'use-cases')}
                            className="text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors"
                        >
                            Use Cases
                        </a>
                        <Link
                            href="https://github.com/vrybakk/docmosaic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors"
                        >
                            GitHub
                        </Link>
                    </nav>

                    <div className="hidden md:flex items-center space-x-4">
                        <div className="relative">
                            <button
                                onClick={toggleLanguageMenu}
                                className="flex items-center text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors"
                            >
                                {currentLanguage}
                                <ChevronDown
                                    className={`ml-1 w-4 h-4 transition-transform ${
                                        isLanguageMenuOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {isLanguageMenuOpen && (
                                <div className="absolute right-0 mt-2 min-w-24 bg-white rounded-md shadow-lg py-1 z-10">
                                    <button
                                        onClick={() => changeLanguage('EN')}
                                        className="block w-full text-left px-4 py-2 text-sm text-docmosaic-purple/80 hover:bg-docmosaic-sage/10 hover:text-docmosaic-purple"
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => changeLanguage('ES')}
                                        className="block w-full text-left px-4 py-2 text-sm text-docmosaic-purple/80 hover:bg-docmosaic-sage/10 hover:text-docmosaic-purple"
                                    >
                                        Español
                                    </button>
                                    <button
                                        onClick={() => changeLanguage('UA')}
                                        className="block w-full text-left px-4 py-2 text-sm text-docmosaic-purple/80 hover:bg-docmosaic-sage/10 hover:text-docmosaic-purple"
                                    >
                                        Українська
                                    </button>
                                </div>
                            )}
                        </div>

                        <CustomLink
                            href="/pdf-editor"
                            className="group"
                            icon={
                                <ArrowBigRight className="group-hover:translate-x-1 transition-transform" />
                            }
                        >
                            Try It Now
                        </CustomLink>
                    </div>

                    <button
                        onClick={toggleMenu}
                        className="md:hidden text-docmosaic-purple p-2"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="container mx-auto px-4 py-4">
                        <nav className="flex flex-col space-y-4">
                            <Link
                                href="/pdf-editor"
                                className="text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                PDF Editor
                            </Link>
                            <a
                                href="#features"
                                onClick={(e) => scrollToSection(e, 'features')}
                                className="text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors py-2"
                            >
                                Features
                            </a>
                            <a
                                href="#use-cases"
                                onClick={(e) => scrollToSection(e, 'use-cases')}
                                className="text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors py-2"
                            >
                                Use Cases
                            </a>
                            <Link
                                href="https://github.com/vrybakk/docmosaic"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-docmosaic-purple/80 hover:text-docmosaic-purple transition-colors py-2"
                            >
                                GitHub
                            </Link>

                            <div className="pt-2 border-t border-gray-100">
                                <p className="text-sm text-docmosaic-purple/60 mb-2">Language</p>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => changeLanguage('EN')}
                                        className={`text-sm ${
                                            currentLanguage === 'EN'
                                                ? 'text-docmosaic-purple font-medium'
                                                : 'text-docmosaic-purple/70'
                                        }`}
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => changeLanguage('ES')}
                                        className={`text-sm ${
                                            currentLanguage === 'ES'
                                                ? 'text-docmosaic-purple font-medium'
                                                : 'text-docmosaic-purple/70'
                                        }`}
                                    >
                                        Español
                                    </button>
                                    <button
                                        onClick={() => changeLanguage('UA')}
                                        className={`text-sm ${
                                            currentLanguage === 'UA'
                                                ? 'text-docmosaic-purple font-medium'
                                                : 'text-docmosaic-purple/70'
                                        }`}
                                    >
                                        Українська
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <CustomLink
                                    href="/pdf-editor"
                                    variant="default"
                                    className="w-full justify-center"
                                    onClick={() => setIsMenuOpen(false)}
                                    icon={<ArrowBigRight />}
                                >
                                    Try It Now
                                </CustomLink>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}
