import { usePage } from '@inertiajs/react';
import { ImgHTMLAttributes } from 'react';

type TournamentXLogoProps = {
    className?: string;
    alt?: string;
} & Pick<ImgHTMLAttributes<HTMLImageElement>, 'loading' | 'fetchPriority'>;

export default function TournamentXLogo({
    className,
    alt = 'Tournament X',
    loading,
    fetchPriority,
}: TournamentXLogoProps) {
    const { tournament_x_logo_url } = usePage().props as { tournament_x_logo_url?: string };

    return (
        <img
            src={tournament_x_logo_url ?? route('site.tournamentx-logo')}
            alt={alt}
            className={className}
            loading={loading}
            fetchPriority={fetchPriority}
        />
    );
}
