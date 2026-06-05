import TournamentXPromoBanner, { PromoConfig } from '@/Components/TournamentX/PromoBanner';
import TournamentXPricingSection, { PricingPlan } from '@/Components/TournamentX/PricingSection';
import TournamentXLogo from '@/Components/TournamentXLogo';
import TournamentXMarketingLayout from '@/Layouts/TournamentXMarketingLayout';
import { Head, Link } from '@inertiajs/react';

const highlights = [
    {
        title: 'Every bracket format',
        description: 'Single & double elim, Swiss, round robin, and two-stage cuts into playoffs.',
        icon: 'M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
        title: 'Live Beyblade X scoring',
        description: 'Judge panel with SF, OF, BF, and XF finishes — scores sync to brackets instantly.',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
        title: 'Public live page',
        description: 'Share a tournament link so players and spectators follow every round without logging in.',
        icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7',
    },
];

const steps = [
    { step: '01', title: 'Register', text: 'Create your organizer account on Tournament X — separate from Shadow Syndicate member login.' },
    { step: '02', title: 'Create event', text: 'Set format, stadiums, and participants — bulk import or sync from community events.' },
    { step: '03', title: 'Run & score', text: 'Start rounds, assign judges, and report finishes from the panel or player matching view.' },
    { step: '04', title: 'Share results', text: 'Live bracket, standings, and placement matches for stream and venue displays.' },
];

export default function TournamentXHome({
    loginUrl,
    registerUrl,
    homeUrl,
    mainSiteUrl,
    promo,
    pricing,
}: {
    loginUrl: string;
    registerUrl: string;
    homeUrl: string;
    mainSiteUrl: string;
    promo: PromoConfig;
    pricing: PricingPlan[];
}) {
    return (
        <TournamentXMarketingLayout
            loginUrl={loginUrl}
            registerUrl={registerUrl}
            homeUrl={homeUrl}
            mainSiteUrl={mainSiteUrl}
        >
            <Head title="Tournament X — Beyblade Tournament Platform" />

            <TournamentXPromoBanner promo={promo} registerUrl={registerUrl} />

            <section className="relative overflow-hidden pt-16 sm:pt-20 pb-16 sm:pb-24">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] bg-fuchsia-600/15 rounded-full blur-[140px]" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <TournamentXLogo
                        className="h-28 sm:h-36 md:h-44 w-auto max-w-[min(100%,36rem)] mx-auto object-contain mb-8"
                        loading="eager"
                        fetchPriority="high"
                    />
                    <p className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6 uppercase">
                        Beyblade tournament platform
                    </p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1]">
                        The tournament site for{' '}
                        <span className="tx-accent-text">organizers who run events</span>
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        This is the dedicated Tournament X website. Register here to manage brackets — Shadow Syndicate
                        members use the main community site for profiles and stats.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={registerUrl}
                            className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl tx-btn text-white"
                        >
                            Register free
                        </a>
                        <a
                            href={loginUrl}
                            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl border border-zinc-700 text-gray-300 hover:border-cyan-500/40 hover:text-white transition-colors"
                        >
                            Log in
                        </a>
                    </div>
                </div>
            </section>

            <section className="relative py-16 border-y border-zinc-800/50 bg-zinc-900/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                    {highlights.map((item) => (
                        <div key={item.title} className="px-4">
                            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="features" className="relative py-20 sm:py-28 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                            Everything for <span className="tx-accent-text">event day</span>
                        </h2>
                        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                            From check-in to finals — Swiss pairings, judge codes, placement brackets, and more.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            ['Bracket formats', 'Single, double, Swiss, round robin & two-stage playoffs'],
                            ['Judge panel', 'Secure judge login with Beyblade X finish scoring'],
                            ['Live sync', 'Scores update brackets and player matching in real time'],
                            ['Stadiums', 'Multiple stadiums with match assignment'],
                            ['Participants', 'Bulk add, seeds, avatars, and account linking'],
                            ['Placements', '3rd place and 5th–7th mini-brackets'],
                        ].map(([title, desc]) => (
                            <div
                                key={title}
                                className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 p-6 hover:border-cyan-500/25 transition-colors"
                            >
                                <h3 className="font-bold text-white mb-2">{title}</h3>
                                <p className="text-sm text-gray-500">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <TournamentXPricingSection plans={pricing} registerUrl={registerUrl} />

            <section id="how-it-works" className="relative py-20 sm:py-28 bg-zinc-900/30 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl sm:text-4xl font-black text-center mb-14">How it works</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((s) => (
                            <div key={s.step} className="rounded-2xl border border-zinc-800/60 bg-zinc-950/80 p-6">
                                <span className="text-3xl font-black tx-accent-text">{s.step}</span>
                                <h3 className="text-lg font-bold text-white mt-3 mb-2">{s.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="contact" className="py-20 sm:py-24 border-t border-zinc-800/50">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Start your next tournament</h2>
                    <p className="text-gray-400 mb-8">
                        Register as an organizer or log in to open your dashboard. Need Pro or sponsor placements? Reach
                        out through Shadow Syndicate.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href={registerUrl} className="inline-flex items-center gap-2 px-10 py-4 text-base font-bold rounded-xl tx-btn text-white">
                            Create account
                        </a>
                        {mainSiteUrl && (
                            <a
                                href={mainSiteUrl}
                                className="inline-flex items-center gap-2 px-10 py-4 text-base font-semibold rounded-xl border border-zinc-700 text-gray-400 hover:text-white transition-colors"
                            >
                                Shadow Syndicate community
                            </a>
                        )}
                    </div>
                </div>
            </section>
        </TournamentXMarketingLayout>
    );
}
