import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

interface Stats {
    total_users: number;
    organizer_accounts: number;
    member_accounts: number;
    total_tournaments: number;
    active_tournaments: number;
    completed_tournaments: number;
    tournament_admins: number;
    starter_plans: number;
    community_plans: number;
    pending_plan_upgrades: number;
    blog_posts: number;
    site_events: number;
    site_members: number;
    jersey_items: number;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    role: string;
    account_type?: string;
    can_manage_tournaments: boolean;
    created_at: string;
}

interface RecentTournament {
    id: number;
    name: string;
    slug: string;
    status: string;
    format: string;
    user: { id: number; name: string } | null;
    created_at: string;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const formatLabel: Record<string, string> = {
    single_elimination: 'Single Elim',
    double_elimination: 'Double Elim',
    round_robin: 'Round Robin',
    swiss: 'Swiss',
};

export default function Dashboard({
    stats,
    recentUsers,
    recentTournaments,
    sites,
}: {
    stats: Stats;
    recentUsers: RecentUser[];
    recentTournaments: RecentTournament[];
    sites: { main_site_url: string; tournamentx_url: string; tournamentx_home: string };
}) {
    return (
        <AdminLayout currentPage="dashboard">
            <Head title="Platform Admin" />

            <div className="p-6 lg:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Platform Hub</h1>
                    <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                    <p className="text-sm text-gray-500 mt-3">Manage Shadow Syndicate and Tournament X from one place.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-5">
                        <h2 className="text-lg font-bold text-white">Shadow Syndicate</h2>
                        <p className="text-xs text-gray-500 mt-1 mb-4">Community site — events, members, blog, shop</p>
                        <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                            <div className="rounded-xl bg-zinc-900/60 py-3 border border-zinc-800/60">
                                <p className="text-xl font-bold text-white">{stats.site_events}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Events</p>
                            </div>
                            <div className="rounded-xl bg-zinc-900/60 py-3 border border-zinc-800/60">
                                <p className="text-xl font-bold text-white">{stats.site_members}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Members</p>
                            </div>
                            <div className="rounded-xl bg-zinc-900/60 py-3 border border-zinc-800/60">
                                <p className="text-xl font-bold text-white">{stats.blog_posts}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Blog</p>
                            </div>
                            <div className="rounded-xl bg-zinc-900/60 py-3 border border-zinc-800/60">
                                <p className="text-xl font-bold text-white">{stats.jersey_items}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Shop</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={sites.main_site_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-red-400 hover:text-red-300"
                            >
                                View site →
                            </a>
                            <Link href={route('admin.content.events')} className="text-xs font-semibold text-gray-400 hover:text-white">
                                Manage content →
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-5">
                        <h2 className="text-lg font-bold text-white">Tournament X</h2>
                        <p className="text-xs text-gray-500 mt-1 mb-4">Organizer app — brackets, judging, plans</p>
                        <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                            <div className="rounded-xl bg-zinc-900/60 py-3 border border-zinc-800/60">
                                <p className="text-xl font-bold text-white">{stats.total_tournaments}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Tournaments</p>
                            </div>
                            <div className="rounded-xl bg-zinc-900/60 py-3 border border-zinc-800/60">
                                <p className="text-xl font-bold text-emerald-400">{stats.active_tournaments}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Active</p>
                            </div>
                            <div className="rounded-xl bg-zinc-900/60 py-3 border border-zinc-800/60">
                                <p className="text-xl font-bold text-cyan-400">{stats.organizer_accounts}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Organizers</p>
                            </div>
                            <div className="rounded-xl bg-zinc-900/60 py-3 border border-zinc-800/60">
                                <p className="text-xl font-bold text-white">{stats.starter_plans}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Starter</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={sites.tournamentx_home}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                            >
                                View site →
                            </a>
                            <Link href={route('admin.platform.pricing')} className="text-xs font-semibold text-gray-400 hover:text-white">
                                Edit pricing →
                            </Link>
                            <Link href={route('admin.users', { account_type: 'organizer' })} className="text-xs font-semibold text-gray-400 hover:text-white">
                                Organizers →
                            </Link>
                            {stats.pending_plan_upgrades > 0 && (
                                <Link href={route('admin.plan-requests')} className="text-xs font-semibold text-amber-400 hover:text-amber-300">
                                    {stats.pending_plan_upgrades} plan request{stats.pending_plan_upgrades === 1 ? '' : 's'} →
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: 'Tournament X organizers', value: stats.organizer_accounts },
                        { label: 'Member logins', value: stats.member_accounts },
                        { label: 'Total accounts', value: stats.total_users },
                        { label: 'Completed tournaments', value: stats.completed_tournaments },
                    ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-4 py-3">
                            <p className="text-lg font-bold text-white">{item.value}</p>
                            <p className="text-[10px] text-gray-500">{item.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
                            <h2 className="text-lg font-semibold text-white">Recent Users</h2>
                            <Link href={route('admin.users')} className="text-xs text-red-400 hover:text-red-300 font-medium">
                                View All
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-800/50">
                            {recentUsers.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-500 text-sm">No users yet</div>
                            ) : (
                                recentUsers.map((user) => {
                                    const accountType = user.account_type ?? (user.role === 'admin' ? 'admin' : 'organizer');
                                    const badgeClass =
                                        accountType === 'member'
                                            ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                            : accountType === 'organizer'
                                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20';
                                    const badgeLabel =
                                        accountType === 'member' ? 'Member' : accountType === 'organizer' ? 'TX' : 'Admin';

                                    return (
                                        <div key={user.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-zinc-800/30">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                                                accountType === 'member'
                                                    ? 'bg-gradient-to-tr from-violet-700 to-violet-500'
                                                    : accountType === 'organizer'
                                                    ? 'bg-gradient-to-tr from-cyan-700 to-cyan-500'
                                                    : 'bg-gradient-to-tr from-red-700 to-red-500'
                                            }`}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${badgeClass}`}>
                                                {badgeLabel}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
                            <h2 className="text-lg font-semibold text-white">Recent Tournaments</h2>
                            <Link href={route('admin.tournaments')} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                                View All
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-800/50">
                            {recentTournaments.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-500 text-sm">No tournaments yet</div>
                            ) : (
                                recentTournaments.map((tournament) => (
                                    <div key={tournament.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-zinc-800/30">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{tournament.name}</p>
                                            <p className="text-xs text-gray-500 truncate">
                                                by {tournament.user?.name ?? 'Unknown'} · {formatLabel[tournament.format] ?? tournament.format}
                                            </p>
                                        </div>
                                        <span
                                            className={`shrink-0 inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[tournament.status] ?? statusColors.pending}`}
                                        >
                                            {tournament.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
