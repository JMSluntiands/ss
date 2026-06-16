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
    { key: 'can_create_tournaments', short: 'Create' },
    { key: 'can_manage_tournaments', short: 'Manage' },
    { key: 'can_use_judge', short: 'Judge' },
    { key: 'can_score_matches', short: 'Score' },
    { key: 'can_manage_events', short: 'Events' },
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

function userPerm(user: UserRecord, key: string): boolean {
    return Boolean((user as unknown as Record<string, boolean>)[key]);
}

function resolveAccountType(user: UserRecord): string {
    if (user.account_type === 'organizer' || user.account_type === 'member' || user.account_type === 'admin') {
        return user.account_type;
    }

    return user.role === 'admin' ? 'admin' : 'organizer';
}

function UserAvatar({ user, accountType }: { user: UserRecord; accountType: string }) {
    return (
        <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                accountType === 'organizer'
                    ? 'bg-gradient-to-tr from-cyan-700 to-cyan-500'
                    : accountType === 'member'
                    ? 'bg-gradient-to-tr from-violet-700 to-violet-500'
                    : 'bg-gradient-to-tr from-red-700 to-red-500'
            }`}
        >
            {user.name.charAt(0).toUpperCase()}
        </div>
    );
}

function AccountBadge({ accountType }: { accountType: string }) {
    const badge = accountTypeBadge[accountType] ?? accountTypeBadge.organizer;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border whitespace-nowrap ${badge.className}`}>
            {badge.label}
        </span>
    );
}

