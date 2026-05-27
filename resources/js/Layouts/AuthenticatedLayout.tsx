import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { PageProps } from '@/types';

interface NavItem {
    name: string;
    href: string;
    icon: ReactNode;
    active?: boolean;
}

export default function Authenticated({
    children,
    currentPage = 'tournaments',
}: PropsWithChildren<{ currentPage?: string }>) {
    const { auth, is_admin, permissions } = usePage<PageProps>().props;
    const user = auth.user;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const navItems: NavItem[] = [
        {
            name: 'Your Tournaments',
            href: route('dashboard'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            active: currentPage === 'tournaments',
        },
        ...(permissions?.can_manage_events ? [{
            name: 'Your Events',
            href: route('my-events'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            active: currentPage === 'events',
        }] : []),
        {
            name: 'Your Communities',
            href: '#',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            active: currentPage === 'communities',
        },
        {
            name: 'Discover',
            href: '#',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            active: currentPage === 'discover',
        },
        {
            name: 'News',
            href: '#',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
            ),
            active: currentPage === 'news',
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
                        <Link href={route('dashboard')} className="text-lg font-black text-white tracking-tight whitespace-nowrap">
                            SHADOW <span className="text-red-500">SYNDICATE</span>
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

                <nav className="flex-1 py-4 px-3 space-y-1">
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

                    {is_admin && (
                        <div className="pt-3 mt-3 border-t border-zinc-800/60">
                            <Link
                                href={route('admin.dashboard')}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all ${
                                    sidebarCollapsed ? 'justify-center' : ''
                                }`}
                                title={sidebarCollapsed ? 'Admin Panel' : undefined}
                            >
                                <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                {!sidebarCollapsed && <span>Admin Panel</span>}
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="border-t border-zinc-800/80 p-3">
                    <div className="relative">
                        <button
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-zinc-800/60 transition-all ${
                                sidebarCollapsed ? 'justify-center' : ''
                            }`}
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            {!sidebarCollapsed && (
                                <>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
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

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800/80 transform transition-transform duration-300 md:hidden ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800/80">
                    <Link href={route('dashboard')} className="text-xl font-black text-white tracking-tight">
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

                <nav className="flex-1 py-4 px-3 space-y-1">
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

                    {is_admin && (
                        <div className="pt-3 mt-3 border-t border-zinc-800/60">
                            <Link
                                href={route('admin.dashboard')}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                            >
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span>Admin Panel</span>
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="border-t border-zinc-800/80 p-3">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-600 truncate">{user.email}</p>
                        </div>
                    </div>
                    <Link
                        href={route('profile.edit')}
                        className="flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-zinc-800/60 transition-colors"
                    >
                        Profile
                    </Link>
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
                </header>

                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
