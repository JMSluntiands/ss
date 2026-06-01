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

function stageFormatLabel(key: string | null | undefined): string {
    if (!key || /^\d+$/.test(key)) {
        return '';
    }
    return formatLabel[key] ?? key.replace(/_/g, ' ');
}

export function formatSummaryFromTournament(t: TournamentForEvent): string {
    if (t.tournament_type === 'two_stage') {
        const groupFmt = stageFormatLabel(t.group_stage_format) || stageFormatLabel(t.format) || 'Swiss';
        const finalFmt = stageFormatLabel(t.final_stage_format) || 'Single Elimination';
        const roundsPart = t.swiss_rounds ? `${t.swiss_rounds} ${groupFmt} rounds` : groupFmt;

        const advance = t.advance_per_group;
        const perGroup = t.participants_per_group;
        let cutPart = '';
        if (advance) {
            const topPerGroup = perGroup ? Math.min(advance, perGroup) : advance;
            cutPart = ` · Top ${topPerGroup} per group`;
            if (t.swiss_top_cut_players && t.swiss_top_cut_players >= 2) {
                cutPart += ` (${t.swiss_top_cut_players} to playoffs)`;
            }
        } else if (t.swiss_top_cut_players && t.swiss_top_cut_players >= 2) {
            cutPart = ` · Top ${t.swiss_top_cut_players} to playoffs`;
        }

        return `Two Stage: ${roundsPart}${cutPart} → ${finalFmt}`;
    }

    const mainFmt = stageFormatLabel(t.format);
    if (t.format === 'swiss' || t.format === 'round_robin') {
        const rounds = t.swiss_rounds ? `${t.swiss_rounds} rounds` : '';
        const cut = t.swiss_top_cut_players ? ` · Top ${t.swiss_top_cut_players} cut` : '';
        return `${mainFmt}${rounds ? ` (${rounds})` : ''}${cut}`;
    }

    return mainFmt || t.format;
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
