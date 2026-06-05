import TournamentXLogo from '@/Components/TournamentXLogo';

interface FeatureItem {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const features: FeatureItem[] = [
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        title: 'Bracket Formats',
        description: 'Run Single Elimination, Double Elimination, Swiss, or Round Robin — pick the format that fits your event.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
        title: 'Two-Stage Events',
        description: 'Group stage (Swiss or Round Robin) with a final cut into Single or Double Elimination playoffs.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        title: 'Swiss & Standings',
        description: 'Automatic pairings, live standings, configurable points, tiebreakers, and optional top-cut playoffs.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
        ),
        title: 'Judge Panel',
        description: 'Password-protected judge access with Beyblade X finish scoring — Spin, Over, Burst, and Xtreme finishes.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        title: 'Live Score Sync',
        description: 'Score matches in real time from the judge panel or player matching view — brackets update instantly.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
        ),
        title: 'Stadium Assignment',
        description: 'Set up multiple stadiums and assign active matches so bladers know exactly where to battle.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        title: 'Participant Management',
        description: 'Add players individually or in bulk, randomize seeds, upload avatars, and assign per-match judges.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        ),
        title: 'Placement Matches',
        description: 'Optional 3rd-place match and 5th–7th placement mini-brackets so every rank is decided on the stadium.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        title: 'Event Registration',
        description: 'Link community events to a tournament — confirmed registrations can sync straight into the bracket.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        ),
        title: 'Public Bracket View',
        description: 'Share a live tournament page so spectators and players can follow every round without logging in.',
    },
];

function FeatureCard({ icon, title, description }: FeatureItem) {
    return (
        <div className="group relative bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 sm:p-7 hover:border-cyan-500/25 transition-all hover:bg-zinc-900/80 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/0 via-cyan-500/0 to-violet-500/0 group-hover:from-fuchsia-500/5 group-hover:via-cyan-500/5 group-hover:to-violet-500/5 transition-all pointer-events-none" />
            <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500/10 via-cyan-500/10 to-violet-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 group-hover:border-cyan-400/35 transition-colors">
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

export default function TournamentXFeaturesSection({ visitSiteHref }: { visitSiteHref: string }) {
    return (
        <section id="features" className="relative py-24 sm:py-32">
            <div className="absolute inset-0 bg-zinc-900/30" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14 sm:mb-16">
                    <div className="flex items-center justify-center mb-6">
                        <TournamentXLogo
                            className="h-20 sm:h-28 md:h-36 w-auto max-w-[min(100%,28rem)] object-contain"
                            alt="Tournament X"
                        />
                    </div>
                    <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6 uppercase">
                        Tournament Platform
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
                        What You Can Do with{' '}
                        <span className="tx-accent-text">Tournament X</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Built for Beyblade organizers — create brackets, run live events, score matches,
                        and keep your community in sync from check-in to finals.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {features.map((feature) => (
                        <FeatureCard key={feature.title} {...feature} />
                    ))}
                </div>

                <div className="mt-12 sm:mt-14 text-center">
                    <a
                        href={visitSiteHref}
                        className="inline-flex items-center gap-3 px-8 py-4 text-base font-bold rounded-xl tx-btn text-white"
                    >
                        Visit Site
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
