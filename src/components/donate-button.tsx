'use client';

import { Button } from '@/components/ui/core/button';
import { Coffee } from 'lucide-react';

interface DonateButtonProps {
    variant?: 'default' | 'outline' | 'coffee';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

export default function DonateButton({
    variant = 'coffee',
    size = 'default',
    className = '',
}: DonateButtonProps) {
    return (
        <Button
            variant={variant === 'coffee' ? 'outline' : variant}
            size={size}
            className={`${className} ${
                variant === 'coffee'
                    ? 'bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black border-[#FFDD00] hover:border-[#FFDD00]/90'
                    : ''
            }`}
            onClick={() => window.open('https://buymeacoffee.com/vrybakk', '_blank')}
        >
            <Coffee className={`w-4 h-4 mr-2 ${variant === 'coffee' ? 'text-black' : ''}`} />
            Buy Me a Coffee
        </Button>
    );
}
