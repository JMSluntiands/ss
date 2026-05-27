import { memberImageSrc } from '@/utils/publicStorage';
import { Link } from '@inertiajs/react';

export interface MemberSlideData {
    id: number;
    name: string;
    role: string;
    rank: string;
    wins: number;
    losses: number;
    bey: string | null;
    image_url: string | null;
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

function MemberCard({ member }: { member: MemberSlideData }) {
    const total = member.wins + member.losses;
    const winRate = total > 0 ? Math.round((member.wins / total) * 100) : 0;
    const img = memberImageSrc(member.image_url);

    return (
        <div className="w-[260px] sm:w-[280px] shrink-0 flex flex-col bg-zinc-900/80 border border-zinc-800/60 rounded-2xl overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden">
                {img ? (
                    <img src={img} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-700 to-zinc-800 flex items-center justify-center">
                        <span className="text-4xl font-black text-white/80">{member.name.charAt(0)}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                <span
                    className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border bg-zinc-950/70 backdrop-blur-sm ${
                        roleColors[member.role] || 'text-gray-400 border-zinc-600/50'
                    }`}
                >
                    {member.role}
                </span>
                {member.rank && (
                    <span
                        className={`absolute top-2 left-2 w-7 h-7 flex items-center justify-center text-xs font-black rounded-lg border ${
                            rankColors[member.rank] || 'text-gray-400 bg-zinc-700/30 border-zinc-600/30'
                        }`}
                    >
                        {member.rank}
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-white text-center truncate">{member.name}</h3>
                {member.bey && (
                    <p className="text-xs text-red-400/80 text-center mt-1 truncate" title={member.bey}>
                        {member.bey}
                    </p>
                )}
                <div className="grid grid-cols-3 gap-1.5 mt-3">
                    <div className="text-center py-1 rounded-lg bg-zinc-800/50">
                        <p className="text-sm font-bold text-emerald-400">{member.wins}</p>
                        <p className="text-[9px] text-gray-600 uppercase">W</p>
                    </div>
                    <div className="text-center py-1 rounded-lg bg-zinc-800/50">
                        <p className="text-sm font-bold text-red-400">{member.losses}</p>
                        <p className="text-[9px] text-gray-600 uppercase">L</p>
                    </div>
                    <div className="text-center py-1 rounded-lg bg-zinc-800/50">
                        <p className="text-sm font-bold text-white">{winRate}%</p>
                        <p className="text-[9px] text-gray-600 uppercase">WR</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MembersMarquee({ members }: { members: MemberSlideData[] }) {
    if (members.length === 0) {
        return (
            <div className="text-center py-12 text-gray-600">
                <p>No members to display yet.</p>
            </div>
        );
    }

    const slides = members.length < 4 ? [...members, ...members, ...members, ...members] : [...members, ...members];

    return (
        <div className="members-marquee relative overflow-hidden rounded-2xl">
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-zinc-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-zinc-900 to-transparent z-10 pointer-events-none" />

            <div className="members-marquee-track flex w-max gap-4 py-2">
                {slides.map((member, i) => (
                    <MemberCard key={`${member.id}-${i}`} member={member} />
                ))}
            </div>
        </div>
    );
}

export function MembersSliderSection({ members }: { members: MemberSlideData[] }) {
    return (
        <section className="relative py-24 sm:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800/80">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-red-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-bold tracking-widest text-red-400 uppercase">Members</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                                    Meet the <span className="text-red-500">Syndicate</span>
                                </h2>
                                <p className="text-gray-400 text-base max-w-xl">
                                    The bladers who power Shadow Syndicate — scroll to see our roster.
                                </p>
                            </div>
                            <Link
                                href={route('members')}
                                className="shrink-0 inline-flex items-center justify-center px-6 py-3 text-sm font-bold bg-red-600 hover:bg-red-500 rounded-xl transition-all shadow-lg shadow-red-600/20"
                            >
                                View All Members →
                            </Link>
                        </div>

                        <MembersMarquee members={members} />
                    </div>
                </div>
            </div>
        </section>
    );
}
