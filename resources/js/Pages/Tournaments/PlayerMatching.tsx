import SiteLogo from '@/Components/SiteLogo';
import TournamentXBrand from '@/Components/TournamentXBrand';
import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { applyCsrfFromPayload } from '@/utils/csrf';
import { Fragment, useMemo, useState } from 'react';

interface MatchPlayer {
    id: number;
    name: string;
    avatar_url?: string | null;
}

interface RoundEntry {
    round: number;
    winner: 'p1' | 'p2';
    finish: string;
    points: number;
}

interface LiveMatch {
    id: number;
    stage: string;
    round: number;
    match_number: number;
    status: string;
    stadium: number | null;
    player1_id: number | null;
    player2_id: number | null;
    player1_score: number | null;
    player2_score: number | null;
    player1_battle_points: number;
    player2_battle_points: number;
    round_details: RoundEntry[] | null;
    player1: MatchPlayer | null;
    player2: MatchPlayer | null;
}

interface TournamentInfo {
    id: number;
    name: string;
    slug: string;
    status: string;
    format: string;
    current_round: number;
    tournament_type: string;
    pts_for_match_win: number;
    pts_for_match_tie: number;
    swiss_top_cut_players: number | null;
    advance_per_group?: number | null;
}

interface GroupLeader {
    group: string;
    participant_name: string;
    participant_id: number | null;
}

interface StandingRow {
    rank: number;
    participant_id: number;
    participant_name: string;
    wins: number;
    losses: number;
    draws: number;
    tournament_points: number;
    battle_points: number;
    opponent_strength: number;
    pts_diff: number;
}

function getPlayoffCut(tournament: TournamentInfo, standingCount: number): number | null {
    const configuredTop = tournament.swiss_top_cut_players ?? 0;
    if (tournament.tournament_type === 'two_stage' && tournament.advance_per_group) {
        return tournament.advance_per_group;
    }
    if (['swiss', 'round_robin'].includes(tournament.format) && configuredTop >= 2) {
        return configuredTop;
    }
    if (configuredTop >= 2) {
        return Math.min(configuredTop, standingCount);
    }
    return null;
}

const rankColor = (rank: number) =>
    rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-500' : 'text-slate-500';


function normalizeRounds(raw: RoundEntry[] | null | undefined): RoundEntry[] {
    if (!Array.isArray(raw)) return [];
    return raw.filter((r) => r && typeof r.round === 'number');
}

function scoreFromRounds(rounds: RoundEntry[], side: 'p1' | 'p2'): number {
    return rounds.filter((r) => r.winner === side).reduce((s, r) => s + (r.points ?? 0), 0);
}

function MatchBoardCard({ match }: { match: LiveMatch }) {
    const rounds = normalizeRounds(match.round_details);
    const p1FromRounds = scoreFromRounds(rounds, 'p1');
    const p2FromRounds = scoreFromRounds(rounds, 'p2');
    const p1Score = Math.max(p1FromRounds, match.player1_score ?? 0, match.player1_battle_points ?? 0);
    const p2Score = Math.max(p2FromRounds, match.player2_score ?? 0, match.player2_battle_points ?? 0);
    const p1Leading = p1Score > p2Score;
    const p2Leading = p2Score > p1Score;
    const leader =
        p1Leading ? match.player1?.name : p2Leading ? match.player2?.name : null;

    return (
        <article className="rounded-2xl border border-fuchsia-500/25 bg-slate-900/60 overflow-hidden shadow-lg shadow-fuchsia-500/10 flex flex-col h-full">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-500/10 via-violet-500/5 to-cyan-500/10">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                    </span>
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">Playing</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                        R{match.round} · M{match.match_number}
                    </span>
                </div>
                {match.stadium != null && (
                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400">
                        Stadium {match.stadium}
                    </span>
                )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`flex-1 flex flex-col items-center min-w-0 ${p1Leading ? 'text-cyan-400' : 'text-white'}`}>
                        <p className="text-xs sm:text-sm font-bold uppercase truncate tracking-wide w-full text-center px-0.5" title={match.player1?.name}>
                            {match.player1?.name}
                        </p>
                        <p className={`text-3xl sm:text-4xl font-black mt-1 tabular-nums leading-none ${p1Leading ? 'text-cyan-400' : 'text-white'}`}>
                            {p1Score}
                        </p>
                    </div>
                    <div className="shrink-0">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-600">VS</span>
                    </div>
                    <div className={`flex-1 flex flex-col items-center min-w-0 ${p2Leading ? 'text-cyan-400' : 'text-white'}`}>
                        <p className="text-xs sm:text-sm font-bold uppercase truncate tracking-wide w-full text-center px-0.5" title={match.player2?.name}>
                            {match.player2?.name}
                        </p>
                        <p className={`text-3xl sm:text-4xl font-black mt-1 tabular-nums leading-none ${p2Leading ? 'text-cyan-400' : 'text-white'}`}>
                            {p2Score}
                        </p>
                    </div>
                </div>

                {leader && (
                    <div className="mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-cyan-300 font-semibold truncate">Leading: {leader}</span>
                    </div>
                )}
            </div>
        </article>
    );
}

