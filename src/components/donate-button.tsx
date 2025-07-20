'use client';

import { Button } from '@/components/ui/core/button';
import { Coffee } from 'lucide-react';

interface DonateButtonProps {
    variant?: 'default' | 'outline' | 'coffee';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

export default function DonateButton({ variant = 'coffee', size = 'default' }: DonateButtonProps) {
    return (
        <Button
            variant={variant === 'coffee' ? 'caramel' : variant}
            size={size}
            onClick={() => window.open('https://buymeacoffee.com/vrybakk', '_blank')}
            icon={<Coffee className={`w-4 h-4`} />}
            className="w-fit"
        >
            Buy Me a Coffee
        </Button>
    );
}
