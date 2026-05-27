/** Public disk files — served via /storage/... route (no symlink required on live). */
export function publicStorageUrl(path: string): string {
    const trimmed = path.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('/storage/')) return trimmed;

    const relative = trimmed.replace(/^\/+/, '');
    return `/storage/${relative}`;
}

export function memberImageSrc(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return publicStorageUrl(url);
}
