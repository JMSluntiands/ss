import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

interface AdminNavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    active?: boolean;
}

export default function AdminLayout({
    children,
    currentPage = 'dashboard',
}: PropsWithChildren<{ currentPage?: string }>) {
    const { auth, flash } = usePage<any>().props;
    const user = auth.user;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [showFlash, setShowFlash] = useState(true);

    const navItems: AdminNavItem[] = [
        {
            name: 'Dashboard',
            href: route('admin.dashboard'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            active: currentPage === 'dashboard',
        },
        {
            name: 'Users',
            href: route('admin.users'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            active: currentPage === 'users',
        },
        {
            name: 'Tournaments',
            href: route('admin.tournaments'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            active: currentPage === 'tournaments',
        },
    ];

    const contentItems: AdminNavItem[] = [
        {
            name: 'Blog Posts',
            href: route('admin.content.blog'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
            ),
            active: currentPage === 'blog',
        },
        {
            name: 'Events',
            href: route('admin.content.events'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            active: currentPage === 'events',
        },
        {
            name: 'Members',
            href: route('admin.content.members'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            active: currentPage === 'members',
        },
        {
            name: 'Shop',
            href: route('admin.content.jersey'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            active: currentPage === 'jersey',
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 flex">
            {/* Sidebar - Desktop */}
            <aside
                className={`hidden md:flex flex-col border-r border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm transition-all duration-300 ${
                    sidebarCollapsed ? 'w-[72px]' : 'w-64'
                }`}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800/80">
                    {!sidebarCollapsed && (
                        <Link href={route('admin.dashboard')} className="flex items-center gap-2">
                            <span className="text-lg font-black text-white tracking-tight whitespace-nowrap">
                                SHADOW <span className="text-red-500">SYNDICATE</span>
                            </span>
                        </Link>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                    >
                        <svg className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {!sidebarCollapsed && (
                    <div className="px-4 py-3 border-b border-zinc-800/80">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Admin Panel</span>
                        </div>
                    </div>
                )}

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                item.active
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                            } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            title={sidebarCollapsed ? item.name : undefined}
                        >
                            <span className={item.active ? 'text-red-400' : 'text-gray-600'}>{item.icon}</span>
                            {!sidebarCollapsed && <span>{item.name}</span>}
                        </Link>
                    ))}

                    {!sidebarCollapsed && (
                        <div className="pt-4 mt-4 border-t border-zinc-800/50">
                            <p className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider">Website Content</p>
                        </div>
                    )}
                    {sidebarCollapsed && <div className="pt-2 mt-2 border-t border-zinc-800/50" />}

                    {contentItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                item.active
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                            } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            title={sidebarCollapsed ? item.name : undefined}
                        >
                            <span className={item.active ? 'text-red-400' : 'text-gray-600'}>{item.icon}</span>
                            {!sidebarCollapsed && <span>{item.name}</span>}
                        </Link>
                    ))}

                    <div className="pt-4 mt-4 border-t border-zinc-800/50">
                        <Link
                            href={route('dashboard')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-zinc-800/60 border border-transparent transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
                            title={sidebarCollapsed ? 'Back to Site' : undefined}
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                            {!sidebarCollapsed && <span>Back to Site</span>}
                        </Link>
                    </div>
                </nav>

                <div className="border-t border-zinc-800/80 p-3">
                    <div className="relative">
                        <button
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-zinc-800/60 transition-all ${
                                sidebarCollapsed ? 'justify-center' : ''
                            }`}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-red-500/30">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            {!sidebarCollapsed && (
                                <>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                        <p className="text-xs text-red-400/70 truncate">Administrator</p>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                    </svg>
                                </>
                            )}
                        </button>

                        {userDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                                <div className={`absolute z-50 bottom-full mb-2 w-48 rounded-xl bg-zinc-800 border border-zinc-700/50 shadow-xl shadow-black/30 py-1 ${
                                    sidebarCollapsed ? 'left-full ml-2 bottom-0' : 'left-0'
                                }`}>
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-zinc-700/50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-700/50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Log Out
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Mobile sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800/80 transform transition-transform duration-300 md:hidden ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800/80">
                    <Link href={route('admin.dashboard')} className="text-xl font-black text-white tracking-tight">
                        SHADOW <span className="text-red-500">SYNDICATE</span>
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-4 py-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Admin Panel</span>
                    </div>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                item.active
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                            }`}
                        >
                            <span className={item.active ? 'text-red-400' : 'text-gray-600'}>{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    ))}

                    <div className="pt-4 mt-4 border-t border-zinc-800/50">
                        <p className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-wider">Website Content</p>
                    </div>

                    {contentItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                item.active
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                            }`}
                        >
                            <span className={item.active ? 'text-red-400' : 'text-gray-600'}>{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    ))}

                    <div className="pt-4 mt-4 border-t border-zinc-800/50">
                        <Link
                            href={route('dashboard')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-zinc-800/60 border border-transparent transition-all"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                            <span>Back to Site</span>
                        </Link>
                    </div>
                </nav>

                <div className="border-t border-zinc-800/80 p-3">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-red-500/30">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-red-400/70 truncate">Administrator</p>
                        </div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800/60 transition-colors"
                    >
                        Log Out
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <header className="md:hidden flex items-center h-16 px-4 border-b border-zinc-800/80 bg-zinc-900/60">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="ml-3 text-lg font-black text-white tracking-tight">
                        SHADOW <span className="text-red-500">SYNDICATE</span>
                    </span>
                    <span className="ml-2 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase">Admin</span>
                </header>

                {/* Flash messages */}
                {showFlash && flash?.success && (
                    <div className="mx-6 mt-4">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="flex-1">{flash.success}</span>
                            <button onClick={() => setShowFlash(false)} className="text-emerald-400/60 hover:text-emerald-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
                {showFlash && flash?.error && (
                    <div className="mx-6 mt-4">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="flex-1">{flash.error}</span>
                            <button onClick={() => setShowFlash(false)} className="text-red-400/60 hover:text-red-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
