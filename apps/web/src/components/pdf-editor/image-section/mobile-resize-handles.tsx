/**
 * Mobile-Optimized Resize Handles
 * Provides touch-friendly resize handles for mobile devices
 */

import { isMobile } from '@/lib/mobile/detection';
import { hapticFeedback } from '@/lib/mobile/haptics';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';
import React from 'react';

export type ResizeHandle =
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight';

interface MobileResizeHandlesProps {
    /** Callback when resize starts */
    onResizeStart: (e: React.MouseEvent | React.TouchEvent, handle: ResizeHandle) => void;
    /** Whether the section is currently being resized */
    isResizing?: boolean;
    /** Whether to show the handles */
    show?: boolean;
}

/**
 * Mobile-optimized resize handles with larger touch targets
 */
export const MobileResizeHandles: React.FC<MobileResizeHandlesProps> = ({
    onResizeStart,
    isResizing = false,
    show = false,
}) => {
    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, handle: ResizeHandle) => {
        e.preventDefault();
        e.stopPropagation();

        // Provide haptic feedback on mobile
        if (typeof window !== 'undefined' && isMobile()) {
            hapticFeedback.light();
        }

        onResizeStart(e, handle);
    };

    // Don't render if not showing or if resizing
    if (!show || isResizing) {
        return null;
    }

    return (
        <div
            className={cn(
                'absolute inset-0 transition-opacity duration-200 z-30 pointer-events-none',
                show ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                show && 'opacity-100', // Always show when explicitly shown
            )}
        >
            {/* Corner handles - larger touch targets for mobile */}
            <div
                data-resize-handle="true"
                className={cn(
                    'absolute -top-3 -left-3 w-10 h-10 bg-white border-3 border-docmosaic-purple rounded-full shadow-xl',
                    'cursor-nw-resize hover:scale-110 transition-transform duration-150',
                    'flex items-center justify-center',
                    'touch-manipulation select-none',
                    'z-30', // Ensure it's above other elements
                    'hover:bg-docmosaic-purple/10', // Hover effect
                    'pointer-events-auto', // Added
                )}
                onMouseDown={(e) => handleResizeStart(e, 'topLeft')}
                onTouchStart={(e) => handleResizeStart(e, 'topLeft')}
                title="Resize from top-left"
            >
                <Minus className="w-4 h-4 text-docmosaic-purple" />
            </div>

            <div
                data-resize-handle="true"
                className={cn(
                    'absolute -top-3 -right-3 w-10 h-10 bg-white border-3 border-docmosaic-purple rounded-full shadow-xl',
                    'cursor-ne-resize hover:scale-110 transition-transform duration-150',
                    'flex items-center justify-center',
                    'touch-manipulation select-none',
                    'z-30', // Ensure it's above other elements
                    'hover:bg-docmosaic-purple/10', // Hover effect
                    'pointer-events-auto', // Added
                )}
                onMouseDown={(e) => handleResizeStart(e, 'topRight')}
                onTouchStart={(e) => handleResizeStart(e, 'topRight')}
                title="Resize from top-right"
            >
                <Plus className="w-4 h-4 text-docmosaic-purple" />
            </div>

            <div
                data-resize-handle="true"
                className={cn(
                    'absolute -bottom-3 -left-3 w-10 h-10 bg-white border-3 border-docmosaic-purple rounded-full shadow-xl',
                    'cursor-sw-resize hover:scale-110 transition-transform duration-150',
                    'flex items-center justify-center',
                    'touch-manipulation select-none',
                    'z-30', // Ensure it's above other elements
                    'hover:bg-docmosaic-purple/10', // Hover effect
                    'pointer-events-auto', // Added
                )}
                onMouseDown={(e) => handleResizeStart(e, 'bottomLeft')}
                onTouchStart={(e) => handleResizeStart(e, 'bottomLeft')}
                title="Resize from bottom-left"
            >
                <Plus className="w-4 h-4 text-docmosaic-purple" />
            </div>

            <div
                data-resize-handle="true"
                className={cn(
                    'absolute -bottom-3 -right-3 w-10 h-10 bg-white border-3 border-docmosaic-purple rounded-full shadow-xl',
                    'cursor-se-resize hover:scale-110 transition-transform duration-150',
                    'flex items-center justify-center',
                    'touch-manipulation select-none',
                    'z-30', // Ensure it's above other elements
                    'hover:bg-docmosaic-purple/10', // Hover effect
                    'pointer-events-auto', // Added
                )}
                onMouseDown={(e) => handleResizeStart(e, 'bottomRight')}
                onTouchStart={(e) => handleResizeStart(e, 'bottomRight')}
                title="Resize from bottom-right"
            >
                <Plus className="w-4 h-4 text-docmosaic-purple" />
            </div>

            {/* Edge handles - full-width/height for better touch targets */}
            <div
                data-resize-handle="true"
                className={cn(
                    'absolute top-0 left-4 right-4 h-4 bg-transparent hover:bg-docmosaic-purple/20',
                    'cursor-n-resize group/edge',
                    'touch-manipulation select-none',
                    'z-30', // Ensure it's above other elements
                    'border-t-2 border-transparent hover:border-docmosaic-purple/30', // Visual indicator
                    'pointer-events-auto', // Added
                )}
                onMouseDown={(e) => handleResizeStart(e, 'top')}
                onTouchStart={(e) => handleResizeStart(e, 'top')}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-docmosaic-purple rounded-full opacity-0 group-hover/edge:opacity-100 transition-opacity duration-150" />
            </div>

            <div
                data-resize-handle="true"
                className={cn(
                    'absolute bottom-0 left-4 right-4 h-4 bg-transparent hover:bg-docmosaic-purple/20',
                    'cursor-s-resize group/edge',
                    'touch-manipulation select-none',
                    'z-30', // Ensure it's above other elements
                    'border-b-2 border-transparent hover:border-docmosaic-purple/30', // Visual indicator
                    'pointer-events-auto', // Added
                )}
                onMouseDown={(e) => handleResizeStart(e, 'bottom')}
                onTouchStart={(e) => handleResizeStart(e, 'bottom')}
            >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-2 border-docmosaic-purple rounded-full opacity-0 group-hover/edge:opacity-100 transition-opacity duration-150" />
            </div>

            <div
                data-resize-handle="true"
                className={cn(
                    'absolute left-0 top-4 bottom-4 w-4 bg-transparent hover:bg-docmosaic-purple/20',
                    'cursor-w-resize group/edge',
                    'touch-manipulation select-none',
                    'z-30', // Ensure it's above other elements
                    'border-l-2 border-transparent hover:border-docmosaic-purple/30', // Visual indicator
                    'pointer-events-auto', // Added
                )}
                onMouseDown={(e) => handleResizeStart(e, 'left')}
                onTouchStart={(e) => handleResizeStart(e, 'left')}
            >
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-docmosaic-purple rounded-full opacity-0 group-hover/edge:opacity-100 transition-opacity duration-150" />
            </div>

            <div
                data-resize-handle="true"
                className={cn(
                    'absolute right-0 top-4 bottom-4 w-4 bg-transparent hover:bg-docmosaic-purple/20',
                    'cursor-e-resize group/edge',
                    'touch-manipulation select-none',
                    'z-30', // Ensure it's above other elements
                    'border-r-2 border-transparent hover:border-docmosaic-purple/30', // Visual indicator
                    'pointer-events-auto', // Added
                )}
                onMouseDown={(e) => handleResizeStart(e, 'right')}
                onTouchStart={(e) => handleResizeStart(e, 'right')}
            >
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-docmosaic-purple rounded-full opacity-0 group-hover/edge:opacity-100 transition-opacity duration-150" />
            </div>
        </div>
    );
};

/**
 * Mobile-optimized resize handle for a specific direction
 */
export const MobileResizeHandle: React.FC<{
    handle: ResizeHandle;
    onResizeStart: (e: React.MouseEvent | React.TouchEvent, handle: ResizeHandle) => void;
    className?: string;
    children?: React.ReactNode;
}> = ({ handle, onResizeStart, className, children }) => {
    const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Provide haptic feedback on mobile
        if (typeof window !== 'undefined' && isMobile()) {
            hapticFeedback.light();
        }

        onResizeStart(e, handle);
    };

    return (
        <div
            className={cn(
                'bg-white border-2 border-docmosaic-purple rounded-full',
                'cursor-pointer hover:scale-110 transition-transform duration-150',
                'flex items-center justify-center',
                'touch-manipulation select-none',
                'w-8 h-8', // Base size
                isMobile() && 'w-10 h-10', // Larger on mobile
                className,
            )}
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            title={`Resize from ${handle}`}
        >
            {children}
        </div>
    );
};
