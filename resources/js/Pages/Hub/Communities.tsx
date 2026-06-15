import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { mainSitePath } from '@/utils/mainSiteUrl';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

interface TournamentCard {
    id: number;
    name: string;
    slug: string;
    format: string;
    status: string;
    start_time: string | null;
    max_participants: number | null;
    participants_count?: number;
    role: 'organizer' | 'player';
    blader_name?: string;
    placement?: string | null;
}

interface MemberProfile {
    id: number;
    name: string;
    role: string;
    rank: string;
    image_url: string | null;
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

function withAppBase(href: string): string {
    if (typeof window === 'undefined' || href.startsWith('http')) return href;
    const needsIndexPhp = window.location.pathname.startsWith('/index.php');
    if (!needsIndexPhp || href.startsWith('/index.php')) return href;
    return `/index.php${href.startsWith('/') ? href : `/${href}`}`;
}

function CommunityCard({ tournament, showManage }: { tournament: TournamentCard; showManage?: boolean }) {
    const publicUrl = withAppBase(route('tournaments.public', { tournament: tournament.slug }, false));

    return (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 hover:border-fuchsia-500/20 transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white truncate">{tournament.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {formatLabel[tournament.format] ?? tournament.format}
                        {tournament.participants_count != null && (
                            <span> · {tournament.participants_count} players</span>
                        )}
                    </p>
                </div>
                <span
                    className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        statusColors[tournament.status] ?? statusColors.pending
                    }`}
                >
                    {tournament.status}
                </span>
            </div>

            {tournament.role === 'player' && tournament.blader_name && (
                <p className="text-xs text-gray-500 mb-3">
                    Playing as <span className="text-cyan-400/90">{tournament.blader_name}</span>
                    {tournament.placement && (
                        <span className="text-gray-600"> · {tournament.placement}</span>
                    )}
                </p>
            )}

            <div className="flex flex-wrap gap-2">
                <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-600 transition-colors"
                >
                    Public bracket
                </a>
                {showManage && (
                    <Link
                        href={withAppBase(route('tournaments.show', { tournament: tournament.id }, false))}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg tx-btn text-white"
                    >
                        Manage
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function Communities({
    ownedTournaments = [],
    joinedTournaments = [],
    shadowMember = false,
    memberProfile = null,
}: {
    ownedTournaments?: TournamentCard[];
    joinedTournaments?: TournamentCard[];
    shadowMember?: boolean;
    memberProfile?: MemberProfile | null;
}) {
    const { main_site_url, permissions } = usePage<PageProps>().props;
    const canCreate = permissions.can_create_tournaments;
    const mainMembers = mainSitePath(main_site_url, '/members');
    const mainHome = mainSitePath(main_site_url, '/');

    return (
        <AuthenticatedLayout currentPage="communities">
            <Head title="Your Communities" />

            <div className="p-6 lg:p-10 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Your Communities</h1>
                    <div className="mt-2 w-16 h-1 rounded-full tx-underline" />
                    <p className="mt-3 text-sm text-gray-500 max-w-xl">
                        Shadow Syndicate and the tournaments you organize or play in — your hubs in one place.
                    </p>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/40 to-zinc-900/60 p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-xl font-black text-white shrink-0">
                            SS
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-white">Shadow Syndicate</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {shadowMember && memberProfile
                                    ? `Member · ${memberProfile.name} · Rank ${memberProfile.rank}`
                                    : 'Partner community on the main site — join there to access the members roster.'}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                            <a
                                href={mainHome}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-700 text-gray-300 hover:text-white hover:border-zinc-600 transition-colors"
                            >
                                Visit site
                            </a>
                            {shadowMember && (
                                <a
                                    href={mainMembers}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600/90 hover:bg-red-500 text-white transition-colors"
                                >
                                    Members roster
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <section className="mb-10">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                            Tournaments you run
                        </h2>
                        {canCreate && (
                            <Link
                                href={withAppBase(route('tournaments.create', undefined, false))}
                                className="text-xs font-semibold tx-link"
                            >
                                + Create
                            </Link>
                        )}
                    </div>

                    {ownedTournaments.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {ownedTournaments.map((t) => (
                                <CommunityCard key={t.id} tournament={t} showManage />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
                            <p className="text-gray-500 text-sm mb-4">No tournaments yet. Create one to host your community bracket.</p>
                            {canCreate && (
                                <Link
                                    href={withAppBase(route('tournaments.create', undefined, false))}
                                    className="inline-flex px-5 py-2.5 text-sm font-semibold rounded-xl tx-btn text-white"
                                >
                                    Create a Tournament
                                </Link>
                            )}
                        </div>
                    )}
                </section>

                {joinedTournaments.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                            Tournaments you joined
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {joinedTournaments.map((t) => (
                                <CommunityCard key={`joined-${t.id}`} tournament={t} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
