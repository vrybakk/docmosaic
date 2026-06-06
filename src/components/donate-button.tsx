'use client';

import { CustomLink } from '@/components/ui/core/link';
import { cn } from '@/lib/utils';
import { Coffee } from 'lucide-react';

interface DonateButtonProps {
    variant?: 'default' | 'outline' | 'coffee';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

export default function DonateButton({
    variant = 'coffee',
    size = 'default',
    className,
}: DonateButtonProps) {
    return (
        <CustomLink
            variant={variant === 'coffee' ? 'caramel' : variant}
            size={size}
            href="https://buymeacoffee.com/vrybakk"
            external
            icon={<Coffee className="w-4 h-4" />}
            className={cn('w-fit buy-me-a-coffee-click-trigger', className)}
        >
            Buy Me a Coffee
        </CustomLink>
    );
}
