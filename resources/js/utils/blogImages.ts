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

export function blogImageSrc(path: string): string {
    const trimmed = path.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('/storage/')) return trimmed;
    return `/storage/${trimmed.replace(/^\/+/, '')}`;
}
