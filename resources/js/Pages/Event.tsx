import SiteFooter from '@/Components/SiteFooter';
import SiteLogo from '@/Components/SiteLogo';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { PageProps } from '@/types';
import { formatEventFeeDisplay, getRegistrationFee } from '@/utils/eventFees';
import { tournamentxLoginUrl } from '@/utils/tournamentxUrl';

interface UpcomingEvent {
    id: number;
    title: string;
    description: string | null;
    organizer: string | null;
    date: string;
    time: string | null;
    location: string;
    map_address: string | null;
    map_lat: number | null;
    map_lng: number | null;
    format: string | null;
    slots: string | null;
    entry_fee: string | null;
    pre_register_fee: string | null;
    pre_register_until: string | null;
    prizes: Array<{ place: string; prize: string }> | null;
    status: string;
    allow_double_entry: boolean;
    require_payment: boolean;
    payment_method: string | null;
    payment_qr: string | null;
}

interface PastEvent {
    id: number;
    title: string;
    date: string;
    location: string;
    participants: number | null;
    winner: string | null;
    runner_up: string | null;
    entry_fee: string | null;
    organizer: string | null;
}

interface RegForm {
    full_name: string;
    entry_type: 'single' | 'double';
    blader_name_1: string;
    blader_name_2: string;
    payment_proof: File | null;
}

const emptyReg: RegForm = {
    full_name: '',
    entry_type: 'single',
    blader_name_1: '',
    blader_name_2: '',
    payment_proof: null,
};

