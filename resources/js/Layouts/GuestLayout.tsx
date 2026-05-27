import SiteLogo from '@/Components/SiteLogo';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { site_logo_url } = usePage<PageProps>().props;

    return (
        <>
        <Head>
            <link rel="preload" href={site_logo_url} as="image" />
        </Head>
        <div className="flex min-h-screen">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-900 rounded-full blur-[100px]" />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-red-500 rounded-full blur-[80px]" />
                </div>

                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
                    }}
                />

                <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
                    <div className="mb-6">
                        <SiteLogo
                            className="w-80 h-auto drop-shadow-[0_0_40px_rgba(220,38,38,0.4)]"
                            loading="eager"
                            fetchPriority="high"
                        />
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight mb-4">
                        SHADOW <span className="text-red-500">SYNDICATE</span>
                    </h1>
                    <p className="text-gray-400 text-center text-lg max-w-sm leading-relaxed">
                        Unleash your power. Track battles, build your collection, and rise to the top.
                    </p>

                    <div className="mt-16 flex gap-8 text-gray-500 text-sm font-medium">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-red-900/30 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <span>Battle</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-red-900/30 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <span>Collect</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-red-900/30 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <span>Rank Up</span>
                        </div>
                    </div>

                    <p className="mt-12 text-xs text-gray-600 tracking-wide">
                        Created by <span className="text-red-500/70 font-semibold">Shadow Syndicate</span>
                    </p>
                </div>
            </div>

            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-zinc-950 px-6 py-12">
                <div className="lg:hidden mb-10 flex flex-col items-center">
                    <SiteLogo
                        className="w-48 h-auto mb-4 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                        loading="eager"
                        fetchPriority="high"
                    />
                    <Link href="/" className="text-2xl font-black text-white tracking-tight">
                        SHADOW <span className="text-red-500">SYNDICATE</span>
                    </Link>
                </div>

                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
        </>
    );
}
