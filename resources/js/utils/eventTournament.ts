export interface TournamentForEvent {
    id: number;
    name: string;
    description: string | null;
    tournament_type: string;
    format: string;
    group_stage_format: string | null;
    final_stage_format: string | null;
    swiss_rounds: number | null;
    swiss_top_cut_players: number | null;
    participants_per_group: number | null;
    advance_per_group: number | null;
}

const formatLabel: Record<string, string> = {
    single_elimination: 'Single Elimination',
    double_elimination: 'Double Elimination',
    round_robin: 'Round Robin',
    swiss: 'Swiss',
};

export function formatSummaryFromTournament(t: TournamentForEvent): string {
    const label = (key: string | null | undefined) =>
        (key && formatLabel[key]) || key || '';

    if (t.tournament_type === 'two_stage') {
        const groupFmt = label(t.group_stage_format || t.format);
        const finalFmt = label(t.final_stage_format || 'single_elimination');
        const rounds = t.swiss_rounds ? `${t.swiss_rounds} Swiss rounds` : 'Swiss';
        const cut =
            t.participants_per_group && t.advance_per_group
                ? `, top ${t.advance_per_group} per group (${t.participants_per_group} per group)`
                : '';
        return `Two Stage: ${rounds}${cut} → ${finalFmt}`;
    }

    if (t.format === 'swiss' || t.format === 'round_robin') {
        const rounds = t.swiss_rounds ? `${t.swiss_rounds} rounds` : '';
        const cut = t.swiss_top_cut_players ? `, top ${t.swiss_top_cut_players} cut` : '';
        return `${label(t.format)}${rounds ? ` (${rounds})` : ''}${cut}`;
    }

    return label(t.format);
}

export function applyTournamentToEventForm<
    T extends {
        title: string;
        description: string;
        organizer: string;
        format: string;
        tournament_id: string;
    },
>(prev: T, tournamentId: string, tournaments: TournamentForEvent[], userName: string): T {
    if (!tournamentId) {
        return { ...prev, tournament_id: '' };
    }

    const t = tournaments.find((x) => x.id === parseInt(tournamentId, 10));
    if (!t) {
        return { ...prev, tournament_id: tournamentId };
    }

    return {
        ...prev,
        tournament_id: tournamentId,
        title: t.name,
        description: t.description ?? '',
        organizer: prev.organizer || userName,
        format: formatSummaryFromTournament(t),
    };
}
