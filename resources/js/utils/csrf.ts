/** Laravel CSRF token for background API calls (fetch / axios / Inertia). */
export function getCsrfToken(): string {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
    if (meta) {
        return meta;
    }

    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    if (match?.[1]) {
        try {
            return decodeURIComponent(match[1]);
        } catch {
            return match[1];
        }
    }

    return '';
}

/** Keep meta tag + axios headers in sync after live polls or Inertia visits. */
export function setCsrfToken(token: string): void {
    if (!token) return;

    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    if (meta) {
        meta.content = token;
    }

    if (typeof window !== 'undefined' && window.axios) {
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        window.axios.defaults.headers.common['X-XSRF-TOKEN'] = token;
    }
}

export function applyCsrfFromPayload(payload: { csrf_token?: string } | null | undefined): void {
    if (payload?.csrf_token) {
        setCsrfToken(payload.csrf_token);
    }
}

/** Refresh session CSRF before form actions on long-lived pages. */
export async function refreshCsrfCookie(): Promise<void> {
    try {
        const url = typeof route === 'function' ? route('csrf.cookie') : '/csrf-cookie';
        const res = await fetch(url, {
            credentials: 'include',
            headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
        });
        if (!res.ok) {
            return;
        }
        const data = (await res.json()) as { csrf_token?: string };
        applyCsrfFromPayload(data);
    } catch {
        // ignore network errors; Play may still work with existing token
    }
}

export function csrfHeaders(): Record<string, string> {
    const token = getCsrfToken();
    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token ? { 'X-CSRF-TOKEN': token, 'X-XSRF-TOKEN': token } : {}),
    };
}
