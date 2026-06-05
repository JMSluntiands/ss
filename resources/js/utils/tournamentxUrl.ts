import { PageProps } from '@/types';

/** Tournament X marketing site (landing page). */
export function tournamentxSiteUrl(props: Pick<PageProps, 'tournamentx_enabled' | 'tournamentx_url'>): string {
    if (props.tournamentx_enabled && props.tournamentx_url) {
        return props.tournamentx_url.replace(/\/$/, '');
    }

    return route('tournamentx.home', undefined, false);
}

/** Register URL for Tournament X. */
export function tournamentxRegisterUrl(props: Pick<PageProps, 'tournamentx_enabled' | 'tournamentx_url'>): string {
    if (props.tournamentx_enabled && props.tournamentx_url) {
        return `${props.tournamentx_url.replace(/\/$/, '')}/register`;
    }

    return route('register', undefined, false);
}

/** Login URL for Tournament X (subdomain when configured). */
export function tournamentxLoginUrl(props: Pick<PageProps, 'tournamentx_enabled' | 'tournamentx_url'>): string {
    if (props.tournamentx_enabled && props.tournamentx_url) {
        return `${props.tournamentx_url.replace(/\/$/, '')}/login`;
    }

    return route('login', undefined, false);
}

/** Dashboard URL for Tournament X (subdomain when configured). */
/** Pricing section on the Tournament X marketing site. */
export function tournamentxPricingUrl(
    props: Pick<PageProps, 'tournamentx_pricing_url' | 'tournamentx_enabled' | 'tournamentx_url'>,
): string {
    if (props.tournamentx_pricing_url) {
        return props.tournamentx_pricing_url;
    }

    return `${tournamentxSiteUrl(props).replace(/\/$/, '')}#pricing`;
}

export function tournamentxDashboardUrl(props: Pick<PageProps, 'tournamentx_enabled' | 'tournamentx_url'>): string {
    if (props.tournamentx_enabled && props.tournamentx_url) {
        return `${props.tournamentx_url.replace(/\/$/, '')}/dashboard`;
    }

    return route('dashboard', undefined, false);
}
