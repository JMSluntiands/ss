/** Public disk files (blog-images, member-images, etc.) — works without storage symlink on live. */
export function publicStorageUrl(path: string): string {
    const trimmed = path.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('/files/')) return trimmed;

    const relative = trimmed.replace(/^\/storage\//, '').replace(/^\/+/, '');
    return route('public.storage', relative);
}

export function memberImageSrc(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return publicStorageUrl(url);
}
