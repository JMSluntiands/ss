import TournamentXLogo from '@/Components/TournamentXLogo';
import { Link } from '@inertiajs/react';

type TournamentXBrandProps = {
    collapsed?: boolean;
    href?: string;
    logoClassName?: string;
    className?: string;
};

export default function TournamentXBrand({
    collapsed = false,
    href,
    logoClassName = 'h-9 w-auto shrink-0',
    className = '',
}: TournamentXBrandProps) {
    const home = href ?? route('dashboard');

    return (
        <Link href={home} className={`flex items-center gap-2.5 min-w-0 hover:opacity-90 transition-opacity ${className}`}>
            <TournamentXLogo className={logoClassName} alt="Tournament X" />
            {!collapsed && (
                <span className="text-lg font-black text-white tracking-tight whitespace-nowrap">
                    TOURNAMENT <span className="tx-accent-text">X</span>
                </span>
            )}
        </Link>
    );
}
