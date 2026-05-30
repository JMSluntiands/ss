import { persistLiveScoreQueued, type RoundEntry as LiveRoundEntry } from '@/utils/liveScoreSync';
import { Head, router } from '@inertiajs/react';
import { useCallback, useState, useEffect, useRef } from 'react';

interface MatchPlayer {
    id: number;
    name: string;
}

interface TournamentMatch {
    id: number;
    stage: string;
    bracket: string | null;
    round: number;
    match_number: number;
    player1_id: number | null;
    player2_id: number | null;
    winner_id: number | null;
    player1_score: number | null;
    player2_score: number | null;
    is_bye: boolean;
    status: string;
    stadium: number | null;
    player1: MatchPlayer | null;
    player2: MatchPlayer | null;
    winner: MatchPlayer | null;
    round_details?: RoundEntry[] | null;
}

interface Tournament {
    id: number;
    name: string;
    slug: string;
    status: string;
    stadiums: number | null;
    matches: TournamentMatch[];
}

interface RoundEntry {
    [key: string]: string | number;
    round: number;
    winner: 'p1' | 'p2';
    finish: string;
    points: number;
}

const FINISH_TYPES = [
    { label: 'SF', name: 'Spin Finish', points: 1, color: 'text-slate-300 border-slate-600 hover:border-slate-400 hover:bg-slate-700/50', badge: 'bg-slate-700/60 text-slate-300 border-slate-600/50' },
    { label: 'OF', name: 'Over Finish', points: 2, color: 'text-blue-400 border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/10', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { label: 'BF', name: 'Burst Finish', points: 2, color: 'text-amber-400 border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { label: 'XF', name: 'Xtreme Finish', points: 3, color: 'text-red-400 border-red-500/30 hover:border-red-400 hover:bg-red-500/10', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

const FINISH_BADGE: Record<string, string> = Object.fromEntries(FINISH_TYPES.map(f => [f.label, f.badge]));

function judgeLiveScoreUrl(tournamentSlug: string, matchId: number): string {
    return route('judge.liveScore', { tournament: tournamentSlug, match: matchId });
}

function RoundScorer({ p1Name, p2Name, rounds, onAddRound, onRemoveRound, onReset }: {
    p1Name: string;
    p2Name: string;
    rounds: RoundEntry[];
    onAddRound: (entry: RoundEntry) => void;
    onRemoveRound: (index: number) => void;
    onReset: () => void;
}) {
    const nextRound = rounds.length + 1;
    const p1Total = rounds.filter(r => r.winner === 'p1').reduce((s, r) => s + r.points, 0);
    const p2Total = rounds.filter(r => r.winner === 'p2').reduce((s, r) => s + r.points, 0);

    const addRound = (winner: 'p1' | 'p2', finish: string, points: number) => {
        onAddRound({ round: nextRound, winner, finish, points });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="flex-1 text-center">
                    <p className="text-xs text-slate-500 mb-1 truncate">{p1Name}</p>
                    <div className={`text-3xl font-bold ${p1Total > p2Total ? 'text-cyan-400' : 'text-white'}`}>{p1Total}</div>
                </div>
                <div className="text-xs font-bold text-slate-600">VS</div>
                <div className="flex-1 text-center">
                    <p className="text-xs text-slate-500 mb-1 truncate">{p2Name}</p>
                    <div className={`text-3xl font-bold ${p2Total > p1Total ? 'text-cyan-400' : 'text-white'}`}>{p2Total}</div>
                </div>
            </div>

            {rounds.length > 0 && (
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-700/30 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Round Log</span>
                        <button type="button" onClick={onReset} className="text-[10px] text-slate-600 hover:text-red-400 transition-colors">Clear All</button>
                    </div>
                    <div className="divide-y divide-slate-700/20 max-h-40 overflow-y-auto">
                        {rounds.map((r, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-slate-800/40 group">
                                <span className="text-slate-600 font-bold w-6 shrink-0">R{r.round}</span>
                                <span className="font-semibold truncate text-cyan-400">
                                    {r.winner === 'p1' ? p1Name : p2Name}
                                </span>
                                <span className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-bold ${FINISH_BADGE[r.finish] || ''}`}>
                                    {r.finish} +{r.points}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onRemoveRound(i)}
                                    className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3">
                <div className="text-center mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-700/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Round {nextRound}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 text-center truncate">{p1Name}</p>
                        <div className="flex flex-col gap-1">
                            {FINISH_TYPES.map((f) => (
                                <button
                                    key={f.label}
                                    type="button"
                                    onClick={() => addRound('p1', f.label, f.points)}
                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all active:scale-95 ${f.color}`}
                                >
                                    <span>{f.label}</span>
                                    <span className="text-[10px] opacity-60">+{f.points}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 text-center truncate">{p2Name}</p>
                        <div className="flex flex-col gap-1">
                            {FINISH_TYPES.map((f) => (
                                <button
                                    key={f.label}
                                    type="button"
                                    onClick={() => addRound('p2', f.label, f.points)}
                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all active:scale-95 ${f.color}`}
                                >
                                    <span>{f.label}</span>
                                    <span className="text-[10px] opacity-60">+{f.points}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function JudgePanel({ tournament }: { tournament: Tournament }) {
    const playingMatches = tournament.matches.filter(
        m => m.status === 'playing' && m.player1 && m.player2
    );
    const completedMatches = tournament.matches.filter(m => m.status === 'completed' && m.winner_id).slice(-5).reverse();
    const [editingMatch, setEditingMatch] = useState<TournamentMatch | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [scoringActive, setScoringActive] = useState(false);

    useEffect(() => {
        if (scoringActive) return;
        const interval = setInterval(() => {
            router.reload({
                only: ['tournament'],
                onStart: () => setIsRefreshing(true),
                onFinish: () => setIsRefreshing(false),
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [scoringActive]);

    return (
        <>
            <Head title={`Judge Panel - ${tournament.name}`} />
            <div className="min-h-screen bg-slate-950">
                <div className="border-b border-slate-800/80 bg-slate-900/40">
                    <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-white">Judge Panel</h1>
                                <p className="text-xs text-slate-500">{tournament.name}</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                            LIVE
                        </span>
                    </div>
                    <div className="max-w-3xl mx-auto px-4 pb-3">
                        <p className="text-[11px] text-slate-500">
                            Auto-refresh every 5s {isRefreshing ? '- syncing...' : ''}
                        </p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                    {playingMatches.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                            <div className="flex flex-col items-center justify-center py-16 px-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-slate-400 text-sm font-medium">No matches currently playing</p>
                                <p className="text-slate-600 text-xs mt-1">Waiting for the organizer to set matches as playing...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Now Playing ({playingMatches.length})
                            </h2>
                            {playingMatches.map(match => (
                                <JudgeMatchCard
                                    key={match.id}
                                    match={match}
                                    tournamentSlug={tournament.slug}
                                    onScoringChange={setScoringActive}
                                />
                            ))}
                        </>
                    )}

                    {completedMatches.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                Recently Completed
                            </h2>
                            <div className="space-y-2">
                                {completedMatches.map(match => (
                                    <div key={match.id} className="rounded-xl border border-slate-800/50 bg-slate-900/30 px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className={match.winner_id === match.player1_id ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>
                                                {match.player1?.name}
                                            </span>
                                            <span className="text-slate-600 text-xs">
                                                {match.player1_score ?? 0} - {match.player2_score ?? 0}
                                            </span>
                                            <span className={match.winner_id === match.player2_id ? 'text-cyan-400 font-semibold' : 'text-slate-500'}>
                                                {match.player2?.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {match.stadium && (
                                                <span className="text-xs text-slate-600">Stadium {match.stadium}</span>
                                            )}
                                            <button
                                                onClick={() => setEditingMatch(match)}
                                                className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[10px] font-medium text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                                            >
                                                Edit Points
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {editingMatch && (
                <JudgeMatchCard
                    match={editingMatch}
                    tournamentSlug={tournament.slug}
                    forceOpen
                    onScoringChange={setScoringActive}
                    onDone={() => setEditingMatch(null)}
                />
            )}
        </>
    );
}

function JudgeMatchCard({
    match,
    tournamentSlug,
    forceOpen = false,
    onDone,
    onScoringChange,
}: {
    match: TournamentMatch;
    tournamentSlug: string;
    forceOpen?: boolean;
    onDone?: () => void;
    onScoringChange?: (active: boolean) => void;
}) {
    const [showScoreModal, setShowScoreModal] = useState(forceOpen || match.status === 'playing');
    const [rounds, setRounds] = useState<RoundEntry[]>(match.round_details ?? []);
    const [submitting, setSubmitting] = useState(false);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const roundsRef = useRef(rounds);
    const liveScoreUrl = match.status === 'playing' ? judgeLiveScoreUrl(tournamentSlug, match.id) : null;

    useEffect(() => {
        roundsRef.current = rounds;
    }, [rounds]);

    const setScoringOpen = (open: boolean) => {
        setShowScoreModal(open);
        onScoringChange?.(open);
    };

    const p1Score = rounds.filter(r => r.winner === 'p1').reduce((s, r) => s + r.points, 0);
    const p2Score = rounds.filter(r => r.winner === 'p2').reduce((s, r) => s + r.points, 0);
    const p1Wins = p1Score > p2Score;
    const p2Wins = p2Score > p1Score;
    const hasScores = p1Score > 0 || p2Score > 0;
    const canSubmit = hasScores && p1Score !== p2Score;

    const submitScore = async () => {
        const winnerId = p1Wins ? match.player1_id! : match.player2_id!;
        if (liveScoreUrl) {
            await persistLiveScoreQueued(liveScoreUrl, rounds as LiveRoundEntry[]);
        }
        setSubmitting(true);
        router.post(
            route('judge.report', [tournamentSlug, match.id]),
            {
                winner_id: winnerId,
                player1_score: p1Score,
                player2_score: p2Score,
                round_details: rounds,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSubmitting(false);
                    setScoringOpen(false);
                    onDone?.();
                },
            }
        );
    };

    useEffect(() => {
        onScoringChange?.(showScoreModal);
    }, [showScoreModal, onScoringChange]);

    useEffect(() => {
        const server = (match.round_details ?? []) as RoundEntry[];
        setRounds((prev) => (server.length >= prev.length ? server : prev));
    }, [match.id, match.round_details]);

    const persistRounds = useCallback(
        async (next: RoundEntry[]) => {
            if (!liveScoreUrl) return true;
            setSaveState('saving');
            const ok = await persistLiveScoreQueued(liveScoreUrl, next as LiveRoundEntry[]);
            setSaveState(ok ? 'saved' : 'error');
            return ok;
        },
        [liveScoreUrl],
    );

    const updateRounds = useCallback(
        (updater: RoundEntry[] | ((prev: RoundEntry[]) => RoundEntry[])) => {
            const prev = roundsRef.current;
            const next = typeof updater === 'function' ? updater(prev) : updater;
            roundsRef.current = next;
            setRounds(next);
            void persistRounds(next);
        },
        [persistRounds],
    );

    return (
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/60 overflow-hidden shadow-lg shadow-emerald-500/5">
            <div className="px-5 py-3 border-b border-emerald-500/20 flex items-center justify-between bg-emerald-500/5">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Playing</span>
                </div>
                {match.stadium && (
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400">
                        Stadium {match.stadium}
                    </span>
                )}
            </div>

            <div className="p-5">
                {!showScoreModal ? (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-center flex-1">
                                <p className="text-lg font-bold text-white">{match.player1?.name}</p>
                            </div>
                            <div className="px-4">
                                <span className="text-sm font-bold text-slate-600">VS</span>
                            </div>
                            <div className="text-center flex-1">
                                <p className="text-lg font-bold text-white">{match.player2?.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setRounds(match.round_details ?? []);
                                setScoringOpen(true);
                            }}
                            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 transition-all active:scale-[0.98]"
                        >
                            {match.status === 'completed' ? 'Edit Score' : 'Submit Score'}
                        </button>
                    </>
                ) : (
                    <div className="space-y-4">
                        <RoundScorer
                            p1Name={match.player1?.name || 'Player 1'}
                            p2Name={match.player2?.name || 'Player 2'}
                            rounds={rounds}
                            onAddRound={(entry) => updateRounds((prev) => [...prev, entry])}
                            onRemoveRound={(i) =>
                                updateRounds((prev) =>
                                    prev.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, round: idx + 1 })),
                                )
                            }
                            onReset={() => updateRounds([])}
                        />

                        {liveScoreUrl && saveState !== 'idle' && (
                            <p className={`text-center text-[10px] ${saveState === 'error' ? 'text-red-400' : saveState === 'saving' ? 'text-slate-500' : 'text-emerald-500/80'}`}>
                                {saveState === 'saving' ? 'Saving to server…' : saveState === 'error' ? 'Could not save — check connection' : 'Saved to server'}
                            </p>
                        )}

                        {canSubmit && (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-emerald-400 font-medium">
                                    Winner: {p1Wins ? match.player1?.name : match.player2?.name}
                                </span>
                            </div>
                        )}
                        {hasScores && p1Score === p2Score && (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-xs text-amber-400">Scores are tied. Add more rounds.</span>
                            </div>
                        )}

                        <button
                            onClick={() => void submitScore()}
                            disabled={!canSubmit || submitting}
                            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Result'}
                        </button>

                        <button
                            onClick={() => {
                                setScoringOpen(false);
                                setRounds(match.round_details ?? []);
                                onDone?.();
                            }}
                            className="w-full px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
