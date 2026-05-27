import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface UserRecord {
    id: number;
    name: string;
    email: string;
    role: string;
    can_manage_tournaments: boolean;
    can_use_judge: boolean;
    can_score_matches: boolean;
    can_create_tournaments: boolean;
    can_manage_events: boolean;
    tournaments_count: number;
    created_at: string;
}

interface PaginatedUsers {
    data: UserRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

const permDefs = [
    { key: 'can_create_tournaments', label: 'Create Tournaments', desc: 'Can create and organize new tournaments' },
    { key: 'can_manage_tournaments', label: 'Manage Tournaments', desc: 'Can manage all tournaments on the platform' },
    { key: 'can_use_judge', label: 'Judge System', desc: 'Can generate judge codes and use the judge panel' },
    { key: 'can_score_matches', label: 'Score Matches', desc: 'Can report and submit match scores' },
    { key: 'can_manage_events', label: 'Manage Events', desc: 'Can create and manage events from the dashboard' },
] as const;

export default function Users({
    users,
    filters,
}: {
    users: PaginatedUsers;
    filters: { search?: string; role?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [confirmAction, setConfirmAction] = useState<{ user: UserRecord; newRole: string } | null>(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '', email: '', password: '', role: 'user',
        can_create_tournaments: false, can_manage_tournaments: false,
        can_use_judge: false, can_score_matches: false, can_manage_events: false,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users'), { search, role: filters.role }, { preserveState: true });
    };

    const handleFilterRole = (role: string) => {
        router.get(route('admin.users'), { search: filters.search, role: role || undefined }, { preserveState: true });
    };

    const handleTogglePerm = (user: UserRecord, key: string) => {
        router.patch(route('admin.users.permissions', user.id), {
            [key]: !(user as any)[key],
        }, { preserveState: true });
    };

    return (
        <AdminLayout currentPage="users">
            <Head title="Manage Users" />

            <div className="p-6 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Manage Users</h1>
                        <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                        <p className="text-sm text-gray-500 mt-3">
                            {users.total} total user{users.total !== 1 ? 's' : ''}
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

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                            />
                        </div>
                    </form>
                    <div className="flex gap-2">
                        {['', 'user', 'admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => handleFilterRole(role)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                                    (filters.role ?? '') === role
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                        : 'bg-zinc-900 text-gray-500 border-zinc-800 hover:text-white hover:bg-zinc-800'
                                }`}
                            >
                                {role === '' ? 'All' : role === 'admin' ? 'Admins' : 'Users'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* User Cards */}
                <div className="space-y-4">
                    {users.data.length === 0 && (
                        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 px-6 py-12 text-center">
                            <p className="text-gray-500 text-sm">No users found.</p>
                        </div>
                    )}

                    {users.data.map((user) => (
                        <div key={user.id} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden hover:border-zinc-700/80 transition-colors">
                            {/* User Info Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                user.role === 'admin'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-zinc-700/30 text-gray-400 border-zinc-700/50'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{user.tournaments_count} tournament{user.tournaments_count !== 1 ? 's' : ''}</span>
                                        <span className="text-zinc-700">·</span>
                                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {user.role === 'user' ? (
                                        <button
                                            onClick={() => setConfirmAction({ user, newRole: 'admin' })}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                                        >
                                            Make Admin
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmAction({ user, newRole: 'user' })}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                        >
                                            Remove Admin
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Permissions Checklist */}
                            <div className="border-t border-zinc-800/60 px-5 py-4 bg-zinc-900/60">
                                <div className="flex items-center gap-2 mb-3">
                                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Access Permissions</span>
                                </div>

                                {user.role === 'admin' ? (
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
                                ) : (
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
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
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

            {/* Role Confirm Modal */}
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

            {/* Add User Modal */}
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

                                {/* Permissions Checklist */}
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
