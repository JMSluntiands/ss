import OptimizedImage from '@/Components/OptimizedImage';
import SiteFooter from '@/Components/SiteFooter';
import SiteNav from '@/Components/SiteNav';
import { memberImageSrc } from '@/utils/publicStorage';
import { Head, Link } from '@inertiajs/react';

interface MemberProfile {
    id: number;
    name: string;
    role: string;
    rank: string;
    wins: number;
    losses: number;
    win_rate: number;
    bey: string | null;
    joined: string | null;
    image_url: string | null;
    has_tournamentx_account: boolean;
}

interface ActivityCounts {
    events_entered: number;
    tournaments_entered: number;
    tournament_match_wins: number;
}

interface TournamentEntry {
    id: number;
    name: string;
    slug: string;
    format: string;
    status: string;
    start_time: string | null;
    blader_name: string;
    placement: string | null;
}

interface EventEntry {
    id: number;
    event_title: string;
    event_date: string | null;
    location: string | null;
    entry_type: string;
    blader_name_1: string;
    blader_name_2: string | null;
    status: string;
    created_at: string;
}

const roleColors: Record<string, string> = {
    Founder: 'text-red-400 border-red-500/30',
    'Co-Founder': 'text-red-300 border-red-400/30',
    Officer: 'text-orange-400 border-orange-500/30',
    Member: 'text-gray-400 border-zinc-600/50',
    Recruit: 'text-gray-500 border-zinc-700/50',
};

const rankColors: Record<string, string> = {
    S: 'text-red-400 bg-red-500/10 border-red-500/30',
    A: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    B: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    C: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    D: 'text-gray-400 bg-zinc-700/30 border-zinc-600/30',
};

const formatLabel: Record<string, string> = {
    single_elimination: 'Single Elimination',
    double_elimination: 'Double Elimination',
    round_robin: 'Round Robin',
    swiss: 'Swiss',
};

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    tentative: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

function tournamentPublicUrl(tournamentxUrl: string, slug: string): string {
    const base = tournamentxUrl.replace(/\/$/, '');
    return `${base}/t/${slug}`;
}

