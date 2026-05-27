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

export default function EventRegistrations({ event }: { event: EventData }) {
    const [processing, setProcessing] = useState<number | null>(null);
    const [viewPayment, setViewPayment] = useState<string | null>(null);

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
                                    {event.require_payment && (
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                    )}
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
                                        {event.require_payment && (
                                            <td className="px-6 py-4">
                                                {reg.payment_proof ? (
                                                    <button
                                                        onClick={() => setViewPayment(route('private.payment-proof', reg.id))}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-600">No proof</span>
                                                )}
                                            </td>
                                        )}
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
                                            {reg.status === 'tentative' && (
                                                <div className="flex items-center justify-end gap-2">
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
                                                </div>
                                            )}
                                            {reg.status === 'confirmed' && (
                                                <span className="text-xs text-emerald-400/60">Added to tournament</span>
                                            )}
                                            {reg.status === 'rejected' && (
                                                <span className="text-xs text-gray-600">Rejected</span>
                                            )}
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

            {/* Payment Proof Viewer */}
            {viewPayment && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setViewPayment(null)} />
                    <div className="fixed z-50 inset-0 flex items-center justify-center p-4">
                        <div className="relative max-w-lg w-full">
                            <button
                                onClick={() => setViewPayment(null)}
                                className="absolute -top-10 right-0 p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <img
                                src={viewPayment}
                                alt="Payment proof"
                                className="w-full rounded-2xl border border-zinc-700 shadow-2xl"
                            />
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}
