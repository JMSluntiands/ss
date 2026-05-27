import SiteLogo from '@/Components/SiteLogo';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageProps } from '@/types';

interface Participant {
    id: number;
    name: string;
    seed: number;
    judge: string | null;
}

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
    player1_battle_points: number;
    player2_battle_points: number;
    is_bye: boolean;
    is_draw: boolean;
    status: string;
    stadium: number | null;
    player1: MatchPlayer | null;
    player2: MatchPlayer | null;
    winner: MatchPlayer | null;
    next_match_id: number | null;
    loser_next_match_id: number | null;
    round_details: RoundEntry[] | null;
}

interface SwissStanding {
    id: number;
    participant_id: number;
    tournament_points: number;
    battle_points: number;
    opponent_strength: number;
    wins: number;
    losses: number;
    draws: number;
    bye_received: boolean;
    rank: number;
    participant: Participant;
}

interface Tournament {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    game: string | null;
    tournament_type: string;
    format: string;
    group_stage_format: string | null;
    final_stage_format: string | null;
    participants_per_group: number | null;
    advance_per_group: number | null;
    break_ties: boolean;
    third_place_match: boolean;
    swiss_rounds: number | null;
    current_round: number;
    pts_for_match_win: number;
    pts_for_match_tie: number;
    pts_for_bye: number;
    registration_type: string;
    registration_fee: string;
    max_participants: number | null;
    stadiums: number | null;
    judge_code: string | null;
    start_time: string | null;
    tentative: boolean;
    status: string;
    created_at: string;
    participants: Participant[];
    matches: TournamentMatch[];
    swiss_standings: SwissStanding[];
}