export default function MemberShow({
    member,
    activity,
    tournaments = [],
    events = [],
    tournamentx_url = '',
}: {
    member: MemberProfile;
    activity: ActivityCounts;
    tournaments?: TournamentEntry[];
    events?: EventEntry[];
    tournamentx_url?: string;
}) {
    const img = memberImageSrc(member.image_url);

    return (
        <>
            <Head title={`${member.name} - Shadow Syndicate`} />
            <div className="min-h-screen bg-zinc-950 text-white">
                <SiteNav activePage="members" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <Link
                        href={route('members')}
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors mb-6"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        All Members
                    </Link>
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 overflow-hidden mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
                            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[280px]">
                                {img ? (
                                    <OptimizedImage
                                        src={memberImageSrc(member.image_url, 'thumb')!}
                                        fallbackSrc={img}
                                        alt={member.name}
                                        sizes="280px"
                                        className="w-full h-full object-cover object-[center_18%]"
                                    />
                                ) : (
                                    <div className="w-full h-full min-h-[220px] bg-gradient-to-br from-red-700 to-zinc-800 flex items-center justify-center">
                                        <span className="text-7xl font-black text-white/80">{member.name.charAt(0)}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent md:bg-gradient-to-r" />
                                {member.rank && (
                                    <span
                                        className={`absolute top-4 left-4 w-10 h-10 flex items-center justify-center text-sm font-black rounded-lg border ${rankColors[member.rank] || ''}`}
                                    >
                                        {member.rank}
                                    </span>
                                )}
                            </div>

                            <div className="p-6 sm:p-8">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span
                                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${roleColors[member.role] || ''} bg-zinc-950/70`}
                                    >
                                        {member.role}
                                    </span>
                                    {member.has_tournamentx_account && (
                                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                                            TournamentX
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{member.name}</h1>
                                {member.bey && <p className="text-red-400/90 mt-2">{member.bey}</p>}
                                {member.joined && <p className="text-sm text-gray-500 mt-1">Joined {member.joined}</p>}

                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6">
                                    <div className="text-center py-3 rounded-xl bg-zinc-800/50 col-span-1">
                                        <p className="text-xl font-bold text-emerald-400">{member.wins}</p>
                                        <p className="text-[10px] text-gray-600 uppercase">Wins</p>
                                    </div>
                                    <div className="text-center py-3 rounded-xl bg-zinc-800/50 col-span-1">
                                        <p className="text-xl font-bold text-red-400">{member.losses}</p>
                                        <p className="text-[10px] text-gray-600 uppercase">Losses</p>
                                    </div>
                                    <div className="text-center py-3 rounded-xl bg-zinc-800/50 col-span-1">
                                        <p className="text-xl font-bold text-white">{member.win_rate}%</p>
                                        <p className="text-[10px] text-gray-600 uppercase">WR</p>
                                    </div>
                                    <div className="text-center py-3 rounded-xl bg-zinc-800/30 col-span-1 sm:col-span-1">
                                        <p className="text-xl font-bold text-white">{activity.tournaments_entered}</p>
                                        <p className="text-[10px] text-gray-600 uppercase">TX Tournaments</p>
                                    </div>
                                    <div className="text-center py-3 rounded-xl bg-zinc-800/30 col-span-1 sm:col-span-1">
                                        <p className="text-xl font-bold text-white">{activity.tournament_match_wins}</p>
                                        <p className="text-[10px] text-gray-600 uppercase">Bracket Wins</p>
                                    </div>
                                    <div className="text-center py-3 rounded-xl bg-zinc-800/30 col-span-1 sm:col-span-1">
                                        <p className="text-xl font-bold text-white">{activity.events_entered}</p>
                                        <p className="text-[10px] text-gray-600 uppercase">Events</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-white mb-1">
                            TournamentX <span className="text-red-500">History</span>
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">Tournaments competed in on TournamentX</p>

                        {tournaments.length > 0 ? (
                            <div className="space-y-3">
                                {tournaments.map((t) => (
                                    <a
                                        key={t.id}
                                        href={tournamentPublicUrl(tournamentx_url, t.slug)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:border-red-500/30 hover:bg-zinc-900/70 transition-all group"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div>
                                                <h3 className="text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                                                    {t.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    As <span className="text-gray-300">{t.blader_name}</span>
                                                    {' · '}
                                                    {formatLabel[t.format] || t.format}
                                                    {t.start_time && (
                                                        <>
                                                            {' · '}
                                                            {new Date(t.start_time).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {t.placement && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                                        {t.placement}
                                                    </span>
                                                )}
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${statusColors[t.status] || statusColors.pending}`}
                                                >
                                                    {t.status}
                                                </span>
                                                <svg
                                                    className="w-4 h-4 text-zinc-600 group-hover:text-red-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 px-6 py-12 text-center">
                                <p className="text-gray-500 text-sm">No TournamentX entries recorded yet.</p>
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-1">
                            Event <span className="text-red-500">Registrations</span>
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">Shadow Syndicate events signed up for</p>

                        {events.length > 0 ? (
                            <div className="space-y-3">
                                {events.map((ev) => (
                                    <div
                                        key={ev.id}
                                        className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold text-white">{ev.event_title}</h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {ev.blader_name_1}
                                                    {ev.blader_name_2 ? ` / ${ev.blader_name_2}` : ''} ({ev.entry_type})
                                                    {ev.event_date && ` · ${ev.event_date}`}
                                                    {ev.location && ` · ${ev.location}`}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex self-start px-3 py-1 rounded-full text-xs font-semibold border capitalize ${statusColors[ev.status] || ''}`}
                                            >
                                                {ev.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 px-6 py-12 text-center">
                                <p className="text-gray-500 text-sm">No event registrations yet.</p>
                            </div>
                        )}
                    </section>
                </div>

                <SiteFooter />
            </div>
        </>
    );
}
