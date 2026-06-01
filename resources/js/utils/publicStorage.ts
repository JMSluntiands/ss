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
