export interface User {
    id: number;
    name: string;
    blader_name?: string | null;
    tournament_blader_name?: string;
    site_member_id?: number | null;
    site_member_image_url?: string | null;
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
        user: User | null;
    };
    is_admin: boolean;
    /** True when user should use Shadow Syndicate member portal (not Tournament X organizer UI). */
    is_member_portal: boolean;
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
    tournament_x_logo_url: string;
    tournamentx_url: string;
    tournamentx_enabled: boolean;
    main_site_url: string;
    tournamentx_plan?: 'starter' | 'community' | 'pro' | null;
    tournamentx_plan_label?: string | null;
    tournamentx_plan_limits?: {
        max_players: number | null;
        judge_panel: boolean;
        live_scoring: boolean;
    } | null;
    tournamentx_show_upgrade?: boolean;
    tournamentx_upgrade_pending?: boolean;
    tournamentx_pricing_url?: string;
    tournamentx_upgrade_payment?: {
        amount: string;
        period: string;
        payment_method: string;
        instructions: string;
        payment_qr_url: string | null;
    };
    tournamentx_upgrade_details?: {
        current_plan: { name: string; description: string; features: string[] };
        target_plan: { name: string; description: string; price: string; period: string; features: string[] };
        payment: {
            amount: string;
            period: string;
            payment_method: string;
            instructions: string;
            payment_qr_url: string | null;
        };
        steps: string[];
    };
    admin_pending_plan_upgrades?: number;
    /** Total counted page views on public site routes (see TrackSiteVisit middleware). */
    site_visit_count: number;
};
