import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface RequestUser {
    id: number;
    name: string;
    email: string;
    tournamentx_plan?: string;
}

interface PlanRequest {
    id: number;
    requested_plan: string;
    status: string;
    amount_due: string | null;
    user_message: string | null;
    payment_proof: string | null;
    created_at: string;
    user: RequestUser;
}

interface PaginatedRequests {
    data: PlanRequest[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

const planLabels: Record<string, string> = {
    starter: 'Starter (Free)',
    community: 'Community',
    pro: 'Pro',
};

export default function PlanRequests({
    requests,
}: {
    requests: PaginatedRequests;
    planOptions?: Array<{ value: string; label: string }>;
}) {
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectNote, setRejectNote] = useState('');

    const approve = (id: number) => {
        if (!confirm('Approve this upgrade request and activate the Community plan?')) {
            return;
        }
        router.post(route('admin.plan-requests.approve', id));
    };

    const reject = (id: number) => {
        router.post(route('admin.plan-requests.reject', id), { admin_note: rejectNote || null }, {
            onSuccess: () => {
                setRejectingId(null);
                setRejectNote('');
            },
        });
    };

    return (
        <AdminLayout currentPage="plan-requests">
            <Head title="Plan Upgrade Requests" />

            <div className="p-6 lg:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Plan Upgrade Requests</h1>
                    <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400" />
                    <p className="text-sm text-gray-500 mt-3">
                        Verify payment proof before approving. Approving activates Community plan and judge / live scoring access.
                    </p>
                </div>

                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
                    {requests.data.length === 0 ? (
                        <div className="px-6 py-16 text-center text-gray-500 text-sm">No pending upgrade requests.</div>
                    ) : (
                        <div className="divide-y divide-zinc-800/60">
                            {requests.data.map((request) => (
                                <div key={request.id} className="px-6 py-5">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-base font-semibold text-white">{request.user.name}</p>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                                    Pending
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">{request.user.email}</p>
                                            <p className="text-sm text-gray-400 mt-2">
                                                Current plan:{' '}
                                                <span className="text-white">
                                                    {planLabels[request.user.tournamentx_plan ?? 'starter'] ?? request.user.tournamentx_plan}
                                                </span>
                                                {' → '}
                                                <span className="text-cyan-400">
                                                    {planLabels[request.requested_plan] ?? request.requested_plan}
                                                </span>
                                            </p>
                                            {request.amount_due && (
                                                <p className="text-sm text-amber-400/90 mt-1">Amount due: {request.amount_due}</p>
                                            )}
                                            {request.payment_proof && (
                                                <a
                                                    href={route('admin.plan-requests.payment-proof', request.id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                                                >
                                                    View payment proof →
                                                </a>
                                            )}
                                            {request.user_message && (
                                                <p className="text-sm text-gray-500 mt-2 italic">&ldquo;{request.user_message}&rdquo;</p>
                                            )}
                                            <p className="text-xs text-gray-600 mt-2">
                                                Requested {new Date(request.created_at).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => approve(request.id)}
                                                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRejectingId(rejectingId === request.id ? null : request.id);
                                                    setRejectNote('');
                                                }}
                                                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 border border-zinc-700 hover:bg-zinc-800 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>

                                    {rejectingId === request.id && (
                                        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                                            <label className="block text-xs text-gray-500 mb-2">Note to user (optional)</label>
                                            <textarea
                                                value={rejectNote}
                                                onChange={(e) => setRejectNote(e.target.value)}
                                                rows={2}
                                                className="w-full rounded-lg bg-zinc-950 border border-zinc-700 text-sm text-white px-3 py-2"
                                                placeholder="Reason for rejection..."
                                            />
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    type="button"
                                                    onClick={() => reject(request.id)}
                                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-500"
                                                >
                                                    Confirm reject
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setRejectingId(null)}
                                                    className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {requests.last_page > 1 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                        {requests.links.map((link, i) => (
                            <button
                                key={i}
                                type="button"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={`px-3 py-1.5 rounded-lg text-sm ${
                                    link.active
                                        ? 'bg-cyan-600 text-white'
                                        : link.url
                                          ? 'text-gray-400 hover:text-white hover:bg-zinc-800'
                                          : 'text-gray-600 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
