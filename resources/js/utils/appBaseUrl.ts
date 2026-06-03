/** Prefix href with /index.php when the app is served that way (shared hosting). */
export function withAppBase(href: string): string {
    if (typeof window === 'undefined' || href.startsWith('http')) {
        return href;
    }

    const needsIndexPhp = window.location.pathname.startsWith('/index.php');

    if (!needsIndexPhp || href.startsWith('/index.php')) {
        return href;
    }

    return `/index.php${href.startsWith('/') ? href : `/${href}`}`;
}

/** Named route as a same-origin relative path, with optional index.php prefix. */
export function appRoute(
    name: string,
    params?: Parameters<typeof route>[1],
    absolute = false,
): string {
    return withAppBase(route(name, params, absolute));
}
