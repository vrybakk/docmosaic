/**
 * Touch Gesture Recognition Utility
 * Provides detection for common touch gestures like long-press, double-tap, and swipe
 */

export interface GestureOptions {
    /** Long-press timeout in milliseconds (default: 500) */
    longPressTimeout?: number;
    /** Double-tap timeout in milliseconds (default: 300) */
    doubleTapTimeout?: number;
    /** Swipe threshold in pixels (default: 50) */
    swipeThreshold?: number;
    /** Whether to prevent default behavior (default: true) */
    preventDefault?: boolean;
}

export interface LongPressEvent {
    /** Touch event that triggered the long-press */
    event: TouchEvent;
    /** Duration of the press in milliseconds */
    duration: number;
    /** Touch coordinates */
    coordinates: { x: number; y: number };
}

export interface SwipeEvent {
    /** Touch event that triggered the swipe */
    event: TouchEvent;
    /** Swipe direction */
    direction: 'up' | 'down' | 'left' | 'right';
    /** Swipe distance in pixels */
    distance: number;
    /** Swipe velocity in pixels per millisecond */
    velocity: number;
    /** Touch coordinates */
    startCoordinates: { x: number; y: number };
    endCoordinates: { x: number; y: number };
}

export interface DoubleTapEvent {
    /** Touch event that triggered the double-tap */
    event: TouchEvent;
    /** Touch coordinates */
    coordinates: { x: number; y: number };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GestureCallback<T = any> = (gestureEvent: T) => void;

/**
 * Touch Gesture Manager
 * Manages touch gesture detection and callbacks
 */
export class TouchGestureManager {
    private options: Required<GestureOptions>;
    private longPressTimer: NodeJS.Timeout | null = null;
    private doubleTapTimer: NodeJS.Timeout | null = null;
    private lastTapTime: number = 0;
    private lastTapCoordinates: { x: number; y: number } = { x: 0, y: 0 };
    private touchStartTime: number = 0;
    private touchStartCoordinates: { x: number; y: number } = { x: 0, y: 0 };
    private isLongPressActive: boolean = false;

    // Callbacks
    private longPressCallback: GestureCallback<LongPressEvent> | null = null;
    private swipeCallbacks: Map<string, GestureCallback<SwipeEvent>> = new Map();
    private doubleTapCallback: GestureCallback<DoubleTapEvent> | null = null;

    constructor(options: GestureOptions = {}) {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
            // SSR - create a dummy manager
            this.options = {
                longPressTimeout: 500,
                doubleTapTimeout: 300,
                swipeThreshold: 50,
                preventDefault: true,
            };
            return;
        }

        this.options = {
            longPressTimeout: options.longPressTimeout ?? 500,
            doubleTapTimeout: options.doubleTapTimeout ?? 300,
            swipeThreshold: options.swipeThreshold ?? 50,
            preventDefault: options.preventDefault ?? true,
        };
    }

    /**
     * Set long-press callback
     */
    onLongPress(callback: GestureCallback<LongPressEvent>): void {
        this.longPressCallback = callback;
    }

    /**
     * Set swipe callback for specific direction(s)
     */
    onSwipe(direction: string | string[], callback: GestureCallback<SwipeEvent>): void {
        const directions = Array.isArray(direction) ? direction : [direction];
        directions.forEach((dir) => {
            this.swipeCallbacks.set(dir, callback);
        });
    }

    /**
     * Set double-tap callback
     */
    onDoubleTap(callback: GestureCallback<DoubleTapEvent>): void {
        this.doubleTapCallback = callback;
    }

    /**
     * Handle touch start event
     */
    handleTouchStart(event: TouchEvent): void {
        if (typeof window === 'undefined') return; // SSR check

        if (this.options.preventDefault) {
            event.preventDefault();
        }

        const touch = event.touches[0];
        this.touchStartTime = Date.now();
        this.touchStartCoordinates = { x: touch.clientX, y: touch.clientY };

        // Start long-press timer
        this.startLongPressTimer(event);
    }

    /**
     * Handle touch move event
     */
    handleTouchMove(event: TouchEvent): void {
        if (typeof window === 'undefined') return; // SSR check

        if (this.options.preventDefault) {
            event.preventDefault();
        }

        const touch = event.touches[0];
        const currentCoordinates = { x: touch.clientX, y: touch.clientY };
        const distance = this.calculateDistance(this.touchStartCoordinates, currentCoordinates);

        // Cancel long-press if moved too far
        if (distance > 10) {
            this.cancelLongPress();
        }
    }

