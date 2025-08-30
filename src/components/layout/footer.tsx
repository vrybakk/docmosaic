'use client';

import { AlertCircle, Code, Github } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import DonateButton from '../donate-button';
import FeedbackModal from '../feedback/feedback-modal';

export default function Footer() {
    return (
        <footer className="py-12">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <Image src="/logo.svg" alt="DocMosaic Logo" width={32} height={32} />
                            <span className="text-xl font-semibold text-docmosaic-purple">
                                DocMosaic
                            </span>
                        </Link>
                        <p className="text-docmosaic-purple/70 mb-4">
                            Free and open source tool for creating structured PDF documents with
                            arranged images.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <DonateButton size="sm" />
                            <FeedbackModal />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-docmosaic-purple mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/pdf-editor"
                                    className="text-docmosaic-purple/70 hover:text-docmosaic-purple web-app-access-trigger"
                                >
                                    PDF Editor
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#features"
                                    className="text-docmosaic-purple/70 hover:text-docmosaic-purple features-button-click-trigger"
                                >
                                    Features
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-docmosaic-purple mb-4">
                            Open Source & Community
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="https://github.com/vrybakk/docmosaic"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-docmosaic-purple/70 hover:text-docmosaic-purple view-source-button-click-trigger"
                                >
                                    <Github className="w-4 h-4 mr-2" />
                                    View Source
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://github.com/vrybakk/docmosaic/issues"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-docmosaic-purple/70 hover:text-docmosaic-purple report-issues-click-trigger"
                                >
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Report Issues
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://github.com/vrybakk/docmosaic/blob/main/CONTRIBUTING.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-docmosaic-purple/70 hover:text-docmosaic-purple contribute-button-click-trigger"
                                >
                                    <Code className="w-4 h-4 mr-2" />
                                    Contribute
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-200 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-docmosaic-purple/60">
                            © {new Date().getFullYear()} DocMosaic. Privacy-first, open source
                            software.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <Link
                                href="/legal/privacy"
                                className="text-sm text-docmosaic-purple/60 hover:text-docmosaic-purple"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/legal/terms"
                                className="text-sm text-docmosaic-purple/60 hover:text-docmosaic-purple"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="/legal/cookies"
                                className="text-sm text-docmosaic-purple/60 hover:text-docmosaic-purple"
                            >
                                Cookie Policy
                            </Link>
                            <Link
                                href="/legal/transparency"
                                className="text-sm text-docmosaic-purple/60 hover:text-docmosaic-purple"
                            >
                                Open Source & Transparency
                            </Link>
                        </div>
                    </div>
                    {/* <p className="text-xs text-center text-docmosaic-purple/50 mt-4">
            This is an open-source project. While we try to improve the tool, we can't provide individual support.
          </p> */}
                </div>
            </div>
        </footer>
    );
}
