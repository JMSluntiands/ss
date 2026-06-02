import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface DiscoverTournament {
    id: number;
    name: string;
    slug: string;
    format: string;
    status: string;
    start_time: string | null;
    max_participants: number | null;
    participants_count: number;
    description: string | null;
    organizer_name: string | null;
    is_mine: boolean;
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

const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Live' },
    { value: 'pending', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
];

function withAppBase(href: string): string {
    if (typeof window === 'undefined' || href.startsWith('http')) return href;
    const needsIndexPhp = window.location.pathname.startsWith('/index.php');
    if (!needsIndexPhp || href.startsWith('/index.php')) return href;
    return `/index.php${href.startsWith('/') ? href : `/${href}`}`;
}

export default function Discover({
    tournaments = [],
    filters = { q: '', status: 'all' },
}: {
    tournaments?: DiscoverTournament[];
    filters?: { q: string; status: string };
}) {
    const [query, setQuery] = useState(filters.q ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');

    const applyFilters = (e?: FormEvent, nextStatus?: string) => {
        e?.preventDefault();
        const statusValue = nextStatus ?? status;
        router.get(
            withAppBase(route('discover', undefined, false)),
            { q: query.trim() || undefined, status: statusValue === 'all' ? undefined : statusValue },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout currentPage="discover">
            <Head title="Discover" />

            <div className="p-6 lg:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Discover</h1>
                    <div className="mt-2 w-16 h-1 rounded-full tx-underline" />
                    <p className="mt-3 text-sm text-gray-500 max-w-xl">
                        Browse public tournaments on Tournament X — follow live brackets or find events to join.
                    </p>
                </div>

                <form onSubmit={applyFilters} className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search tournaments..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder-gray-600 text-sm focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-xl text-sm font-semibold tx-btn text-white shrink-0"
                    >
                        Search
                    </button>
                </form>

                <div className="flex flex-wrap gap-2 mb-8">
                    {statusFilters.map((f) => (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => {
                                setStatus(f.value);
                                applyFilters(undefined, f.value);
                            }}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                                status === f.value
                                    ? 'bg-fuchsia-500/10 text-cyan-300 border-fuchsia-500/25'
                                    : 'text-gray-500 border-zinc-800 hover:border-zinc-700 hover:text-white'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {tournaments.length > 0 ? (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {tournaments.map((t) => {
                            const publicUrl = withAppBase(route('tournaments.public', { tournament: t.slug }, false));

                            return (
                                <article
                                    key={t.id}
                                    className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 flex flex-col hover:border-cyan-500/20 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-bold text-white leading-snug">{t.name}</h3>
                                        {t.is_mine && (
                                            <span className="shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                                Yours
                                            </span>
                                        )}
                                    </div>

                                    {t.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{t.description}</p>
                                    )}

                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                                        <span>{formatLabel[t.format] ?? t.format}</span>
                                        <span>·</span>
                                        <span>{t.participants_count} players</span>
                                        {t.organizer_name && (
                                            <>
                                                <span>·</span>
                                                <span className="truncate">{t.organizer_name}</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-auto flex items-center justify-between gap-2">
                                        <span
                                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                statusColors[t.status] ?? statusColors.pending
                                            }`}
                                        >
                                            {t.status}
                                        </span>
                                        <div className="flex gap-2">
                                            <a
                                                href={publicUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-700 text-gray-400 hover:text-white transition-colors"
                                            >
                                                View
                                            </a>
                                            {t.is_mine && (
                                                <Link
                                                    href={withAppBase(route('tournaments.show', { tournament: t.id }, false))}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg tx-btn text-white"
                                                >
                                                    Manage
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
                        <p className="text-gray-500">No tournaments match your search. Try another name or filter.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
