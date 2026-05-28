import { MemberSlideData, MembersSliderSection } from '@/Components/MembersMarquee';
import SiteFooter from '@/Components/SiteFooter';
import SiteLogo from '@/Components/SiteLogo';
import SiteVisitsStrip from '@/Components/SiteVisitsStrip';
import VisitorCounter from '@/Components/VisitorCounter';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Welcome({ auth, members = [] }: PageProps & { members?: MemberSlideData[] }) {
    const [scrollY, setScrollY] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
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

            <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
                {/* ── Navigation ── */}
                <nav
                    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                        navScrolled
                            ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 shadow-lg shadow-black/20'
                            : 'bg-transparent'
                    }`}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 sm:h-20">
                            <div className="flex items-center gap-3">
                                <SiteLogo className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_12px_rgba(220,38,38,0.4)]" />
                                <span className="text-lg sm:text-xl font-black tracking-tight">
                                    SHADOW <span className="text-red-500">SYNDICATE</span>
                                </span>
                            </div>

                            <div className="hidden md:flex items-center gap-2">
                                <a href="#home" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</a>
                                <Link href={route('members')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Members</Link>
                                <Link href={route('events')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Event</Link>
                                <Link href={route('blog')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Blog</Link>
                                <Link href={route('jersey')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Shop</Link>
                                <div className="w-px h-6 bg-zinc-700 mx-2" />
                                <button
                                    onClick={() => setJoinModalOpen(true)}
                                    className="px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                                >
                                    Join Us
                                </button>
                            </div>

                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                                {menuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {menuOpen && (
                            <div className="md:hidden border-t border-zinc-800/60 py-4 space-y-1 bg-zinc-950/95 backdrop-blur-xl">
                                <a href="#home" className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-zinc-800/60 rounded-lg" onClick={() => setMenuOpen(false)}>Home</a>
                                <Link href={route('members')} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-zinc-800/60 rounded-lg">Members</Link>
                                <Link href={route('events')} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-zinc-800/60 rounded-lg">Event</Link>
                                <Link href={route('blog')} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-zinc-800/60 rounded-lg">Blog</Link>
                                <Link href={route('jersey')} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-zinc-800/60 rounded-lg">Shop</Link>
                                <div className="border-t border-zinc-800/60 my-2" />
                                <button onClick={() => { setMenuOpen(false); setJoinModalOpen(true); }} className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-zinc-800/60 rounded-lg">Join Us</button>
                            </div>
                        )}
                    </div>
                </nav>

                {/* ── Hero Section ── */}
                <section id="home" className={`relative min-h-screen flex items-center justify-center pt-20 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
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
                                <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-none mb-6">
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

                                <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="group relative px-8 py-4 text-lg font-bold bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-lg shadow-red-600/20 hover:shadow-red-500/30"
                                        >
                                            Go to Dashboard
                                            <span className="absolute inset-0 rounded-xl border border-red-400/20 group-hover:border-red-400/40 transition-colors" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register')}
                                            className="group relative px-8 py-4 text-lg font-bold bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-lg shadow-red-600/20 hover:shadow-red-500/30"
                                        >
                                            Join Now!
                                            <span className="absolute inset-0 rounded-xl border border-red-400/20 group-hover:border-red-400/40 transition-colors" />
                                        </Link>
                                    )}
                                    <Link
                                        href={route('login')}
                                        className="group px-8 py-4 text-lg font-bold border border-zinc-700 hover:border-red-500/50 rounded-xl transition-all hover:bg-zinc-900/80 flex items-center gap-3"
                                    >
                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Manage Tournament
                                    </Link>
                                </div>
                            </div>

                            {/* Right column - Logo */}
                            <div className="flex justify-center order-1 lg:order-2">
                                <div className="relative">
                                    <SiteLogo className="w-56 h-56 sm:w-72 sm:h-72 lg:w-[400px] lg:h-[400px] drop-shadow-[0_0_60px_rgba(220,38,38,0.5)] relative z-10 object-contain" />

                                    <svg className="absolute -top-6 -right-8 w-16 h-24 animate-lightning-1" viewBox="0 0 64 96" fill="none">
                                        <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg1)" />
                                        <defs><linearGradient id="lg1" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#ef4444" /></linearGradient></defs>
                                    </svg>

                                    <svg className="absolute -bottom-4 -left-10 w-14 h-20 rotate-[200deg] animate-lightning-2" viewBox="0 0 64 96" fill="none">
                                        <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg2)" />
                                        <defs><linearGradient id="lg2" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fca5a5" /><stop offset="1" stopColor="#dc2626" /></linearGradient></defs>
                                    </svg>

                                    <svg className="absolute top-1/2 -right-12 w-12 h-16 -rotate-[30deg] animate-lightning-3" viewBox="0 0 64 96" fill="none">
                                        <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg3)" />
                                        <defs><linearGradient id="lg3" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#b91c1c" /></linearGradient></defs>
                                    </svg>

                                    <svg className="absolute -top-2 -left-8 w-10 h-14 rotate-[160deg] animate-lightning-4" viewBox="0 0 64 96" fill="none">
                                        <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg4)" />
                                        <defs><linearGradient id="lg4" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fecaca" /><stop offset="1" stopColor="#ef4444" /></linearGradient></defs>
                                    </svg>

                                    <svg className="absolute bottom-4 -right-6 w-10 h-16 rotate-[45deg] animate-lightning-2" viewBox="0 0 64 96" fill="none">
                                        <path d="M32 0L20 40h16L24 96l28-56H36L48 0H32z" fill="url(#lg5)" />
                                        <defs><linearGradient id="lg5" x1="32" y1="0" x2="32" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#dc2626" /></linearGradient></defs>
                                    </svg>

                                    <svg className="absolute top-8 -left-6 w-8 h-12 -rotate-[120deg] animate-lightning-1" viewBox="0 0 64 96" fill="none">
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

                {/* ── Features Section ── */}
                <section id="features" className="relative py-24 sm:py-32">
                    <div className="absolute inset-0 bg-zinc-900/30" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-full mb-6 uppercase">
                                Features
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
                                Everything You Need to{' '}
                                <span className="text-red-500">Battle</span>
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                From tournament management to live rankings, we have all the
                                tools your community needs.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FeatureCard
                                icon={
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                }
                                title="Tournament System"
                                description="Create and manage tournaments with brackets, Swiss format, and round-robin. Real-time updates for all participants."
                            />
                            <FeatureCard
                                icon={
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                }
                                title="Live Battles"
                                description="Real-time match reporting and live updates. Follow every battle from the stadium all the way to the finals."
                            />
                            <FeatureCard
                                icon={
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                }
                                title="Rankings & Stats"
                                description="Track your wins, losses, and overall ranking. See who's the strongest in the community."
                            />
                            <FeatureCard
                                icon={
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                }
                                title="Community Hub"
                                description="Connect with fellow bladers, join communities, and discuss the latest Beyblade releases."
                            />
                            <FeatureCard
                                icon={
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                }
                                title="Judge System"
                                description="Built-in judge panel for fair and organized matches. Secure judge codes and real-time match reporting."
                            />
                            <FeatureCard
                                icon={
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                }
                                title="Challonge Integration"
                                description="Use Challonge for additional tournament management and global Beyblade tournament access."
                            />
                        </div>
                    </div>
                </section>

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
                                        <h3 className="text-sm font-bold text-red-400 mb-1">Step 1: Join our Discord</h3>
                                        <p className="text-sm text-gray-400">Join our Discord server and introduce yourself in the #introductions channel. Share your blader name and your favorite Beyblade.</p>
                                    </div>
                                    <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-red-400 mb-1">Step 2: Attend an Event</h3>
                                        <p className="text-sm text-gray-400">Attend at least one of our community events, either online or in-person. Check the Events page for upcoming schedules.</p>
                                    </div>
                                    <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4">
                                        <h3 className="text-sm font-bold text-red-400 mb-1">Step 3: Get Verified</h3>
                                        <p className="text-sm text-gray-400">After attending an event, an officer will verify your membership and you'll get your official Shadow Syndicate role on Discord.</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <a
                                        href="https://discord.gg/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 text-center px-6 py-3 text-sm font-bold bg-red-600 hover:bg-red-500 rounded-xl transition-colors"
                                    >
                                        Join Discord Server
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

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="group bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 sm:p-8 hover:border-red-500/30 transition-all hover:bg-zinc-900/80">
            <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-5 group-hover:bg-red-500/15 transition-colors">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        </div>
    );
}
