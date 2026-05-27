import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

interface Stats {
    total_users: number;
    total_tournaments: number;
    active_tournaments: number;
    completed_tournaments: number;
    tournament_admins: number;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    role: string;
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
}: {
    stats: Stats;
    recentUsers: RecentUser[];
    recentTournaments: RecentTournament[];
}) {
    const statCards = [
        {
            label: 'Total Users',
            value: stats.total_users,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: 'from-red-700 to-red-500',
            bgColor: 'bg-red-500/10 border-red-500/20',
            textColor: 'text-red-400',
        },
        {
            label: 'Total Tournaments',
            value: stats.total_tournaments,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            color: 'from-orange-600 to-orange-400',
            bgColor: 'bg-orange-500/10 border-orange-500/20',
            textColor: 'text-orange-400',
        },
        {
            label: 'Active Now',
            value: stats.active_tournaments,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            color: 'from-emerald-600 to-emerald-400',
            bgColor: 'bg-emerald-500/10 border-emerald-500/20',
            textColor: 'text-emerald-400',
        },
        {
            label: 'Tournament Admins',
            value: stats.tournament_admins,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            color: 'from-violet-600 to-violet-400',
            bgColor: 'bg-violet-500/10 border-violet-500/20',
            textColor: 'text-violet-400',
        },
    ];

    return (
        <AdminLayout currentPage="dashboard">
            <Head title="Admin Dashboard" />

            <div className="p-6 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                        <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:bg-zinc-900/60 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} border flex items-center justify-center`}>
                                    <span className={stat.textColor}>{stat.icon}</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Users */}
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
                            <h2 className="text-lg font-semibold text-white">Recent Users</h2>
                            <Link
                                href={route('admin.users')}
                                className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-800/50">
                            {recentUsers.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-500 text-sm">No users yet</div>
                            ) : (
                                recentUsers.map((user) => (
                                    <div key={user.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-zinc-800/30 transition-colors">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {user.role === 'admin' && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase">Admin</span>
                                            )}
                                            {user.can_manage_tournaments && user.role !== 'admin' && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase">T. Admin</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Tournaments */}
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
                            <h2 className="text-lg font-semibold text-white">Recent Tournaments</h2>
                            <Link
                                href={route('admin.tournaments')}
                                className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-800/50">
                            {recentTournaments.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-500 text-sm">No tournaments yet</div>
                            ) : (
                                recentTournaments.map((tournament) => (
                                    <div key={tournament.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-zinc-800/30 transition-colors">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-500/20 to-red-400/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{tournament.name}</p>
                                            <p className="text-xs text-gray-500 truncate">
                                                by {tournament.user?.name ?? 'Unknown'} · {formatLabel[tournament.format] ?? tournament.format}
                                            </p>
                                        </div>
                                        <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[tournament.status] ?? statusColors.pending}`}>
                                            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
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
