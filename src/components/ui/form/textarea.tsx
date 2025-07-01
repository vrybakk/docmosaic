'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
    HTMLTextAreaElement,
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    'flex min-h-[80px] w-full rounded-md border border-docmosaic-purple/20 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-docmosaic-purple/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-docmosaic-purple/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
});
Textarea.displayName = 'Textarea';

export { Textarea };
