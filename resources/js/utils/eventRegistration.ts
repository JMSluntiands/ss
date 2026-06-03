import { PageProps } from '@/types';

export interface EventRegFormDefaults {
    full_name: string;
    blader_name_1: string;
}

export function getEventRegistrationDefaults(
    auth: PageProps['auth'],
): EventRegFormDefaults {
    const user = auth.user;
    if (!user) {
        return { full_name: '', blader_name_1: '' };
    }

    const bladerName =
        user.tournament_blader_name ?? user.blader_name ?? user.name;

    return {
        full_name: user.name,
        blader_name_1: bladerName,
    };
}

export function tournamentxLoginUrl(
    tournamentxUrl: string,
    returnUrl?: string,
): string {
    const base = tournamentxUrl.replace(/\/$/, '');
    if (!returnUrl) {
        return `${base}/login`;
    }

    return `${base}/login?redirect=${encodeURIComponent(returnUrl)}`;
}
