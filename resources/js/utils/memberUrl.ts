import { PageProps, User } from '@/types';

export function isMemberPortalUser(props: Pick<PageProps, 'is_member_portal'>): boolean {
    return Boolean(props.is_member_portal);
}

export function accountHomeUrl(
    props: Pick<
        PageProps,
        | 'is_member_portal'
        | 'is_platform_admin_user'
        | 'platform_admin_dashboard_url'
        | 'tournamentx_enabled'
        | 'tournamentx_url'
    >,
): string {
    if (isMemberPortalUser(props)) {
        return memberDashboardUrl();
    }

    if (props.is_platform_admin_user && props.platform_admin_dashboard_url) {
        return props.platform_admin_dashboard_url;
    }

    const { tournamentx_enabled, tournamentx_url } = props;
    if (tournamentx_enabled && tournamentx_url) {
        return `${tournamentx_url.replace(/\/$/, '')}/dashboard`;
    }

    return route('dashboard', undefined, false);
}

export function memberDisplayName(user: User): string {
    return user.blader_name || user.tournament_blader_name || user.name;
}

/** Member login on the main Shadow Syndicate site. */
export function memberLoginUrl(): string {
    return route('member.login', undefined, false);
}

/** Member dashboard on the main Shadow Syndicate site. */
export function memberDashboardUrl(): string {
    return route('member.dashboard', undefined, false);
}
