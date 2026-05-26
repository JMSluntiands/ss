import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const members = [
    { name: 'DarkBlade', role: 'Founder', rank: 'S', wins: 87, losses: 12, bey: 'Dranzer Spiral', joined: 'Jan 2024', img: 'https://i.pravatar.cc/150?img=1' },
    { name: 'StormRider', role: 'Co-Founder', rank: 'S', wins: 74, losses: 18, bey: 'Dragoon Storm', joined: 'Jan 2024', img: 'https://i.pravatar.cc/150?img=3' },
    { name: 'PhantomX', role: 'Officer', rank: 'A', wins: 65, losses: 23, bey: 'Wolborg MS', joined: 'Feb 2024', img: 'https://i.pravatar.cc/150?img=5' },
    { name: 'BlitzKing', role: 'Officer', rank: 'A', wins: 58, losses: 20, bey: 'Draciel Shield', joined: 'Mar 2024', img: 'https://i.pravatar.cc/150?img=7' },
    { name: 'ShadowViper', role: 'Member', rank: 'A', wins: 52, losses: 25, bey: 'Driger Fang', joined: 'Mar 2024', img: 'https://i.pravatar.cc/150?img=8' },
    { name: 'NovaCrush', role: 'Member', rank: 'B', wins: 44, losses: 30, bey: 'Trygle Wing', joined: 'Apr 2024', img: 'https://i.pravatar.cc/150?img=11' },
    { name: 'IronFist', role: 'Member', rank: 'B', wins: 39, losses: 28, bey: 'Galeon Attacker', joined: 'May 2024', img: 'https://i.pravatar.cc/150?img=12' },
    { name: 'ThunderBolt', role: 'Member', rank: 'B', wins: 35, losses: 32, bey: 'Flash Leopard', joined: 'May 2024', img: 'https://i.pravatar.cc/150?img=14' },
    { name: 'CrimsonEdge', role: 'Member', rank: 'C', wins: 28, losses: 35, bey: 'Burn Phoenix', joined: 'Jun 2024', img: 'https://i.pravatar.cc/150?img=15' },
    { name: 'ZeroGravity', role: 'Member', rank: 'C', wins: 22, losses: 30, bey: 'Galaxy Pegasus', joined: 'Jul 2024', img: 'https://i.pravatar.cc/150?img=18' },
    { name: 'VortexBlade', role: 'Member', rank: 'C', wins: 18, losses: 25, bey: 'Storm Aquario', joined: 'Aug 2024', img: 'https://i.pravatar.cc/150?img=20' },
    { name: 'NightHawk', role: 'Recruit', rank: 'D', wins: 10, losses: 20, bey: 'Rock Leone', joined: 'Sep 2024', img: 'https://i.pravatar.cc/150?img=22' },
];

const roleColors: Record<string, string> = {
    Founder: 'text-red-400',
    'Co-Founder': 'text-red-300',
    Officer: 'text-orange-400',
    Member: 'text-gray-400',
    Recruit: 'text-gray-500',
};

export default function Members() {
    const [search, setSearch] = useState('');

    const filtered = members.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.role.toLowerCase().includes(search.toLowerCase()) ||
            m.bey.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <>
            <Head title="Members - Shadow Syndicate" />
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
                        {filtered.map((member) => (
                            <div
                                key={member.name}
                                className="group relative bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all"
                            >
                                <div className="relative aspect-square overflow-hidden">
                                    <img
                                        src={member.img}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                                    <span className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${roleColors[member.role]} bg-zinc-950/70 backdrop-blur-sm`}>
                                        {member.role}
                                    </span>
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-bold text-white text-lg mb-1">{member.name}</h3>
                                    <p className="text-xs text-gray-500">Joined {member.joined}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20 text-gray-600">
                            <p className="text-lg">No members found matching your search.</p>
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
