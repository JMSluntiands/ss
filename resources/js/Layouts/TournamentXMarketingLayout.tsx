import SiteLogo from '@/Components/SiteLogo';
import TournamentXLogo from '@/Components/TournamentXLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

type TournamentXMarketingLayoutProps = PropsWithChildren<{
    loginUrl: string;
    registerUrl: string;
    homeUrl: string;
    mainSiteUrl: string;
}>;

const navItems = [
    { href: '#promo', label: 'Promo' },
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#how-it-works', label: 'How it works' },
];

export default function TournamentXMarketingLayout({
    children,
    loginUrl,
    registerUrl,
    homeUrl,
    mainSiteUrl,
}: TournamentXMarketingLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="guest-tx-theme min-h-screen bg-zinc-950 text-white flex flex-col">
            <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
                    <Link href={homeUrl} className="flex items-center gap-2 shrink-0">
                        <TournamentXLogo className="h-8 sm:h-9 w-auto" alt="Tournament X" />
                    </Link>

                    <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-400">
                        {navItems.map((item) => (
                            <a key={item.href} href={item.href} className="hover:text-cyan-300 transition-colors">
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href={loginUrl}
                            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            Log in
                        </a>
                        <a
                            href={registerUrl}
                            className="px-4 py-2 text-sm font-semibold rounded-lg tx-btn text-white"
                        >
                            Register
                        </a>
                        <button
                            type="button"
                            className="lg:hidden p-2 text-gray-400 hover:text-white"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="lg:hidden border-t border-zinc-800/60 px-4 py-4 space-y-1 bg-zinc-950/98">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="block py-2.5 text-sm text-gray-300 hover:text-white"
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.label}
                            </a>
                        ))}
                        <a href={loginUrl} className="block py-2.5 text-sm font-medium text-cyan-400">
                            Log in
                        </a>
                    </div>
                )}
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-zinc-800/60 bg-zinc-900/30 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
                        <div>
                            <TournamentXLogo className="h-10 w-auto mb-4" alt="Tournament X" />
                            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                                Tournament management for Beyblade X — brackets, judging, and live results.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Product</p>
                                <a href="#features" className="block text-gray-400 hover:text-cyan-300">
                                    Features
                                </a>
                                <a href="#pricing" className="block text-gray-400 hover:text-cyan-300">
                                    Pricing
                                </a>
                                <a href={registerUrl} className="block text-gray-400 hover:text-cyan-300">
                                    Register
                                </a>
                                <a href={loginUrl} className="block text-gray-400 hover:text-cyan-300">
                                    Log in
                                </a>
                            </div>
                            {mainSiteUrl && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Community</p>
                                    <a href={mainSiteUrl} className="block text-gray-400 hover:text-red-400">
                                        Shadow Syndicate
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 uppercase tracking-wider">Powered by</span>
                            {mainSiteUrl ? (
                                <a
                                    href={mainSiteUrl}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-red-400 transition-colors"
                                >
                                    <SiteLogo className="w-7 h-7" />
                                    Shadow Syndicate
                                </a>
                            ) : (
                                <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                                    <SiteLogo className="w-7 h-7" />
                                    Shadow Syndicate
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 text-center sm:text-right">
                            © {new Date().getFullYear()} Tournament X · Subdomain product of Shadow Syndicate
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
