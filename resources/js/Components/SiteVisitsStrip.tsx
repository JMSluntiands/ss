import SiteLogo from '@/Components/SiteLogo';
import VisitorCounter from '@/Components/VisitorCounter';
import { Link } from '@inertiajs/react';

type SiteVisitsStripProps = {
    className?: string;
    brandLinkHome?: boolean;
    /** `lg-only`: hide brand on small screens (e.g. GuestLayout where mobile header already shows the logo). */
    brandVisibility?: 'always' | 'lg-only';
};

/**
 * Brand row + site visit counter, meant to sit directly under the main hero or sticky nav (not in the footer).
 */
export default function SiteVisitsStrip({
    className = '',
    brandLinkHome = true,
    brandVisibility = 'always',
}: SiteVisitsStripProps) {
    const brand = (
        <>
            <SiteLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 drop-shadow-[0_0_10px_rgba(220,38,38,0.35)]" />
            <span className="text-base sm:text-lg font-black tracking-tight text-gray-300">
                SHADOW <span className="text-red-500">SYNDICATE</span>
            </span>
        </>
    );

    const brandWrapClass = brandVisibility === 'lg-only' ? 'hidden lg:flex' : 'flex';
    const rowJustify =
        brandVisibility === 'lg-only'
            ? 'justify-center lg:justify-between'
            : 'justify-between';

    return (
        <div
            className={`border-b border-red-900/20 bg-gradient-to-r from-zinc-950 via-black/80 to-zinc-950 ${className}`}
        >
            <div
                className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex flex-col lg:flex-row items-center gap-4 ${rowJustify}`}
            >
                <div
                    className={`${brandWrapClass} items-center gap-3 w-full lg:w-auto justify-center lg:justify-start`}
                >
                    {brandLinkHome ? (
                        <Link href={route('home')} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                            {brand}
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3">{brand}</div>
                    )}
                </div>
                <div className="shrink-0 flex justify-center w-full lg:w-auto lg:justify-end">
                    <VisitorCounter className="scale-[0.98] sm:scale-100" />
                </div>
            </div>
        </div>
    );
}
