'use client';

import type { PageOrientation, PageSize } from '@docmosaic/core';
import { Settings2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '../../ui/sheet';
import { DocumentName } from './document-name';
import { OrientationSelect } from './orientation-select';
import { PageSizeSelect } from './page-size-select';

interface HeaderProps {
    /** The name of the document */
    name: string;
    /** The current page size */
    pageSize: PageSize;
    /** The current page orientation */
    orientation: PageOrientation;
    /** Callback when the document name changes */
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Callback when the page size changes */
    onPageSizeChange: (value: PageSize) => void;
    /** Callback when the orientation changes */
    onOrientationChange: (value: PageOrientation) => void;
}

/**
 * Default editor header layout. Composes `DocumentName`, `PageSizeSelect`,
 * and `OrientationSelect` plus a mobile settings sheet. For custom
 * arrangements use the individual `Editor.DocumentName`, etc. directly.
 */
export function Header({
    name,
    pageSize,
    orientation,
    onNameChange,
    onPageSizeChange,
    onOrientationChange,
}: HeaderProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <header className="bg-gradient border-b py-[15px] px-4">
            <div className="mx-auto container flex items-center justify-between gap-4">
                {/* Document Name */}
                <div className="flex items-center gap-4 flex-1">
                    <DocumentName name={name} onNameChange={onNameChange} />
                </div>

                {/* Desktop Settings */}
                <div className="hidden md:flex items-center gap-4">
                    <PageSizeSelect value={pageSize} onValueChange={onPageSizeChange} />
                    <OrientationSelect value={orientation} onValueChange={onOrientationChange} />
                </div>

                {/* Mobile Settings Button */}
                <div className="md:hidden">
                    <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="white" size="icon">
                                <Settings2 className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="top" className="max-w-full">
                            <SheetHeader>
                                <SheetTitle>Page Settings</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Page Size</label>
                                    <PageSizeSelect
                                        value={pageSize}
                                        onValueChange={onPageSizeChange}
                                        fullWidth
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Orientation</label>
                                    <OrientationSelect
                                        value={orientation}
                                        onValueChange={onOrientationChange}
                                        fullWidth
                                    />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
