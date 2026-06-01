/** Public disk files — served via /storage/... route (no symlink required on live). */
export function publicStorageUrl(path: string): string {
    const trimmed = path.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('/storage/')) return trimmed;

    const relative = trimmed.replace(/^\/+/, '');
    return `/storage/${relative}`;
}

export type ImageSize = 'thumb' | 'full';

function storageRelativePath(url: string): string {
    if (url.startsWith('/storage/')) {
        return url.slice('/storage/'.length);
    }

    return url.replace(/^\/+/, '');
}

export function storageThumbPath(relativePath: string): string {
    if (relativePath.endsWith('_thumb.jpg')) {
        return relativePath;
    }

    const lastDot = relativePath.lastIndexOf('.');
    if (lastDot === -1) {
        return `${relativePath}_thumb.jpg`;
    }

    return `${relativePath.slice(0, lastDot)}_thumb.jpg`;
}

export function memberImageSrc(url: string | null, size: ImageSize = 'full'): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    const relative = storageRelativePath(url);
    const path = size === 'thumb' ? storageThumbPath(relative) : relative;

    return publicStorageUrl(path);
}

/** Participant avatars from API (path or /storage/... or full URL). */
export function participantImageSrc(url: string | null | undefined): string | null {
    return memberImageSrc(url ?? null);
}

export function formatPhpPrice(value: number | string | null | undefined): string {
    const n = typeof value === 'string' ? parseFloat(value) : Number(value ?? 0);
    if (!Number.isFinite(n)) {
        return '₱0.00';
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

export type ShopCategory = 'jersey' | 'beyblade_part';

export const SHOP_CATEGORY_LABELS: Record<ShopCategory, string> = {
    jersey: 'Jersey / Apparel',
    beyblade_part: 'Beyblade Part',
};
