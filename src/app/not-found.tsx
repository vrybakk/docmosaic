'use client';

import { Button } from '@/components/ui/core/button';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <FileQuestion className="h-24 w-24 text-docmosaic-purple opacity-50" />
                </div>
                <h1 className="text-4xl font-bold text-docmosaic-purple">Page Not Found</h1>
                <p className="mx-auto text-xl text-docmosaic-purple/70 max-w-md">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have
                    been moved or deleted.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/">
                        <Button className="bg-docmosaic-purple hover:bg-docmosaic-purple/90 text-docmosaic-cream">
                            Return Home
                        </Button>
                    </Link>
                    <Link href="/pdf-editor">
                        <Button
                            variant="outline"
                            className="border-docmosaic-purple/20 text-docmosaic-purple hover:bg-docmosaic-sage/10"
                        >
                            Try PDF Editor
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
