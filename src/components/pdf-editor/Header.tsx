'use client';

import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select-field';
import { PAGE_SIZE_LABELS } from '@/lib/page-sizes';
import { PageOrientation, PageSize } from '@/lib/types';

interface HeaderProps {
    name: string;
    pageSize: PageSize;
    orientation: PageOrientation;
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPageSizeChange: (value: string) => void;
    onOrientationChange: (value: string) => void;
}

export function Header({
    name,
    pageSize,
    orientation,
    onNameChange,
    onPageSizeChange,
    onOrientationChange,
}: HeaderProps) {
    return (
        <header className="bg-docmosaic-purple p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <Input
                    type="text"
                    value={name}
                    onChange={onNameChange}
                    className="bg-transparent border-none text-docmosaic-cream placeholder-docmosaic-cream/50 text-lg font-semibold focus:ring-0"
                    placeholder="Untitled Document"
                />
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <SelectField
                        value={pageSize}
                        onValueChange={onPageSizeChange}
                        options={Object.entries(PAGE_SIZE_LABELS).map(([key, label]) => ({
                            value: key,
                            label,
                        }))}
                        className="w-64 text-docmosaic-cream border-docmosaic-cream"
                    />
                    <SelectField
                        value={orientation}
                        onValueChange={onOrientationChange}
                        options={[
                            { value: 'portrait', label: 'Portrait' },
                            { value: 'landscape', label: 'Landscape' },
                        ]}
                        className="w-32 text-docmosaic-cream border-docmosaic-cream"
                    />
                </div>
            </div>
        </header>
    );
}