const formatLabel: Record<string, string> = {
    single_elimination: 'Single Elimination',
    double_elimination: 'Double Elimination',
    round_robin: 'Round Robin',
    swiss: 'Swiss',
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

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
            {/* Score display */}
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

            {/* Round log */}
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
                                <span className={`font-semibold truncate ${r.winner === 'p1' ? 'text-cyan-400' : 'text-cyan-400'}`}>
                                    {r.winner === 'p1' ? p1Name : p2Name}
                                </span>
                                <span className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-bold ${FINISH_BADGE[r.finish] || ''}`}>
                                    {r.finish} +{r.points}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onRemoveRound(i)}
                                    className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                                    title="Remove round"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Round input */}
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

/* ─── Single Elimination MatchCard ─── */
function MatchCard({
    match,
    tournamentId,
    isActive,
    canScore: canScoreProp = true,
    participants = [],
    stadiumCount = 0,
    occupiedStadiums = [],
}: {
    match: TournamentMatch;
    tournamentId: number;
    isActive: boolean;
    canScore?: boolean;
    participants?: Participant[];
    stadiumCount?: number;
    occupiedStadiums?: number[];
}) {
    const [showStadiumPicker, setShowStadiumPicker] = useState(false);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [rounds, setRounds] = useState<RoundEntry[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const isPlaying = match.status === 'playing';
    const canReport = isActive && canScoreProp && match.player1_id && match.player2_id && !match.winner_id;
    const canSetPlaying = canReport && !isPlaying;

    const p1Score = rounds.filter(r => r.winner === 'p1').reduce((s, r) => s + r.points, 0);
    const p2Score = rounds.filter(r => r.winner === 'p2').reduce((s, r) => s + r.points, 0);

    const openScoreModal = () => {
        setRounds([]);
        setShowScoreModal(true);
    };

    const submitScore = () => {
        const winnerId = p1Score > p2Score ? match.player1_id : match.player2_id;
        if (!winnerId) return;
        setSubmitting(true);
        router.post(
            route('matches.report', [tournamentId, match.id]),
            {
                winner_id: winnerId,
                player1_score: p1Score,
                player2_score: p2Score,
                round_details: rounds,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => { setSubmitting(false); setShowScoreModal(false); },
            }
        );
    };

    const startPlaying = (stadium: number | null) => {
        router.patch(
            route('matches.setStatus', [tournamentId, match.id]),
            { status: 'playing', stadium },
            { preserveScroll: true, preserveState: true }
        );
        setShowStadiumPicker(false);
    };

    const cancelPlaying = () => {
        router.patch(
            route('matches.setStatus', [tournamentId, match.id]),
            { status: 'pending', stadium: null },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleSetPlaying = () => {
        if (stadiumCount > 0) {
            setShowStadiumPicker(true);
        } else {
            startPlaying(null);
        }
    };

    const p1Name = match.player1?.name || 'TBD';
    const p2Name = match.player2?.name || 'TBD';
    const isBye = (!match.player1_id || !match.player2_id) && match.winner_id;

    const p1Judge = match.player1_id ? participants.find(p => p.id === match.player1_id)?.judge : null;
    const p2Judge = match.player2_id ? participants.find(p => p.id === match.player2_id)?.judge : null;

    if (isBye && match.round === 1) return null;

    const JudgeBadge = ({ judge }: { judge: string }) => (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-400 leading-none">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
            {judge}
        </span>
    );

    return (
        <>
            <div className={`rounded-xl border overflow-hidden text-sm w-56 shrink-0 ${
                match.winner_id
                    ? 'border-slate-700/50 bg-slate-800/40'
                    : isPlaying
                        ? 'border-emerald-500/40 bg-slate-800/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                        : canReport
                            ? 'border-cyan-500/30 bg-slate-800/60 shadow-lg shadow-cyan-500/5'
                            : 'border-slate-800/80 bg-slate-900/60'
            }`}>
                {/* Playing indicator bar */}
                {isPlaying && (
                    <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-500/10 border-b border-emerald-500/20">
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                {match.stadium ? `Stadium ${match.stadium}` : 'Now Playing'}
                            </span>
                        </div>
                        {isActive && (
                            <button
                                onClick={cancelPlaying}
                                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                                title="Cancel playing"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                )}
                <div className={`flex items-center justify-between px-3 py-2.5 border-b border-slate-700/30 transition-all ${
                    match.winner_id && match.winner_id === match.player1_id
                        ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
                        : match.player1_id ? 'text-slate-300' : 'text-slate-600 italic'
                }`}>
                    <div className="flex items-center gap-2 min-w-0">
                        {match.winner_id && match.winner_id === match.player1_id && (
                            <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span className="truncate">{p1Name}</span>
                        {p1Judge && <JudgeBadge judge={p1Judge} />}
                    </div>
                    {match.player1_score !== null && match.player1_score > 0 && (
                        <span className={`text-xs font-bold ml-2 ${match.winner_id === match.player1_id ? 'text-cyan-400' : 'text-slate-500'}`}>{match.player1_score}</span>
                    )}
                </div>
                <div className={`flex items-center justify-between px-3 py-2.5 transition-all ${
                    match.winner_id && match.winner_id === match.player2_id
                        ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
                        : match.player2_id ? 'text-slate-300' : 'text-slate-600 italic'
                }`}>
                    <div className="flex items-center gap-2 min-w-0">
                        {match.winner_id && match.winner_id === match.player2_id && (
                            <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span className="truncate">{p2Name}</span>
                        {p2Judge && <JudgeBadge judge={p2Judge} />}
                    </div>
                    {match.player2_score !== null && match.player2_score > 0 && (
                        <span className={`text-xs font-bold ml-2 ${match.winner_id === match.player2_id ? 'text-cyan-400' : 'text-slate-500'}`}>{match.player2_score}</span>
                    )}
                </div>
                {/* Score details toggle for completed */}
                {match.winner_id && (match.player1_score !== null || match.player2_score !== null) && (
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full flex items-center justify-center gap-1 px-2 py-1 border-t border-slate-700/30 text-[10px] font-medium text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        {showDetails ? 'Hide' : 'Score'}
                    </button>
                )}
                {/* Action buttons */}
                {canReport && (
                    <div className="flex border-t border-slate-700/30">
                        {canSetPlaying && (
                            <button
                                onClick={handleSetPlaying}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800/60 text-[11px] font-medium text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border-r border-slate-700/30"
                            >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                Play
                            </button>
                        )}
                        <button
                            onClick={openScoreModal}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800/60 text-[11px] font-medium text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Score
                        </button>
                    </div>
                )}
            </div>

            {/* Score Details Modal */}
            {showDetails && match.winner_id && (() => {
                const rd = match.round_details ?? [];
                const p1Total = rd.length > 0
                    ? rd.filter(r => r.winner === 'p1').reduce((s, r) => s + Number(r.points), 0)
                    : (match.player1_score ?? 0);
                const p2Total = rd.length > 0
                    ? rd.filter(r => r.winner === 'p2').reduce((s, r) => s + Number(r.points), 0)
                    : (match.player2_score ?? 0);
                return (
                <>
                    <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowDetails(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                                <h2 className="text-base font-semibold text-white">Match History</h2>
                                <button onClick={() => setShowDetails(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="p-5">
                                <div className="flex items-stretch gap-3 mb-5">
                                    <div className={`flex-1 rounded-xl p-3 text-center ${match.winner_id === match.player1_id ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-800/40 border border-slate-700/30'}`}>
                                        <p className={`text-xs font-semibold truncate ${match.winner_id === match.player1_id ? 'text-cyan-400' : 'text-slate-400'}`}>{p1Name}</p>
                                        <p className={`text-3xl font-bold mt-1 ${match.winner_id === match.player1_id ? 'text-cyan-400' : 'text-white'}`}>
                                            {p1Total}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">pts</p>
                                        {match.winner_id === match.player1_id && (
                                            <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-[10px] font-bold text-cyan-400">
                                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                WINNER
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-slate-600">VS</span>
                                    </div>
                                    <div className={`flex-1 rounded-xl p-3 text-center ${match.winner_id === match.player2_id ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-800/40 border border-slate-700/30'}`}>
                                        <p className={`text-xs font-semibold truncate ${match.winner_id === match.player2_id ? 'text-cyan-400' : 'text-slate-400'}`}>{p2Name}</p>
                                        <p className={`text-3xl font-bold mt-1 ${match.winner_id === match.player2_id ? 'text-cyan-400' : 'text-white'}`}>
                                            {p2Total}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">pts</p>
                                        {match.winner_id === match.player2_id && (
                                            <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-[10px] font-bold text-cyan-400">
                                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                WINNER
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {rd.length > 0 ? (
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Round History</p>
                                        <div className="space-y-1.5">
                                            {rd.map((r, i) => {
                                                const winnerName = r.winner === 'p1' ? p1Name : p2Name;
                                                const badgeClass = FINISH_BADGE[r.finish] || 'bg-slate-700/60 text-slate-300 border-slate-600/50';
                                                return (
                                                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/30">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-slate-500 w-14">Round {r.round}</span>
                                                            <span className="text-xs font-medium text-white truncate">{winnerName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>{r.finish}</span>
                                                            <span className="text-xs font-bold text-cyan-400">+{r.points}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-xs text-slate-500 py-4">No round details recorded</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
                );
            })()}

            {/* Stadium Picker Modal */}
            {showStadiumPicker && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowStadiumPicker(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold text-white">Select Stadium</h2>
                                <button onClick={() => setShowStadiumPicker(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">
                                <span className="text-white font-medium">{p1Name}</span> vs <span className="text-white font-medium">{p2Name}</span>
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {Array.from({ length: stadiumCount }, (_, i) => i + 1).map((num) => {
                                    const isOccupied = occupiedStadiums.includes(num);
                                    return (
                                        <button
                                            key={num}
                                            onClick={() => !isOccupied && startPlaying(num)}
                                            disabled={isOccupied}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                                                isOccupied
                                                    ? 'bg-slate-800/30 border-slate-700/30 text-slate-600 cursor-not-allowed'
                                                    : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30'
                                            }`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            Stadium {num}
                                            {isOccupied && <span className="text-[10px] text-red-400/70">In Use</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Score Modal */}
            {showScoreModal && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/70" onClick={() => setShowScoreModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white">Report Score</h2>
                                <button onClick={() => setShowScoreModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <RoundScorer
                                p1Name={p1Name}
                                p2Name={p2Name}
                                rounds={rounds}
                                onAddRound={(entry) => setRounds(prev => [...prev, entry])}
                                onRemoveRound={(i) => setRounds(prev => prev.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, round: idx + 1 })))}
                                onReset={() => setRounds([])}
                            />

                            {(() => {
                                const hasScores = p1Score > 0 || p2Score > 0;
                                const isTied = hasScores && p1Score === p2Score;
                                const canSubmit = hasScores && !isTied;
                                const winnerName = canSubmit ? (p1Score > p2Score ? p1Name : p2Name) : null;

                                return (
                                    <div className="mt-4 space-y-3">
                                        {winnerName && (
                                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm text-emerald-400 font-medium">Winner: {winnerName}</span>
                                            </div>
                                        )}
                                        {isTied && (
                                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <span className="text-xs text-amber-400">Scores are tied. Add more rounds.</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={submitScore}
                                            disabled={!canSubmit || submitting}
                                            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? 'Submitting...' : 'Submit Result'}
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

/* ─── Swiss Match Score Modal ─── */
function SwissScoreModal({
    match,
    tournamentId,
    onClose,
}: {
    match: TournamentMatch;
    tournamentId: number;
    onClose: () => void;
}) {
    const isEdit = match.status === 'completed';
    const [rounds, setRounds] = useState<RoundEntry[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const p1BP = rounds.filter(r => r.winner === 'p1').reduce((s, r) => s + r.points, 0);
    const p2BP = rounds.filter(r => r.winner === 'p2').reduce((s, r) => s + r.points, 0);

    const p1Name = match.player1?.name || 'Player 1';
    const p2Name = match.player2?.name || 'Player 2';

    const winnerId = p1BP > p2BP ? match.player1_id : p2BP > p1BP ? match.player2_id : null;
    const canSubmit = winnerId !== null;

    const handleSubmit = () => {
        if (!canSubmit) return;
        setSubmitting(true);
        router.post(
            route('matches.report', [tournamentId, match.id]),
            {
                winner_id: winnerId,
                player1_battle_points: p1BP,
                player2_battle_points: p2BP,
                is_draw: false,
                round_details: rounds,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setSubmitting(false);
                    onClose();
                },
            }
        );
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/70" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">{isEdit ? 'Edit Match Result' : 'Report Match Result'}</h2>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <RoundScorer
                            p1Name={p1Name}
                            p2Name={p2Name}
                            rounds={rounds}
                            onAddRound={(entry) => setRounds(prev => [...prev, entry])}
                            onRemoveRound={(i) => setRounds(prev => prev.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, round: idx + 1 })))}
                            onReset={() => setRounds([])}
                        />

                        {winnerId && (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-emerald-400 font-medium">
                                    Winner: {winnerId === match.player1_id ? p1Name : p2Name}
                                </span>
                            </div>
                        )}
                        {p1BP === p2BP && (p1BP > 0 || p2BP > 0) && (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-xs text-amber-400">Scores are tied. One player must have a higher score to submit.</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit || submitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Saving...' : isEdit ? 'Update Result' : 'Submit Result'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ─── Swiss Match Card ─── */
function SwissMatchCard({
    match,
    tournamentId,
    isActive,
    canScore: canScoreProp = true,
    onOpenScore,
    participants = [],
    stadiumCount = 0,
    occupiedStadiums = [],
}: {
    match: TournamentMatch;
    tournamentId: number;
    isActive: boolean;
    canScore?: boolean;
    onOpenScore: (match: TournamentMatch) => void;
    participants?: Participant[];
    stadiumCount?: number;
    occupiedStadiums?: number[];
}) {
    const [showStadiumPicker, setShowStadiumPicker] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const p1Name = match.player1?.name || 'TBD';
    const p2Name = match.player2?.name || 'BYE';
    const isCompleted = match.status === 'completed';
    const isPlaying = match.status === 'playing';
    const canReport = isActive && canScoreProp && !isCompleted && match.player1_id && match.player2_id && !match.is_bye;
    const canSetPlaying = canReport && !isPlaying;

    const p1Judge = match.player1_id ? participants.find(p => p.id === match.player1_id)?.judge : null;
    const p2Judge = match.player2_id ? participants.find(p => p.id === match.player2_id)?.judge : null;

    const startPlaying = (stadium: number | null) => {
        router.patch(
            route('matches.setStatus', [tournamentId, match.id]),
            { status: 'playing', stadium },
            { preserveScroll: true, preserveState: true }
        );
        setShowStadiumPicker(false);
    };

    const cancelPlaying = () => {
        router.patch(
            route('matches.setStatus', [tournamentId, match.id]),
            { status: 'pending', stadium: null },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleSetPlaying = () => {
        if (stadiumCount > 0) {
            setShowStadiumPicker(true);
        } else {
            startPlaying(null);
        }
    };

    const JudgeBadge = ({ judge }: { judge: string }) => (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-400 leading-none">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
            {judge}
        </span>
    );

    return (
        <>
        <div className={`rounded-xl border overflow-hidden transition-all ${
            isCompleted
                ? 'border-slate-700/50 bg-slate-800/30'
                : isPlaying
                    ? 'border-emerald-500/40 bg-slate-800/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                    : canReport
                        ? 'border-cyan-500/30 bg-slate-800/50 shadow-lg shadow-cyan-500/5'
                        : 'border-slate-800/80 bg-slate-900/40'
        }`}>
            {isPlaying && (
                <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-500/10 border-b border-emerald-500/20">
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                            {match.stadium ? `Stadium ${match.stadium}` : 'Now Playing'}
                        </span>
                    </div>
                    {isActive && (
                        <button
                            onClick={cancelPlaying}
                            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                            title="Cancel playing"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
            )}
            <div className="flex items-stretch">
                <div className="w-10 flex items-center justify-center bg-slate-800/60 border-r border-slate-700/30 shrink-0">
                    <span className="text-xs font-bold text-slate-500">{match.match_number}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className={`flex items-center justify-between px-4 py-2.5 border-b border-slate-700/20 ${
                        isCompleted && match.winner_id === match.player1_id ? 'bg-cyan-500/5' : ''
                    }`}>
                        <div className="flex items-center gap-2 min-w-0">
                            {isCompleted && match.winner_id === match.player1_id && (
                                <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span className={`text-sm truncate ${
                                isCompleted && match.winner_id === match.player1_id ? 'text-cyan-400 font-semibold' : 'text-white'
                            }`}>{p1Name}</span>
                            {p1Judge && <JudgeBadge judge={p1Judge} />}
                        </div>
                        {isCompleted && match.player1_battle_points > 0 && (
                            <span className={`text-xs font-bold ml-2 ${match.winner_id === match.player1_id ? 'text-cyan-400' : 'text-slate-500'}`}>{match.player1_battle_points} BP</span>
                        )}
                    </div>
                    <div className={`flex items-center justify-between px-4 py-2.5 ${
                        isCompleted && match.winner_id === match.player2_id ? 'bg-cyan-500/5' : ''
                    }`}>
                        <div className="flex items-center gap-2 min-w-0">
                            {isCompleted && match.winner_id === match.player2_id && (
                                <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span className={`text-sm truncate ${
                                match.is_bye ? 'text-slate-500 italic' :
                                isCompleted && match.winner_id === match.player2_id ? 'text-cyan-400 font-semibold' : 'text-white'
                            }`}>{match.is_bye ? 'BYE' : p2Name}</span>
                            {!match.is_bye && p2Judge && <JudgeBadge judge={p2Judge} />}
                        </div>
                        {isCompleted && !match.is_bye && match.player2_battle_points > 0 && (
                            <span className={`text-xs font-bold ml-2 ${match.winner_id === match.player2_id ? 'text-cyan-400' : 'text-slate-500'}`}>{match.player2_battle_points} BP</span>
                        )}
                    </div>
                </div>

                <div className="w-20 flex items-center justify-center border-l border-slate-700/30 shrink-0">
                    {match.is_bye ? (
                        <span className="text-xs text-slate-500 font-medium">BYE</span>
                    ) : isCompleted ? (
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1 ${
                                    showDetails
                                        ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                                        : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30'
                                }`}
                                title="View score"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Score
                            </button>
                            {isActive && (
                                <button
                                    onClick={() => onOpenScore(match)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[10px] font-medium text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                                    title="Edit score"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    ) : canReport ? (
                        <div className="flex flex-col items-center gap-1">
                            {canSetPlaying && (
                                <button
                                    onClick={handleSetPlaying}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800/60 text-[10px] font-medium text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                    Play
                                </button>
                            )}
                            <button
                                onClick={() => onOpenScore(match)}
                                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 transition-all"
                            >
                                Score
                            </button>
                        </div>
                    ) : (
                        <span className="text-xs text-slate-600">--</span>
                    )}
                </div>
            </div>
        </div>

        {showDetails && isCompleted && !match.is_bye && (() => {
            const rd = match.round_details ?? [];
            const p1Total = rd.length > 0
                ? rd.filter(r => r.winner === 'p1').reduce((s, r) => s + Number(r.points), 0)
                : (match.player1_battle_points || match.player1_score || 0);
            const p2Total = rd.length > 0
                ? rd.filter(r => r.winner === 'p2').reduce((s, r) => s + Number(r.points), 0)
                : (match.player2_battle_points || match.player2_score || 0);
            return (
            <>
                <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowDetails(false)} />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-base font-semibold text-white">Match History</h2>
                            <button onClick={() => setShowDetails(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-5">
                            <div className="flex items-stretch gap-3 mb-5">
                                <div className={`flex-1 rounded-xl p-3 text-center ${match.winner_id === match.player1_id ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-800/40 border border-slate-700/30'}`}>
                                    <p className={`text-xs font-semibold truncate ${match.winner_id === match.player1_id ? 'text-cyan-400' : 'text-slate-400'}`}>{p1Name}</p>
                                    <p className={`text-3xl font-bold mt-1 ${match.winner_id === match.player1_id ? 'text-cyan-400' : 'text-white'}`}>
                                        {p1Total}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">pts</p>
                                    {match.winner_id === match.player1_id && (
                                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-[10px] font-bold text-cyan-400">
                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            WINNER
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm font-bold text-slate-600">VS</span>
                                </div>
                                <div className={`flex-1 rounded-xl p-3 text-center ${match.winner_id === match.player2_id ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-800/40 border border-slate-700/30'}`}>
                                    <p className={`text-xs font-semibold truncate ${match.winner_id === match.player2_id ? 'text-cyan-400' : 'text-slate-400'}`}>{p2Name}</p>
                                    <p className={`text-3xl font-bold mt-1 ${match.winner_id === match.player2_id ? 'text-cyan-400' : 'text-white'}`}>
                                        {p2Total}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">pts</p>
                                    {match.winner_id === match.player2_id && (
                                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-[10px] font-bold text-cyan-400">
                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            WINNER
                                        </span>
                                    )}
                                </div>
                            </div>

                            {rd.length > 0 ? (
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Round History</p>
                                    <div className="space-y-1.5">
                                        {rd.map((r, i) => {
                                            const winnerName = r.winner === 'p1' ? p1Name : p2Name;
                                            const badgeClass = FINISH_BADGE[r.finish] || 'bg-slate-700/60 text-slate-300 border-slate-600/50';
                                            return (
                                                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/30">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-500 w-14">Round {r.round}</span>
                                                        <span className="text-xs font-medium text-white truncate">{winnerName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>{r.finish}</span>
                                                        <span className="text-xs font-bold text-cyan-400">+{r.points}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-xs text-slate-500 py-4">No round details recorded</p>
                            )}
                        </div>
                    </div>
                </div>
            </>
            );
        })()}

        {showStadiumPicker && (
            <>
                <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowStadiumPicker(false)} />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-white">Select Stadium</h2>
                            <button onClick={() => setShowStadiumPicker(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            <span className="text-white font-medium">{p1Name}</span> vs <span className="text-white font-medium">{p2Name}</span>
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {Array.from({ length: stadiumCount }, (_, i) => i + 1).map((num) => {
                                const isOccupied = occupiedStadiums.includes(num);
                                return (
                                    <button
                                        key={num}
                                        onClick={() => !isOccupied && startPlaying(num)}
                                        disabled={isOccupied}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                                            isOccupied
                                                ? 'bg-slate-800/30 border-slate-700/30 text-slate-600 cursor-not-allowed'
                                                : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        Stadium {num}
                                        {isOccupied && <span className="text-[10px] text-red-400/70">In Use</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </>
        )}
        </>
    );
}

/* ─── Swiss Standings Table ─── */
function StandingsTable({
    standings,
    matches,
    tournament,
}: {
    standings: SwissStanding[];
    matches: TournamentMatch[];
    tournament: Tournament;
}) {
    if (!standings || standings.length === 0) return null;

    const ptsDiff: Record<number, number> = {};
    standings.forEach(s => { ptsDiff[s.participant_id] = 0; });
    matches.forEach(m => {
        if (m.status !== 'completed' || m.is_bye) return;
        if (m.player1_id) ptsDiff[m.player1_id] = (ptsDiff[m.player1_id] || 0) + m.player1_battle_points - m.player2_battle_points;
        if (m.player2_id) ptsDiff[m.player2_id] = (ptsDiff[m.player2_id] || 0) + m.player2_battle_points - m.player1_battle_points;
    });

    const sortedStandings = [...standings].sort((a, b) => {
        const scoreDiff = Number(b.tournament_points) - Number(a.tournament_points);
        if (scoreDiff !== 0) return scoreDiff;
        const tbDiff = b.battle_points - a.battle_points;
        if (tbDiff !== 0) return tbDiff;
        const osDiff = Number(b.opponent_strength) - Number(a.opponent_strength);
        if (osDiff !== 0) return osDiff;
        const pdA = ptsDiff[a.participant_id] || 0;
        const pdB = ptsDiff[b.participant_id] || 0;
        return pdB - pdA;
    });

    const topCut = (() => {
        if (tournament.tournament_type !== 'two_stage' || !tournament.advance_per_group) return null;
        return Math.min(tournament.advance_per_group * 2, sortedStandings.length);
    })();

    return (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Standings</h2>
                    {topCut && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Top {topCut} Cut
                        </span>
                    )}
                </div>
                {tournament.start_time && (
                    <div className="flex gap-6 text-sm">
                        <span className="text-slate-500">Start Time</span>
                        <span className="text-white font-medium">
                            {new Date(tournament.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                            {new Date(tournament.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-700/60 bg-slate-800/40">
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-16">Rank</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Participant</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <div>Match W-L-T</div>
                                <div className="text-[10px] font-normal text-slate-500 normal-case">(wins +{Number(tournament.pts_for_match_win).toFixed(1)}, ties +{Number(tournament.pts_for_match_tie).toFixed(1)})</div>
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">1. Score</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">2. TB</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">3. Buchholz</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">4. Pts Diff</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStandings.map((s, i) => {
                            const diff = ptsDiff[s.participant_id] || 0;
                            const rank = i + 1;
                            const isAdvancing = topCut !== null && rank <= topCut;
                            const isCutoffRow = topCut !== null && rank === topCut;
                            return (
                                <React.Fragment key={s.id}>
                                    <tr className={`border-b transition-colors hover:bg-slate-800/30 ${
                                        isCutoffRow ? 'border-b-0' :
                                        'border-slate-800/40'
                                    } ${
                                        i === 0 ? 'bg-yellow-500/5' :
                                        isAdvancing ? 'bg-cyan-500/[0.03]' :
                                        i % 2 === 0 ? 'bg-slate-900/20' : ''
                                    }`}>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {i === sortedStandings.length - 1 && sortedStandings.length > 3 && (
                                                    <span className="text-base" title="Last place">🐦</span>
                                                )}
                                                {i < 3 && (
                                                    <svg className={`w-4 h-4 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : 'text-amber-500'}`} viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M2.5 7.5L5 14h14l2.5-6.5L17.5 10 12 4l-5.5 6L2.5 7.5zM5 16h14v2H5v-2z"/>
                                                    </svg>
                                                )}
                                                <span className={`text-sm font-bold ${
                                                    i === 0 ? 'text-yellow-400' :
                                                    i === 1 ? 'text-slate-300' :
                                                    i === 2 ? 'text-amber-500' :
                                                    'text-slate-500'
                                                }`}>
                                                    {rank}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-semibold ${
                                                i === 0 ? 'text-yellow-400' :
                                                !isAdvancing && topCut !== null ? 'text-slate-500' :
                                                'text-white'
                                            }`}>
                                                {s.participant.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-medium ${!isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'}`}>{s.wins}</span>
                                            <span className="text-slate-600 mx-0.5">-</span>
                                            <span className={`font-medium ${!isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'}`}>{s.losses}</span>
                                            <span className="text-slate-600 mx-0.5">-</span>
                                            <span className={`font-medium ${!isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'}`}>{s.draws}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-bold ${!isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'}`}>{Number(s.tournament_points).toFixed(1)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-medium ${!isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'}`}>{s.battle_points}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={!isAdvancing && topCut !== null ? 'text-slate-500' : 'text-white'}>{Number(s.opponent_strength).toFixed(0)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-medium ${
                                                !isAdvancing && topCut !== null ? 'text-slate-500' :
                                                diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-white'
                                            }`}>
                                                {diff > 0 ? `+${diff}` : diff}
                                            </span>
                                        </td>
                                    </tr>
                                    {isCutoffRow && (
                                        <tr>
                                            <td colSpan={7} className="px-0 py-0">
                                                <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-800/60">
                                                    <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/40 to-transparent" />
                                                    <span className="text-[10px] font-bold text-cyan-400/70 uppercase tracking-widest whitespace-nowrap">
                                                        Top {topCut} Cut
                                                    </span>
                                                    <div className="flex-1 h-px bg-gradient-to-l from-cyan-500/40 to-transparent" />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ─── Reusable Player Stats Table ─── */
function PlayerStatsTable({ participants, matches, standings }: {
    participants: Participant[];
    matches: TournamentMatch[];
    standings?: SwissStanding[];
}) {
    const completedMatches = matches.filter(m => m.status === 'completed' && !m.is_bye);
    if (completedMatches.length === 0) return null;

    const playerStats = participants.map(p => {
        const pMatches = completedMatches.filter(m =>
            m.player1_id === p.id || m.player2_id === p.id
        );
        const finishCounts: Record<string, number> = { SF: 0, OF: 0, BF: 0, XF: 0 };
        let totalPoints = 0;
        let wins = 0;
        let losses = 0;

        pMatches.forEach(m => {
            const side = m.player1_id === p.id ? 'p1' : 'p2';
            if (m.winner_id === p.id) wins++;
            else losses++;

            const rd = m.round_details ?? [];
            rd.forEach(r => {
                if (r.winner === side) {
                    const finish = String(r.finish);
                    finishCounts[finish] = (finishCounts[finish] || 0) + 1;
                    totalPoints += Number(r.points);
                }
            });
        });

        const standing = standings?.find(s => s.participant_id === p.id);
        const sortWins = standing ? (standing.wins || 0) : wins;
        const sortLosses = standing ? (standing.losses || 0) : losses;
        const sortTP = standing ? Number(standing.tournament_points) : wins;

        return {
            participant: p,
            matches: pMatches.length,
            finishCounts,
            totalPoints,
            wins: sortWins,
            losses: sortLosses,
            sortTP,
        };
    }).sort((a, b) => {
        if (b.sortTP !== a.sortTP) return b.sortTP - a.sortTP;
        return b.totalPoints - a.totalPoints;
    });

    return (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/80">
                <h2 className="text-lg font-semibold text-white">Player Stats</h2>
                <p className="text-xs text-slate-500 mt-1">Finish type breakdown per player across all matches</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-700/60 bg-slate-800/40">
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Player</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">W-L</th>
                            <th className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/60 text-slate-300 border border-slate-600/50">SF</span>
                            </th>
                            <th className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">OF</span>
                            </th>
                            <th className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">BF</span>
                            </th>
                            <th className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">XF</span>
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playerStats.map((ps, i) => (
                            <tr key={ps.participant.id} className={`border-b transition-colors hover:bg-slate-800/30 ${
                                i === 0 ? 'bg-yellow-500/5 border-slate-800/40' :
                                i % 2 === 0 ? 'bg-slate-900/20 border-slate-800/40' : 'border-slate-800/40'
                            }`}>
                                <td className="px-4 py-3">
                                    <span className={`text-sm font-bold ${
                                        i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-500' : 'text-slate-500'
                                    }`}>{i + 1}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`font-semibold ${i === 0 ? 'text-yellow-400' : 'text-white'}`}>{ps.participant.name}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="font-medium text-white">{ps.wins}</span>
                                    <span className="text-slate-600 mx-0.5">-</span>
                                    <span className="font-medium text-white">{ps.losses}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-sm font-bold ${ps.finishCounts.SF > 0 ? 'text-slate-300' : 'text-slate-600'}`}>{ps.finishCounts.SF}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-sm font-bold ${ps.finishCounts.OF > 0 ? 'text-blue-400' : 'text-slate-600'}`}>{ps.finishCounts.OF}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-sm font-bold ${ps.finishCounts.BF > 0 ? 'text-amber-400' : 'text-slate-600'}`}>{ps.finishCounts.BF}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-sm font-bold ${ps.finishCounts.XF > 0 ? 'text-red-400' : 'text-slate-600'}`}>{ps.finishCounts.XF}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-sm font-bold ${ps.totalPoints > 0 ? 'text-cyan-400' : 'text-slate-600'}`}>{ps.totalPoints}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ─── Elimination Bracket Renderer (SE or DE) ─── */
function EliminationBracket({
    matches,
    tournament,
    format,
    readOnly = false,
    canScore = true,
}: {
    matches: TournamentMatch[];
    tournament: Tournament;
    format: string;
    readOnly?: boolean;
    canScore?: boolean;
}) {
    const isActive = !readOnly && tournament.status === 'active';
    const occupiedStadiums = matches
        .filter(m => m.status === 'playing' && m.stadium)
        .map(m => m.stadium as number);

    const playingMatches = matches.filter(m => m.status === 'playing' && m.player1 && m.player2);

    const NowPlayingBanner = () => {
        if (playingMatches.length === 0) return null;
        return (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
                <div className="px-6 py-3 border-b border-emerald-500/20 flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h3 className="text-base font-semibold text-emerald-400">Now Playing</h3>
                </div>
                <div className="px-6 py-4 flex flex-wrap gap-3">
                    {playingMatches.map(m => (
                        <div key={m.id} className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{m.player1?.name}</span>
                                <span className="text-xs font-bold text-slate-500">VS</span>
                                <span className="text-sm font-bold text-white">{m.player2?.name}</span>
                            </div>
                            {m.stadium && (
                                <span className="ml-2 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400">
                                    Stadium {m.stadium}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (format === 'double_elimination') {
        const winnersMatches = matches.filter(m => m.bracket === 'winners');
        const losersMatches = matches.filter(m => m.bracket === 'losers');
        const grandFinalMatches = matches.filter(m => m.bracket === 'grand_final');

        const wRoundsMap: Record<number, TournamentMatch[]> = {};
        winnersMatches.forEach(m => {
            if (!wRoundsMap[m.round]) wRoundsMap[m.round] = [];
            wRoundsMap[m.round].push(m);
        });
        const wRounds = Object.keys(wRoundsMap).map(Number).sort((a, b) => a - b);

        const lRoundsMap: Record<number, TournamentMatch[]> = {};
        losersMatches.forEach(m => {
            if (!lRoundsMap[m.round]) lRoundsMap[m.round] = [];
            lRoundsMap[m.round].push(m);
        });
        const lRounds = Object.keys(lRoundsMap).map(Number).sort((a, b) => a - b);

        const getWRoundName = (round: number) => {
            if (round === wRounds.length) return 'WB Finals';
            if (round === wRounds.length - 1) return 'WB Semi-Finals';
            return `WB Round ${round}`;
        };

        const getLRoundName = (round: number) => {
            if (round === lRounds.length) return 'LB Finals';
            return `LB Round ${round}`;
        };

        return (
            <div className="space-y-8 overflow-hidden">
                <NowPlayingBanner />

                {/* Winners Bracket */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800/80 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-cyan-400" />
                        <h3 className="text-base font-semibold text-white">Winners Bracket</h3>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <div className="flex gap-8 min-w-max">
                            {wRounds.map(round => {
                                const roundMatches = wRoundsMap[round].filter(
                                    m => !((!m.player1_id || !m.player2_id) && m.winner_id)
                                );
                                if (roundMatches.length === 0) return null;
                                return (
                                    <div key={round} className="flex flex-col">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">
                                            {getWRoundName(round)}
                                        </h4>
                                        <div className="flex flex-col justify-around flex-1 gap-4">
                                            {roundMatches.map(match => (
                                                <MatchCard key={match.id} match={match} tournamentId={tournament.id} isActive={isActive} canScore={canScore} participants={tournament.participants || []} stadiumCount={tournament.stadiums || 0} occupiedStadiums={occupiedStadiums} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Losers Bracket */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800/80 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <h3 className="text-base font-semibold text-white">Losers Bracket</h3>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <div className="flex gap-8 min-w-max">
                            {lRounds.map(round => {
                                const roundMatches = lRoundsMap[round];
                                return (
                                    <div key={round} className="flex flex-col">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">
                                            {getLRoundName(round)}
                                        </h4>
                                        <div className="flex flex-col justify-around flex-1 gap-4">
                                            {roundMatches.map(match => (
                                                <MatchCard key={match.id} match={match} tournamentId={tournament.id} isActive={isActive} canScore={canScore} participants={tournament.participants || []} stadiumCount={tournament.stadiums || 0} occupiedStadiums={occupiedStadiums} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Grand Finals */}
                {grandFinalMatches.length > 0 && (
                    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 overflow-hidden">
                        <div className="px-6 py-4 border-b border-yellow-500/20 flex items-center gap-3">
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3l3.057-3L12 4.5 15.943 0 19 3l-2 6.5L19 21H5l2-11.5L5 3z" />
                            </svg>
                            <h3 className="text-base font-semibold text-yellow-400">Grand Finals</h3>
                        </div>
                        <div className="p-6 flex justify-center">
                            {grandFinalMatches.map(match => (
                                <MatchCard key={match.id} match={match} tournamentId={tournament.id} isActive={isActive} canScore={canScore} participants={tournament.participants || []} stadiumCount={tournament.stadiums || 0} occupiedStadiums={occupiedStadiums} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Single Elimination
    const mainMatches = matches.filter(m => !m.bracket || m.bracket === 'winners');
    const placement3Matches = matches.filter(m => m.bracket === 'placement_3');
    const placement5Matches = matches.filter(m => m.bracket === 'placement_5');

    const roundsMap: Record<number, TournamentMatch[]> = {};
    mainMatches.forEach(m => {
        if (!roundsMap[m.round]) roundsMap[m.round] = [];
        roundsMap[m.round].push(m);
    });
    const rounds = Object.keys(roundsMap).map(Number).sort((a, b) => a - b);
    const totalRounds = rounds.length;

    const getRoundName = (round: number) => {
        if (round === totalRounds) return 'Finals';
        if (round === totalRounds - 1) return 'Semi-Finals';
        if (round === totalRounds - 2) return 'Quarter-Finals';
        return `Round ${round}`;
    };

    const p5RoundsMap: Record<number, TournamentMatch[]> = {};
    placement5Matches.forEach(m => {
        if (!p5RoundsMap[m.round]) p5RoundsMap[m.round] = [];
        p5RoundsMap[m.round].push(m);
    });
    const p5Rounds = Object.keys(p5RoundsMap).map(Number).sort((a, b) => a - b);

    return (
        <div className="space-y-6">
            <NowPlayingBanner />

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white">Bracket</h3>
                    {isActive && <span className="text-xs text-cyan-400 font-medium">Click a name to report winner</span>}
                </div>
                <div className="p-6 overflow-x-auto">
                    <div className="flex gap-8 min-w-max">
                        {rounds.map(round => {
                            const isFirstRound = round === rounds[0];
                            const roundMatches = roundsMap[round].filter(m => {
                                if ((!m.player1_id || !m.player2_id) && m.winner_id) return false;
                                if (isFirstRound && !m.player1_id && !m.player2_id) return false;
                                return true;
                            });
                            if (roundMatches.length === 0) return null;
                            return (
                                <div key={round} className="flex flex-col">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">
                                        {getRoundName(round)}
                                    </h4>
                                    <div className="flex flex-col justify-around flex-1 gap-4">
                                        {roundMatches.map(match => (
                                            <MatchCard key={match.id} match={match} tournamentId={tournament.id} isActive={isActive} canScore={canScore} participants={tournament.participants || []} stadiumCount={tournament.stadiums || 0} occupiedStadiums={occupiedStadiums} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Placement Matches */}
            {(() => {
                const p3Visible = placement3Matches.filter(m => m.player1_id || m.player2_id);
                const p5Visible = placement5Matches.filter(m => m.player1_id || m.player2_id);
                if (p3Visible.length === 0 && p5Visible.length === 0) return null;

                const p5vRoundsMap: Record<number, TournamentMatch[]> = {};
                p5Visible.forEach(m => {
                    if (!p5vRoundsMap[m.round]) p5vRoundsMap[m.round] = [];
                    p5vRoundsMap[m.round].push(m);
                });
                const p5vRounds = Object.keys(p5vRoundsMap).map(Number).sort((a, b) => a - b);

                return (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                    <div className="px-6 py-4 border-b border-amber-500/20 flex items-center gap-3">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3l3.057-3L12 4.5 15.943 0 19 3l-2 6.5L19 21H5l2-11.5L5 3z" />
                        </svg>
                        <h3 className="text-base font-semibold text-amber-400">Placement Matches</h3>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap gap-8">
                            {p3Visible.length > 0 && (
                                <div className="flex flex-col">
                                    <h4 className="text-xs font-bold text-amber-500/70 uppercase tracking-wider mb-4 text-center">
                                        Battle for 3rd Place
                                    </h4>
                                    <div className="flex flex-col gap-4">
                                        {p3Visible.map(match => (
                                            <MatchCard key={match.id} match={match} tournamentId={tournament.id} isActive={isActive} canScore={canScore} participants={tournament.participants || []} stadiumCount={tournament.stadiums || 0} occupiedStadiums={occupiedStadiums} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {p5Visible.length > 0 && (
                                <div className="flex flex-col">
                                    <h4 className="text-xs font-bold text-amber-500/70 uppercase tracking-wider mb-4 text-center">
                                        Battle for 5th Place
                                    </h4>
                                    {p5vRounds.length > 1 && (
                                        <p className="text-[10px] text-slate-500 text-center mb-3 -mt-2">
                                            QF losers play a mini bracket — two semis, then a final for 5th
                                        </p>
                                    )}
                                    <div className="space-y-4">
                                        {p5vRounds.map(round => (
                                            <div key={`p5-${round}`}>
                                                {p5vRounds.length > 1 && (
                                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
                                                        {round === p5vRounds[p5vRounds.length - 1] ? '5th Place Final' : `Semi ${round}`}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-4 justify-center">
                                                    {p5vRoundsMap[round].map(match => (
                                                        <MatchCard key={match.id} match={match} tournamentId={tournament.id} isActive={isActive} canScore={canScore} participants={tournament.participants || []} stadiumCount={tournament.stadiums || 0} occupiedStadiums={occupiedStadiums} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                );
            })()}
        </div>
    );
}

/* ─── Swiss View (rounds + pairings + standings + final stage) ─── */
function SwissView({
    tournament,
    matches,
    standings,
    readOnly = false,
    canScore = true,
}: {
    tournament: Tournament;
    matches: TournamentMatch[];
    standings: SwissStanding[];
    readOnly?: boolean;
    canScore?: boolean;
}) {
    const groupMatches = matches.filter(m => m.stage !== 'final');
    const finalMatches = matches.filter(m => m.stage === 'final');
    const hasFinalStage = finalMatches.length > 0;
    const isTwoStage = tournament.tournament_type === 'two_stage';

    const mainBracket = finalMatches.filter(m => !m.bracket || m.bracket === 'winners' || m.bracket === 'grand_final');
    const grandFinal = mainBracket.find(m => m.bracket === 'grand_final' && m.winner_id);
    const lastMainMatch = grandFinal || mainBracket.filter(m => m.winner_id && !m.next_match_id).sort((a, b) => b.round - a.round)[0];
    const hasChampion = !!lastMainMatch?.winner_id;

    type TabId = 'bracket' | 'standings' | 'stats' | 'final' | 'rankings';
    const tabKey = `swiss_tab_${tournament.id}`;
    const [activeTab, setActiveTab] = useState<TabId>(() => {
        try {
            const saved = sessionStorage.getItem(tabKey);
            if (saved && ['bracket', 'standings', 'stats', 'final', 'rankings'].includes(saved)) {
                return saved as TabId;
            }
        } catch {}
        if (hasChampion) return 'rankings';
        return hasFinalStage ? 'final' : 'bracket';
    });
    const handleTabChange = (tab: TabId) => {
        setActiveTab(tab);
        try { sessionStorage.setItem(tabKey, tab); } catch {}
    };

    const roundKey = `swiss_round_${tournament.id}`;
    const [selectedRound, setSelectedRound] = useState(() => {
        try {
            const saved = sessionStorage.getItem(roundKey);
            if (saved) return parseInt(saved, 10) || tournament.current_round || 1;
        } catch {}
        return tournament.current_round || 1;
    });
    const handleRoundChange = (round: number) => {
        setSelectedRound(round);
        try { sessionStorage.setItem(roundKey, String(round)); } catch {}
    };
    const [scoreMatch, setScoreMatch] = useState<TournamentMatch | null>(null);

    const isActive = !readOnly && tournament.status === 'active';
    const totalRounds = tournament.swiss_rounds || 1;
    const currentRound = tournament.current_round;
    const occupiedStadiums = groupMatches
        .filter(m => m.status === 'playing' && m.stadium)
        .map(m => m.stadium as number);
    const playingMatches = groupMatches.filter(m => m.status === 'playing' && m.player1 && m.player2);

    const roundsAvailable = [];
    for (let r = 1; r <= currentRound; r++) {
        roundsAvailable.push(r);
    }

    const roundMatches = groupMatches.filter(m => m.round === selectedRound);
    const currentRoundMatches = groupMatches.filter(m => m.round === currentRound);
    const allCurrentComplete = currentRoundMatches.length > 0 && currentRoundMatches.every(m => m.status === 'completed');
    const isLastRound = currentRound >= totalRounds;
    const canAdvance = isActive && allCurrentComplete && !isLastRound;
    const canStartFinals = isActive && allCurrentComplete && isLastRound && isTwoStage && !hasFinalStage;
    const canComplete = isActive && allCurrentComplete && isLastRound && !isTwoStage;

    const NowPlayingBanner = () => {
        if (playingMatches.length === 0) return null;
        return (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 overflow-hidden mb-4">
                <div className="px-6 py-3 border-b border-emerald-500/20 flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h3 className="text-base font-semibold text-emerald-400">Now Playing</h3>
                </div>
                <div className="px-6 py-4 flex flex-wrap gap-3">
                    {playingMatches.map(m => (
                        <div key={m.id} className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{m.player1?.name}</span>
                                <span className="text-xs font-bold text-slate-500">VS</span>
                                <span className="text-sm font-bold text-white">{m.player2?.name}</span>
                            </div>
                            {m.stadium && (
                                <span className="ml-2 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400">
                                    Stadium {m.stadium}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const tabs = [
        {
            id: 'bracket' as const,
            label: isTwoStage ? 'Group Stage' : 'Bracket',
            icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
        },
        {
            id: 'standings' as const,
            label: 'Standings',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        },
        {
            id: 'stats' as const,
            label: 'Player Stats',
            icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
        },
        {
            id: 'final' as const,
            label: 'Final Stage',
            icon: 'M5 3l3.057-3L12 4.5 15.943 0 19 3l-2 6.5L19 21H5l2-11.5L5 3z',
        },
        ...(hasChampion ? [{
            id: 'rankings' as const,
            label: 'Rankings',
            icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
        }] : []),
    ];

    return (
        <>
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                            activeTab === tab.id
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                        </svg>
                        {tab.label}
                        {tab.id === 'final' && hasFinalStage && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                        {tab.id === 'rankings' && (
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        )}
                    </button>
                ))}
            </div>

            {/* Bracket / Group Stage Tab */}
            {activeTab === 'bracket' && (<>
                <NowPlayingBanner />
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">{isTwoStage ? 'Group Stage Rounds' : 'Rounds'}</h2>
                        <span className="text-xs text-slate-500">
                            Round {currentRound} of {totalRounds}
                        </span>
                    </div>

                    <div className="px-4 py-3 border-b border-slate-800/80 flex gap-2 overflow-x-auto">
                        {roundsAvailable.map((r) => {
                            const rMatches = groupMatches.filter(m => m.round === r);
                            const rComplete = rMatches.length > 0 && rMatches.every(m => m.status === 'completed');
                            return (
                                <button
                                    key={r}
                                    onClick={() => handleRoundChange(r)}
                                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        selectedRound === r
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                            : rComplete
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    Round {r}
                                    {rComplete && r !== selectedRound && (
                                        <svg className="w-3.5 h-3.5 inline ml-1.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-4 space-y-3">
                        {roundMatches.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-8">No matches generated yet.</p>
                        ) : (
                            roundMatches.map((match) => (
                                <SwissMatchCard
                                    key={match.id}
                                    match={match}
                                    tournamentId={tournament.id}
                                    isActive={isActive && selectedRound === currentRound}
                                    canScore={canScore}
                                    onOpenScore={setScoreMatch}
                                    participants={tournament.participants || []}
                                    stadiumCount={tournament.stadiums || 0}
                                    occupiedStadiums={occupiedStadiums}
                                />
                            ))
                        )}
                    </div>

                    {isActive && selectedRound === currentRound && (
                        <div className="px-4 pb-4">
                            {canAdvance && (
                                <button
                                    onClick={() => router.post(route('tournaments.nextRound', tournament.id), {}, { preserveScroll: true, preserveState: true })}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 transition-all active:scale-[0.98]"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    Advance to Round {currentRound + 1}
                                </button>
                            )}
                            {canStartFinals && (
                                <button
                                    onClick={() => router.post(route('tournaments.nextRound', tournament.id), {}, { preserveScroll: true, preserveState: true })}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:brightness-110 transition-all active:scale-[0.98]"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3l3.057-3L12 4.5 15.943 0 19 3l-2 6.5L19 21H5l2-11.5L5 3z" />
                                    </svg>
                                    Start Final Stage ({formatLabel[tournament.final_stage_format || 'single_elimination']})
                                </button>
                            )}
                            {canComplete && (
                                <button
                                    onClick={() => router.post(route('tournaments.nextRound', tournament.id), {}, { preserveScroll: true, preserveState: true })}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-110 transition-all active:scale-[0.98]"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Complete Tournament
                                </button>
                            )}
                            {!allCurrentComplete && (
                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-400">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Complete all matches in this round before advancing.
                                </div>
                            )}
                        </div>
                    )}

                    {hasFinalStage && isLastRound && (
                        <div className="px-4 pb-4">
                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Group stage complete! Switch to the Final Stage tab to view the bracket.
                            </div>
                        </div>
                    )}
                </div>
            </>)}

            {/* Standings Tab */}
            {activeTab === 'standings' && (
                <StandingsTable standings={standings} matches={groupMatches} tournament={tournament} />
            )}

            {/* Player Stats Tab */}
            {activeTab === 'stats' && (
                <PlayerStatsTable
                    participants={tournament.participants || []}
                    matches={groupMatches}
                    standings={standings}
                />
            )}

            {/* Rankings Tab */}
            {activeTab === 'rankings' && hasChampion && (() => {
                const p3Match = finalMatches.find(m => m.bracket === 'placement_3' && m.winner_id);
                const p5Matches = finalMatches.filter(m => m.bracket === 'placement_5');
                const p5Final = p5Matches.filter(m => m.winner_id).sort((a, b) => b.round - a.round)[0];

                const rankings: { rank: number; label: string; name: string; color: string }[] = [];
                const champion = lastMainMatch!.winner_id === lastMainMatch!.player1_id ? lastMainMatch!.player1 : lastMainMatch!.player2;
                const runnerUp = lastMainMatch!.winner_id === lastMainMatch!.player1_id ? lastMainMatch!.player2 : lastMainMatch!.player1;

                if (champion) rankings.push({ rank: 1, label: 'Champion', name: champion.name, color: 'text-yellow-400' });
                if (runnerUp) rankings.push({ rank: 2, label: '2nd Place', name: runnerUp.name, color: 'text-slate-300' });

                if (p3Match) {
                    const p3Winner = p3Match.winner_id === p3Match.player1_id ? p3Match.player1 : p3Match.player2;
                    const p3Loser = p3Match.winner_id === p3Match.player1_id ? p3Match.player2 : p3Match.player1;
                    if (p3Winner) rankings.push({ rank: 3, label: '3rd Place', name: p3Winner.name, color: 'text-amber-600' });
                    if (p3Loser) rankings.push({ rank: 4, label: '4th Place', name: p3Loser.name, color: 'text-white' });
                }

                if (p5Final) {
                    const p5Winner = p5Final.winner_id === p5Final.player1_id ? p5Final.player1 : p5Final.player2;
                    const p5Loser = p5Final.winner_id === p5Final.player1_id ? p5Final.player2 : p5Final.player1;
                    if (p5Winner) rankings.push({ rank: 5, label: '5th Place', name: p5Winner.name, color: 'text-white' });
                    if (p5Loser) rankings.push({ rank: 6, label: '6th Place', name: p5Loser.name, color: 'text-white' });

                    const p5Semis = p5Matches.filter(m => m.winner_id && m.round < p5Final.round);
                    p5Semis.forEach(m => {
                        const loser = m.winner_id === m.player1_id ? m.player2 : m.player1;
                        if (loser) rankings.push({ rank: 7, label: '7th Place', name: loser.name, color: 'text-slate-400' });
                    });
                }

                const placed = new Set(rankings.map(r => r.name));
                const eliminatedByRound: { round: number; name: string }[] = [];
                mainBracket.filter(m => m.winner_id).forEach(m => {
                    const loser = m.winner_id === m.player1_id ? m.player2 : m.player1;
                    if (loser && !placed.has(loser.name)) {
                        eliminatedByRound.push({ round: m.round, name: loser.name });
                        placed.add(loser.name);
                    }
                });
                eliminatedByRound.sort((a, b) => b.round - a.round);

                let nextRank = rankings.length > 0 ? Math.max(...rankings.map(r => r.rank)) + 1 : 1;
                const grouped: Record<number, string[]> = {};
                eliminatedByRound.forEach(e => {
                    if (!grouped[e.round]) grouped[e.round] = [];
                    grouped[e.round].push(e.name);
                });
                Object.keys(grouped).sort((a, b) => Number(b) - Number(a)).forEach(roundKey => {
                    const names = grouped[Number(roundKey)];
                    names.forEach(name => {
                        rankings.push({ rank: nextRank, label: `${nextRank}${nextRank === 1 ? 'st' : nextRank === 2 ? 'nd' : nextRank === 3 ? 'rd' : 'th'} Place`, name, color: 'text-slate-500' });
                    });
                    nextRank += names.length;
                });

                const medalIcon = (rank: number) => {
                    if (rank === 1) return <span className="text-lg">🥇</span>;
                    if (rank === 2) return <span className="text-lg">🥈</span>;
                    if (rank === 3) return <span className="text-lg">🥉</span>;
                    return <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center text-xs font-bold text-slate-400">{rank}</span>;
                };

                return (
                    <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 overflow-hidden">
                        <div className="px-6 py-4 border-b border-cyan-500/20 bg-cyan-500/5 flex items-center gap-3">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <h3 className="text-base font-semibold text-cyan-400">Final Rankings</h3>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {rankings.map((r, i) => (
                                <div key={`${r.rank}-${r.name}`} className={`flex items-center gap-4 px-6 py-3 ${i === 0 ? 'bg-yellow-500/5' : ''}`}>
                                    <div className="w-8 flex justify-center shrink-0">{medalIcon(r.rank)}</div>
                                    <span className={`text-sm font-semibold flex-1 ${r.color}`}>{r.name}</span>
                                    <span className="text-xs text-slate-500 font-medium">{r.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}

            {/* Final Stage Tab */}
            {activeTab === 'final' && (
                hasFinalStage ? (
                    <EliminationBracket
                        matches={finalMatches}
                        tournament={tournament}
                        format={tournament.final_stage_format || 'single_elimination'}
                        readOnly={readOnly}
                        canScore={canScore}
                    />
                ) : tournament.status === 'completed' && !isTwoStage && standings.length > 0 ? (
                    /* Single-stage Swiss completed: show podium */
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-800/80">
                            <h2 className="text-lg font-semibold text-white">Final Stage</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-end justify-center gap-4 mb-8 pt-4">
                                {standings[1] && (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-xl bg-slate-400/10 border border-slate-400/20 flex items-center justify-center mb-2">
                                            <span className="text-2xl font-bold text-slate-300">2</span>
                                        </div>
                                        <div className="w-28 bg-slate-400/10 rounded-t-xl pt-4 pb-3 px-2 text-center" style={{ height: '80px' }}>
                                            <p className="text-sm font-semibold text-slate-300 truncate">{standings[1].participant.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">{Number(standings[1].tournament_points).toFixed(1)} pts</p>
                                        </div>
                                    </div>
                                )}
                                {standings[0] && (
                                    <div className="flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mb-2">
                                            <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3l3.057-3L12 4.5 15.943 0 19 3l-2 6.5L19 21H5l2-11.5L5 3z" />
                                            </svg>
                                        </div>
                                        <div className="w-32 bg-yellow-500/10 border border-yellow-500/20 rounded-t-xl pt-4 pb-3 px-2 text-center" style={{ height: '100px' }}>
                                            <p className="text-base font-bold text-yellow-400 truncate">{standings[0].participant.name}</p>
                                            <p className="text-xs text-yellow-500/70 mt-1">{Number(standings[0].tournament_points).toFixed(1)} pts</p>
                                            <p className="text-[10px] text-yellow-500/50 mt-0.5">Champion</p>
                                        </div>
                                    </div>
                                )}
                                {standings[2] && (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-xl bg-amber-700/20 border border-amber-700/30 flex items-center justify-center mb-2">
                                            <span className="text-2xl font-bold text-amber-500">3</span>
                                        </div>
                                        <div className="w-28 bg-amber-700/10 rounded-t-xl pt-4 pb-3 px-2 text-center" style={{ height: '64px' }}>
                                            <p className="text-sm font-semibold text-amber-500 truncate">{standings[2].participant.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">{Number(standings[2].tournament_points).toFixed(1)} pts</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="rounded-xl border border-slate-700/50 overflow-hidden">
                                <div className="px-4 py-3 bg-slate-800/40 border-b border-slate-700/50">
                                    <h3 className="text-sm font-semibold text-white">Final Rankings</h3>
                                </div>
                                <div className="divide-y divide-slate-800/40">
                                    {standings.map((s, i) => (
                                        <div key={s.id} className={`flex items-center gap-4 px-4 py-3 ${i === 0 ? 'bg-yellow-500/5' : ''}`}>
                                            <span className={`w-8 text-center text-sm font-bold ${
                                                i === 0 ? 'text-yellow-400' :
                                                i === 1 ? 'text-slate-300' :
                                                i === 2 ? 'text-amber-500' :
                                                'text-slate-500'
                                            }`}>{s.rank}</span>
                                            <span className={`flex-1 text-sm font-medium ${i === 0 ? 'text-yellow-400' : 'text-white'}`}>{s.participant.name}</span>
                                            <span className="text-sm text-slate-400">{s.wins}W-{s.losses}L</span>
                                            <span className="text-sm font-bold text-cyan-400 w-16 text-right">{Number(s.tournament_points).toFixed(1)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-800/80">
                            <h2 className="text-lg font-semibold text-white">Final Stage</h2>
                        </div>
                        <div className="flex flex-col items-center justify-center py-20 px-6">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3l3.057-3L12 4.5 15.943 0 19 3l-2 6.5L19 21H5l2-11.5L5 3z" />
                                </svg>
                            </div>
                            <p className="text-slate-400 text-sm text-center">
                                {isTwoStage
                                    ? 'Complete all group stage rounds to start the final stage bracket.'
                                    : 'Final stage will be available once the tournament is completed.'
                                }
                            </p>
                            <p className="text-slate-500 text-xs mt-1 text-center">
                                {isTwoStage
                                    ? `Top players will advance to a ${formatLabel[tournament.final_stage_format || 'single_elimination']} bracket.`
                                    : `Complete all ${totalRounds} rounds to see the final results.`
                                }
                            </p>
                        </div>
                    </div>
                )
            )}

            {/* Score Modal */}
            {!readOnly && scoreMatch && (
                <SwissScoreModal
                    match={scoreMatch}
                    tournamentId={tournament.id}
                    onClose={() => setScoreMatch(null)}
                />
            )}
        </>
    );
}

/* ─── Single Add Form (isolated to prevent parent re-renders) ─── */
function SingleAddForm({ tournamentId }: { tournamentId: number }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const name = inputRef.current?.value?.trim();
        if (!name || processing) return;
        setProcessing(true);
        router.post(route('participants.store', tournamentId), { name }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => { if (inputRef.current) inputRef.current.value = ''; },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <input
                ref={inputRef}
                placeholder="Participant name"
                className="flex-1 rounded-xl border border-slate-700/50 bg-slate-800/50 py-2.5 px-4 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
            <button type="submit" disabled={processing} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
        </form>
    );
}

/* ─── Bulk Add Modal (isolated to prevent parent re-renders) ─── */
function BulkAddModal({ tournamentId, onClose }: { tournamentId: number; onClose: () => void }) {
    const [names, setNames] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!names.trim() || processing) return;
        setProcessing(true);
        router.post(route('participants.bulk', tournamentId), { names }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => { setNames(''); onClose(); },
            onFinish: () => setProcessing(false),
        });
    };

    const count = names.split('\n').filter(n => n.trim()).length;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Bulk Add Participants</h2>
                        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <textarea value={names} onChange={(e) => setNames(e.target.value)} placeholder={"Enter one name per line:\n\nPlayer 1\nPlayer 2\nPlayer 3"} rows={10} autoFocus className="block w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-3 px-4 text-white placeholder-slate-500 transition-all focus:border-cyan-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none font-mono text-sm" />
                        <p className="mt-2 text-xs text-slate-500">{count} participant(s) detected.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
                            <button type="submit" disabled={processing || !names.trim()} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">Add All</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

/* ─── Participant Row with Judge Assignment ─── */
function ParticipantRow({
    participant,
    tournamentId,
    readOnly,
    isPending,
    onRemove,
}: {
    participant: Participant;
    tournamentId: number;
    readOnly: boolean;
    isPending: boolean;
    onRemove: (id: number) => void;
}) {
    const [editingJudge, setEditingJudge] = useState(false);
    const [judgeValue, setJudgeValue] = useState(participant.judge || '');
    const judgeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingJudge && judgeInputRef.current) {
            judgeInputRef.current.focus();
        }
    }, [editingJudge]);

    const saveJudge = () => {
        const trimmed = judgeValue.trim();
        if (trimmed !== (participant.judge || '')) {
            router.patch(
                route('participants.updateJudge', [tournamentId, participant.id]),
                { judge: trimmed || null },
                { preserveScroll: true, preserveState: true }
            );
        }
        setEditingJudge(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') saveJudge();
        if (e.key === 'Escape') {
            setJudgeValue(participant.judge || '');
            setEditingJudge(false);
        }
    };

    return (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/60 group transition-colors">
            <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">{participant.seed}</span>
            <div className="flex-1 min-w-0">
                <span className="text-sm text-white truncate block">{participant.name}</span>
                {!readOnly ? (
                    editingJudge ? (
                        <input
                            ref={judgeInputRef}
                            value={judgeValue}
                            onChange={(e) => setJudgeValue(e.target.value)}
                            onBlur={saveJudge}
                            onKeyDown={handleKeyDown}
                            placeholder="Judge name"
                            className="mt-1 w-full rounded-lg border border-cyan-500/40 bg-slate-800 py-1 px-2 text-xs text-cyan-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                        />
                    ) : (
                        <button
                            onClick={() => { setJudgeValue(participant.judge || ''); setEditingJudge(true); }}
                            className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                            {participant.judge || 'Set Judge'}
                        </button>
                    )
                ) : participant.judge ? (
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                        {participant.judge}
                    </span>
                ) : null}
            </div>
            {!readOnly && isPending && (
                <button onClick={() => onRemove(participant.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0" title="Remove">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            )}
        </div>
    );
}

/* ─── Stadiums Field with Modal ─── */
function StadiumsField({
    tournamentId,
    stadiums,
    readOnly,
}: {
    tournamentId: number;
    stadiums: number | null;
    readOnly: boolean;
}) {
    const [showModal, setShowModal] = useState(false);
    const [value, setValue] = useState(stadiums?.toString() || '');
    const [saving, setSaving] = useState(false);

    const openModal = () => {
        setValue(stadiums?.toString() || '');
        setShowModal(true);
    };

    const save = () => {
        const num = parseInt(value) || null;
        setSaving(true);
        router.patch(
            route('tournaments.updateStadiums', tournamentId),
            { stadiums: num },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => { setSaving(false); setShowModal(false); },
            }
        );
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Stadiums</span>
                {readOnly ? (
                    <span className="text-sm font-medium text-white">{stadiums || '-'}</span>
                ) : (
                    <button
                        onClick={openModal}
                        className="text-sm font-medium text-white hover:text-cyan-400 transition-colors flex items-center gap-1"
                    >
                        {stadiums || '-'}
                        <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                )}
            </div>

            {showModal && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Set Stadiums</h2>
                                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Number of Stadiums</label>
                            <input
                                type="number"
                                min="1"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                                autoFocus
                                placeholder="e.g. 4"
                                className="block w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-3 px-4 text-white placeholder-slate-500 text-center text-xl font-bold transition-all focus:border-cyan-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <p className="mt-2 text-xs text-slate-500 text-center">How many stadiums are available for matches.</p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
                                <button
                                    onClick={save}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

/* ─── Main Show Page ─── */
export default function Show({ tournament, readOnly = false }: { tournament: Tournament; readOnly?: boolean }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [, setLiveTick] = useState(0);

    const liveDataRef = useRef<{
        matches: TournamentMatch[] | null;
        standings: SwissStanding[] | null;
        status: string | null;
        currentRound: number | null;
    }>({ matches: null, standings: null, status: null, currentRound: null });
    const prevDataRef = useRef<string>('');

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        liveDataRef.current = { matches: null, standings: null, status: null, currentRound: null };
        prevDataRef.current = '';
        setLiveTick(0);
    }, [tournament]);

    const { permissions } = usePage<PageProps>().props;
    const canJudge = permissions?.can_use_judge ?? false;
    const canScore = permissions?.can_score_matches ?? false;

    const currentStatus = liveDataRef.current.status ?? tournament.status;
    const shouldPoll = readOnly || currentStatus === 'active';
    const liveUrl = readOnly
        ? `/t/${tournament.slug}/live`
        : `/tournaments/${tournament.id}/live`;

    useQuery({
        queryKey: ['tournament-live', tournament.id, tournament.slug, readOnly],
        queryFn: async () => {
            const res = await fetch(liveUrl);
            if (!res.ok) throw new Error('Failed to fetch live data');
            const data = await res.json();
            const dataString = JSON.stringify(data);
            if (dataString !== prevDataRef.current) {
                prevDataRef.current = dataString;
                liveDataRef.current = {
                    matches: data.matches,
                    standings: data.swiss_standings ?? liveDataRef.current.standings,
                    status: data.status ?? liveDataRef.current.status,
                    currentRound: data.current_round ?? liveDataRef.current.currentRound,
                };
                setLiveTick(t => t + 1);
            }
            return data;
        },
        enabled: shouldPoll,
        refetchInterval: shouldPoll ? 5000 : false,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: false,
        structuralSharing: true,
    });

    const handleRemoveParticipant = (participantId: number) => {
        router.delete(route('participants.destroy', [tournament.id, participantId]), { preserveScroll: true, preserveState: true });
    };

    const handleDelete = () => {
        router.delete(route('tournaments.destroy', tournament.id));
    };

    const live = liveDataRef.current;
    const liveTournament = {
        ...tournament,
        matches: live.matches ?? tournament.matches ?? [],
        swiss_standings: live.standings ?? tournament.swiss_standings ?? [],
        status: live.status ?? tournament.status,
        current_round: live.currentRound ?? tournament.current_round,
    };

    const participants = tournament.participants || [];
    const matches = liveTournament.matches;
    const standings = liveTournament.swiss_standings;
    const participantCount = participants.length;
    const maxLabel = tournament.max_participants ? tournament.max_participants.toString() : '\u221e';
    const isActive = !readOnly && liveTournament.status === 'active';
    const occupiedStadiums = matches
        .filter(m => m.status === 'playing' && m.stadium)
        .map(m => m.stadium as number);
    const isSwiss = tournament.format === 'swiss';
    const isTwoStage = tournament.tournament_type === 'two_stage';

    // Single elimination: group main-bracket matches by round (exclude placement brackets)
    const roundsMap: Record<number, TournamentMatch[]> = {};
    if (!isSwiss) {
        matches
            .filter(m => !m.bracket || m.bracket === 'winners')
            .forEach((m) => {
                if (!roundsMap[m.round]) roundsMap[m.round] = [];
                roundsMap[m.round].push(m);
            });
    }
    const rounds = Object.keys(roundsMap).map(Number).sort((a, b) => a - b);
    const totalRounds = isSwiss ? (tournament.swiss_rounds || 0) : rounds.length;

    const getRoundName = (round: number) => {
        if (round === totalRounds) return 'Finals';
        if (round === totalRounds - 1) return 'Semi-Finals';
        if (round === totalRounds - 2) return 'Quarter-Finals';
        return `Round ${round}`;
    };

    // Format description for two-stage
    const formatDescription = isTwoStage
        ? `${formatLabel[tournament.group_stage_format || tournament.format] || tournament.format} \u2192 ${formatLabel[tournament.final_stage_format || 'single_elimination']}`
        : (formatLabel[tournament.format] || tournament.format);

    // Find champion
    const finalMatches = matches.filter(m => m.stage === 'final');
    const findBracketChampion = (matchList: TournamentMatch[]) => {
        const gf = matchList.find(m => m.bracket === 'grand_final' && m.winner_id);
        if (gf) return gf.winner;
        const mainBracket = matchList
            .filter(m => m.winner_id && !m.next_match_id && m.bracket !== 'placement_3' && m.bracket !== 'placement_5')
            .sort((a, b) => b.round - a.round);
        return mainBracket[0]?.winner || null;
    };
    const champion = isTwoStage && finalMatches.length > 0
        ? findBracketChampion(finalMatches)
        : isSwiss
            ? (liveTournament.status === 'completed' && standings.length > 0 ? standings[0]?.participant : null)
            : findBracketChampion(matches);

    const PageLayout = ({ children }: { children: React.ReactNode }) => {
        if (readOnly) {
            return (
                <>
                    <Head title={tournament.name} />
                    <div className="min-h-screen bg-zinc-950 flex flex-col">
                        <header className="flex items-center justify-between h-16 px-6 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm">
                            <span className="text-xl font-black text-white tracking-tight">
                                SHADOW <span className="text-red-500">SYNDICATE</span>
                            </span>
                            <SiteLogo className="h-10 w-auto" />
                        </header>
                        <main className="flex-1">{children}</main>
                        <footer className="border-t border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
                            <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center gap-4">
                                <SiteLogo className="h-14 w-auto opacity-80" />
                                <p className="text-sm text-gray-500">
                                    Created by <span className="font-semibold text-red-400">Shadow Syndicate</span>
                                </p>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span className="text-xs text-red-400 font-medium">Please Donate Red Aero Pegasus</span>
                                </div>
                                <a href="https://www.facebook.com/ARSIEN1328" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-400 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    Facebook
                                </a>
                                <p className="text-xs text-zinc-600 mt-2">Powered by SHADOW <span className="text-red-500">SYNDICATE</span></p>
                            </div>
                        </footer>
                    </div>
                </>
            );
        }
        return (
            <AuthenticatedLayout currentPage="tournaments">
                <Head title={tournament.name} />
                {children}
            </AuthenticatedLayout>
        );
    };

    return (
        <PageLayout>

            <div className="p-6 lg:p-10 overflow-x-hidden">
                {/* Breadcrumb */}
                {!readOnly && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                        <Link href={route('dashboard')} className="hover:text-cyan-400 transition-colors">Your Tournaments</Link>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <span className="text-slate-300">{tournament.name}</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[liveTournament.status] || statusColors.pending}`}>
                                {liveTournament.status.charAt(0).toUpperCase() + liveTournament.status.slice(1)}
                            </span>
                        </div>
                        <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                    </div>
                    {!readOnly && liveTournament.status === 'pending' && (
                        <div className="flex items-center gap-3">
                            <Link href={route('tournaments.edit', tournament.id)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Edit
                            </Link>
                            <button onClick={() => setShowDeleteConfirm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Champion Banner */}
                {champion && (
                    <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-yellow-500/10 p-6 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3l3.057-3L12 4.5 15.943 0 19 3l-2 6.5L19 21H5l2-11.5L5 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-yellow-500/70 uppercase tracking-wider font-bold">Champion</p>
                            <p className="text-2xl font-bold text-yellow-400">{champion.name}</p>
                        </div>
                    </div>
                )}

                {/* Tournament Details */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 mb-8 overflow-hidden">
                    {/* Row 1: Format, Players & Rounds, Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
                        {/* Column 1: Format & Structure */}
                        <div className="p-5 space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Format</span>
                            </div>
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Type</span>
                                    <span className="text-sm font-medium text-white">
                                        {isTwoStage ? 'Two Stage' : 'Single Stage'}
                                    </span>
                                </div>
                                {isTwoStage ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Group Stage</span>
                                            <span className="text-sm font-medium text-white">
                                                {formatLabel[tournament.group_stage_format || tournament.format] || tournament.format}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Final Stage</span>
                                            <span className="text-sm font-medium text-white">
                                                {formatLabel[tournament.final_stage_format || 'single_elimination']}
                                            </span>
                                        </div>
                                        {tournament.participants_per_group && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-500">Groups</span>
                                                <span className="text-sm font-medium text-white">
                                                    {tournament.participants_per_group} per group, top {tournament.advance_per_group || 2} advance per group
                                                </span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Format</span>
                                        <span className="text-sm font-medium text-white">
                                            {formatLabel[tournament.format] || tournament.format}
                                        </span>
                                    </div>
                                )}
                                {tournament.third_place_match && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">3rd Place Match</span>
                                        <span className="text-sm font-medium text-emerald-400">Yes</span>
                                    </div>
                                )}
                                {tournament.break_ties && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Break Ties</span>
                                        <span className="text-sm font-medium text-emerald-400">Placement Matches</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Column 2: Players & Rounds */}
                        <div className="p-5 space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Players & Rounds</span>
                            </div>
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Players</span>
                                    <span className="text-sm font-medium text-white">{participantCount} / {maxLabel}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        {isSwiss ? 'Swiss Rounds' : 'Rounds'}
                                    </span>
                                    <span className="text-sm font-medium text-white">
                                        {isSwiss
                                            ? (liveTournament.current_round > 0 ? `${liveTournament.current_round} / ${totalRounds}` : totalRounds || '-')
                                            : (totalRounds || '-')
                                        }
                                    </span>
                                </div>
                                <StadiumsField
                                    tournamentId={tournament.id}
                                    stadiums={tournament.stadiums}
                                    readOnly={readOnly}
                                />
                            </div>
                        </div>

                        {/* Column 3: Status & Schedule */}
                        <div className="p-5 space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                            </div>
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Status</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[liveTournament.status] || statusColors.pending}`}>
                                        {liveTournament.status.charAt(0).toUpperCase() + liveTournament.status.slice(1)}
                                    </span>
                                </div>
                                {tournament.start_time && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">
                                            {tournament.tentative ? 'Start (tentative)' : 'Start Time'}
                                        </span>
                                        <span className="text-sm font-medium text-white">
                                            {new Date(tournament.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            {' '}
                                            {new Date(tournament.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                        </span>
                                    </div>
                                )}
                                {isTwoStage && finalMatches.length > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Stage</span>
                                        <span className="text-sm font-medium text-amber-400">Final Stage</span>
                                    </div>
                                )}
                                {isTwoStage && finalMatches.length === 0 && isActive && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Stage</span>
                                        <span className="text-sm font-medium text-cyan-400">Group Stage</span>
                                    </div>
                                )}
                            </div>
                            {/* Scoring (Swiss only) */}
                            {isSwiss && isActive && (
                                <div className="pt-3 mt-3 border-t border-slate-700/30">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scoring</p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                        <div className="flex justify-between text-slate-400">
                                            <span>Win</span>
                                            <span className="font-bold text-emerald-400">+{Number(tournament.pts_for_match_win).toFixed(1)} TP</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>Survivor</span>
                                            <span className="font-bold text-slate-300">+1 BP</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>Loss</span>
                                            <span className="font-bold text-red-400">+0.0 TP</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>Over</span>
                                            <span className="font-bold text-slate-300">+2 BP</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>Draw</span>
                                            <span className="font-bold text-amber-400">+{Number(tournament.pts_for_match_tie).toFixed(1)} TP</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>Burst</span>
                                            <span className="font-bold text-slate-300">+2 BP</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>BYE</span>
                                            <span className="font-bold text-blue-400">+{Number(tournament.pts_for_bye).toFixed(1)} TP</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>Xtreme</span>
                                            <span className="font-bold text-slate-300">+3 BP</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Participants & Quick Actions */}
                    {!readOnly && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-slate-800/80 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
                        {/* Participants */}
                        <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Participants</span>
                                </div>
                                <span className="text-xs text-slate-500">{participantCount} / {maxLabel}</span>
                            </div>
                            <div>
                                {liveTournament.status === 'pending' && (
                                    <>
                                        <SingleAddForm tournamentId={tournament.id} />
                                        <button onClick={() => setShowAddModal(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 hover:border-slate-600/50 transition-all mb-3">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            Bulk Add
                                        </button>
                                    </>
                                )}
                                {participants.length === 0 ? (
                                    <p className="text-slate-500 text-xs text-center py-4">No participants yet</p>
                                ) : (
                                    <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                                        {participants.map((p) => (
                                            <ParticipantRow
                                                key={p.id}
                                                participant={p}
                                                tournamentId={tournament.id}
                                                readOnly={readOnly}
                                                isPending={liveTournament.status === 'pending'}
                                                onRemove={handleRemoveParticipant}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-5 space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</span>
                            </div>
                            <div className="space-y-1.5">
                                {liveTournament.status === 'pending' ? (
                                    <button onClick={() => router.post(route('tournaments.start', tournament.id), {}, { preserveScroll: true, preserveState: true })} disabled={participantCount < 2} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-emerald-500/10 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Start Tournament {participantCount < 2 && <span className="text-[10px] text-slate-600 ml-auto">Need 2+</span>}
                                    </button>
                                ) : liveTournament.status === 'completed' ? (
                                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Tournament Complete
                                    </div>
                                ) : liveTournament.status === 'active' ? (
                                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Tournament Active
                                    </div>
                                ) : null}
                                {liveTournament.status === 'pending' && (
                                    <button onClick={() => router.post(route('participants.randomize', tournament.id), {}, { preserveScroll: true, preserveState: true })} disabled={participantCount < 2} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        Randomize Seeds
                                    </button>
                                )}
                                <button onClick={() => { const shareUrl = `${window.location.origin}/t/${tournament.slug}`; navigator.clipboard.writeText(shareUrl); setToast('Tournament link copied!'); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition-all">
                                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                    Share Tournament
                                </button>
                            </div>
                        </div>

                        {/* Judge Access */}
                        <div className="p-5 space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                </svg>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Judge Access</span>
                            </div>
                            {!canJudge ? (
                                <div className="px-3 py-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                    <p className="text-slate-500 text-xs text-center">You don't have permission to use the judge system. Ask an admin to enable it.</p>
                                </div>
                            ) : (
                                <>
                                    {isActive && !tournament.judge_code && (
                                        <button
                                            onClick={() => router.post(route('tournaments.generateJudgeCode', tournament.id), {}, { preserveScroll: true, preserveState: true })}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-700/50 transition-all"
                                        >
                                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                            </svg>
                                            Generate Judge Code
                                        </button>
                                    )}
                                    {tournament.judge_code && (
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Judge Code</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="flex-1 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-lg font-mono font-bold text-cyan-400 tracking-[0.3em] text-center">
                                                        {tournament.judge_code}
                                                    </span>
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(tournament.judge_code!); setToast('Judge code copied!'); }}
                                                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/60 transition-all"
                                                        title="Copy code"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Judge Link</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="flex-1 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs font-mono text-slate-300 truncate">
                                                        {window.location.origin}/t/{tournament.slug}/judge
                                                    </span>
                                                    <button
                                                        onClick={() => { const judgeUrl = `${window.location.origin}/t/${tournament.slug}/judge`; navigator.clipboard.writeText(judgeUrl); setToast('Judge link copied!'); }}
                                                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/60 transition-all shrink-0"
                                                        title="Copy link"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-600 text-center">Share the link + code to judges so they can submit scores</p>
                                        </div>
                                    )}
                                    {!isActive && !tournament.judge_code && (
                                        <p className="text-slate-500 text-xs text-center py-4">Available when tournament is active</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    )}

                </div>

                {/* Main Content */}
                <div className="min-w-0">
                    <div className="space-y-6 min-w-0">
                        {isSwiss ? (
                            liveTournament.status === 'active' || liveTournament.status === 'completed' ? (
                                <SwissView
                                    tournament={liveTournament}
                                    matches={matches}
                                    standings={standings}
                                    readOnly={readOnly}
                                    canScore={canScore}
                                />
                            ) : (
                                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-800/80">
                                        <h2 className="text-lg font-semibold text-white">Swiss Rounds</h2>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-20 px-6">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-400 text-sm text-center">
                                            {participantCount < 2 ? 'Add at least 2 participants first.' : 'Click "Start Tournament" to generate Swiss pairings.'}
                                        </p>
                                        {participantCount >= 2 && (
                                            <p className="text-slate-500 text-xs mt-2 text-center">
                                                {Math.ceil(Math.log2(participantCount))} rounds will be generated for {participantCount} participants.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        ) : tournament.format === 'double_elimination' ? (
                            matches.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-white">Bracket</h2>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-20 px-6">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-400 text-sm text-center">
                                            {participantCount < 2 ? 'Add at least 2 participants first.' : 'Click "Start Tournament" to generate the bracket.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <EliminationBracket
                                    matches={matches}
                                    tournament={liveTournament}
                                    format="double_elimination"
                                    readOnly={readOnly}
                                    canScore={canScore}
                                />
                            )
                        ) : (
                            /* Single Elimination Bracket */
                            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-white">Bracket</h2>
                                    {isActive && canScore && <span className="text-xs text-cyan-400 font-medium">Click a name to report winner</span>}
                                </div>

                                {matches.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 px-6">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-400 text-sm text-center">
                                            {participantCount < 2 ? 'Add at least 2 participants first.' : 'Click "Start Tournament" to generate the bracket.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-6 overflow-x-auto">
                                        <div className="flex gap-8 min-w-max">
                                            {rounds.map((round) => {
                                                const isFirstRound = round === rounds[0];
                                                const roundMatches = roundsMap[round].filter(m => {
                                                    if ((!m.player1_id || !m.player2_id) && m.winner_id) return false;
                                                    if (isFirstRound && !m.player1_id && !m.player2_id) return false;
                                                    return true;
                                                });
                                                if (roundMatches.length === 0) return null;

                                                return (
                                                    <div key={round} className="flex flex-col">
                                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">
                                                            {getRoundName(round)}
                                                        </h3>
                                                        <div className="flex flex-col justify-around flex-1 gap-4">
                                                            {roundMatches.map((match) => (
                                                                <MatchCard
                                                                    key={match.id}
                                                                    match={match}
                                                                    tournamentId={tournament.id}
                                                                    isActive={isActive}
                                                                    canScore={canScore}
                                                                    participants={participants}
                                                                    stadiumCount={tournament.stadiums || 0}
                                                                    occupiedStadiums={occupiedStadiums}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Player Stats for elimination formats */}
                        {!isSwiss && matches.length > 0 && (
                            <PlayerStatsTable
                                participants={participants}
                                matches={matches}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Add Modal */}
            {!readOnly && showAddModal && (
                <BulkAddModal tournamentId={tournament.id} onClose={() => setShowAddModal(false)} />
            )}

            {/* Delete Modal */}
            {!readOnly && showDeleteConfirm && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowDeleteConfirm(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 p-6">
                            <h2 className="text-lg font-semibold text-white">Delete Tournament</h2>
                            <p className="mt-2 text-sm text-slate-400">Are you sure you want to delete <strong className="text-white">{tournament.name}</strong>? This cannot be undone.</p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all">Cancel</button>
                                <button onClick={handleDelete} className="px-5 py-2.5 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-500 transition-all">Delete Tournament</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className="animate-fade-in-up flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800 border border-emerald-500/30 shadow-2xl shadow-black/40">
                        <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium text-white">{toast}</span>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
