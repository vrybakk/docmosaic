/**
 * Mobile Haptic Feedback Utility
 * Provides consistent haptic feedback across different mobile devices
 */

export interface HapticPattern {
    /** Duration in milliseconds */
    duration: number;
    /** Pattern array for complex haptics (iOS) */
    pattern?: number[];
}

export interface HapticOptions {
    /** Whether to enable haptics (default: true) */
    enabled?: boolean;
    /** Fallback to basic vibration if advanced haptics not supported */
    fallback?: boolean;
}

class HapticManager {
    private enabled: boolean = true;
    private fallback: boolean = true;
    private isSupported: boolean;

    constructor(options: HapticOptions = {}) {
        this.enabled = options.enabled ?? true;
        this.fallback = options.fallback ?? true;
        this.isSupported = this.checkSupport();
    }

    /**
     * Check if haptic feedback is supported on this device
     */
    private checkSupport(): boolean {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

        return 'vibrate' in navigator || 'vibrate' in window;
    }

    /**
     * Enable or disable haptic feedback
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    /**
     * Check if haptics are currently enabled
     */
    isEnabled(): boolean {
        return this.enabled && this.isSupported;
    }

    /**
     * Trigger light haptic feedback (subtle)
     */
    light(): void {
        if (!this.isEnabled()) return;
        this.vibrate(10);
    }

    /**
     * Trigger medium haptic feedback (noticeable)
     */
    medium(): void {
        if (!this.isEnabled()) return;
        this.vibrate(50);
    }

    /**
     * Trigger heavy haptic feedback (strong)
     */
    heavy(): void {
        if (!this.isEnabled()) return;
        this.vibrate(100);
    }

    /**
     * Trigger success haptic feedback
     */
    success(): void {
        if (!this.isEnabled()) return;
        this.vibrate([50, 50, 100]);
    }

    /**
     * Trigger error haptic feedback
     */
    error(): void {
        if (!this.isEnabled()) return;
        this.vibrate([100, 50, 100]);
    }

    /**
     * Trigger selection haptic feedback
     */
    selection(): void {
        if (!this.isEnabled()) return;
        this.vibrate(25);
    }

    /**
     * Trigger deletion haptic feedback
     */
    deletion(): void {
        if (!this.isEnabled()) return;
        this.vibrate([75, 50, 75]);
    }

    /**
     * Trigger undo/redo haptic feedback
     */
    undoRedo(): void {
        if (!this.isEnabled()) return;
        this.vibrate([30, 30, 60]);
    }

    /**
     * Trigger page change haptic feedback
     */
    pageChange(): void {
        if (!this.isEnabled()) return;
        this.vibrate([40, 40]);
    }

    /**
     * Trigger zoom haptic feedback
     */
    zoom(): void {
        if (!this.isEnabled()) return;
        this.vibrate(20);
    }

    /**
     * Trigger custom haptic pattern
     */
    custom(pattern: HapticPattern): void {
        if (!this.isEnabled()) return;
        this.vibrate(pattern.pattern || pattern.duration);
    }

    /**
     * Internal vibration method with fallback support
     */
    private vibrate(pattern: number | number[]): void {
        if (typeof navigator === 'undefined' || typeof window === 'undefined') return;

        try {
            if (navigator.vibrate) {
                navigator.vibrate(pattern);
            } else if (this.fallback && 'vibrate' in window) {
                // Fallback for older implementations
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).vibrate(pattern);
            }
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }
}

// Create and export singleton instance
export const hapticFeedback = new HapticManager();

// Export individual functions for convenience
export const {
    light,
    medium,
    heavy,
    success,
    error,
    selection,
    deletion,
    undoRedo,
    pageChange,
    zoom,
    custom,
    setEnabled,
    isEnabled,
} = hapticFeedback;

// Export the manager class for advanced usage
export { HapticManager };
