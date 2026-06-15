import type { UploadProgressInfo } from './use-image-upload';

interface SectionUploadProgressProps {
    progress: UploadProgressInfo;
}

/** Overlay shown while an image upload pipeline is running. */
export function SectionUploadProgress({ progress }: SectionUploadProgressProps) {
    return (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
            <div className="w-full max-w-xs px-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{progress.message}</span>
                    <span className="text-sm font-medium text-gray-500">
                        {Math.round(progress.progress)}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