function getMapEmbedUrl(event: UpcomingEvent): string | null {
    if (event.map_lat && event.map_lng) {
        return `https://maps.google.com/maps?q=${event.map_lat},${event.map_lng}&z=15&output=embed`;
    }
    if (event.map_address) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(event.map_address)}&z=15&output=embed`;
    }
    return null;
}

function formatEventDateTime(date: string, time?: string | null): string {
    const isoDateTime = time ? `${date}T${time}` : `${date}T00:00`;
    const parsed = new Date(isoDateTime);

    if (Number.isNaN(parsed.getTime())) {
        return `${date}${time ? ` ${time}` : ''}`;
    }

    const dateText = parsed.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    if (!time) {
        return dateText;
    }

    const timeText = parsed.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    return `${dateText} ${timeText}`;
}

export default function Event({ upcomingEvents = [], pastEvents = [] }: { upcomingEvents?: UpcomingEvent[]; pastEvents?: PastEvent[] }) {
    const pageProps = usePage<PageProps>().props;
    const { auth, flash } = pageProps;
    const [regEvent, setRegEvent] = useState<UpcomingEvent | null>(null);
    const [regForm, setRegForm] = useState<RegForm>(emptyReg);
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openRegister = (event: UpcomingEvent) => {
        if (!auth.user) {
            window.location.href = tournamentxLoginUrl(pageProps);
            return;
        }
        setRegEvent(event);
        setRegForm({ ...emptyReg });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRegSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!regEvent) return;
        setProcessing(true);

        const formData = new FormData();
        formData.append('full_name', regForm.full_name);
        formData.append('entry_type', regForm.entry_type);
        formData.append('blader_name_1', regForm.blader_name_1);
        if (regForm.entry_type === 'double') {
            formData.append('blader_name_2', regForm.blader_name_2);
        }
        if (regForm.payment_proof) {
            formData.append('payment_proof', regForm.payment_proof);
        }

        router.post(route('events.register', regEvent.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => setRegEvent(null),
        });
    };

    const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors';

    return (
        <>
            <Head title="Events - Shadow Syndicate" />
            <div className="min-h-screen bg-zinc-950 text-white">
                {/* Navigation */}
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
                                <Link href={route('members')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Members</Link>
                                <Link href={route('events')} className="px-4 py-2 text-sm font-medium text-red-400 transition-colors">Event</Link>
                                <Link href={route('blog')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Blog</Link>
                                <Link href={route('jersey')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Shop</Link>
                            </div>
                        </div>
                    </div>
                </nav>
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                            {flash.success}
                        </div>
                    </div>
                )}
                {flash?.error && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                            {flash.error}
                        </div>
                    </div>
                )}

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

                        {upcomingEvents.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {upcomingEvents.map((event) => {
                                    const mapUrl = getMapEmbedUrl(event);

                                    return (
                                        <div
                                            key={event.id}
                                            onClick={() => router.visit(route('events.show', event.id))}
                                            className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all flex flex-col cursor-pointer"
                                        >
                                            <div className="p-5 sm:p-6 flex flex-col flex-1">
                                                {/* Header: Title + Status */}
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                                                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{event.title}</h3>
                                                    <span
                                                        className={`shrink-0 self-start px-4 py-1.5 text-xs font-bold rounded-full border ${
                                                            event.status === 'Registration Open'
                                                                ? 'text-green-400 bg-green-500/10 border-green-500/30'
                                                                : event.status === 'Completed'
                                                                  ? 'text-gray-400 bg-zinc-800/60 border-zinc-700/40'
                                                                  : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                                                        }`}
                                                    >
                                                        {event.status}
                                                    </span>
                                                </div>

                                                {event.organizer && (
                                                    <p className="text-sm text-gray-500 mb-4">
                                                        Posted by{' '}
                                                        <span className="text-gray-300 font-medium">{event.organizer}</span>
                                                    </p>
                                                )}

                                                {event.description && (
                                                    <p className="text-gray-400 text-sm leading-relaxed max-w-3xl mb-6">{event.description}</p>
                                                )}

                                                {/* Info Grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-xs">Date & Time</p>
                                                            <p className="text-white font-medium">{formatEventDateTime(event.date, event.time)}</p>
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
                                                            <p className="text-white font-medium">{event.format || '—'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-sm">
                                                        <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-xs">Players</p>
                                                            <p className="text-white font-medium">{event.slots || '—'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-sm">
                                                        <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-xs">Fees</p>
                                                            <p className="text-white font-medium">{formatEventFeeDisplay(event)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Prizes + Map + Register pinned to bottom */}
                                                <div className="mt-auto">
                                                    {/* Prizes */}
                                                    {event.prizes && event.prizes.length > 0 && (
                                                        <div className="mb-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 11h-.5A3.375 3.375 0 009 14.25v4.5m3.75-12V3.75m-3 3.75h6" />
                                                                </svg>
                                                                <h4 className="text-sm font-bold text-white uppercase tracking-wide">Prizes</h4>
                                                            </div>
                                                            <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-xl p-4 space-y-2">
                                                                {event.prizes.map((p, i) => (
                                                                    <div key={i} className="flex items-start gap-3 text-sm">
                                                                        <span className="shrink-0 text-red-400 font-bold min-w-[120px]">{p.place}:</span>
                                                                        <span className="text-gray-300">{p.prize}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Google Maps Embed */}
                                                    {mapUrl && (
                                                        <div className="mb-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503-8.397l.497.028a4.125 4.125 0 01-.063 8.246m.063-8.246A4.125 4.125 0 0012 10.875M9 6.75A4.125 4.125 0 0112 2.625a4.125 4.125 0 013 4.125" />
                                                                </svg>
                                                                <h4 className="text-sm font-bold text-white uppercase tracking-wide">Venue Location</h4>
                                                            </div>
                                                            <div className="rounded-xl overflow-hidden border border-zinc-700/40">
                                                                <iframe
                                                                    src={mapUrl}
                                                                    width="100%"
                                                                    height="200"
                                                                    style={{ border: 0 }}
                                                                    allowFullScreen
                                                                    loading="lazy"
                                                                    referrerPolicy="no-referrer-when-downgrade"
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Register Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openRegister(event);
                                                        }}
                                                        className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                        </svg>
                                                        Register Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-600">
                                <svg className="w-12 h-12 mx-auto mb-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                <p className="text-lg font-medium">No upcoming events</p>
                                <p className="text-sm text-gray-700 mt-1">Stay tuned for future tournaments!</p>
                            </div>
                        )}
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

                        {pastEvents.length > 0 ? (
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
                                            <th className="text-left py-3 px-4 text-gray-500 font-medium">Entrance Fee</th>
                                            <th className="text-left py-3 px-4 text-gray-500 font-medium">Organizer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pastEvents.map((event) => (
                                            <tr key={event.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors">
                                                <td className="py-4 px-4 font-medium text-white">{event.title}</td>
                                                <td className="py-4 px-4 text-gray-400">{event.date}</td>
                                                <td className="py-4 px-4 text-gray-400">{event.location}</td>
                                                <td className="py-4 px-4 text-center text-gray-300">{event.participants ?? '—'}</td>
                                                <td className="py-4 px-4">
                                                    <span className="text-red-400 font-medium">{event.winner ?? '—'}</span>
                                                </td>
                                                <td className="py-4 px-4 text-gray-400">{event.runner_up ?? '—'}</td>
                                                <td className="py-4 px-4 text-gray-400">{event.entry_fee ?? '—'}</td>
                                                <td className="py-4 px-4 text-gray-400">{event.organizer ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-600">
                                <p className="text-lg">No past events.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <SiteFooter className="mt-12" />
            </div>

            {/* Registration Modal */}
            {regEvent && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setRegEvent(null)} />
                    <div className="fixed z-50 inset-0 flex items-start justify-center p-4 overflow-y-auto">
                        <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 p-6 my-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Register</h3>
                                    <p className="text-xs text-gray-500">{regEvent.title}</p>
                                </div>
                            </div>

                            <form onSubmit={handleRegSubmit} className="space-y-4">
                                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                                    <p className="text-xs text-gray-500">Amount to pay</p>
                                    <p className="text-lg font-bold text-red-400">{getRegistrationFee(regEvent)}</p>
                                    {regEvent.pre_register_fee && regEvent.entry_fee && regEvent.pre_register_fee !== regEvent.entry_fee && (
                                        <p className="text-[11px] text-gray-600 mt-1">Door price: {regEvent.entry_fee}</p>
                                    )}
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
                                    <input
                                        type="text"
                                        value={regForm.full_name}
                                        onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
                                        required
                                        className={inputClass}
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                {/* Entry Type */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Entry Type *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setRegForm({ ...regForm, entry_type: 'single' })}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                                regForm.entry_type === 'single'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                                    : 'bg-zinc-800/50 text-gray-400 border-zinc-700/50 hover:text-white hover:border-zinc-600'
                                            }`}
                                        >
                                            Single Entry
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => regEvent.allow_double_entry && setRegForm({ ...regForm, entry_type: 'double' })}
                                            disabled={!regEvent.allow_double_entry}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                                regForm.entry_type === 'double'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                                    : !regEvent.allow_double_entry
                                                      ? 'bg-zinc-800/30 text-gray-600 border-zinc-700/30 cursor-not-allowed'
                                                      : 'bg-zinc-800/50 text-gray-400 border-zinc-700/50 hover:text-white hover:border-zinc-600'
                                            }`}
                                        >
                                            Double Entry
                                        </button>
                                    </div>
                                    {!regEvent.allow_double_entry && (
                                        <p className="text-[11px] text-gray-600 mt-1">Double entry is not available for this event.</p>
                                    )}
                                </div>

                                {/* Blader Name 1 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Blader Name {regForm.entry_type === 'double' ? '1' : ''} *
                                    </label>
                                    <input
                                        type="text"
                                        value={regForm.blader_name_1}
                                        onChange={(e) => setRegForm({ ...regForm, blader_name_1: e.target.value })}
                                        required
                                        className={inputClass}
                                        placeholder="Enter blader name"
                                    />
                                </div>

                                {/* Blader Name 2 (for double entry) */}
                                {regForm.entry_type === 'double' && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Blader Name 2 *</label>
                                        <input
                                            type="text"
                                            value={regForm.blader_name_2}
                                            onChange={(e) => setRegForm({ ...regForm, blader_name_2: e.target.value })}
                                            required
                                            className={inputClass}
                                            placeholder="Enter second blader name"
                                        />
                                    </div>
                                )}

                                {/* Payment Upload */}
                                {regEvent.require_payment && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Upload Payment Proof *</label>

                                        {/* QR Code & Instructions */}
                                        {(regEvent.payment_qr || regEvent.payment_method) && (
                                            <div className="mb-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
                                                {regEvent.payment_qr && (
                                                    <img
                                                        src={route('private.payment-qr', regEvent.id)}
                                                        alt="Payment QR Code"
                                                        className="w-48 h-48 object-contain mx-auto rounded-lg mb-2"
                                                    />
                                                )}
                                                {regEvent.payment_method && (
                                                    <p className="text-sm text-gray-300">{regEvent.payment_method}</p>
                                                )}
                                                <p className="text-[11px] text-amber-400/70 mt-2">Scan the QR code to pay, then upload proof below</p>
                                            </div>
                                        )}

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setRegForm({ ...regForm, payment_proof: e.target.files?.[0] ?? null })}
                                            required
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20 file:cursor-pointer file:transition-colors"
                                        />
                                        <p className="text-[11px] text-gray-600 mt-1">Upload a screenshot of your payment (max 5MB)</p>
                                    </div>
                                )}

                                {/* Status Note */}
                                <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
                                    <p className="text-xs text-gray-500">
                                        Your registration will be marked as <span className="text-amber-400 font-medium">tentative</span> until the event organizer confirms it.
                                    </p>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setRegEvent(null)}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all disabled:opacity-50"
                                    >
                                        {processing ? 'Submitting...' : 'Submit Registration'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
