import { ImageSize, publicStorageUrl, storageThumbPath } from '@/utils/publicStorage';

export function normalizeImages(images: unknown): string[] {
    if (!images) return [];
    if (typeof images === 'string') {
        try {
            const parsed = JSON.parse(images);
            return Array.isArray(parsed) ? normalizeImages(parsed) : [];
        } catch {
            return images.length > 0 ? [images] : [];
        }
    }
    if (!Array.isArray(images)) return [];
    return images.filter((p): p is string => typeof p === 'string' && p.trim().length > 0);
}

export function blogImageSrc(path: string, size: ImageSize = 'full'): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    if (size === 'thumb') {
        return publicStorageUrl(storageThumbPath(path.replace(/^\/+/, '')));
    }

    return publicStorageUrl(path);
}

/** List/grid cards — smaller file when thumb exists (falls back via OptimizedImage). */
export function blogCoverSrc(path: string): { src: string; fallbackSrc: string } {
    return {
        src: blogImageSrc(path, 'thumb'),
        fallbackSrc: blogImageSrc(path, 'full'),
    };
}
