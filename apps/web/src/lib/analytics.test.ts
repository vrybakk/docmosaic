import { afterEach, describe, expect, it, vi } from 'vitest';
import { setAnalyticsTracker, trackEvent } from './analytics';

describe('analytics tracker injection', () => {
    afterEach(() => {
        // Reset to no-op so tests don't leak state to each other or to other suites.
        setAnalyticsTracker(() => {});
        vi.unstubAllEnvs();
    });

    it('forwards events to the injected tracker in production', () => {
        vi.stubEnv('NODE_ENV', 'production');
        const spy = vi.fn();
        setAnalyticsTracker(spy);

        trackEvent.documentGenerated({
            totalPages: 1,
            totalImages: 0,
            averageImagesPerPage: 0,
            format: 'A4',
            orientation: 'portrait',
            fileSize: 1024,
        });

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith('document_generated', {
            pages: 1,
            images: 0,
            imagesPerPage: 0,
            format: 'A4',
            orientation: 'portrait',
            sizeKB: 1024,
            estimatedSizeKB: null,
        });
    });

    it('does not call the tracker outside production', () => {
        vi.stubEnv('NODE_ENV', 'development');
        const spy = vi.fn();
        setAnalyticsTracker(spy);

        trackEvent.editorInit();

        expect(spy).not.toHaveBeenCalled();
    });
});
