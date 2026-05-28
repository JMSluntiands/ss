export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: 'user' | 'admin';
    can_manage_tournaments: boolean;
    can_use_judge: boolean;
    can_score_matches: boolean;
    can_create_tournaments: boolean;
    can_manage_events: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    is_admin: boolean;
    permissions: {
        can_create_tournaments: boolean;
        can_manage_tournaments: boolean;
        can_use_judge: boolean;
        can_score_matches: boolean;
        can_manage_events: boolean;
    };
    flash: {
        success?: string;
        error?: string;
    };
    site_logo_url: string;
    /** Total counted page views on public site routes (see TrackSiteVisit middleware). */
    site_visit_count: number;
};
