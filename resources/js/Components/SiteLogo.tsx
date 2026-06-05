import { usePage } from '@inertiajs/react';
import { ImgHTMLAttributes } from 'react';

type SiteLogoProps = {
    className?: string;
    alt?: string;
    /** Soft red glow behind the logo (no rectangular drop-shadow on the image). */
    glow?: boolean;
    /** Blends dark PNG edges into dark page backgrounds. */
    blend?: boolean;
} & Pick<ImgHTMLAttributes<HTMLImageElement>, 'loading' | 'fetchPriority'>;

export default function SiteLogo({
    className = '',
    alt = 'Shadow Syndicate',
    loading,
    fetchPriority,
    glow = false,
    blend = false,
}: SiteLogoProps) {
    const { site_logo_url } = usePage().props as { site_logo_url?: string };

    const imgClass = [
        className,
        blend ? 'mix-blend-screen' : '',
        glow ? 'relative z-10' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const img = (
        <img
            src={site_logo_url ?? route('site.logo')}
            alt={alt}
            className={imgClass}
            loading={loading}
            fetchPriority={fetchPriority}
        />
    );

    if (!glow) {
        return img;
    }

    return (
        <span className="relative inline-flex items-center justify-center">
            <span
                className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/25 blur-[72px] sm:blur-[96px]"
                aria-hidden
            />
            {img}
        </span>
    );
}
