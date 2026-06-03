import SiteLogo from '@/Components/SiteLogo';
import { PageProps } from '@/types';
import { tournamentxDashboardUrl, tournamentxLoginUrl } from '@/utils/tournamentxUrl';
import { Link, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

export type SiteNavPage = 'home' | 'members' | 'events' | 'blog' | 'jersey';

type SiteNavProps = {
    activePage?: SiteNavPage;
    position?: 'sticky' | 'fixed';
    scrolled?: boolean;
    showJoinUs?: boolean;
    onJoinUsClick?: () => void;
    homeHref?: string;
    trailing?: ReactNode;
};

const navLinks: { key: SiteNavPage; label: string; href: () => string }[] = [
    { key: 'home', label: 'Home', href: () => route('home') },
    { key: 'members', label: 'Members', href: () => route('members') },
    { key: 'events', label: 'Event', href: () => route('events') },
    { key: 'blog', label: 'Blog', href: () => route('blog') },
    { key: 'jersey', label: 'Shop', href: () => route('jersey') },
];

function linkClass(active: boolean): string {
    return `px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
        active ? 'text-red-400' : 'text-gray-300 hover:text-white'
    }`;
}

export default function SiteNav({
    activePage,
    position = 'sticky',
    scrolled = true,
    showJoinUs = false,
    onJoinUsClick,
    homeHref,
    trailing,
}: SiteNavProps) {
    const { auth, tournamentx_enabled, tournamentx_url } = usePage<PageProps>().props;
    const [menuOpen, setMenuOpen] = useState(false);

    const loginUrl = tournamentxLoginUrl({ tournamentx_enabled, tournamentx_url });
    const dashboardUrl = tournamentxDashboardUrl({ tournamentx_enabled, tournamentx_url });

    const navClass =
        position === 'fixed'
            ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                  scrolled
                      ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 shadow-lg shadow-black/20'
                      : 'bg-transparent'
              }`
            : 'bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-50';

    const logoHref = homeHref ?? route('home');

    const authAction = auth.user ? (
        <a
            href={dashboardUrl}
            className="shrink-0 px-4 py-2 text-sm font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg transition-colors"
        >
            Dashboard
        </a>
    ) : (
        <a
            href={loginUrl}
            className="shrink-0 px-4 py-2 text-sm font-semibold text-white bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-500 rounded-lg transition-colors"
        >
            Login
        </a>
    );

    return (
        <nav className={`${navClass} w-full`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex items-center justify-between gap-2 sm:gap-3 h-16 sm:h-20 min-w-0 w-full">
                    <Link href={logoHref} className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
                        <SiteLogo className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 drop-shadow-[0_0_12px_rgba(220,38,38,0.4)]" />
                        <span className="text-sm sm:text-lg md:text-xl font-black tracking-tight truncate">
                            SHADOW <span className="text-red-500">SYNDICATE</span>
                        </span>
                    </Link>

                    {trailing ? (
                        <div className="flex items-center gap-3 shrink-0">{trailing}</div>
                    ) : (
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="hidden md:flex items-center gap-0.5 min-w-0">
                                {navLinks.map((item) =>
                                    item.key === 'home' && homeHref?.startsWith('#') ? (
                                        <a
                                            key={item.key}
                                            href={homeHref}
                                            className={linkClass(activePage === item.key)}
                                        >
                                            {item.label}
                                        </a>
                                    ) : (
                                        <Link
                                            key={item.key}
                                            href={item.href()}
                                            className={linkClass(activePage === item.key)}
                                        >
                                            {item.label}
                                        </Link>
                                    ),
                                )}
                            </div>

                            {authAction}

                            {showJoinUs && onJoinUsClick && (
                                <button
                                    type="button"
                                    onClick={onJoinUsClick}
                                    className="hidden sm:inline-flex shrink-0 px-4 sm:px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                                >
                                    Join Us
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            >
                                {menuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {menuOpen && !trailing && (
                    <div className="md:hidden border-t border-zinc-800/60 py-4 space-y-1 bg-zinc-950/95 backdrop-blur-xl">
                        {navLinks.map((item) =>
                            item.key === 'home' && homeHref?.startsWith('#') ? (
                                <a
                                    key={item.key}
                                    href={homeHref}
                                    className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-zinc-800/60 rounded-lg"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <Link
                                    key={item.key}
                                    href={item.href()}
                                    className={`block px-4 py-2.5 text-sm rounded-lg ${
                                        activePage === item.key
                                            ? 'text-red-400 bg-zinc-800/40'
                                            : 'text-gray-300 hover:text-white hover:bg-zinc-800/60'
                                    }`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ),
                        )}
                        {showJoinUs && onJoinUsClick && (
                            <>
                                <div className="border-t border-zinc-800/60 my-2" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onJoinUsClick();
                                    }}
                                    className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-zinc-800/60 rounded-lg"
                                >
                                    Join Us
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
