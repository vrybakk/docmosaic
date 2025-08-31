'use client';

import { Button } from '@/components/ui/core/button';
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
        <Button
            variant={variant === 'coffee' ? 'caramel' : variant}
            size={size}
            onClick={() => window.open('https://buymeacoffee.com/vrybakk', '_blank')}
            icon={<Coffee className={`w-4 h-4`} />}
            className={cn('w-fit buy-me-a-coffee-click-trigger', className)}
        >
            Buy Me a Coffee
        </Button>
    );
}
