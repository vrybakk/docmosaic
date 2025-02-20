'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <AlertTriangle className="h-24 w-24 text-red-500 opacity-50" />
                </div>
                <h1 className="text-4xl font-bold text-docmosaic-purple">Something went wrong!</h1>
                <p className="text-xl text-docmosaic-purple/70 max-w-md">
                    An unexpected error occurred. Our team has been notified and is working to fix it.
                </p>
                <div className="flex justify-center gap-4">
                    <Button
                        onClick={reset}
                        className="bg-docmosaic-purple hover:bg-docmosaic-purple/90 text-docmosaic-cream"
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="border-docmosaic-purple/20 text-docmosaic-purple hover:bg-docmosaic-sage/10"
                    >
                        Refresh Page
                    </Button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-red-50 rounded-lg">
                        <p className="text-red-700 font-mono text-sm break-all">{error.message}</p>
                    </div>
                )}
            </div>
        </div>
    );
} 