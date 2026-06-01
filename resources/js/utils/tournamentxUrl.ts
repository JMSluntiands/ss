import { PageProps } from '@/types';

/** Login URL for Tournament X (subdomain when configured). */
export function tournamentxLoginUrl(props: Pick<PageProps, 'tournamentx_enabled' | 'tournamentx_url'>): string {
    if (props.tournamentx_enabled && props.tournamentx_url) {
        return `${props.tournamentx_url.replace(/\/$/, '')}/login`;
    }

    return route('login');
}

/** Dashboard URL for Tournament X (subdomain when configured). */
export function tournamentxDashboardUrl(props: Pick<PageProps, 'tournamentx_enabled' | 'tournamentx_url'>): string {
    if (props.tournamentx_enabled && props.tournamentx_url) {
        return `${props.tournamentx_url.replace(/\/$/, '')}/dashboard`;
    }

    return route('dashboard');
}
