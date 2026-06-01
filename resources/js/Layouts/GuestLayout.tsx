import SiteLogo from '@/Components/SiteLogo';
import TournamentXLogo from '@/Components/TournamentXLogo';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

const featureItems = [
    {
        label: 'Battle',
        border: 'border-pink-500/25',
        icon: 'text-pink-400',
        iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
        label: 'Collect',
        border: 'border-cyan-500/25',
        icon: 'text-cyan-400',
        iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
        label: 'Rank Up',
        border: 'border-violet-500/25',
        icon: 'text-violet-400',
        iconPath:
            'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
] as const;

export default function Guest({ children }: PropsWithChildren) {
    const { tournament_x_logo_url } = usePage<PageProps>().props;

    return (
        <>
            <Head>
                <link rel="preload" href={tournament_x_logo_url} as="image" />
            </Head>
            <div className="guest-tx-theme flex min-h-screen bg-zinc-950">
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
                    <div className="absolute inset-0 opacity-25">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-600 rounded-full blur-[120px]" />
                        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600 rounded-full blur-[100px]" />
                        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-600 rounded-full blur-[80px]" />
                    </div>

                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
                        }}
                    />

                    <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
                        <div className="mb-6">
                            <TournamentXLogo
                                className="w-80 h-auto drop-shadow-[0_0_50px_rgba(236,72,153,0.35)]"
                                loading="eager"
                                fetchPriority="high"
                            />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight mb-4">
                            TOURNAMENT{' '}
                            <span className="guest-tx-accent-text">X</span>
                        </h1>
                        <p className="text-gray-400 text-center text-lg max-w-sm leading-relaxed">
                            Unleash your power. Track battles, build your collection, and rise to the top.
                        </p>

                        <div className="mt-16 flex gap-8 text-gray-500 text-sm font-medium">
                            {featureItems.map((item) => (
                                <div key={item.label} className="flex flex-col items-center gap-2">
                                    <div
                                        className={`w-12 h-12 rounded-xl bg-white/5 border ${item.border} flex items-center justify-center`}
                                    >
                                        <svg
                                            className={`w-6 h-6 ${item.icon}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d={item.iconPath}
                                            />
                                        </svg>
                                    </div>
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex flex-col items-center gap-3">
                            <SiteLogo
                                className="w-16 h-16 object-contain drop-shadow-[0_0_12px_rgba(220,38,38,0.35)]"
                                loading="lazy"
                            />
                            <p className="text-xs text-gray-600 tracking-wide text-center">
                                Created by{' '}
                                <span className="text-red-500/70 font-semibold">Shadow Syndicate</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-zinc-950 px-6 py-12 relative">
                    <div className="pointer-events-none absolute inset-0 lg:hidden overflow-hidden opacity-20">
                        <div className="absolute -top-20 right-0 w-56 h-56 bg-fuchsia-600 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600 rounded-full blur-[90px]" />
                    </div>

                    <div className="relative z-10 lg:hidden mb-10 flex flex-col items-center">
                        <TournamentXLogo
                            className="w-48 h-auto mb-4 drop-shadow-[0_0_30px_rgba(34,211,238,0.25)]"
                            loading="eager"
                            fetchPriority="high"
                        />
                        <Link href="/" className="text-2xl font-black text-white tracking-tight">
                            TOURNAMENT <span className="guest-tx-accent-text">X</span>
                        </Link>
                    </div>

                    <div className="relative z-10 w-full max-w-md">{children}</div>

                    <div className="relative z-10 lg:hidden mt-8 flex flex-col items-center gap-3">
                        <SiteLogo
                            className="w-14 h-14 object-contain drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                            loading="lazy"
                        />
                        <p className="text-xs text-gray-600 tracking-wide text-center">
                            Created by{' '}
                            <span className="text-red-500/70 font-semibold">Shadow Syndicate</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
