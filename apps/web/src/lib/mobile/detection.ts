/**
 * Mobile Device Detection Utility
 * Provides comprehensive mobile device detection and capability checking
 */

export interface DeviceInfo {
    /** Whether the device is mobile */
    isMobile: boolean;
    /** Whether the device supports touch */
    supportsTouch: boolean;
    /** Device type (mobile, tablet, desktop) */
    deviceType: 'mobile' | 'tablet' | 'desktop';
    /** Operating system */
    os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
    /** Browser */
    browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
    /** Screen size category */
    screenSize: 'small' | 'medium' | 'large' | 'xlarge';
    /** Whether the device supports haptic feedback */
    supportsHaptics: boolean;
    /** Whether the device supports PWA installation */
    supportsPWA: boolean;
}

/**
 * Check if the current device is mobile
 */
export const isMobile = (): boolean => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

    return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
        ) || 'ontouchstart' in window
    );
};

/**
 * Check if the device supports touch
 */
export const supportsTouch = (): boolean => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get device type based on screen size and user agent
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'desktop';

    if (!isMobile()) return 'desktop';

    // Check if it's a tablet based on screen size and user agent
    const isTablet =
        /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent) ||
        (window.innerWidth >= 768 && window.innerHeight >= 1024);

    return isTablet ? 'tablet' : 'mobile';
};

/**
 * Get operating system
 */
export const getOS = (): 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown' => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent;

    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    if (/Windows/.test(userAgent)) return 'windows';
    if (/Mac OS X/.test(userAgent)) return 'macos';
    if (/Linux/.test(userAgent)) return 'linux';

    return 'unknown';
};

/**
 * Get browser type
 */
export const getBrowser = (): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent;

    if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) return 'chrome';
    if (/Firefox/.test(userAgent)) return 'firefox';
    if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'safari';
    if (/Edge/.test(userAgent)) return 'edge';

    return 'unknown';
};

/**
 * Get screen size category
 */
export const getScreenSize = (): 'small' | 'medium' | 'large' | 'xlarge' => {
    if (typeof window === 'undefined') return 'medium';

    const width = window.innerWidth;

    if (width < 640) return 'small'; // Mobile
    if (width < 1024) return 'medium'; // Tablet
    if (width < 1280) return 'large'; // Desktop
    return 'xlarge'; // Large Desktop
};

/**
 * Check if device supports haptic feedback
 */
export const supportsHaptics = (): boolean => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

    return 'vibrate' in navigator || 'vibrate' in window;
};

/**
 * Check if device supports PWA installation
 */
export const supportsPWA = (): boolean => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

    return 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Get comprehensive device information
 */
export const getDeviceInfo = (): DeviceInfo => {
    return {
        isMobile: isMobile(),
        supportsTouch: supportsTouch(),
        deviceType: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        screenSize: getScreenSize(),
        supportsHaptics: supportsHaptics(),
        supportsPWA: supportsPWA(),
    };
};

/**
 * Check if current device is iOS
 */
export const isIOS = (): boolean => getOS() === 'ios';

/**
 * Check if current device is Android
 */
export const isAndroid = (): boolean => getOS() === 'android';

/**
 * Check if current device is tablet
 */
export const isTablet = (): boolean => getDeviceType() === 'tablet';

/**
 * Check if current device is mobile phone
 */
export const isMobilePhone = (): boolean => getDeviceType() === 'mobile';

/**
 * Check if current device is desktop
 */
export const isDesktop = (): boolean => getDeviceType() === 'desktop';

/**
 * Get device pixel ratio for high-DPI displays
 */
export const getPixelRatio = (): number => {
    if (typeof window === 'undefined') return 1;

    return window.devicePixelRatio || 1;
};

/**
 * Check if device has high-DPI display
 */
export const hasHighDPI = (): boolean => getPixelRatio() > 1;

/**
 * Check if device is in landscape orientation
 */
export const isLandscape = (): boolean => {
    if (typeof window === 'undefined') return false;

    return window.innerWidth > window.innerHeight;
};

/**
 * Check if device is in portrait orientation
 */
export const isPortrait = (): boolean => !isLandscape();
