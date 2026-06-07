'use client';

import { Settings2 } from 'lucide-react';
import { Children, type ReactNode, useState } from 'react';
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

interface PropertiesProps {
    /**
     * Optional children. When provided, the properties bar renders an empty
     * shell with the children inside. When omitted, falls back to the bundled
     * default layout (document name + page size + orientation, plus a mobile
     * settings sheet).
     */
    children?: ReactNode;
}

/**
 * Default editor document-properties bar — sits at the top of the editor
 * shell. All state-reading children are context-aware, so the properties bar
 * itself takes no state props.
 */
export function Properties({ children }: PropertiesProps = {}) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    if (children !== undefined && Children.count(children) > 0) {
        return (
            <header className="bg-gradient border-b py-[15px] px-4">
                <div className="mx-auto container flex items-center justify-between gap-4">
                    {children}
                </div>
            </header>
        );
    }

    return (
        <header className="bg-gradient border-b py-[15px] px-4">
            <div className="mx-auto container flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <DocumentName />
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <PageSizeSelect />
                    <OrientationSelect />
                </div>

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
                                    <PageSizeSelect fullWidth />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Orientation</label>
                                    <OrientationSelect fullWidth />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
