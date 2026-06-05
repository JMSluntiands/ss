import OptimizedImage from '@/Components/OptimizedImage';
import SiteLogo from '@/Components/SiteLogo';
import { memberDisplayName } from '@/utils/memberUrl';
import { memberImageSrc } from '@/utils/publicStorage';
import { tournamentxSiteUrl } from '@/utils/tournamentxUrl';
import { Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, PropsWithChildren } from 'react';
import { PageProps } from '@/types';

export default function MemberLayout({ children }: PropsWithChildren) {
    const page = usePage<PageProps>();
    const { auth, tournamentx_enabled, tournamentx_url, permissions } = page.props;
    const tournamentXSite = tournamentxSiteUrl({ tournamentx_enabled, tournamentx_url });
    const canOrganize =
        permissions?.can_create_tournaments ||
        permissions?.can_manage_tournaments ||
        permissions?.can_manage_events;

    const logout: FormEventHandler = (e) => {
        e.preventDefault();
        router.post(route('member.logout', undefined, false));
    };

    const user = auth.user;
    const profileImage =
        user &&
        (memberImageSrc(user.site_member_image_url ?? null, 'thumb')
            ?? memberImageSrc(user.site_member_image_url ?? null, 'full'));

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <header className="border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <Link href={route('home')} className="flex items-center gap-2.5 min-w-0">
                        <SiteLogo className="w-9 h-9 shrink-0 drop-shadow-[0_0_12px_rgba(220,38,38,0.4)]" />
                        <span className="font-bold text-sm sm:text-base truncate">Shadow Syndicate</span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <a
                            href={tournamentXSite}
                            className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-cyan-400/90 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-colors"
                        >
                            Tournament X
                        </a>
                        {canOrganize && (
                            <a
                                href={
                                    tournamentx_enabled && tournamentx_url
                                        ? `${tournamentx_url.replace(/\/$/, '')}/dashboard`
                                        : route('dashboard', undefined, false)
                                }
                                className="hidden md:inline-flex px-3 py-1.5 text-xs font-semibold text-white bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors"
                            >
                                Organizer dashboard
                            </a>
                        )}
                        {user && (
                            <div className="hidden sm:flex items-center gap-2 min-w-0">
                                {profileImage ? (
                                    <OptimizedImage
                                        src={profileImage}
                                        fallbackSrc={memberImageSrc(user.site_member_image_url ?? null, 'full') ?? undefined}
                                        alt={memberDisplayName(user)}
                                        className="h-8 w-8 rounded-full object-cover border border-zinc-700/50 shrink-0"
                                    />
                                ) : (
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                                        {memberDisplayName(user).charAt(0).toUpperCase()}
                                    </span>
                                )}
                                <span className="text-xs text-gray-300 truncate max-w-[100px] font-medium">
                                    {memberDisplayName(user)}
                                </span>
                            </div>
                        )}
                        <form onSubmit={logout}>
                            <button
                                type="submit"
                                className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors"
                            >
                                Log out
                            </button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">{children}</main>
        </div>
    );
}