    /**
     * Handle touch end event
     */
    handleTouchEnd(event: TouchEvent): void {
        if (typeof window === 'undefined') return; // SSR check

        if (this.options.preventDefault) {
            event.preventDefault();
        }

        const touch = event.changedTouches[0];
        const endCoordinates = { x: touch.clientX, y: touch.clientY };
        const distance = this.calculateDistance(this.touchStartCoordinates, endCoordinates);
        const duration = Date.now() - this.touchStartTime;

        // Cancel long-press timer
        this.cancelLongPress();

        // Check for swipe gesture
        if (distance > this.options.swipeThreshold && duration < 300) {
            this.handleSwipe(event, endCoordinates, distance, duration);
        }

        // Check for tap/double-tap
        this.handleTap(event, endCoordinates);
    }

    /**
     * Start long-press timer
     */
    private startLongPressTimer(event: TouchEvent): void {
        this.cancelLongPress();

        this.longPressTimer = setTimeout(() => {
            const touch = event.touches[0];
            const coordinates = { x: touch.clientX, y: touch.clientY };
            const duration = Date.now() - this.touchStartTime;

            this.isLongPressActive = true;

            if (this.longPressCallback) {
                this.longPressCallback({
                    event,
                    duration,
                    coordinates,
                });
            }
        }, this.options.longPressTimeout);
    }

    /**
     * Cancel long-press timer
     */
    private cancelLongPress(): void {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        this.isLongPressActive = false;
    }

    /**
     * Handle swipe gesture
     */
    private handleSwipe(
        event: TouchEvent,
        endCoordinates: { x: number; y: number },
        distance: number,
        duration: number,
    ): void {
        const deltaX = endCoordinates.x - this.touchStartCoordinates.x;
        const deltaY = endCoordinates.y - this.touchStartCoordinates.y;
        const velocity = distance / duration;

        // Determine swipe direction
        let direction: string;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }

        // Check if we have a callback for this direction
        const callback = this.swipeCallbacks.get(direction) || this.swipeCallbacks.get('any');
        if (callback) {
            callback({
                event,
                direction: direction as 'up' | 'down' | 'left' | 'right',
                distance,
                velocity,
                startCoordinates: this.touchStartCoordinates,
                endCoordinates,
            });
        }
    }

    /**
     * Handle tap and double-tap
     */
    private handleTap(event: TouchEvent, coordinates: { x: number; y: number }): void {
        const currentTime = Date.now();
        const timeSinceLastTap = currentTime - this.lastTapTime;
        const distanceFromLastTap = this.calculateDistance(this.lastTapCoordinates, coordinates);

        // Check if this is a double-tap
        if (timeSinceLastTap < this.options.doubleTapTimeout && distanceFromLastTap < 30) {
            // Double-tap detected
            if (this.doubleTapCallback) {
                this.doubleTapCallback({
                    event,
                    coordinates,
                });
            }

            // Reset for next potential double-tap
            this.lastTapTime = 0;
            this.lastTapCoordinates = { x: 0, y: 0 };
        } else {
            // Single tap - store for potential double-tap
            this.lastTapTime = currentTime;
            this.lastTapCoordinates = coordinates;
        }
    }

    /**
     * Calculate distance between two points
     */
    private calculateDistance(
        point1: { x: number; y: number },
        point2: { x: number; y: number },
    ): number {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Clean up timers and reset state
     */
    destroy(): void {
        this.cancelLongPress();
        if (this.doubleTapTimer) {
            clearTimeout(this.doubleTapTimer);
        }
        this.reset();
    }

    /**
     * Reset internal state
     */
    reset(): void {
        this.lastTapTime = 0;
        this.lastTapCoordinates = { x: 0, y: 0 };
        this.touchStartTime = 0;
        this.touchStartCoordinates = { x: 0, y: 0 };
        this.isLongPressActive = false;
    }

    /**
     * Check if long-press is currently active
     */
    isLongPressing(): boolean {
        return this.isLongPressActive;
    }
}

/**
 * Create a new touch gesture manager
 */
export const createTouchGestureManager = (options?: GestureOptions): TouchGestureManager => {
    return new TouchGestureManager(options);
};

/**
 * Utility function to get touch coordinates from event
 */
export const getTouchCoordinates = (event: TouchEvent): { x: number; y: number } => {
    const touch = event.touches[0] || event.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
};

/**
 * Utility function to calculate distance between two points
 */
export const calculateDistance = (
    point1: { x: number; y: number },
    point2: { x: number; y: number },
): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Utility function to determine swipe direction
 */
export const getSwipeDirection = (
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
): 'up' | 'down' | 'left' | 'right' => {
    const deltaX = endPoint.x - startPoint.x;
    const deltaY = endPoint.y - startPoint.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left';
    } else {
        return deltaY > 0 ? 'down' : 'up';
    }
};