function StandingsSidebar({
    standings,
    groupLeaders,
    tournament,
}: {
    standings: StandingRow[];
    groupLeaders: GroupLeader[];
    tournament: TournamentInfo;
}) {
    const topCut = getPlayoffCut(tournament, standings.length);

    return (
        <aside className="lg:col-span-4 flex flex-col min-h-[20rem] lg:min-h-0 lg:h-full min-w-0">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 overflow-hidden flex flex-col flex-1 min-h-0 h-full">
                <div className="px-4 py-3 border-b border-slate-800/80 shrink-0 flex items-center justify-between gap-2">
                    <div>
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Standings</h2>
                    </div>
                    {topCut != null && (
                        <span className="shrink-0 text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider">
                            Top {topCut} cut
                        </span>
                    )}
                </div>

                {groupLeaders.length > 0 && (
                    <div className="px-4 py-3 border-b border-cyan-500/15 bg-cyan-500/5 shrink-0">
                        <p className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider mb-2">
                            Group leaders
                        </p>
                        <div className="space-y-1.5">
                            {groupLeaders.map((leader) => (
                                <div
                                    key={`${leader.group}-${leader.participant_id ?? leader.participant_name}`}
                                    className="flex items-center justify-between gap-2 text-xs"
                                >
                                    <span className="text-cyan-300/80 font-medium shrink-0">{leader.group}</span>
                                    <span className="text-cyan-100 font-semibold truncate text-right">{leader.participant_name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {standings.length === 0 ? (
                    <p className="px-4 py-8 text-xs text-slate-600 text-center">
                        {['swiss', 'round_robin'].includes(tournament.format)
                            ? 'Standings appear after matches are played.'
                            : 'Standings are shown for Swiss and Round Robin formats.'}
                    </p>
                ) : (
                    <div className="overflow-auto flex-1 min-h-0 [scrollbar-width:thin] [scrollbar-color:rgb(71_85_105)_transparent]">
                        <table className="w-full min-w-[32rem] text-xs">
                            <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                                <tr className="border-b border-slate-700/60 bg-slate-800/40">
                                    <th className="px-2 py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider w-12">Rank</th>
                                    <th className="px-2 py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider min-w-[5.5rem]">Participant</th>
                                    <th className="px-2 py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <div>Match W-L-T</div>
                                        <div className="text-[9px] font-normal text-slate-500 normal-case">
                                            (wins +{Number(tournament.pts_for_match_win).toFixed(1)}, ties +{Number(tournament.pts_for_match_tie).toFixed(1)})
                                        </div>
                                    </th>
                                    <th className="px-2 py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">1. Score</th>
                                    <th className="px-2 py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">2. TB</th>
                                    <th className="px-2 py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">3. Buchholz</th>
                                    <th className="px-2 py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">4. Pts Diff</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((row) => {
                                    const isAdvancing = topCut !== null && row.rank <= topCut;
                                    const isCutoffRow = topCut !== null && row.rank === topCut;
                                    const diff = row.pts_diff;
                                    return (
                                        <Fragment key={row.participant_id}>
                                            <tr
                                                className={`border-b hover:bg-slate-800/30 ${
                                                    isCutoffRow ? 'border-b-0' : 'border-slate-800/40'
                                                } ${
                                                    row.rank === 1 ? 'bg-yellow-500/5' :
                                                    isAdvancing ? 'bg-cyan-500/[0.03]' :
                                                    row.rank % 2 === 0 ? 'bg-slate-900/20' : ''
                                                }`}
                                            >
                                                <td className="px-2 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-0.5">
                                                        {row.rank <= 3 && (
                                                            <svg className={`w-3.5 h-3.5 ${rankColor(row.rank)}`} viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M2.5 7.5L5 14h14l2.5-6.5L17.5 10 12 4l-5.5 6L2.5 7.5zM5 16h14v2H5v-2z" />
                                                            </svg>
                                                        )}
                                                        <span className={`font-bold tabular-nums ${rankColor(row.rank)}`}>
                                                            {row.rank}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <span
                                                        className={`inline-block max-w-[6rem] truncate font-semibold ${
                                                            row.rank === 1 ? 'text-yellow-400' :
                                                            !isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'
                                                        }`}
                                                        title={row.participant_name}
                                                    >
                                                        {row.participant_name}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-center tabular-nums">
                                                    <span className={!isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'}>{row.wins}</span>
                                                    <span className="text-slate-600 mx-0.5">-</span>
                                                    <span className={!isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'}>{row.losses}</span>
                                                    <span className="text-slate-600 mx-0.5">-</span>
                                                    <span className={!isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'}>{row.draws}</span>
                                                </td>
                                                <td className="px-2 py-2 text-center font-bold tabular-nums">
                                                    <span className={!isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'}>
                                                        {row.tournament_points.toFixed(1)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-center tabular-nums">
                                                    <span className={!isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'}>{row.battle_points}</span>
                                                </td>
                                                <td className="px-2 py-2 text-center tabular-nums">
                                                    <span className={!isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'}>
                                                        {row.opponent_strength.toFixed(0)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-center tabular-nums">
                                                    <span className={
                                                        !isAdvancing && topCut !== null ? 'text-slate-500' :
                                                        diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-white'
                                                    }>
                                                        {diff > 0 ? `+${diff}` : diff}
                                                    </span>
                                                </td>
                                            </tr>
                                            {isCutoffRow && (
                                                <tr>
                                                    <td colSpan={7} className="px-0 py-0">
                                                        <div className="flex items-center gap-2 px-2 py-1 bg-slate-800/60">
                                                            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/40 to-transparent" />
                                                            <span className="text-[9px] font-bold text-cyan-400/70 uppercase tracking-widest whitespace-nowrap">
                                                                Top {topCut} Cut
                                                            </span>
                                                            <div className="flex-1 h-px bg-gradient-to-l from-cyan-500/40 to-transparent" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default function PlayerMatching({
    tournament,
    matches: initialMatches,
    group_leaders: initialGroupLeaders,
    standings: initialStandings,
}: {
    tournament: TournamentInfo;
    matches: LiveMatch[];
    group_leaders: GroupLeader[];
    standings: StandingRow[];
}) {
    const [matches, setMatches] = useState<LiveMatch[]>(initialMatches);
    const [currentRound, setCurrentRound] = useState(tournament.current_round);
    const [groupLeaders, setGroupLeaders] = useState<GroupLeader[]>(initialGroupLeaders ?? []);
    const [standings, setStandings] = useState<StandingRow[]>(initialStandings ?? []);
    const liveUrl = `/t/${tournament.slug}/matches/live`;

    const { isFetching } = useQuery({
        queryKey: ['player-matching', tournament.slug],
        queryFn: async () => {
            const res = await fetch(`${liveUrl}?_=${Date.now()}`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            applyCsrfFromPayload(data);
            setMatches(data.matches ?? []);
            if (data.current_round != null) setCurrentRound(data.current_round);
            setGroupLeaders(data.group_leaders ?? []);
            setStandings(data.standings ?? []);
            return data;
        },
        refetchInterval: 4000,
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: true,
    });

    const sortedMatches = useMemo(
        () =>
            [...matches].sort((a, b) => {
                const sa = a.stadium ?? 999;
                const sb = b.stadium ?? 999;
                if (sa !== sb) return sa - sb;
                return a.match_number - b.match_number;
            }),
        [matches],
    );

    return (
        <>
            <Head title={`Live Matches — ${tournament.name}`} />
            <div className="tx-app-theme h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-600 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600 rounded-full blur-[100px]" />
                </div>

                <header className="relative z-10 grid grid-cols-[1fr_auto_1fr] shrink-0 items-center gap-2 sm:gap-4 h-14 sm:h-16 px-4 sm:px-6 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm">
                    <div className="justify-self-start min-w-0">
                        <TournamentXBrand href={route('home')} logoClassName="h-9 sm:h-10 w-auto" />
                    </div>
                    <div className="justify-self-center flex flex-col items-center gap-0.5 shrink-0">
                        <SiteLogo className="h-7 sm:h-8 w-auto opacity-90" loading="lazy" />
                        <p className="text-[9px] sm:text-[10px] text-zinc-600 whitespace-nowrap">
                            Created by <span className="text-red-500/70 font-semibold">Shadow Syndicate</span>
                        </p>
                    </div>
                    <div className="justify-self-end flex flex-wrap items-center justify-end gap-2 sm:gap-3 shrink-0 min-w-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-xs font-bold text-cyan-300">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                            </span>
                            LIVE
                        </span>
                        {currentRound > 0 && (
                            <span className="text-xs text-slate-500">Round {currentRound}</span>
                        )}
                        <span className="text-xs text-slate-600">
                            {isFetching ? 'Updating…' : 'Auto-refresh every 4s'}
                        </span>
                    </div>
                </header>

                <main className="relative z-10 flex-1 min-h-0 flex flex-col w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 overflow-y-auto lg:overflow-hidden">
                    <div className="shrink-0 mb-4 sm:mb-5">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white uppercase tracking-tight truncate" title={tournament.name}>
                            {tournament.name}
                        </h1>
                        <div className="mt-2 sm:mt-3 w-20 h-1 rounded-full tx-underline" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 lg:flex-1 lg:min-h-0 lg:items-stretch">
                        <div className="lg:col-span-8 min-w-0 lg:min-h-0 lg:flex lg:flex-col lg:overflow-hidden">
                            {sortedMatches.length === 0 ? (
                                <div className="lg:flex-1 lg:min-h-0 rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden flex items-center justify-center min-h-[12rem] lg:min-h-0">
                                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center max-w-md">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-300 text-sm font-medium">No live matches right now</p>
                                        <p className="text-slate-600 text-xs mt-1">
                                            Matches appear here when they're in play. They disappear once the result is submitted.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="lg:flex-1 lg:min-h-0 lg:flex lg:flex-col lg:overflow-hidden">
                                    <p className="shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                        Now Playing ({sortedMatches.length})
                                    </p>
                                    <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgb(71_85_105)_transparent]">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 pb-1">
                                            {sortedMatches.map((match) => (
                                                <MatchBoardCard key={match.id} match={match} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <StandingsSidebar
                            standings={standings}
                            groupLeaders={groupLeaders}
                            tournament={tournament}
                        />
                    </div>
                </main>
            </div>
        </>
    );
}
