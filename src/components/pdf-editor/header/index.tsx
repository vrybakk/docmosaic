'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ORIENTATION_OPTIONS, PAGE_SIZE_OPTIONS } from '@/lib/pdf-editor/constants/theme';
import { PageOrientation, PageSize } from '@/lib/pdf-editor/types';
import { cn } from '@/lib/utils';
import { Pen, Settings2 } from 'lucide-react';
import { useState } from 'react';

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
 * Header component for the PDF editor
 * Contains document name input and page settings (size and orientation)
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
        <header className="bg-docmosaic-purple border-b p-4">
            <div className="mx-auto container flex items-center justify-between gap-4">
                {/* Document Name */}
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                        <Input
                            type="text"
                            value={name}
                            onChange={onNameChange}
                            className={cn(
                                'w-full max-w-[300px] bg-transparent border-none',
                                'text-docmosaic-cream placeholder-docmosaic-cream/50',
                                'text-lg font-semibold focus:ring-0 pr-5',
                            )}
                            placeholder="Untitled Document"
                        />
                        <Pen className="h-4 w-4 text-docmosaic-cream absolute right-2.5 top-0 bottom-0 my-auto" />
                    </div>
                </div>

                {/* Desktop Settings */}
                <div className="hidden md:flex items-center gap-4">
                    <Select value={pageSize} onValueChange={onPageSizeChange}>
                        <SelectTrigger
                            className={cn(
                                'w-[120px] border-docmosaic-cream/20',
                                'text-docmosaic-cream bg-transparent',
                                'focus:ring-docmosaic-cream/20',
                            )}
                        >
                            <SelectValue placeholder="Page Size" />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={orientation} onValueChange={onOrientationChange}>
                        <SelectTrigger
                            className={cn(
                                'w-[120px] border-docmosaic-cream/20',
                                'text-docmosaic-cream bg-transparent',
                                'focus:ring-docmosaic-cream/20',
                            )}
                        >
                            <SelectValue placeholder="Orientation" />
                        </SelectTrigger>
                        <SelectContent>
                            {ORIENTATION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Mobile Settings Button */}
                <div className="md:hidden">
                    <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-docmosaic-cream hover:bg-docmosaic-cream/10"
                            >
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
                                    <Select value={pageSize} onValueChange={onPageSizeChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select page size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PAGE_SIZE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Orientation</label>
                                    <Select value={orientation} onValueChange={onOrientationChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select orientation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ORIENTATION_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
