import { usePage } from '@inertiajs/react';
import { ImgHTMLAttributes } from 'react';

type SiteLogoProps = {
    className?: string;
    alt?: string;
} & Pick<ImgHTMLAttributes<HTMLImageElement>, 'loading' | 'fetchPriority'>;

export default function SiteLogo({
    className,
    alt = 'Shadow Syndicate',
    loading,
    fetchPriority,
}: SiteLogoProps) {
    const { site_logo_url } = usePage().props as { site_logo_url?: string };

    return (
        <img
            src={site_logo_url ?? route('site.logo')}
            alt={alt}
            className={className}
            loading={loading}
            fetchPriority={fetchPriority}
        />
    );
}
