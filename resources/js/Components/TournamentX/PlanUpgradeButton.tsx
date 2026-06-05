import { PageProps } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

type ButtonProps = PropsWithChildren<{
    className?: string;
    title?: string;
}>;

export default function PlanUpgradeButton({ children, className, title }: ButtonProps) {
    const { tournamentx_upgrade_details } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const details = tournamentx_upgrade_details;
    const payment = details?.payment;

    const withAppBase = (href: string): string => {
        if (typeof window === 'undefined' || href.startsWith('http')) return href;
        const needsIndexPhp = window.location.pathname.startsWith('/index.php');
        if (!needsIndexPhp || href.startsWith('/index.php')) return href;
        return `/index.php${href.startsWith('/') ? href : `/${href}`}`;
    };

    const submit = () => {
        if (!paymentProof) {
            return;
        }

        setSubmitting(true);
        router.post(
            withAppBase(route('plan-upgrade-request.store', undefined, false)),
            {
                requested_plan: 'community',
                message: message || null,
                payment_proof: paymentProof,
            },
            {
                forceFormData: true,
                onFinish: () => {
                    setSubmitting(false);
                    setOpen(false);
                    setMessage('');
                    setPaymentProof(null);
                },
            },
        );
    };

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={className} title={title}>
                {children}
            </button>

            {open && details && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-5 border-b border-zinc-800/80">
                                <h2 className="text-lg font-bold text-white">
                                    Upgrade to {details.target_plan.name}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">{details.target_plan.description}</p>
                            </div>

                            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-2">
                                            Current — {details.current_plan.name}
                                        </p>
                                        <ul className="space-y-1.5">
                                            {details.current_plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-xs text-gray-500">
                                                    <span className="text-gray-600 shrink-0">•</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
                                            Upgrade — {details.target_plan.name}
                                        </p>
                                        <ul className="space-y-1.5">
                                            {details.target_plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-xs text-gray-300">
                                                    <span className="text-cyan-400 shrink-0">✓</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        How to upgrade
                                    </p>
                                    <ol className="space-y-2">
                                        {details.steps.map((step, index) => (
                                            <li key={step} className="flex items-start gap-3 text-sm text-gray-400">
                                                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                                                    {index + 1}
                                                </span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {payment && (
                                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-amber-400/90 mb-3 text-center">
                                            Payment details
                                        </p>
                                        <p className="text-2xl font-bold text-white text-center">
                                            {payment.amount}
                                            {payment.period ? (
                                                <span className="text-sm font-normal text-gray-500">{payment.period}</span>
                                            ) : null}
                                        </p>
                                        {payment.payment_qr_url && (
                                            <img
                                                src={payment.payment_qr_url}
                                                alt="Payment QR"
                                                className="w-48 h-48 object-contain mx-auto rounded-lg mt-3 mb-2 border border-zinc-800"
                                            />
                                        )}
                                        {payment.payment_method && (
                                            <div className="mt-3 rounded-lg bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-center">
                                                <p className="text-[10px] uppercase tracking-wider text-gray-600">Send to</p>
                                                <p className="text-sm text-white font-medium mt-0.5">{payment.payment_method}</p>
                                            </div>
                                        )}
                                        {payment.instructions && (
                                            <p className="text-xs text-amber-400/80 mt-3 text-center">{payment.instructions}</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Upload payment proof *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        required
                                        onChange={(e) => setPaymentProof(e.target.files?.[0] ?? null)}
                                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-500/10 file:text-violet-300 hover:file:bg-violet-500/20 file:cursor-pointer"
                                    />
                                    <p className="text-[11px] text-gray-600 mt-1">
                                        Screenshot of GCash/Maya/bank transfer (max 5MB)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Note (optional)</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={2}
                                        className="w-full rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white px-3 py-2"
                                        placeholder="Reference number, sender name, date paid, etc."
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-zinc-800/80 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 border border-zinc-700 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={submit}
                                    disabled={!paymentProof || submitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white tx-btn disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
