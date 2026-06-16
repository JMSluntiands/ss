import SiteFooter from '@/Components/SiteFooter';
import SiteNav from '@/Components/SiteNav';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { PageProps } from '@/types';
import { formatEventFeeDisplay, getRegistrationFee } from '@/utils/eventFees';
import { getEventRegistrationDefaults } from '@/utils/eventRegistration';
import { isEventSlotsFull } from '@/utils/eventSlots';

interface EventData {
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
    rules: string | null;
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

function getMapEmbedUrl(event: EventData): string | null {
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

export default function EventShow({
    event,
    registeredCount,
}: {
    event: EventData;
    registeredCount: number;
}) {
    const { flash, auth } = usePage<PageProps>().props;
    const [regOpen, setRegOpen] = useState(false);
    const [regForm, setRegForm] = useState<RegForm>(emptyReg);
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mapUrl = getMapEmbedUrl(event);
    const slotsFull = isEventSlotsFull(event.slots, registeredCount);

    const openRegister = () => {
        if (slotsFull) return;
        const defaults = getEventRegistrationDefaults(auth);
        setRegForm({ ...emptyReg, ...defaults });
        if (fileInputRef.current) fileInputRef.current.value = '';
        setRegOpen(true);
    };

    const handleRegSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('full_name', regForm.full_name);
        formData.append('entry_type', regForm.entry_type);
        formData.append('blader_name_1', regForm.blader_name_1);
        if (regForm.entry_type === 'double') formData.append('blader_name_2', regForm.blader_name_2);
        if (regForm.payment_proof) formData.append('payment_proof', regForm.payment_proof);

        router.post(route('events.register', event.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => setRegOpen(false),
        });
    };

    const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors';

    return (
        <>
            <Head title={`${event.title} - Event Details`} />
            <div className="min-h-screen bg-zinc-950 text-white">
                <SiteNav activePage="events" />
                {(flash?.success || flash?.error) && (
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-2">
                        {flash?.success && (
                            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                                {flash.success}
                            </div>
                        )}
                        {flash?.error && (
                            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                                {flash.error}
                            </div>
                        )}
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <Link
                        href={route('events')}
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors mb-6"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Events
                    </Link>
                    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 sm:p-7">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{event.title}</h1>
                            <span className="px-4 py-1.5 text-xs font-bold rounded-full border text-yellow-400 bg-yellow-500/10 border-yellow-500/30">
                                {event.status}
                            </span>
                        </div>

                        {event.organizer && (
                            <p className="text-sm text-gray-500 mb-4">
                                Posted by <span className="text-gray-300 font-medium">{event.organizer}</span>
                            </p>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                {event.description && (
                                    <p className="text-gray-300 mb-6 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                                )}

                                {event.rules && (
                                    <div className="mb-6">
                                        <h2 className="text-sm font-bold uppercase tracking-wide text-white mb-2">Rules</h2>
                                        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
                                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{event.rules}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-3 text-sm"><span className="text-gray-500">Date & Time:</span> <span className="text-white">{formatEventDateTime(event.date, event.time)}</span></div>
                                    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-3 text-sm"><span className="text-gray-500">Location:</span> <span className="text-white">{event.location}</span></div>
                                    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-3 text-sm"><span className="text-gray-500">Format:</span> <span className="text-white">{event.format || '—'}</span></div>
                                    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-3 text-sm"><span className="text-gray-500">Slots:</span> <span className="text-white">{event.slots || '—'}</span></div>
                                    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-3 text-sm sm:col-span-2">
                                        <span className="text-gray-500">Fees:</span>{' '}
                                        <span className="text-white">{formatEventFeeDisplay(event)}</span>
                                    </div>
                                </div>

                                {mapUrl && (
                                    <div className="rounded-xl overflow-hidden border border-zinc-700/40">
                                        <iframe
                                            src={mapUrl}
                                            width="100%"
                                            height="300"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={openRegister}
                                    disabled={slotsFull}
                                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                        slotsFull
                                            ? 'text-gray-500 bg-zinc-800 border border-zinc-700/50 cursor-not-allowed'
                                            : 'text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110'
                                    }`}
                                >
                                    {slotsFull ? 'Slots Full' : 'Register Now'}
                                </button>

                                {event.prizes && event.prizes.length > 0 && (
                                    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-zinc-800/60">
                                            <h2 className="text-sm font-bold uppercase tracking-wide text-white">Prizes</h2>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {event.prizes.map((p, i) => (
                                                <div key={i} className="text-sm">
                                                    <span className="text-red-400 font-semibold">{p.place}</span>
                                                    <p className="text-gray-300 mt-0.5">{p.prize}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                <SiteFooter className="mt-12" />
            </div>

            {regOpen && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setRegOpen(false)} />
                    <div className="fixed z-50 inset-0 flex items-start justify-center p-4 overflow-y-auto">
                        <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 p-6 my-8">
                            <h3 className="text-lg font-semibold text-white mb-4">Register - {event.title}</h3>
                            <form onSubmit={handleRegSubmit} className="space-y-4">
                                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                                    <p className="text-xs text-gray-500">Amount to pay</p>
                                    <p className="text-lg font-bold text-red-400">{getRegistrationFee(event)}</p>
                                    {event.pre_register_fee && event.entry_fee && event.pre_register_fee !== event.entry_fee && (
                                        <p className="text-[11px] text-gray-600 mt-1">Door price: {event.entry_fee}</p>
                                    )}
                                </div>
                                <div className={`p-3 rounded-xl border ${auth.user ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                                    <p className="text-xs text-gray-500">Registering as</p>
                                    {auth.user ? (
                                        <>
                                            <p className="text-sm font-semibold text-emerald-400">Logged in</p>
                                            <p className="text-sm font-medium text-white mt-0.5">{auth.user.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm font-semibold text-amber-400">Guest</p>
                                            <p className="text-xs text-gray-500 mt-0.5">No login required — fill in your details below.</p>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={regForm.full_name}
                                        onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
                                        className={inputClass}
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setRegForm({ ...regForm, entry_type: 'single' })} className={`px-4 py-2.5 rounded-xl text-sm font-medium border ${regForm.entry_type === 'single' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-zinc-800/50 text-gray-400 border-zinc-700/50'}`}>Single</button>
                                    <button type="button" onClick={() => event.allow_double_entry && setRegForm({ ...regForm, entry_type: 'double' })} disabled={!event.allow_double_entry} className={`px-4 py-2.5 rounded-xl text-sm font-medium border ${regForm.entry_type === 'double' ? 'bg-red-500/10 text-red-400 border-red-500/30' : !event.allow_double_entry ? 'bg-zinc-800/30 text-gray-600 border-zinc-700/30 cursor-not-allowed' : 'bg-zinc-800/50 text-gray-400 border-zinc-700/50'}`}>Double</button>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Blader Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={regForm.blader_name_1}
                                        onChange={(e) => setRegForm({ ...regForm, blader_name_1: e.target.value })}
                                        className={inputClass}
                                        placeholder="Your blader name"
                                    />
                                </div>
                                {regForm.entry_type === 'double' && <input type="text" required value={regForm.blader_name_2} onChange={(e) => setRegForm({ ...regForm, blader_name_2: e.target.value })} className={inputClass} placeholder="Blader Name 2" />}
                                {event.require_payment && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Upload Payment Proof *</label>

                                        {(event.payment_qr || event.payment_method) && (
                                            <div className="mb-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
                                                {event.payment_qr && (
                                                    <img
                                                        src={route('private.payment-qr', event.id)}
                                                        alt="Payment QR Code"
                                                        className="w-48 h-48 object-contain mx-auto rounded-lg mb-2"
                                                    />
                                                )}
                                                {event.payment_method && (
                                                    <p className="text-sm text-gray-300">{event.payment_method}</p>
                                                )}
                                                <p className="text-[11px] text-amber-400/70 mt-2">Scan the QR code to pay, then upload proof below</p>
                                            </div>
                                        )}

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            required
                                            onChange={(e) => setRegForm({ ...regForm, payment_proof: e.target.files?.[0] ?? null })}
                                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20 file:cursor-pointer file:transition-colors"
                                        />
                                        <p className="text-[11px] text-gray-600 mt-1">Upload a screenshot of your payment (max 5MB)</p>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setRegOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white">Cancel</button>
                                    <button type="submit" disabled={processing} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-500 disabled:opacity-50">{processing ? 'Submitting...' : 'Submit'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

