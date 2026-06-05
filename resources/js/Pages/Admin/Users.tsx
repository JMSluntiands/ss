import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface SiteMemberSummary {
    id: number;
    user_id: number;
    name: string;
    rank: string | null;
    role: string | null;
}

interface UserRecord {
    id: number;
    name: string;
    email: string;
    role: string;
    account_type: string;
    blader_name?: string | null;
    tournamentx_plan?: string;
    can_manage_tournaments: boolean;
    can_use_judge: boolean;
    can_score_matches: boolean;
    can_create_tournaments: boolean;
    can_manage_events: boolean;
    tournaments_count: number;
    created_at: string;
    site_member?: SiteMemberSummary | null;
}

interface PaginatedUsers {
    data: UserRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

type AccountTypeFilter = '' | 'organizer' | 'member' | 'admin';

const permDefs = [
    { key: 'can_create_tournaments', label: 'Create Tournaments', desc: 'Can create and organize new tournaments' },
    { key: 'can_manage_tournaments', label: 'Manage Tournaments', desc: 'Can manage all tournaments on the platform' },
    { key: 'can_use_judge', label: 'Judge System', desc: 'Can generate judge codes and use the judge panel' },
    { key: 'can_score_matches', label: 'Score Matches', desc: 'Can report and submit match scores' },
    { key: 'can_manage_events', label: 'Manage Events', desc: 'Can create and manage events from the dashboard' },
] as const;

const accountTypeBadge: Record<string, { label: string; className: string }> = {
    organizer: {
        label: 'Tournament X',
        className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    member: {
        label: 'Member',
        className: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    admin: {
        label: 'Admin',
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
};

const accountFilters: Array<{ value: AccountTypeFilter; label: string; countKey: keyof AccountCounts }> = [
    { value: '', label: 'All accounts', countKey: 'all' },
    { value: 'organizer', label: 'Tournament X', countKey: 'organizer' },
    { value: 'member', label: 'Members', countKey: 'member' },
    { value: 'admin', label: 'Admins', countKey: 'admin' },
];

interface AccountCounts {
    all: number;
    organizer: number;
    member: number;
    admin: number;
}

function resolveAccountType(user: UserRecord): string {
    if (user.account_type === 'organizer' || user.account_type === 'member' || user.account_type === 'admin') {
        return user.account_type;
    }

    return user.role === 'admin' ? 'admin' : 'organizer';
}

export default function Users({
    users,
    filters,
    counts,
    planOptions = [],
}: {
    users: PaginatedUsers;
    filters: { search?: string; account_type?: string };
    counts: AccountCounts;
    planOptions?: Array<{ value: string; label: string }>;
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [confirmAction, setConfirmAction] = useState<{ user: UserRecord; newRole: string } | null>(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '', email: '', password: '', role: 'user',
        can_create_tournaments: false, can_manage_tournaments: false,
        can_use_judge: false, can_score_matches: false, can_manage_events: false,
    });

    const activeFilter = (filters.account_type ?? '') as AccountTypeFilter;

    const navigate = (params: { search?: string; account_type?: string }) => {
        router.get(route('admin.users'), {
            search: params.search ?? filters.search ?? undefined,
            account_type: params.account_type || undefined,
        }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        navigate({ search, account_type: activeFilter });
    };

    const handleFilterAccountType = (accountType: AccountTypeFilter) => {
        navigate({ search: filters.search, account_type: accountType });
    };

    const handleTogglePerm = (user: UserRecord, key: string) => {
        router.patch(route('admin.users.permissions', user.id), {
            [key]: !(user as any)[key],
        }, { preserveState: true });
    };

    const filterDescription =
        activeFilter === 'organizer'
            ? 'Organizer accounts registered on Tournament X'
            : activeFilter === 'member'
            ? 'Shadow Syndicate community member logins'
            : activeFilter === 'admin'
            ? 'Platform admin accounts'
            : 'All login accounts across Tournament X and Shadow Syndicate';

    return (
        <AdminLayout currentPage="users">
            <Head title="Manage Users" />

            <div className="p-6 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Manage Users</h1>
                        <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                        <p className="text-sm text-gray-500 mt-3">{filterDescription}</p>
                        <p className="text-xs text-gray-600 mt-1">
                            Showing {users.total} account{users.total !== 1 ? 's' : ''}
                            {activeFilter === 'organizer' && ` · ${counts.organizer} Tournament X total`}
                            {activeFilter === 'member' && ` · ${counts.member} members total`}
                        </p>
                    </div>
                    <button
                        onClick={() => { setNewUser({ name: '', email: '', password: '', role: 'user', can_create_tournaments: false, can_manage_tournaments: false, can_use_judge: false, can_score_matches: false, can_manage_events: false }); setShowAddUser(true); }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-500 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-red-500/40 hover:brightness-110 active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add User
                    </button>
                </div>

                {/* Account type tabs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
                    {accountFilters.map(({ value, label, countKey }) => {
                        const active = activeFilter === value;

                        return (
                            <button
                                key={value || 'all'}
                                onClick={() => handleFilterAccountType(value)}
                                className={`rounded-xl border px-4 py-3 text-left transition-all ${
                                    active
                                        ? value === 'organizer'
                                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                                            : value === 'member'
                                            ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                                            : value === 'admin'
                                            ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                            : 'bg-zinc-800/80 border-zinc-600 text-white'
                                        : 'bg-zinc-900 border-zinc-800 text-gray-500 hover:text-white hover:border-zinc-700'
                                }`}
                            >
                                <p className="text-lg font-bold">{counts[countKey]}</p>
                                <p className="text-xs font-medium mt-0.5">{label}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or blader name..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                        />
                    </div>
                </form>

                {/* User Cards */}
                <div className="space-y-4">
                    {users.data.length === 0 && (
                        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 px-6 py-12 text-center">
                            <p className="text-gray-500 text-sm">No accounts found for this filter.</p>
                        </div>
                    )}

                    {users.data.map((user) => {
                        const accountType = resolveAccountType(user);
                        const badge = accountTypeBadge[accountType] ?? accountTypeBadge.organizer;
                        const isOrganizer = accountType === 'organizer';
                        const isMember = accountType === 'member';
                        const isAdmin = accountType === 'admin';

                        return (
                            <div
                                key={user.id}
                                className={`rounded-2xl border overflow-hidden transition-colors ${
                                    isOrganizer
                                        ? 'border-cyan-500/20 bg-cyan-500/[0.03] hover:border-cyan-500/35'
                                        : isMember
                                        ? 'border-violet-500/20 bg-violet-500/[0.03] hover:border-violet-500/35'
                                        : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700/80'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                                            isOrganizer
                                                ? 'bg-gradient-to-tr from-cyan-700 to-cyan-500'
                                                : isMember
                                                ? 'bg-gradient-to-tr from-violet-700 to-violet-500'
                                                : 'bg-gradient-to-tr from-red-700 to-red-500'
                                        }`}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badge.className}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            {isMember && (user.blader_name || user.site_member?.name) && (
                                                <p className="text-xs text-violet-400/80 mt-0.5">
                                                    Blader: {user.blader_name || user.site_member?.name}
                                                    {user.site_member?.rank ? ` · ${user.site_member.rank}` : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            {isOrganizer && (
                                                <>
                                                    <span>{user.tournaments_count} tournament{user.tournaments_count !== 1 ? 's' : ''}</span>
                                                    <span className="text-zinc-700">·</span>
                                                </>
                                            )}
                                            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {isAdmin || user.role === 'admin' ? (
                                            <button
                                                onClick={() => setConfirmAction({ user, newRole: 'user' })}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                            >
                                                Remove Admin
                                            </button>
                                        ) : isOrganizer ? (
                                            <button
                                                onClick={() => setConfirmAction({ user, newRole: 'admin' })}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                                            >
                                                Make Admin
                                            </button>
                                        ) : null}
                                    </div>
                                </div>

                                {isOrganizer && planOptions.length > 0 && (
                                    <div className="border-t border-cyan-500/15 px-5 py-4 bg-cyan-500/5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider">Tournament X plan</p>
                                                <p className="text-xs text-gray-600 mt-0.5">Controls player limits, judge panel, and live scoring.</p>
                                            </div>
                                            <select
                                                value={user.tournamentx_plan ?? 'starter'}
                                                onChange={(e) =>
                                                    router.patch(route('admin.users.plan', user.id), {
                                                        tournamentx_plan: e.target.value,
                                                    }, { preserveState: true })
                                                }
                                                className="rounded-xl border border-cyan-500/30 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                                            >
                                                {planOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {isMember && (
                                    <div className="border-t border-violet-500/15 px-5 py-4 bg-violet-500/5">
                                        <p className="text-[10px] font-bold text-violet-400/80 uppercase tracking-wider">Shadow Syndicate member</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Community login only — profile, events, and stats on the main site. Not a Tournament X organizer account.
                                        </p>
                                        {user.site_member && (
                                            <p className="text-xs text-gray-600 mt-2">
                                                Roster: {user.site_member.name}
                                                {user.site_member.role ? ` · ${user.site_member.role}` : ''}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {isOrganizer && (
                                    <div className="border-t border-zinc-800/60 px-5 py-4 bg-zinc-900/60">
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Tournament X permissions</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                            {permDefs.map(({ key, label, desc }) => {
                                                const enabled = (user as any)[key] as boolean;
                                                return (
                                                    <button
                                                        key={key}
                                                        onClick={() => handleTogglePerm(user, key)}
                                                        className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-all border ${
                                                            enabled
                                                                ? 'bg-emerald-500/5 border-emerald-500/15 hover:bg-emerald-500/10'
                                                                : 'bg-zinc-800/30 border-zinc-700/30 hover:bg-zinc-800/60'
                                                        }`}
                                                    >
                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                                            enabled
                                                                ? 'bg-emerald-500 border-emerald-500'
                                                                : 'border-zinc-600 bg-transparent'
                                                        }`}>
                                                            {enabled && (
                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`text-xs font-semibold ${enabled ? 'text-emerald-400' : 'text-gray-400'}`}>{label}</p>
                                                            <p className="text-[10px] text-gray-600 leading-tight">{desc}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {isAdmin && (
                                    <div className="border-t border-zinc-800/60 px-5 py-4 bg-zinc-900/60">
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Platform admin access</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                            {permDefs.map(({ label }) => (
                                                <div key={label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10">
                                                    <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-xs font-medium text-red-400">{label}</span>
                                                    <span className="ml-auto text-[9px] text-red-400/50 uppercase font-bold">Admin</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {users.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-6">
                        {users.links.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                disabled={!link.url}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    link.active
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        : link.url
                                        ? 'text-gray-500 hover:text-white hover:bg-zinc-800'
                                        : 'text-gray-700 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {confirmAction && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
                    <div className="fixed z-50 inset-0 flex items-center justify-center p-4">
                        <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white">Confirm Action</h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-6">
                                {confirmAction.newRole === 'admin'
                                    ? `Make "${confirmAction.user.name}" an admin? They will have full access to all features.`
                                    : `Remove admin from "${confirmAction.user.name}"? Their permissions will be based on individual toggles.`
                                }
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        router.patch(route('admin.users.role', confirmAction.user.id), { role: confirmAction.newRole }, { preserveState: true });
                                        setConfirmAction(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showAddUser && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddUser(false)} />
                    <div className="fixed z-50 inset-0 flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white">Add New User</h3>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    router.post(route('admin.users.store'), newUser, {
                                        preserveState: true,
                                        onSuccess: () => setShowAddUser(false),
                                    });
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        required
                                        placeholder="Full name"
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                        placeholder="user@shadowsyndicate.com"
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        minLength={6}
                                        placeholder="Minimum 6 characters"
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Access Permissions</label>
                                    {newUser.role === 'admin' ? (
                                        <p className="text-xs text-red-400/70 italic px-1">Admin role has full access to all features.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {permDefs.map(({ key, label, desc }) => {
                                                const enabled = (newUser as any)[key] as boolean;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={key}
                                                        onClick={() => setNewUser({ ...newUser, [key]: !enabled })}
                                                        className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-all border ${
                                                            enabled
                                                                ? 'bg-emerald-500/5 border-emerald-500/15 hover:bg-emerald-500/10'
                                                                : 'bg-zinc-800/30 border-zinc-700/30 hover:bg-zinc-800/60'
                                                        }`}
                                                    >
                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                                            enabled
                                                                ? 'bg-emerald-500 border-emerald-500'
                                                                : 'border-zinc-600 bg-transparent'
                                                        }`}>
                                                            {enabled && (
                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className={`text-xs font-semibold ${enabled ? 'text-emerald-400' : 'text-gray-400'}`}>{label}</p>
                                                            <p className="text-[10px] text-gray-600 leading-tight">{desc}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddUser(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all"
                                    >
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
