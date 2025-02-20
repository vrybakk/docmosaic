'use client';

import type React from 'react';

import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
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
        const lang = pathname.split('/')[1];
        setCurrentLanguage(lang === 'es' ? 'ES' : lang === 'uk' ? 'UA' : 'EN');
    }, [pathname]);

    const changeLanguage = (lang: string) => {
        router.push(`/${lang === 'EN' ? '' : lang.toLowerCase()}`);
        setIsLanguageMenuOpen(false);
        setCurrentLanguage(lang);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleLanguageMenu = () => {
        setIsLanguageMenuOpen(!isLanguageMenuOpen);
    };

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm z-50">
            <div className="mx-auto container px-4 py-4">
                <nav className="flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image src="/logo.svg" alt="DocMosaic Logo" width={40} height={40} />
                        <span className="text-2xl font-semibold text-docmosaic-purple">
                            DocMosaic
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center space-x-6">
                        {isLandingPage ? (
                            <>
                                <a
                                    href="#how-it-works"
                                    onClick={(e) => scrollToSection(e, 'how-it-works')}
                                    className="text-docmosaic-purple hover:underline transition-all duration-300"
                                >
                                    How It Works
                                </a>
                                <Link href="/pdf-editor" className="btn-primary group">
                                    Try DocMosaic
                                    <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </>
                        ) : (
                            <Link
                                href="/"
                                className="text-docmosaic-purple hover:underline transition-all duration-300"
                            >
                                Back to Home
                            </Link>
                        )}
                        <div className="relative">
                            <button
                                onClick={toggleLanguageMenu}
                                className="flex items-center space-x-1 text-docmosaic-purple hover:underline"
                            >
                                <span>{currentLanguage}</span>
                                <ChevronDown size={16} />
                            </button>
                            {isLanguageMenuOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg overflow-hidden z-20">
                                    <button
                                        onClick={() => changeLanguage('EN')}
                                        className="block w-full text-left px-4 py-2 text-sm text-docmosaic-purple hover:bg-docmosaic-sage/20"
                                    >
                                        English
                                    </button>
                                    <button
                                        onClick={() => changeLanguage('ES')}
                                        className="block w-full text-left px-4 py-2 text-sm text-docmosaic-purple hover:bg-docmosaic-sage/20"
                                    >
                                        Español
                                    </button>
                                    <button
                                        onClick={() => changeLanguage('UA')}
                                        className="block w-full text-left px-4 py-2 text-sm text-docmosaic-purple hover:bg-docmosaic-sage/20"
                                    >
                                        Українська
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        className="md:hidden text-docmosaic-purple"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </nav>
                {isMenuOpen && (
                    <div className="md:hidden mt-4">
                        <ul className="flex flex-col space-y-4">
                            {isLandingPage ? (
                                <>
                                    <li>
                                        <a
                                            href="#how-it-works"
                                            onClick={(e) => scrollToSection(e, 'how-it-works')}
                                            className="text-docmosaic-purple hover:underline transition-all duration-300"
                                        >
                                            How It Works
                                        </a>
                                    </li>
                                    <li>
                                        <Link
                                            href="/pdf-editor"
                                            className="btn-primary inline-block text-center group"
                                        >
                                            Try DocMosaic
                                            <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <Link
                                        href="/"
                                        className="text-docmosaic-purple hover:underline transition-all duration-300"
                                    >
                                        Back to Home
                                    </Link>
                                </li>
                            )}
                            <li>
                                <button
                                    onClick={toggleLanguageMenu}
                                    className="flex items-center space-x-1 text-docmosaic-purple hover:underline"
                                >
                                    <span>{currentLanguage}</span>
                                    <ChevronDown size={16} />
                                </button>
                                {isLanguageMenuOpen && (
                                    <div className="mt-2 space-y-2">
                                        <button
                                            onClick={() => changeLanguage('EN')}
                                            className="block w-full text-left px-4 py-2 text-sm text-docmosaic-purple hover:bg-docmosaic-sage/20"
                                        >
                                            English
                                        </button>
                                        <button
                                            onClick={() => changeLanguage('ES')}
                                            className="block w-full text-left px-4 py-2 text-sm text-docmosaic-purple hover:bg-docmosaic-sage/20"
                                        >
                                            Español
                                        </button>
                                        <button
                                            onClick={() => changeLanguage('UA')}
                                            className="block w-full text-left px-4 py-2 text-sm text-docmosaic-purple hover:bg-docmosaic-sage/20"
                                        >
                                            Українська
                                        </button>
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
}
