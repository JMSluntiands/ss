import SiteLogo from '@/Components/SiteLogo';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface MemberData {
    id: number;
    name: string;
    role: string;
    rank: string;
    wins: number;
    losses: number;
    bey: string | null;
    joined: string | null;
    image_url: string | null;
}

function memberImageSrc(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `/storage/${url}`;
}

const roleColors: Record<string, string> = {
    Founder: 'text-red-400 border-red-500/30',
    'Co-Founder': 'text-red-300 border-red-400/30',
    Officer: 'text-orange-400 border-orange-500/30',
    Member: 'text-gray-400 border-zinc-600/50',
    Recruit: 'text-gray-500 border-zinc-700/50',
};

const rankColors: Record<string, string> = {
    S: 'text-red-400 bg-red-500/10 border-red-500/30',
    A: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    B: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    C: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    D: 'text-gray-400 bg-zinc-700/30 border-zinc-600/30',
};

export default function Members({ members = [] }: { members?: MemberData[] }) {
    const [search, setSearch] = useState('');

    const filtered = members.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.role.toLowerCase().includes(search.toLowerCase()) ||
            (m.bey || '').toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <>
            <Head title="Members - Shadow Syndicate" />
            <div className="min-h-screen bg-zinc-950 text-white">
                <nav className="bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 sm:h-20">
                            <Link href={route('home')} className="flex items-center gap-3">
                                <SiteLogo className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_12px_rgba(220,38,38,0.4)]" />
                                <span className="text-lg sm:text-xl font-black tracking-tight">
                                    SHADOW <span className="text-red-500">SYNDICATE</span>
                                </span>
                            </Link>
                            <div className="hidden md:flex items-center gap-2">
                                <Link href={route('home')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
                                <Link href={route('members')} className="px-4 py-2 text-sm font-medium text-red-400 transition-colors">Members</Link>
                                <Link href={route('events')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Event</Link>
                                <Link href={route('blog')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Blog</Link>
                                <Link href={route('jersey')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Jersey</Link>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-10">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                            Our <span className="text-red-500">Members</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            Meet the bladers who make up the Shadow Syndicate. From founders to recruits, every member brings power to the arena.
                        </p>
                    </div>

                    {members.length > 0 ? (
                        <>
                            <div className="mb-8">
                                <input
                                    type="text"
                                    placeholder="Search members by name, role, or Beyblade..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                                {filtered.map((member) => {
                                    const total = member.wins + member.losses;
                                    const winRate = total > 0 ? Math.round((member.wins / total) * 100) : 0;

                                    return (
                                        <div
                                            key={member.id}
                                            className="group relative bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all"
                                        >
                                            <div className="relative aspect-[4/3] overflow-hidden">
                                                {memberImageSrc(member.image_url) ? (
                                                    <img
                                                        src={memberImageSrc(member.image_url)!}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-red-700 to-zinc-800 flex items-center justify-center">
                                                        <span className="text-5xl font-black text-white/80">{member.name.charAt(0)}</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                                                <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${roleColors[member.role] || 'text-gray-400 border-zinc-600/50'} bg-zinc-950/70 backdrop-blur-sm`}>
                                                    {member.role}
                                                </span>
                                                {member.rank && (
                                                    <span className={`absolute top-3 left-3 w-8 h-8 flex items-center justify-center text-xs font-black rounded-lg border ${rankColors[member.rank] || 'text-gray-400 bg-zinc-700/30 border-zinc-600/30'}`}>
                                                        {member.rank}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-white text-lg text-center">{member.name}</h3>

                                                {member.bey && (
                                                    <p className="text-xs text-red-400/80 text-center mt-1 truncate" title={member.bey}>
                                                        {member.bey}
                                                    </p>
                                                )}

                                                <div className="grid grid-cols-3 gap-2 mt-3">
                                                    <div className="text-center py-1.5 rounded-lg bg-zinc-800/50">
                                                        <p className="text-sm font-bold text-emerald-400">{member.wins}</p>
                                                        <p className="text-[10px] text-gray-600 uppercase">Wins</p>
                                                    </div>
                                                    <div className="text-center py-1.5 rounded-lg bg-zinc-800/50">
                                                        <p className="text-sm font-bold text-red-400">{member.losses}</p>
                                                        <p className="text-[10px] text-gray-600 uppercase">Losses</p>
                                                    </div>
                                                    <div className="text-center py-1.5 rounded-lg bg-zinc-800/50">
                                                        <p className="text-sm font-bold text-white">{winRate}%</p>
                                                        <p className="text-[10px] text-gray-600 uppercase">WR</p>
                                                    </div>
                                                </div>

                                                <p className="text-[11px] text-gray-600 text-center mt-3">
                                                    {member.joined ? `Joined ${member.joined}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {filtered.length === 0 && (
                                <div className="text-center py-20 text-gray-600">
                                    <p className="text-lg">No members found matching your search.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 text-gray-600">
                            <p className="text-lg">No members yet.</p>
                        </div>
                    )}
                </div>

                <footer className="border-t border-zinc-800/60 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-xs text-gray-700">&copy; {new Date().getFullYear()} Shadow Syndicate. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
