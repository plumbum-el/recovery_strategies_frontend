import { useState } from 'react';
import { localMediaPath } from '../recovery_strategies_environment';

export const DEFAULT_IMAGE = localMediaPath('recovery_strategies_default_image.png');
export const DEFAULT_VIDEO = localMediaPath('recovery_strategies_default_video.mp4');

function localBackup(src: string | null, kind: 'image' | 'video'): string {
    const fallback = kind === 'image' ? DEFAULT_IMAGE : DEFAULT_VIDEO;
    if (!src) return fallback;
    try {
        const basename = decodeURIComponent(src.split('/').pop() || '');
        if (/^(sync|async|cloud|cold)_(image\.(png|jpg|jpeg|webp)|video\.(mp4|webm))$/.test(basename)) {
            return localMediaPath('recovery_strategies_' + basename);
        }
    } catch {
        return fallback;
    }
    return fallback;
}

interface ImageProps {
    src: string | null;
    alt: string;
    className?: string;
}

export function StrategyImage({ src, alt, className = '' }: ImageProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const actualSrc = !src || src === failedSrc ? localBackup(src, 'image') : src;
    return (
        <img loading="lazy" decoding="async" className={className} src={actualSrc} alt={alt} onError={() => setFailedSrc(src)} />
    );
}

export function StrategyVideo({ src, poster }: { src: string | null; poster: string | null }) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const actualSrc = !src || src === failedSrc ? localBackup(src, 'video') : src;
    return (
        <video key={actualSrc} className="strategy-video" controls muted playsInline preload="metadata" poster={poster || localBackup(poster, 'image')} src={actualSrc} onError={() => setFailedSrc(src)} />
    );
}
