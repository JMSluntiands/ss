import OptimizedImage from '@/Components/OptimizedImage';
import SiteLogo from '@/Components/SiteLogo';
import { PageProps, User } from '@/types';
import { accountHomeUrl, memberDisplayName, memberLoginUrl } from '@/utils/memberUrl';
import { memberImageSrc } from '@/utils/publicStorage';
import { Link, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

export type SiteNavPage = 'home' | 'members' | 'events' | 'blog' | 'jersey';

type SiteNavProps = {
    activePage?: SiteNavPage;
    position?: 'sticky' | 'fixed';
    scrolled?: boolean;
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

function memberAvatar(user: User, sizeClass = 'h-9 w-9') {
    const imageUrl = memberImageSrc(user.site_member_image_url ?? null, 'thumb')
        ?? memberImageSrc(user.site_member_image_url ?? null, 'full');

    if (imageUrl) {
        return (
            <OptimizedImage
                src={imageUrl}
                fallbackSrc={memberImageSrc(user.site_member_image_url ?? null, 'full') ?? undefined}
                alt={memberDisplayName(user)}
                className={`${sizeClass} shrink-0 rounded-full object-cover border border-zinc-700/50`}
            />
        );
    }

    return (
        <span
            className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-red-500/20 text-sm font-bold text-red-400`}
        >
            {memberDisplayName(user).charAt(0).toUpperCase()}
        </span>
    );
}

function linkClass(active: boolean): string {
    return `px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
        active ? 'text-red-400' : 'text-gray-300 hover:text-white'
    }`;
}

export default function SiteNav({
    activePage,
    position = 'sticky',
    scrolled = true,
    homeHref,
    trailing,
}: SiteNavProps) {
    const page = usePage<PageProps>();
    const { auth, tournamentx_enabled, tournamentx_url, is_member_portal } = page.props;
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const loginUrl = memberLoginUrl();
    const profileUrl = auth.user
        ? accountHomeUrl({ is_member_portal, tournamentx_enabled, tournamentx_url })
        : memberLoginUrl();

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
        <div className="relative shrink-0">
            {profileOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} aria-hidden />
            )}
            <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-2 max-w-[10rem] sm:max-w-[12rem] py-1 text-left hover:opacity-90 transition-opacity"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
            >
                {memberAvatar(auth.user)}
                <span className="min-w-0 text-sm font-semibold text-white truncate">
                    {memberDisplayName(auth.user)}
                </span>
                <svg
                    className={`w-4 h-4 shrink-0 text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {profileOpen && (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-zinc-800/80 bg-zinc-900 py-1 shadow-xl shadow-black/40"
                >
                    <a
                        href={profileUrl}
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                        onClick={() => setProfileOpen(false)}
                    >
                        {is_member_portal ? 'Profile' : 'Dashboard'}
                    </a>
                    {!is_member_portal && tournamentx_enabled && tournamentx_url && (
                        <a
                            href={`${tournamentx_url.replace(/\/$/, '')}/profile`}
                            role="menuitem"
                            className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                            onClick={() => setProfileOpen(false)}
                        >
                            Account settings
                        </a>
                    )}
                    <Link
                        href={route('member.logout', undefined, false)}
                        method="post"
                        as="button"
                        role="menuitem"
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-red-400 hover:bg-zinc-800/60 transition-colors"
                        onClick={() => setProfileOpen(false)}
                    >
                        Logout
                    </Link>
                </div>
            )}
        </div>
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
                    </div>
                )}
            </div>
        </nav>
    );
}
