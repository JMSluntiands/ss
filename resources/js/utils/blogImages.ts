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

import { publicStorageUrl } from '@/utils/publicStorage';

export function blogImageSrc(path: string): string {
    return publicStorageUrl(path);
}