function PermissionToggles({
    user,
    onToggle,
}: {
    user: UserRecord;
    onToggle: (user: UserRecord, key: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-1">
            {permDefs.map(({ key, short }) => {
                const enabled = userPerm(user, key);

                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onToggle(user, key)}
                        title={short}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                            enabled
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                                : 'bg-zinc-800/60 text-gray-500 border-zinc-700/50 hover:text-gray-300'
                        }`}
                    >
                        {short}
                    </button>
                );
            })}
        </div>
    );
}

function TableShell({
    title,
    subtitle,
    accent,
    count,
    children,
    emptyMessage,
}: {
    title: string;
    subtitle: string;
    accent: 'cyan' | 'violet';
    count: number;
    children: React.ReactNode;
    emptyMessage: string;
}) {
    const borderClass = accent === 'cyan' ? 'border-cyan-500/20' : 'border-violet-500/20';
    const headerBg = accent === 'cyan' ? 'bg-cyan-500/5' : 'bg-violet-500/5';
    const titleClass = accent === 'cyan' ? 'text-cyan-300' : 'text-violet-300';

    return (
        <section className={`rounded-2xl border ${borderClass} overflow-hidden`}>
            <div className={`px-5 py-4 border-b ${borderClass} ${headerBg}`}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className={`text-sm font-bold uppercase tracking-wider ${titleClass}`}>{title}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{count} account{count !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {count === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-gray-500">{emptyMessage}</div>
            ) : (
                <div className="overflow-x-auto">{children}</div>
            )}
        </section>
    );
}

function OrganizerTable({
    users,
    planOptions,
    onTogglePerm,
    onMakeAdmin,
}: {
    users: UserRecord[];
    planOptions: Array<{ value: string; label: string }>;
    onTogglePerm: (user: UserRecord, key: string) => void;
    onMakeAdmin: (user: UserRecord) => void;
}) {
    return (
        <TableShell
            title="Tournament X Organizers"
            subtitle="Accounts that run tournaments, judge panels, and live scoring"
            accent="cyan"
            count={users.length}
            emptyMessage="No organizer accounts found."
        >
            <table className="w-full min-w-[900px] text-sm">
                <thead>
                    <tr className="border-b border-zinc-800/80 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Plan</th>
                        <th className="px-5 py-3">Tournaments</th>
                        <th className="px-5 py-3">Joined</th>
                        <th className="px-5 py-3">Permissions</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-cyan-500/[0.03] transition-colors">
                            <td className="px-5 py-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <UserAvatar user={user} accountType="organizer" />
                                    <span className="font-medium text-white truncate">{user.name}</span>
                                </div>
                            </td>
                            <td className="px-5 py-3 text-gray-400 truncate max-w-[200px]">{user.email}</td>
                            <td className="px-5 py-3">
                                {planOptions.length > 0 ? (
                                    <select
                                        value={user.tournamentx_plan ?? 'starter'}
                                        onChange={(e) =>
                                            router.patch(route('admin.users.plan', user.id), {
                                                tournamentx_plan: e.target.value,
                                            }, { preserveState: true })
                                        }
                                        className="rounded-lg border border-cyan-500/30 bg-zinc-900 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                                    >
                                        {planOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="text-xs text-gray-500">—</span>
                                )}
                            </td>
                            <td className="px-5 py-3 text-gray-400">{user.tournaments_count}</td>
                            <td className="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">
                                {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-3">
                                <PermissionToggles user={user} onToggle={onTogglePerm} />
                            </td>
                            <td className="px-5 py-3 text-right">
                                <button
                                    type="button"
                                    onClick={() => onMakeAdmin(user)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all whitespace-nowrap"
                                >
                                    Make Admin
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </TableShell>
    );
}

function CommunityTable({
    users,
    onRemoveAdmin,
}: {
    users: UserRecord[];
    onRemoveAdmin: (user: UserRecord) => void;
}) {
    return (
        <TableShell
            title="Members & Admins"
            subtitle="Shadow Syndicate community logins and platform admin accounts"
            accent="violet"
            count={users.length}
            emptyMessage="No member or admin accounts found."
        >
            <table className="w-full min-w-[800px] text-sm">
                <thead>
                    <tr className="border-b border-zinc-800/80 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3">Blader / Roster</th>
                        <th className="px-5 py-3">Joined</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                    {users.map((user) => {
                        const accountType = resolveAccountType(user);
                        const isAdmin = accountType === 'admin' || user.role === 'admin';
                        const blader = user.blader_name || user.site_member?.name;
                        const rosterMeta = [
                            user.site_member?.rank,
                            user.site_member?.role,
                        ].filter(Boolean).join(' · ');

                        return (
                            <tr key={user.id} className="hover:bg-violet-500/[0.03] transition-colors">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <UserAvatar user={user} accountType={accountType} />
                                        <span className="font-medium text-white truncate">{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-gray-400 truncate max-w-[200px]">{user.email}</td>
                                <td className="px-5 py-3">
                                    <AccountBadge accountType={accountType} />
                                </td>
                                <td className="px-5 py-3 text-xs text-gray-500 max-w-[180px]">
                                    {blader ? (
                                        <div>
                                            <span className="text-violet-400/90">{blader}</span>
                                            {rosterMeta && <span className="block text-gray-600 mt-0.5">{rosterMeta}</span>}
                                        </div>
                                    ) : isAdmin ? (
                                        <span className="text-red-400/70">Full platform access</span>
                                    ) : (
                                        <span className="text-gray-600">—</span>
                                    )}
                                </td>
                                <td className="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-5 py-3 text-right">
                                    {isAdmin ? (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveAdmin(user)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all whitespace-nowrap"
                                        >
                                            Remove Admin
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-600">—</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </TableShell>
    );
}

function FilteredUserTable({
    users,
    planOptions,
    activeFilter,
    onTogglePerm,
    onMakeAdmin,
    onRemoveAdmin,
}: {
    users: UserRecord[];
    planOptions: Array<{ value: string; label: string }>;
    activeFilter: AccountTypeFilter;
    onTogglePerm: (user: UserRecord, key: string) => void;
    onMakeAdmin: (user: UserRecord) => void;
    onRemoveAdmin: (user: UserRecord) => void;
}) {
    const isOrganizer = activeFilter === 'organizer';
    const accent = isOrganizer ? 'cyan' : 'violet';
    const borderClass = accent === 'cyan' ? 'border-cyan-500/20' : 'border-violet-500/20';

    return (
        <div className={`rounded-2xl border ${borderClass} overflow-hidden`}>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                    <thead>
                        <tr className="border-b border-zinc-800/80 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-zinc-900/40">
                            <th className="px-5 py-3">User</th>
                            <th className="px-5 py-3">Email</th>
                            {isOrganizer && <th className="px-5 py-3">Plan</th>}
                            {isOrganizer && <th className="px-5 py-3">Tournaments</th>}
                            {!isOrganizer && <th className="px-5 py-3">Type</th>}
                            {!isOrganizer && <th className="px-5 py-3">Blader / Roster</th>}
                            <th className="px-5 py-3">Joined</th>
                            {isOrganizer && <th className="px-5 py-3">Permissions</th>}
                            <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                        {users.map((user) => {
                            const accountType = resolveAccountType(user);
                            const isAdmin = accountType === 'admin' || user.role === 'admin';
                            const blader = user.blader_name || user.site_member?.name;

                            return (
                                <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <UserAvatar user={user} accountType={accountType} />
                                            <span className="font-medium text-white truncate">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-gray-400 truncate max-w-[200px]">{user.email}</td>
                                    {isOrganizer && (
                                        <td className="px-5 py-3">
                                            <select
                                                value={user.tournamentx_plan ?? 'starter'}
                                                onChange={(e) =>
                                                    router.patch(route('admin.users.plan', user.id), {
                                                        tournamentx_plan: e.target.value,
                                                    }, { preserveState: true })
                                                }
                                                className="rounded-lg border border-cyan-500/30 bg-zinc-900 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                                            >
                                                {planOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    )}
                                    {isOrganizer && (
                                        <td className="px-5 py-3 text-gray-400">{user.tournaments_count}</td>
                                    )}
                                    {!isOrganizer && (
                                        <td className="px-5 py-3">
                                            <AccountBadge accountType={accountType} />
                                        </td>
                                    )}
                                    {!isOrganizer && (
                                        <td className="px-5 py-3 text-xs text-violet-400/90 truncate max-w-[180px]">
                                            {blader ?? (isAdmin ? 'Full platform access' : '—')}
                                        </td>
                                    )}
                                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    {isOrganizer && (
                                        <td className="px-5 py-3">
                                            <PermissionToggles user={user} onToggle={onTogglePerm} />
                                        </td>
                                    )}
                                    <td className="px-5 py-3 text-right">
                                        {isAdmin ? (
                                            <button
                                                type="button"
                                                onClick={() => onRemoveAdmin(user)}
                                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                            >
                                                Remove Admin
                                            </button>
                                        ) : isOrganizer ? (
                                            <button
                                                type="button"
                                                onClick={() => onMakeAdmin(user)}
                                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                                            >
                                                Make Admin
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-600">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Users({
    layout = 'split',
    users,
    organizers = [],
    community = [],
    filters,
    counts,
    planOptions = [],
}: {
    layout?: 'split' | 'single';
    users: PaginatedUsers | null;
    organizers?: UserRecord[];
    community?: UserRecord[];
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
    const isSplitView = layout === 'split' && !activeFilter;

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
            [key]: !userPerm(user, key),
        }, { preserveState: true });
    };

    const filterDescription = isSplitView
        ? 'Organizers and community accounts shown in separate tables'
        : activeFilter === 'organizer'
        ? 'Tournament X organizer accounts'
        : activeFilter === 'member'
        ? 'Shadow Syndicate member logins'
        : activeFilter === 'admin'
        ? 'Platform admin accounts'
        : 'All login accounts';

    const displayedTotal = isSplitView
        ? organizers.length + community.length
        : users?.total ?? 0;

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
                            Showing {displayedTotal} account{displayedTotal !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setNewUser({
                                name: '', email: '', password: '', role: 'user',
                                can_create_tournaments: false, can_manage_tournaments: false,
                                can_use_judge: false, can_score_matches: false, can_manage_events: false,
                            });
                            setShowAddUser(true);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-500 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-red-500/40 hover:brightness-110 active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add User
                    </button>
                </div>

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

                {isSplitView ? (
                    <div className="space-y-8">
                        <OrganizerTable
                            users={organizers}
                            planOptions={planOptions}
                            onTogglePerm={handleTogglePerm}
                            onMakeAdmin={(user) => setConfirmAction({ user, newRole: 'admin' })}
                        />
                        <CommunityTable
                            users={community}
                            onRemoveAdmin={(user) => setConfirmAction({ user, newRole: 'user' })}
                        />
                    </div>
                ) : users && users.data.length > 0 ? (
                    <FilteredUserTable
                        users={users.data}
                        planOptions={planOptions}
                        activeFilter={activeFilter}
                        onTogglePerm={handleTogglePerm}
                        onMakeAdmin={(user) => setConfirmAction({ user, newRole: 'admin' })}
                        onRemoveAdmin={(user) => setConfirmAction({ user, newRole: 'user' })}
                    />
                ) : (
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 px-6 py-12 text-center">
                        <p className="text-gray-500 text-sm">No accounts found for this filter.</p>
                    </div>
                )}

                {!isSplitView && users && users.last_page > 1 && (
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
                                        <div className="flex flex-wrap gap-1.5">
                                            {permDefs.map(({ key, short }) => {
                                                const enabled = userPerm(newUser as unknown as UserRecord, key);

                                                return (
                                                    <button
                                                        type="button"
                                                        key={key}
                                                        onClick={() => setNewUser({ ...newUser, [key]: !enabled })}
                                                        className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${
                                                            enabled
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                                                : 'bg-zinc-800/60 text-gray-500 border-zinc-700/50'
                                                        }`}
                                                    >
                                                        {short}
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
