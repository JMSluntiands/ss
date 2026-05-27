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

export default function Dashboard({ tournaments = [] }: { tournaments?: Tournament[] }) {
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);
    const { permissions } = usePage<PageProps>().props;
    const canCreate = permissions.can_create_tournaments;

    return (
        <AuthenticatedLayout currentPage="tournaments">
            <Head title="Your Tournaments" />

            <div className="p-6 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Your Tournaments</h1>
                        <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                    </div>

                    {canCreate && (
                    <div className="relative">
                        <button
                            onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-500 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-red-500/40 hover:brightness-110 active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create a Tournament
                            <svg className={`w-4 h-4 transition-transform ${showCreateDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showCreateDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowCreateDropdown(false)} />
                                <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl bg-zinc-800 border border-zinc-700/50 shadow-xl shadow-black/30 py-1">
                                    <Link
                                        href={route('tournaments.create')}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-zinc-700/50 transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                        </svg>
                                        Tournament
                                    </Link>
                                    <Link
                                        href={route('tournaments.create')}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-zinc-700/50 transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Race
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No tournaments yet</h3>
                            <p className="text-gray-500 text-sm text-center max-w-sm mb-6">
                                {canCreate
                                    ? 'Create your first tournament and start battling! Organize events, invite bladers, and track your wins.'
                                    : 'You don\'t have permission to create tournaments. Ask an admin to grant you access.'}
                            </p>
                            {canCreate && (
                            <Link
                                href={route('tournaments.create')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700/50 text-sm font-medium text-gray-300 hover:text-white hover:bg-zinc-700/50 hover:border-zinc-600/50 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
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
                                href={route('tournaments.show', tournament.id)}
                                className="block rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:bg-zinc-900/70 hover:border-red-900/40 transition-all group"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-500/20 to-red-400/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                                                <span className="text-zinc-700">·</span>
                                                <span className="text-xs text-gray-500">
                                                    {tournament.max_participants ? `${tournament.max_participants} max` : 'Unlimited'}
                                                </span>
                                                {tournament.start_time && (
                                                    <>
                                                        <span className="text-zinc-700">·</span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(tournament.start_time).toLocaleDateString()}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {tournament.champion_name && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                                                <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M2.5 7.5L5 14h14l2.5-6.5L17.5 10 12 4l-5.5 6L2.5 7.5zM5 16h14v2H5v-2z"/>
                                                </svg>
                                                <span className="text-xs font-semibold text-yellow-400">{tournament.champion_name}</span>
                                            </div>
                                        )}
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[tournament.status] || statusColors.pending}`}>
                                            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                                        </span>
                                        <svg className="w-5 h-5 text-zinc-600 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{tournaments.length}</p>
                                <p className="text-xs text-gray-500">Tournaments</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">0</p>
                                <p className="text-xs text-gray-500">Battles Won</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">--</p>
                                <p className="text-xs text-gray-500">Ranking</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
