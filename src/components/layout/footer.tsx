'use client';

import Typography from '@/components/common/typography';
import DonateButton from '@/components/donate-button';
import { CustomLink } from '@/components/ui/core/link';
import {
    Bug,
    Code,
    Github,
    LayoutList,
    MessageSquareText,
    // Smartphone,
    SquareDashedMousePointer,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-12">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <Image src="/logo.svg" alt="DocMosaic Logo" width={32} height={32} />
                            <Typography variant="h3" className="text-docmosaic-black">
                                DocMosaic
                            </Typography>
                        </Link>
                        <Typography variant="paragraph" className="text-docmosaic-black/70 mb-4">
                            Free and open source tool for creating structured PDF documents with
                            arranged images.
                        </Typography>
                        <div className="flex flex-wrap gap-4">
                            <DonateButton variant="coffee" size="sm" />
                            <CustomLink
                                variant="sage"
                                size="sm"
                                href="https://forms.clickup.com/2179724/f/22gmc-41632/XPTXPPQYXACUBJLSRP"
                                external={true}
                                className="your-input-click-trigger"
                                icon={<MessageSquareText className="w-4 h-4" />}
                            >
                                Your Input
                            </CustomLink>
                        </div>
                    </div>
                    <div>
                        <Typography variant="h4" className="text-docmosaic-purple mb-4 uppercase">
                            Product
                        </Typography>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/pdf-editor"
                                    className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black web-app-access-trigger"
                                >
                                    <SquareDashedMousePointer
                                        className="w-4 h-4 mr-2"
                                        strokeWidth={1}
                                    />
                                    <Typography variant="small" className="text-inherit">
                                        PDF Web Editor
                                    </Typography>
                                </Link>
                            </li>
                            {/* <li>
                                <Link
                                    href="#mobile-app"
                                    className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black mobile-app-access-trigger"
                                >
                                    <Smartphone className="w-4 h-4 mr-2" strokeWidth={1} />
                                    <Typography variant="small" className="text-inherit">
                                        Mobile App
                                    </Typography>
                                </Link>
                            </li> */}
                            <li>
                                <Link
                                    href="#features"
                                    className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black features-button-click-trigger"
                                >
                                    <LayoutList className="w-4 h-4 mr-2" strokeWidth={1} />
                                    <Typography variant="small" className="text-inherit">
                                        Features
                                    </Typography>
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <Typography variant="h4" className="text-docmosaic-purple mb-4 uppercase">
                            Open Source & Community
                        </Typography>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="https://github.com/vrybakk/docmosaic"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black view-source-button-click-trigger"
                                >
                                    <Github className="w-4 h-4 mr-2" strokeWidth={1} />
                                    <Typography variant="small" className="text-inherit">
                                        View Source
                                    </Typography>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://github.com/vrybakk/docmosaic/issues"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black report-issues-click-trigger"
                                >
                                    <Bug className="w-4 h-4 mr-2" strokeWidth={1} />
                                    <Typography variant="small" className="text-inherit">
                                        Report Issues
                                    </Typography>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://github.com/vrybakk/docmosaic/blob/main/CONTRIBUTING.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-docmosaic-black/70 hover:text-docmosaic-black contribute-button-click-trigger"
                                >
                                    <Code className="w-4 h-4 mr-2" strokeWidth={1} />
                                    <Typography variant="small" className="text-inherit">
                                        Contribute
                                    </Typography>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-200 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center gap-2 md:gap-4">
                        <Typography variant="small" className="text-docmosaic-black/60">
                            © {new Date().getFullYear()} DocMosaic. All rights reserved. |{' '}
                            <Link
                                href="/legal/privacy"
                                className="text-docmosaic-black/60 hover:text-docmosaic-black underline"
                            >
                                Privacy Policy
                            </Link>
                        </Typography>
                        <div className="flex flex-wrap items-center gap-4">
                            <Typography variant="small" className="text-docmosaic-black/60">
                                created by{' '}
                                <Link
                                    href="https://nerd-stud.io"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-docmosaic-caramel hover:text-docmosaic-caramel/80 underline font-medium"
                                >
                                    nerd-stud.io
                                </Link>{' '}
                                🧡
                            </Typography>
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
