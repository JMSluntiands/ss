import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps } from '@/types';

interface Tournament {
    id: number;
    name: string;
    slug: string;
    format: string;
    status: string;
    max_participants: number | null;
    start_time: string | null;
    created_at: string;
    champion_name: string | null;
}

interface FinishStats {
    sf: number;
    of: number;
    bf: number;
    xf: number;
    matches_played: number;
    rounds_won: number;
}

interface ParticipatedTournament {
    id: number;
    name: string;
    slug: string;
    format: string;
    status: string;
    start_time: string | null;
    blader_name: string;
    placement: string | null;
    linked_account?: boolean;
    finish_stats?: FinishStats;
}

function FinishStatsChips({ stats }: { stats?: FinishStats }) {
    if (!stats || stats.matches_played === 0) {
        return (
            <p className="text-[11px] text-gray-600 mt-2">Finish stats appear after scored matches (SF, OF, BF, XF).</p>
        );
    }

    const chips = [
        { label: 'XF', value: stats.xf, className: 'bg-red-500/10 text-red-400 border-red-500/20' },
        { label: 'BF', value: stats.bf, className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        { label: 'OF', value: stats.of, className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        { label: 'SF', value: stats.sf, className: 'bg-slate-500/10 text-slate-300 border-slate-600/40' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2 mt-3">
            {chips.map((c) => (
                <span
                    key={c.label}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${c.className}`}
                >
                    {c.label} <span>{c.value}</span>
                </span>
            ))}
            <span className="text-[10px] text-gray-600">
                {stats.matches_played} match{stats.matches_played !== 1 ? 'es' : ''} · {stats.rounds_won} rounds won
            </span>
        </div>
    );
}

function ParticipatedTournamentCard({
    tournament,
    withAppBase,
}: {
    tournament: ParticipatedTournament;
    withAppBase: (href: string) => string;
}) {
    return (
        <Link
            href={withAppBase(route('tournaments.public', tournament.slug, false))}
            className="block rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:bg-zinc-900/70 hover:border-red-900/40 transition-all group"
        >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                        {tournament.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        As <span className="text-gray-300">{tournament.blader_name}</span>
                        {' · '}
                        {formatLabel[tournament.format] || tournament.format}
                        {tournament.linked_account === false && (
                            <span className="text-amber-500/80"> · name not linked to account yet</span>
                        )}
                    </p>
                    <FinishStatsChips stats={tournament.finish_stats} />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {tournament.placement && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            {tournament.placement}
                        </span>
                    )}
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[tournament.status] || statusColors.pending}`}
                    >
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                    </span>
                </div>
            </div>
        </Link>
    );
}

interface MemberStats {
    name: string;
    role: string;
    rank: string;
    wins: number;
    losses: number;
    win_rate: number | null;
    bey: string | null;
    joined: string | null;
    events_entered: number;
    tournaments_entered: number;
    tournament_match_wins: number;
}

interface MatchHistoryEntry {
    id: number;
    tournament_name: string;
    tournament_slug: string | null;
    opponent_name: string | null;
    result: 'win' | 'loss' | 'draw' | 'bye';
    finishes: string[];
    round: number | null;
    played_at: string | null;
}

const finishCards = [
    { key: 'xf' as const, label: 'XF', className: 'border-red-500/20 bg-red-500/10 text-red-400' },
    { key: 'bf' as const, label: 'BF', className: 'border-amber-500/20 bg-amber-500/10 text-amber-400' },
    { key: 'of' as const, label: 'OF', className: 'border-blue-500/20 bg-blue-500/10 text-blue-400' },
    { key: 'sf' as const, label: 'SF', className: 'border-slate-600/40 bg-slate-500/10 text-slate-300' },
];

const resultStyles: Record<MatchHistoryEntry['result'], string> = {
    win: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    loss: 'bg-red-500/10 text-red-400 border-red-500/20',
    draw: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    bye: 'bg-zinc-700/30 text-gray-400 border-zinc-600/40',
};

function resultLabel(result: MatchHistoryEntry['result']): string {
    switch (result) {
        case 'win':
            return 'Win';
        case 'loss':
            return 'Loss';
        case 'draw':
            return 'Draw';
        case 'bye':
            return 'Bye';
    }
}

const formatLabel: Record<string, string> = {
    single_elimination: 'Single Elim',
    double_elimination: 'Double Elim',
    round_robin: 'Round Robin',
    swiss: 'Swiss',
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

function rankColor(rank: string) {
    switch (rank) {
        case 'S':
            return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'A':
            return 'bg-red-500/10 text-red-400 border-red-500/20';
        case 'B':
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'C':
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        default:
            return 'bg-zinc-700/30 text-gray-400 border-zinc-700/50';
    }
}

export default function Dashboard({
    tournaments = [],
    memberStats = null,
    participatedTournaments = [],
    isShadowMember = false,
    isMemberDashboard = false,
    aggregateFinishStats = null,
    matchHistory = [],
}: {
    tournaments?: Tournament[];
    memberStats?: MemberStats | null;
    participatedTournaments?: ParticipatedTournament[];
    isShadowMember?: boolean;
    isMemberDashboard?: boolean;
    aggregateFinishStats?: FinishStats | null;
    matchHistory?: MatchHistoryEntry[];
}) {
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);
    const { permissions, main_site_url } = usePage<PageProps>().props;
    const canCreate = permissions.can_create_tournaments;
    const hasParticipated = participatedTournaments.length > 0;

    const withAppBase = (href: string): string => {
        if (typeof window === 'undefined' || href.startsWith('http')) return href;
        const needsIndexPhp = window.location.pathname.startsWith('/index.php');
        if (!needsIndexPhp || href.startsWith('/index.php')) return href;
        return `/index.php${href.startsWith('/') ? href : `/${href}`}`;
    };

    const statsFromMember = memberStats != null;

    const statTournaments = statsFromMember
        ? memberStats.tournaments_entered
        : tournaments.length;

    const statWins = statsFromMember ? memberStats.wins : 0;

    const statRanking = statsFromMember ? memberStats.rank : '--';

    if (isMemberDashboard && memberStats) {
        return (
            <AuthenticatedLayout currentPage="tournaments">
                <Head title="Your Stats" />

                <div className="p-6 lg:p-10 max-w-5xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">Your Stats</h1>
                        <div className="mt-2 w-16 h-1 rounded-full tx-underline" />
                        <p className="mt-3 text-sm text-gray-500">
                            {memberStats.name} · {memberStats.role}
                            {memberStats.bey ? ` · ${memberStats.bey}` : ''}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:col-span-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80">Win Rate</p>
                            <p className="text-4xl font-black text-white mt-2">{memberStats.win_rate ?? 0}%</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {memberStats.wins}W · {memberStats.losses}L
                            </p>
                        </div>
                        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Finish Records</p>
                            <div className="grid grid-cols-4 gap-3">
                                {finishCards.map((card) => (
                                    <div
                                        key={card.key}
                                        className={`rounded-xl border px-3 py-4 text-center ${card.className}`}
                                    >
                                        <p className="text-2xl font-bold">{aggregateFinishStats?.[card.key] ?? 0}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">{card.label}</p>
                                    </div>
                                ))}
                            </div>
                            {aggregateFinishStats && aggregateFinishStats.matches_played > 0 && (
                                <p className="text-[11px] text-gray-600 mt-3">
                                    {aggregateFinishStats.matches_played} matches scored · {aggregateFinishStats.rounds_won} rounds won
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
                        <div className="px-5 py-4 border-b border-zinc-800/60">
                            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Match History</h2>
                        </div>

                        {matchHistory.length > 0 ? (
                            <div className="divide-y divide-zinc-800/50">
                                {matchHistory.map((match) => (
                                    <div key={match.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{match.tournament_name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                vs {match.opponent_name ?? '—'}
                                                {match.round != null ? ` · Round ${match.round}` : ''}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                            <span
                                                className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${resultStyles[match.result]}`}
                                            >
                                                {resultLabel(match.result)}
                                            </span>
                                            {match.finishes.length > 0 ? (
                                                match.finishes.map((finish, i) => (
                                                    <span
                                                        key={`${match.id}-${finish}-${i}`}
                                                        className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border border-zinc-700/50 bg-zinc-800/50 text-gray-300"
                                                    >
                                                        {finish}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-gray-600">No finish data</span>
                                            )}
                                            {match.played_at && (
                                                <span className="text-[10px] text-gray-600">
                                                    {new Date(match.played_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-5 py-14 text-center">
                                <p className="text-sm text-gray-500">No scored matches yet.</p>
                                <p className="text-xs text-gray-600 mt-2 max-w-sm mx-auto">
                                    Once you play in a tournament and matches are scored, your history and finish records will show here.
                                </p>
                                {main_site_url && (
                                    <a
                                        href={`${main_site_url.replace(/\/$/, '')}/events`}
                                        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
                                    >
                                        Browse events
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout currentPage="tournaments">
            <Head title="Your Tournaments" />

            <div className="p-6 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Your Tournaments</h1>
                        <div className="mt-2 w-16 h-1 rounded-full tx-underline" />
                    </div>

                    {canCreate && (
                        <div className="relative">
                            <button
                                onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                                className="tx-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create a Tournament
                                <svg
                                    className={`w-4 h-4 transition-transform ${showCreateDropdown ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showCreateDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowCreateDropdown(false)} />
                                    <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl bg-zinc-800 border border-zinc-700/50 shadow-xl shadow-black/30 py-1">
                                        <Link
                                            href={withAppBase(route('tournaments.create', undefined, false))}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-zinc-700/50 transition-colors"
                                        >
                                            Tournament
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {tournaments.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
                        <div className="flex flex-col items-center justify-center py-24 px-6">
                            <div className="w-20 h-20 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No tournaments yet</h3>
                            <p className="text-gray-500 text-sm text-center max-w-sm mb-6">
                                {canCreate
                                    ? 'Create your first tournament and start battling! Organize events, invite bladers, and track your wins.'
                                    : "You don't have permission to create tournaments. Ask an admin to grant you access."}
                            </p>
                            {canCreate && (
                                <Link
                                    href={withAppBase(route('tournaments.create', undefined, false))}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700/50 text-sm font-medium text-gray-300 hover:text-white hover:bg-zinc-700/50 hover:border-zinc-600/50 transition-all"
                                >
                                    Create your first tournament
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tournaments.map((tournament) => (
                            <Link
                                key={tournament.id}
                                href={withAppBase(route('tournaments.show', tournament.id, false))}
                                className="block rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:bg-zinc-900/70 hover:border-red-900/40 transition-all group"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl tx-card-icon flex items-center justify-center shrink-0">
                                            <svg className="w-6 h-6 tx-card-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                                                {tournament.name}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {formatLabel[tournament.format] || tournament.format}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {tournament.champion_name && (
                                            <span className="text-xs font-semibold text-yellow-400">{tournament.champion_name}</span>
                                        )}
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[tournament.status] || statusColors.pending}`}
                                        >
                                            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {hasParticipated && !isShadowMember && (
                    <div className="space-y-3 mt-8">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                            Tournaments you entered
                        </h3>
                        {participatedTournaments.map((tournament) => (
                            <ParticipatedTournamentCard
                                key={tournament.id}
                                tournament={tournament}
                                withAppBase={withAppBase}
                            />
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{statTournaments}</p>
                                <p className="text-xs text-gray-500">
                                    {statsFromMember ? 'Tournaments Entered' : 'Tournaments'}
                                </p>
                                {statsFromMember && memberStats.events_entered > 0 && (
                                    <p className="text-[11px] text-gray-600 mt-0.5">
                                        {memberStats.events_entered} event
                                        {memberStats.events_entered !== 1 ? 's' : ''} registered
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{statWins}</p>
                                <p className="text-xs text-gray-500">Battles Won</p>
                                {statsFromMember && (
                                    <p className="text-[11px] text-gray-600 mt-0.5">
                                        {memberStats.losses} loss{memberStats.losses !== 1 ? 'es' : ''}
                                        {memberStats.tournament_match_wins > 0 &&
                                            ` · ${memberStats.tournament_match_wins} in brackets`}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{statRanking}</p>
                                <p className="text-xs text-gray-500">Ranking</p>
                                {statsFromMember && memberStats.win_rate !== null && (
                                    <p className="text-[11px] text-gray-600 mt-0.5">{memberStats.win_rate}% win rate</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
