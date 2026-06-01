import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';

interface Registration {
    id: number;
    full_name: string;
    entry_type: 'single' | 'double';
    blader_name_1: string;
    blader_name_2: string | null;
    payment_proof: string | null;
    status: 'tentative' | 'confirmed' | 'rejected';
    user: { id: number; name: string; email: string } | null;
    created_at: string;
}

interface EventData {
    id: number;
    title: string;
    require_payment: boolean;
    allow_double_entry: boolean;
    tournament_id: number | null;
    tournament: { id: number; name: string } | null;
    registrations: Registration[];
}

const statusStyles: Record<string, string> = {
    tentative: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

type PaymentPreview = { url: string; playerName: string };

export default function EventRegistrations({ event }: { event: EventData }) {
    const [processing, setProcessing] = useState<number | null>(null);
    const [viewPayment, setViewPayment] = useState<PaymentPreview | null>(null);

    const openReceipt = (reg: Registration) => {
        setViewPayment({
            url: route('private.payment-proof', reg.id),
            playerName: reg.full_name,
        });
    };

    const handleConfirm = (reg: Registration) => {
        setProcessing(reg.id);
        router.post(route('registrations.confirm', reg.id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    const handleReject = (reg: Registration) => {
        setProcessing(reg.id);
        router.post(route('registrations.reject', reg.id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    const tentative = event.registrations.filter(r => r.status === 'tentative');
    const confirmed = event.registrations.filter(r => r.status === 'confirmed');
    const rejected = event.registrations.filter(r => r.status === 'rejected');

    return (
        <AuthenticatedLayout currentPage="events">
            <Head title={`Registrations - ${event.title}`} />

            <div className="p-6 lg:p-10">
                <div className="mb-8">
                    <Link
                        href={route('my-events')}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-4"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Events
                    </Link>
                    <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                    <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                    <div className="flex items-center gap-4 mt-3">
                        <p className="text-sm text-gray-500">
                            {event.registrations.length} total registration{event.registrations.length !== 1 ? 's' : ''}
                        </p>
                        {event.tournament && (
                            <span className="text-xs text-gray-600">
                                Tournament: <span className="text-gray-400">{event.tournament.name}</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <p className="text-2xl font-bold text-amber-400">{tentative.length}</p>
                        <p className="text-xs text-amber-400/70 font-medium uppercase tracking-wider mt-1">Tentative</p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <p className="text-2xl font-bold text-emerald-400">{confirmed.length}</p>
                        <p className="text-xs text-emerald-400/70 font-medium uppercase tracking-wider mt-1">Confirmed</p>
                    </div>
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                        <p className="text-2xl font-bold text-red-400">{rejected.length}</p>
                        <p className="text-xs text-red-400/70 font-medium uppercase tracking-wider mt-1">Rejected</p>
                    </div>
                </div>

                {/* Registrations List */}
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800/60">
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Player</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entry</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Blader Name(s)</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {event.registrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-white">{reg.full_name}</p>
                                            {reg.user && (
                                                <p className="text-xs text-gray-600">{reg.user.email}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                reg.entry_type === 'double'
                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {reg.entry_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-300">{reg.blader_name_1}</p>
                                            {reg.blader_name_2 && (
                                                <p className="text-sm text-gray-400">{reg.blader_name_2}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {reg.payment_proof ? (
                                                <button
                                                    type="button"
                                                    onClick={() => openReceipt(reg)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    View
                                                </button>
                                            ) : event.require_payment ? (
                                                <span className="text-xs text-amber-400/80">Not uploaded</span>
                                            ) : (
                                                <span className="text-xs text-gray-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                statusStyles[reg.status]
                                            }`}>
                                                {reg.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-xs text-gray-500">
                                                {new Date(reg.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 flex-wrap">
                                            {reg.payment_proof && (
                                                <button
                                                    type="button"
                                                    onClick={() => openReceipt(reg)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
                                                >
                                                    Receipt
                                                </button>
                                            )}
                                            {reg.status === 'tentative' && (
                                                <>
                                                    <button
                                                        onClick={() => handleConfirm(reg)}
                                                        disabled={processing === reg.id}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                                    >
                                                        {processing === reg.id ? '...' : 'Confirm'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(reg)}
                                                        disabled={processing === reg.id}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                                    >
                                                        {processing === reg.id ? '...' : 'Reject'}
                                                    </button>
                                                </>
                                            )}
                                            {reg.status === 'confirmed' && (
                                                <span className="text-xs text-emerald-400/60">Added to tournament</span>
                                            )}
                                            {reg.status === 'rejected' && (
                                                <span className="text-xs text-gray-600">Rejected</span>
                                            )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {event.registrations.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-500 text-sm">No registrations yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment receipt modal */}
            {viewPayment && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setViewPayment(null)} />
                    <div className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none">
                        <div className="relative max-w-lg w-full pointer-events-auto rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80">
                                <div>
                                    <h3 className="text-sm font-semibold text-white">Payment Receipt</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{viewPayment.playerName}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewPayment(null)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4 bg-zinc-950/50 max-h-[70vh] overflow-y-auto">
                                <img
                                    src={viewPayment.url}
                                    alt={`Payment receipt for ${viewPayment.playerName}`}
                                    className="w-full rounded-xl border border-zinc-700/80"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}
