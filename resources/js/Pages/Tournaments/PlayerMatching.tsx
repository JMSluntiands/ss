import ParticipantAvatar from '@/Components/ParticipantAvatar';
import SiteLogo from '@/Components/SiteLogo';
import TournamentXBrand from '@/Components/TournamentXBrand';
import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

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
}

interface GroupLeader {
    group: string;
    participant_name: string;
    participant_id: number | null;
}

const FINISH_BADGE: Record<string, string> = {
    SF: 'bg-slate-700/60 text-slate-300 border-slate-600/50',
    OF: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    BF: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    XF: 'bg-red-500/10 text-red-400 border-red-500/20',
};

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
                <div className="flex items-start gap-2 sm:gap-3 mb-4">
                    <div className={`flex-1 flex flex-col items-center min-w-0 ${p1Leading ? 'text-cyan-400' : 'text-white'}`}>
                        <ParticipantAvatar
                            name={match.player1?.name ?? 'Player 1'}
                            avatarUrl={match.player1?.avatar_url}
                            size="xl"
                            className="mb-2.5 border-slate-600/80"
                        />
                        <p className="text-xs sm:text-sm font-bold uppercase truncate tracking-wide w-full text-center px-0.5" title={match.player1?.name}>
                            {match.player1?.name}
                        </p>
                        <p className={`text-3xl sm:text-4xl font-black mt-1 tabular-nums leading-none ${p1Leading ? 'text-cyan-400' : 'text-white'}`}>
                            {p1Score}
                        </p>
                    </div>
                    <div className="shrink-0 pt-10 sm:pt-12">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-600">VS</span>
                    </div>
                    <div className={`flex-1 flex flex-col items-center min-w-0 ${p2Leading ? 'text-cyan-400' : 'text-white'}`}>
                        <ParticipantAvatar
                            name={match.player2?.name ?? 'Player 2'}
                            avatarUrl={match.player2?.avatar_url}
                            size="xl"
                            className="mb-2.5 border-slate-600/80"
                        />
                        <p className="text-xs sm:text-sm font-bold uppercase truncate tracking-wide w-full text-center px-0.5" title={match.player2?.name}>
                            {match.player2?.name}
                        </p>
                        <p className={`text-3xl sm:text-4xl font-black mt-1 tabular-nums leading-none ${p2Leading ? 'text-cyan-400' : 'text-white'}`}>
                            {p2Score}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden flex-1 min-h-[4.5rem]">
                    <div className="px-3 py-2 border-b border-slate-700/30">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Round log</span>
                    </div>
                    {rounds.length === 0 ? (
                        <p className="px-3 py-4 text-xs text-slate-600 text-center">Waiting for judge scores…</p>
                    ) : (
                        <div className="divide-y divide-slate-700/20 max-h-40 overflow-y-auto">
                            {rounds.map((r, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-2 text-xs">
                                    <span className="text-slate-600 font-bold w-7 shrink-0">R{r.round}</span>
                                    <span className="font-semibold text-cyan-400 truncate uppercase">
                                        {r.winner === 'p1' ? match.player1?.name : match.player2?.name}
                                    </span>
                                    <span
                                        className={`shrink-0 ml-auto px-2 py-0.5 rounded border text-[10px] font-bold ${FINISH_BADGE[r.finish] ?? FINISH_BADGE.SF}`}
                                    >
                                        {r.finish} +{r.points}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
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

export default function PlayerMatching({
    tournament,
    matches: initialMatches,
    group_leaders: initialGroupLeaders,
}: {
    tournament: TournamentInfo;
    matches: LiveMatch[];
    group_leaders: GroupLeader[];
}) {
    const [matches, setMatches] = useState<LiveMatch[]>(initialMatches);
    const [currentRound, setCurrentRound] = useState(tournament.current_round);
    const [groupLeaders, setGroupLeaders] = useState<GroupLeader[]>(initialGroupLeaders ?? []);
    const liveUrl = `/t/${tournament.slug}/matches/live`;

    const { isFetching } = useQuery({
        queryKey: ['player-matching', tournament.slug],
        queryFn: async () => {
            const res = await fetch(`${liveUrl}?_=${Date.now()}`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setMatches(data.matches ?? []);
            if (data.current_round != null) setCurrentRound(data.current_round);
            setGroupLeaders(data.group_leaders ?? []);
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
            <div className="tx-app-theme min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-600 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600 rounded-full blur-[100px]" />
                </div>

                <header className="relative z-10 flex items-center justify-between h-16 px-4 sm:px-6 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm">
                    <TournamentXBrand href={route('home')} logoClassName="h-9 sm:h-10 w-auto" />
                </header>

                <main className="relative z-10 flex-1 w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div className="md:max-w-[55%]">
                            <h1 className="text-2xl sm:text-4xl font-bold text-white uppercase tracking-tight truncate" title={tournament.name}>
                                {tournament.name}
                            </h1>
                            <div className="mt-3 w-20 h-1 rounded-full tx-underline" />
                            <div className="flex flex-wrap items-center gap-3 mt-4">
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
                        </div>
                        <div className="md:max-w-[45%] md:text-right">
                            {groupLeaders.length > 0 && (
                                <>
                                    <p className="text-[11px] font-semibold text-cyan-300/80 uppercase tracking-wider mb-2">
                                        Eto ang top per group (pwede maglaban sa Swiss King)
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                                        {groupLeaders.map((leader) => (
                                            <span
                                                key={`${leader.group}-${leader.participant_id ?? leader.participant_name}`}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-semibold text-cyan-300"
                                            >
                                                <span className="text-cyan-400/80">{leader.group}:</span>
                                                <span className="truncate max-w-[10rem]">{leader.participant_name}</span>
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {sortedMatches.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden max-w-lg mx-auto">
                            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
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
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-4">
                                Now Playing ({sortedMatches.length})
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                                {sortedMatches.map((match) => (
                                    <MatchBoardCard key={match.id} match={match} />
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                <footer className="relative z-10 border-t border-zinc-800/80 py-6 flex flex-col items-center gap-3">
                    <p className="text-xs text-zinc-500">
                        Powered by <span className="tx-accent-text font-semibold">Tournament X</span>
                    </p>
                    <div className="flex flex-col items-center gap-2">
                        <SiteLogo className="h-10 w-auto opacity-90" loading="lazy" />
                        <p className="text-[11px] text-zinc-600">
                            Created by <span className="text-red-500/70 font-semibold">Shadow Syndicate</span>
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
