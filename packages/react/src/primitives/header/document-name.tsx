'use client';

import { Pen } from 'lucide-react';
import { cn } from '../../internal/utils';
import { Input } from '../../ui/input';

interface DocumentNameProps {
    name: string;
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Inline document name input shown in the header.
 */
export function DocumentName({ name, onNameChange }: DocumentNameProps) {
    return (
        <div className="relative">
            <Input
                type="text"
                value={name}
                onChange={onNameChange}
                className={cn(
                    'w-full max-w-[300px] bg-transparent border-none',
                    'text-editor-accent placeholder-editor-accent-soft/50',
                    'text-lg font-semibold focus:ring-0 shadow-none pr-5',
                )}
                placeholder="Untitled Document"
            />
            <Pen className="h-4 w-4 text-editor-accent absolute right-2.5 top-0 bottom-0 my-auto" />
        </div>
    );
}
