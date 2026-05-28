import SiteLogo from '@/Components/SiteLogo';
import { Link } from '@inertiajs/react';

type SiteFooterProps = {
    variant?: 'simple' | 'full';
    className?: string;
};

function DeveloperCredit() {
    return (
        <p className="text-xs text-gray-600">
            Web developers —{' '}
            <span className="text-gray-500">Ronnel C Navarro</span>
            {' '}&amp;{' '}
            <span className="text-gray-500">Rho Anne Cera</span>
        </p>
    );
}

export default function SiteFooter({ variant = 'simple', className = '' }: SiteFooterProps) {
    const year = new Date().getFullYear();

    if (variant === 'full') {
        return (
            <footer className={`border-t border-zinc-800/60 py-12 ${className}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <Link href={route('home')} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                                <SiteLogo className="w-8 h-8 drop-shadow-[0_0_8px_rgba(220,38,38,0.3)]" />
                                <span className="text-sm font-black tracking-tight text-gray-400">
                                    SHADOW <span className="text-red-500/70">SYNDICATE</span>
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                            <Link href={route('members')} className="hover:text-red-400 transition-colors">
                                Members
                            </Link>
                            <Link href={route('events')} className="hover:text-red-400 transition-colors">
                                Event
                            </Link>
                            <Link href={route('blog')} className="hover:text-red-400 transition-colors">
                                Blog
                            </Link>
                        </div>
                        <div className="text-center md:text-right space-y-1">
                            <p className="text-xs text-gray-700">
                                &copy; {year} Shadow Syndicate. All rights reserved.
                            </p>
                            <DeveloperCredit />
                        </div>
                    </div>
                </div>
            </footer>
        );
    }

    return (
        <footer className={`border-t border-zinc-800/60 py-8 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4 py-8">
                <div className="text-center space-y-2">
                    <p className="text-xs text-gray-700">&copy; {year} Shadow Syndicate. All rights reserved.</p>
                    <DeveloperCredit />
                </div>
            </div>
        </footer>
    );
}
