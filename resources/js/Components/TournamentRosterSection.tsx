import OptimizedImage from '@/Components/OptimizedImage';
import { memberImageSrc } from '@/utils/publicStorage';
import { useState } from 'react';

export interface RosterBlader {
    name: string;
    placement?: string | null;
}

export interface TournamentRosterData {
    id: number;
    name: string;
    event_date: string | null;
    location: string | null;
    result: string | null;
    description: string | null;
    image_url: string | null;
    roster: RosterBlader[];
}

const resultColors: Record<string, string> = {
    Champion: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    'Top 4 Team': 'bg-red-500/15 text-red-300 border-red-500/40',
    Participated: 'bg-zinc-700/40 text-gray-400 border-zinc-600/50',
};

const placementStyles: Record<string, string> = {
    '1st': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    '2nd': 'bg-slate-400/15 text-slate-200 border-slate-400/30',
    '3rd': 'bg-orange-600/20 text-orange-300 border-orange-600/40',
    'Top 4': 'bg-red-500/15 text-red-300 border-red-500/30',
    'Top 8': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    'Top 16': 'bg-violet-500/15 text-violet-300 border-violet-500/30',
};

function formatDate(dateStr: string | null): string | null {
    if (!dateStr) return null;

    const normalized = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function avatarGradient(name: string): string {
    const hues = [0, 15, 345, 30, 210, 270];
    const index = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const hue = hues[index % hues.length];
    return `linear-gradient(135deg, hsl(${hue} 70% 35%) 0%, hsl(${hue} 50% 22%) 100%)`;
}

function BladerChip({ blader }: { blader: RosterBlader }) {
    const placementClass = blader.placement
        ? placementStyles[blader.placement] || 'bg-zinc-800/60 text-gray-400 border-zinc-700/50'
        : null;

    return (
        <div className="group flex items-center gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/50 px-3 py-2.5 hover:border-red-500/25 hover:bg-zinc-900/80 transition-all">
            <div
                className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-sm font-black text-white/90 shadow-inner"
                style={{ background: avatarGradient(blader.name) }}
            >
                {blader.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{blader.name}</p>
                {blader.placement && (
                    <span
                        className={`inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${placementClass}`}
                    >
                        {blader.placement}
                    </span>
                )}
            </div>
        </div>
    );
}

function TournamentPanel({ tournament }: { tournament: TournamentRosterData }) {
    const img = memberImageSrc(tournament.image_url);
    const formattedDate = formatDate(tournament.event_date);
    const resultClass = resultColors[tournament.result || ''] || 'bg-red-500/10 text-red-400 border-red-500/25';

    return (
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
                <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 aspect-[4/3] lg:aspect-auto lg:min-h-[280px]">
                    {img ? (
                        <OptimizedImage
                            src={memberImageSrc(tournament.image_url, 'thumb')!}
                            fallbackSrc={img}
                            alt={tournament.name}
                            sizes="(max-width: 1024px) 100vw, 40vw"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-950/80 via-zinc-900 to-zinc-950 flex items-center justify-center">
                            <svg className="w-20 h-20 text-red-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-xl font-black text-white leading-tight">{tournament.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {formattedDate && (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {formattedDate}
                                </span>
                            )}
                            {tournament.location && (
                                <>
                                    {formattedDate && <span className="text-zinc-700">·</span>}
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {tournament.location}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-3 flex flex-col">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {tournament.result && (
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border ${resultClass}`}>
                            {tournament.result}
                        </span>
                    )}
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border bg-zinc-800/50 text-gray-400 border-zinc-700/50">
                        {tournament.roster.length} Blader{tournament.roster.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {tournament.description && (
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">{tournament.description}</p>
                )}

                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-red-500 rounded-full" />
                    <h4 className="text-sm font-bold uppercase tracking-widest text-red-400">Our Roster</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                    {tournament.roster.map((blader) => (
                        <BladerChip key={blader.name} blader={blader} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function TournamentRosterSection({ tournaments = [] }: { tournaments?: TournamentRosterData[] }) {
    const [activeId, setActiveId] = useState(tournaments[0]?.id ?? null);
    const active = tournaments.find((t) => t.id === activeId) ?? tournaments[0];

    if (tournaments.length === 0) {
        return null;
    }

    return (
        <section id="tournaments-joined" className="relative py-24 sm:py-32">
            <div className="absolute inset-0 bg-zinc-900/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-full mb-6 uppercase">
                        Tournament History
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
                        Tournaments We&apos;ve{' '}
                        <span className="text-red-500">Joined</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Shadow Syndicate on the road — see the tournaments we&apos;ve entered
                        and the bladers who represented us.
                    </p>
                </div>

                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800/80">
                    <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-red-600/8 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />

                    <div className="relative z-10 p-6 sm:p-8 lg:p-10">
                        {tournaments.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                                {tournaments.map((t) => {
                                    const isActive = t.id === active?.id;
                                    const tabDate = formatDate(t.event_date);
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setActiveId(t.id)}
                                            className={`shrink-0 min-w-[140px] max-w-[220px] px-4 py-2.5 rounded-xl text-left border transition-all ${
                                                isActive
                                                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/20'
                                                    : 'bg-zinc-800/40 text-gray-300 border-zinc-700/50 hover:text-white hover:border-zinc-600'
                                            }`}
                                        >
                                            <span className="block text-sm font-semibold truncate">{t.name}</span>
                                            {tabDate && (
                                                <span
                                                    className={`block text-[11px] font-medium mt-1 truncate ${
                                                        isActive ? 'text-red-100' : 'text-gray-500'
                                                    }`}
                                                >
                                                    {tabDate}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {active && <TournamentPanel tournament={active} />}
                    </div>
                </div>

                {tournaments.length > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {tournaments.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setActiveId(t.id)}
                                aria-label={`Show ${t.name}`}
                                className={`h-1.5 rounded-full transition-all ${
                                    t.id === active?.id ? 'w-8 bg-red-500' : 'w-1.5 bg-zinc-700 hover:bg-zinc-600'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
