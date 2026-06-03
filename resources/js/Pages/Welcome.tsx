import { MemberSlideData, MembersSliderSection } from '@/Components/MembersMarquee';
// import TournamentRosterSection, { TournamentRosterData } from '@/Components/TournamentRosterSection';
import SiteFooter from '@/Components/SiteFooter';
import SiteLogo from '@/Components/SiteLogo';
import SiteNav from '@/Components/SiteNav';
import SiteVisitsStrip from '@/Components/SiteVisitsStrip';
import VisitorCounter from '@/Components/VisitorCounter';
import { PageProps } from '@/types';
import { tournamentxDashboardUrl, tournamentxLoginUrl } from '@/utils/tournamentxUrl';
import TournamentXFeaturesSection from '@/Components/TournamentXFeaturesSection';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Welcome({
    auth,
    members = [],
    // tournamentRosters = [],
}: PageProps & { members?: MemberSlideData[] /* ; tournamentRosters?: TournamentRosterData[] */ }) {
    const page = usePage<PageProps>();
    const txLogin = tournamentxLoginUrl(page.props);
    const txDashboard = tournamentxDashboardUrl(page.props);
    const manageTournamentHref = auth.user ? txDashboard : txLogin;
    const [scrollY, setScrollY] = useState(0);
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 100);
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => { clearTimeout(t); window.removeEventListener('scroll', handleScroll); };
    }, []);

    const navScrolled = scrollY > 50;

    return (
        <>
            <Head title="Shadow Syndicate - Beyblade Community" />

            <div className="min-h-screen w-full overflow-x-hidden bg-zinc-950 text-white">
                <SiteNav
                    activePage="home"
                    position="fixed"
                    scrolled={navScrolled}
                    homeHref="#home"
                    showJoinUs
                    onJoinUsClick={() => setJoinModalOpen(true)}
                />

                {/* ── Hero Section ── */}
                <section id="home" className={`relative min-h-screen flex items-center justify-center overflow-x-hidden pt-20 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[150px] animate-pulse" />
                        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-900/20 rounded-full blur-[120px]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[100px]" />
                        <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage:
                                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
                            }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent" />
                    </div>

                    <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                            {/* Left column - Text */}
                            <div className="text-center lg:text-left order-2 lg:order-1">
                                <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-none mb-6 break-words">
                                    SHADOW
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-600">
                                        SYNDICATE
                                    </span>
                                </h1>

                                <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                                    The ultimate Beyblade community. Join tournaments,
                                    battle head-to-head, and climb the rankings. Let it rip!
                                </p>

                                <div className="w-full max-w-md mx-auto lg:mx-0">
                                    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm shadow-xl shadow-black/30 overflow-hidden">
                                        {auth.user ? (
                                            <a
                                                href={txDashboard}
                                                className="group flex items-center gap-4 p-4 sm:p-5 border-l-4 border-l-red-500 hover:bg-red-500/5 transition-colors"
                                            >
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 group-hover:bg-red-500/25 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className="font-bold text-white group-hover:text-red-300 transition-colors">Go to Dashboard</p>
                                                    <p className="text-sm text-gray-500">Profile, stats & member tools</p>
                                                </div>
                                                <svg className="w-5 h-5 shrink-0 text-zinc-600 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </a>
                                        ) : (
                                            <>
                                                <a
                                                    href={txLogin}
                                                    className="group flex items-center gap-4 p-4 sm:p-5 border-l-4 border-l-red-500 hover:bg-red-500/5 transition-colors"
                                                >
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 group-hover:bg-red-500/25 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <p className="font-bold text-white group-hover:text-red-300 transition-colors">Login</p>
                                                        <p className="text-sm text-gray-500">Sign in to your blader account</p>
                                                    </div>
                                                    <svg className="w-5 h-5 shrink-0 text-zinc-600 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </a>
                                                <div className="h-px bg-zinc-800/80" />
                                                <Link
                                                    href={route('register')}
                                                    className="group flex items-center gap-4 p-4 sm:p-5 border-l-4 border-l-zinc-600 hover:bg-zinc-800/30 transition-colors"
                                                >
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-700/40 border border-zinc-600/50 text-gray-300 group-hover:bg-zinc-700/60 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <p className="font-bold text-white group-hover:text-gray-200 transition-colors">Join Now</p>
                                                        <p className="text-sm text-gray-500">Create your blader account</p>
                                                    </div>
                                                    <svg className="w-5 h-5 shrink-0 text-zinc-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </>
                                        )}
                                        <div className="h-px bg-zinc-800/80" />
                                        <a
                                            href={manageTournamentHref}
                                            className="group flex items-center gap-4 p-4 sm:p-5 border-l-4 border-l-cyan-500/80 hover:bg-cyan-500/5 transition-colors"
                                        >
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="font-bold text-white group-hover:text-cyan-300 transition-colors">Manage Tournament</p>
                                                <p className="text-sm text-gray-500">Brackets, judging & live scores</p>
                                            </div>
                                            <svg className="w-5 h-5 shrink-0 text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </a>
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm">
                                        <Link href={route('events')} className="text-gray-500 hover:text-red-400 transition-colors font-medium">
                                            View Events
                                        </Link>
                                        <span className="text-zinc-700 hidden sm:inline" aria-hidden>·</span>
                                        <Link href={route('members')} className="text-gray-500 hover:text-red-400 transition-colors font-medium">
                                            Meet Members
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Right column - Logo */}
                            <div className="flex justify-center order-1 lg:order-2 w-full min-w-0">
                                <div className="relative mx-auto max-w-full overflow-hidden px-6 sm:px-10 py-4">
                                    <SiteLogo className="w-48 h-48 sm:w-72 sm:h-72 lg:w-[400px] lg:h-[400px] mx-auto drop-shadow-[0_0_60px_rgba(220,38,38,0.5)] relative z-10 object-contain" />

                                    <svg className="absolute top-0 right-2 sm:-top-6 sm:-right-8 w-12 h-20 sm:w-16 sm:h-24 animate-lightning-1" viewBox="0 0 64 96" fill="none">
                                        <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg1)" />
                                        <defs><linearGradient id="lg1" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#ef4444" /></linearGradient></defs>
                                    </svg>

                                    <svg className="absolute bottom-0 left-0 sm:-bottom-4 sm:-left-10 w-10 h-16 sm:w-14 sm:h-20 rotate-[200deg] animate-lightning-2" viewBox="0 0 64 96" fill="none">
                                        <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg2)" />
                                        <defs><linearGradient id="lg2" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fca5a5" /><stop offset="1" stopColor="#dc2626" /></linearGradient></defs>
                                    </svg>

                                    <svg className="absolute top-1/2 right-0 sm:-right-12 w-10 h-14 sm:w-12 sm:h-16 -rotate-[30deg] animate-lightning-3" viewBox="0 0 64 96" fill="none">
                                        <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg3)" />
                                        <defs><linearGradient id="lg3" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#b91c1c" /></linearGradient></defs>
                                    </svg>

                                    <svg className="absolute top-0 left-0 sm:-top-2 sm:-left-8 w-8 h-12 sm:w-10 sm:h-14 rotate-[160deg] animate-lightning-4" viewBox="0 0 64 96" fill="none">
                                        <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg4)" />
                                        <defs><linearGradient id="lg4" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fecaca" /><stop offset="1" stopColor="#ef4444" /></linearGradient></defs>
                                    </svg>

                                    <svg className="absolute bottom-2 right-1 sm:bottom-4 sm:-right-6 w-8 h-12 sm:w-10 sm:h-16 rotate-[45deg] animate-lightning-2" viewBox="0 0 64 96" fill="none">
                                        <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg5)" />
                                        <defs><linearGradient id="lg5" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#dc2626" /></linearGradient></defs>
                                    </svg>

                                    <svg className="absolute top-6 left-1 sm:top-8 sm:-left-6 w-7 h-10 sm:w-8 sm:h-12 -rotate-[120deg] animate-lightning-1" viewBox="0 0 64 96" fill="none">
                                        <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg6)" />
                                        <defs><linearGradient id="lg6" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fca5a5" /><stop offset="1" stopColor="#b91c1c" /></linearGradient></defs>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 animate-bounce text-center">
                            <a href="#about" className="text-gray-600 hover:text-red-400 transition-colors">
                                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </section>

                {/* ── About Section ── */}
                <section id="about" className="relative py-24 sm:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 sm:mb-12" />

                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                            <div>
                                <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-full mb-6 uppercase">
                                    About Us
                                </span>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-6">
                                    Built by Bladers,
                                    <br />
                                    <span className="text-red-500">For Bladers</span>
                                </h2>
                                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                                    Shadow Syndicate is a passionate Beyblade community dedicated to
                                    competitive play, camaraderie, and growing the Beyblade scene.
                                    From casual battles to organized tournaments, we're here for
                                    all bladers.
                                </p>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    Whether you're a beginner or a veteran, you're welcome in our
                                    community. Let's level up the Beyblade experience together!
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 text-center hover:border-red-500/30 transition-colors">
                                    <div className="text-4xl font-black text-red-500 mb-2">50+</div>
                                    <div className="text-sm text-gray-500 font-medium">Active Members</div>
                                </div>
                                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 text-center hover:border-red-500/30 transition-colors">
                                    <div className="text-4xl font-black text-red-500 mb-2">20+</div>
                                    <div className="text-sm text-gray-500 font-medium">Tournaments Held</div>
                                </div>
                                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 text-center hover:border-red-500/30 transition-colors">
                                    <div className="text-4xl font-black text-red-500 mb-2">100+</div>
                                    <div className="text-sm text-gray-500 font-medium">Battles Fought</div>
                                </div>
                                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 text-center hover:border-red-500/30 transition-colors">
                                    <div className="text-4xl font-black text-red-500 mb-2">1</div>
                                    <div className="text-sm text-gray-500 font-medium">Community</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <TournamentXFeaturesSection manageHref={manageTournamentHref} />

                {/* Tournament history — hidden for now
                <TournamentRosterSection tournaments={tournamentRosters} />
                */}

                <MembersSliderSection members={members} />

                {/* ── Community Section ── */}
                <section id="community" className="relative py-24 sm:py-32">
                    <div className="absolute inset-0 bg-zinc-900/30" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-full mb-6 uppercase">
                            Join the Syndicate
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
                            Ready to{' '}
                            <span className="text-red-500">Let It Rip?</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Be part of the strongest Beyblade community. Register now
                            and start your journey as a blader!
                        </p>
                    </div>
                </section>

                <SiteFooter variant="full" />

                <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
                    <VisitorCounter />
                </div>

                {/* ── Join Us Modal ── */}
                {joinModalOpen && (
                    <>
                        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={() => setJoinModalOpen(false)} />
                        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-8 relative shadow-2xl shadow-black/50">
                                <button
                                    onClick={() => setJoinModalOpen(false)}
                                    className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <div className="flex items-center gap-3 mb-6">
                                    <SiteLogo className="w-12 h-12 drop-shadow-[0_0_12px_rgba(220,38,38,0.4)]" />
                                    <div>
                                        <h2 className="text-xl font-black text-white">Join Shadow Syndicate</h2>
                                        <p className="text-sm text-gray-500">Become part of the community</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-red-400 mb-1">Step 1: Follow our Facebook Page</h3>
                                        <p className="text-sm text-gray-400">Follow our Facebook page and send us a message to introduce yourself. Share your blader name and your favorite Beyblade.</p>
                                    </div>
                                    <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-red-400 mb-1">Step 2: Attend an Event</h3>
                                        <p className="text-sm text-gray-400">Attend at least one of our community events, either online or in-person. Check the Events page for upcoming schedules.</p>
                                    </div>
                                    <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-red-400 mb-1">Step 3: Get Verified</h3>
                                        <p className="text-sm text-gray-400">After attending an event, an officer will verify your membership and you&apos;ll be added as part of the Shadow Syndicate community.</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <a
                                        href="https://www.facebook.com/profile.php?id=61590319061777"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 text-center px-6 py-3 text-sm font-bold bg-red-600 hover:bg-red-500 rounded-xl transition-colors"
                                    >
                                        Visit Facebook Page
                                    </a>
                                    <Link
                                        href={route('events')}
                                        className="flex-1 text-center px-6 py-3 text-sm font-bold border border-zinc-700 hover:border-red-500/50 rounded-xl transition-colors hover:bg-zinc-800/60"
                                    >
                                        View Events
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
