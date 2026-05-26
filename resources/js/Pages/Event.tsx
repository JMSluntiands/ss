import { Head, Link } from '@inertiajs/react';

const upcomingEvents = [
    {
        title: 'Shadow Syndicate Championship Series #5',
        date: 'June 15, 2026',
        time: '2:00 PM',
        location: 'SM North EDSA, Activity Center',
        format: 'Double Elimination',
        slots: '32 / 64',
        status: 'Registration Open',
        description: 'The biggest tournament of the season! Open to all bladers with official WBO-approved Beyblades. Prizes for Top 3.',
    },
    {
        title: 'Rookie Rumble - Beginners Only',
        date: 'June 28, 2026',
        time: '10:00 AM',
        location: 'Trinoma Mall, 3rd Floor',
        format: 'Swiss (5 Rounds)',
        slots: '12 / 24',
        status: 'Registration Open',
        description: 'Exclusive tournament for new bladers! Perfect for those who want to experience competitive play for the first time.',
    },
    {
        title: 'Shadow Wars: Team Battle',
        date: 'July 12, 2026',
        time: '1:00 PM',
        location: 'Glorietta 5, Activity Center',
        format: 'Team Round-Robin (3v3)',
        slots: '6 / 8 Teams',
        status: 'Coming Soon',
        description: 'Form your team of 3 bladers and compete against other squads. Strategy and teamwork will decide the winners!',
    },
];

const pastEvents = [
    {
        title: 'Shadow Syndicate Championship Series #4',
        date: 'May 10, 2026',
        location: 'SM Megamall, Event Hall',
        participants: 48,
        winner: 'DarkBlade',
        runnerUp: 'StormRider',
    },
    {
        title: 'Friday Night Fights #12',
        date: 'April 25, 2026',
        location: 'Online (Discord)',
        participants: 16,
        winner: 'PhantomX',
        runnerUp: 'BlitzKing',
    },
    {
        title: 'Shadow Syndicate Championship Series #3',
        date: 'March 15, 2026',
        location: 'Robinsons Galleria, Activity Area',
        participants: 56,
        winner: 'StormRider',
        runnerUp: 'ShadowViper',
    },
    {
        title: 'Valentines Clash',
        date: 'February 14, 2026',
        location: 'SM North EDSA, Activity Center',
        participants: 32,
        winner: 'DarkBlade',
        runnerUp: 'NovaCrush',
    },
];

export default function Event() {
    return (
        <>
            <Head title="Events - Shadow Syndicate" />
            <div className="min-h-screen bg-zinc-950 text-white">
                <nav className="bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 sm:h-20">
                            <Link href={route('home')} className="flex items-center gap-3">
                                <img src="/storage/sslogo.png" alt="Shadow Syndicate" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_12px_rgba(220,38,38,0.4)]" />
                                <span className="text-lg sm:text-xl font-black tracking-tight">
                                    SHADOW <span className="text-red-500">SYNDICATE</span>
                                </span>
                            </Link>
                            <div className="hidden md:flex items-center gap-2">
                                <Link href={route('home')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
                                <Link href={route('members')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Members</Link>
                                <Link href={route('events')} className="px-4 py-2 text-sm font-medium text-red-400 transition-colors">Event</Link>
                                <Link href={route('blog')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Blog</Link>
                                <Link href={route('jersey')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Jersey</Link>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Upcoming Events */}
                    <div className="mb-16">
                        <div className="mb-10">
                            <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-full mb-4 uppercase">
                                Upcoming
                            </span>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                                Upcoming <span className="text-red-500">Events</span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-2xl">
                                Check out our upcoming tournaments and events. Register early to secure your slot!
                            </p>
                        </div>

                        <div className="space-y-6">
                            {upcomingEvents.map((event) => (
                                <div
                                    key={event.title}
                                    className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 sm:p-8 hover:border-red-500/30 transition-all"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{event.description}</p>
                                        </div>
                                        <span
                                            className={`shrink-0 px-4 py-1.5 text-xs font-bold rounded-full border ${
                                                event.status === 'Registration Open'
                                                    ? 'text-green-400 bg-green-500/10 border-green-500/30'
                                                    : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                                            }`}
                                        >
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Date & Time</p>
                                                <p className="text-white font-medium">{event.date} at {event.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Location</p>
                                                <p className="text-white font-medium">{event.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Format</p>
                                                <p className="text-white font-medium">{event.format}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Slots</p>
                                                <p className="text-white font-medium">{event.slots}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Past Events */}
                    <div>
                        <div className="mb-10">
                            <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-gray-400 bg-zinc-800/60 border border-zinc-700/60 rounded-full mb-4 uppercase">
                                Past Events
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                                Event <span className="text-red-500">History</span>
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-800">
                                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Event</th>
                                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Location</th>
                                        <th className="text-center py-3 px-4 text-gray-500 font-medium">Players</th>
                                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Champion</th>
                                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Runner-Up</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pastEvents.map((event) => (
                                        <tr key={event.title} className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors">
                                            <td className="py-4 px-4 font-medium text-white">{event.title}</td>
                                            <td className="py-4 px-4 text-gray-400">{event.date}</td>
                                            <td className="py-4 px-4 text-gray-400">{event.location}</td>
                                            <td className="py-4 px-4 text-center text-gray-300">{event.participants}</td>
                                            <td className="py-4 px-4">
                                                <span className="text-red-400 font-medium">{event.winner}</span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-400">{event.runnerUp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <footer className="border-t border-zinc-800/60 py-8 mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-xs text-gray-700">&copy; {new Date().getFullYear()} Shadow Syndicate. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
