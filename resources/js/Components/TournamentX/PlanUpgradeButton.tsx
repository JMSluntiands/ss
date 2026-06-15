import { PageProps } from '@/types';
import { Dialog, DialogPanel } from '@headlessui/react';
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

            <Dialog open={open} onClose={() => setOpen(false)} className="relative z-[100]">
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" aria-hidden="true" />

                <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
                    {details && (
                        <DialogPanel className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50">
                            <div className="px-6 py-5 border-b border-zinc-800/80 shrink-0">
                                <h2 className="text-xl font-bold text-white">
                                    Upgrade to {details.target_plan.name}
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">{details.target_plan.description}</p>
                            </div>

                            <div className="px-6 py-5 space-y-5 overflow-y-auto">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                                            Current — {details.current_plan.name}
                                        </p>
                                        <ul className="space-y-2">
                                            {details.current_plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                                                    <span className="text-gray-500 shrink-0 mt-0.5">•</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-3">
                                            Upgrade — {details.target_plan.name}
                                        </p>
                                        <ul className="space-y-2">
                                            {details.target_plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-sm text-gray-100">
                                                    <span className="text-cyan-400 shrink-0 mt-0.5">✓</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                                        How to upgrade
                                    </p>
                                    <ol className="space-y-3">
                                        {details.steps.map((step, index) => (
                                            <li key={step} className="flex items-start gap-3 text-sm text-gray-200">
                                                <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-200 text-xs font-bold flex items-center justify-center shrink-0">
                                                    {index + 1}
                                                </span>
                                                <span className="pt-0.5">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {payment && (
                                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5">
                                        <p className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-3 text-center">
                                            Payment details
                                        </p>
                                        <p className="text-3xl font-bold text-white text-center">
                                            {payment.amount}
                                            {payment.period ? (
                                                <span className="text-base font-normal text-gray-400">{payment.period}</span>
                                            ) : null}
                                        </p>
                                        {payment.payment_qr_url && (
                                            <img
                                                src={payment.payment_qr_url}
                                                alt="Payment QR"
                                                className="w-52 h-52 object-contain mx-auto rounded-lg mt-4 mb-2 border border-zinc-800"
                                            />
                                        )}
                                        {payment.payment_method && (
                                            <div className="mt-4 rounded-lg bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-center">
                                                <p className="text-xs uppercase tracking-wider text-gray-400">Send to</p>
                                                <p className="text-base text-white font-medium mt-1">{payment.payment_method}</p>
                                            </div>
                                        )}
                                        {payment.instructions && (
                                            <p className="text-sm text-amber-300/90 mt-4 text-center leading-relaxed">
                                                {payment.instructions}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Upload payment proof *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        required
                                        onChange={(e) => setPaymentProof(e.target.files?.[0] ?? null)}
                                        className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-500/10 file:text-violet-300 hover:file:bg-violet-500/20 file:cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Screenshot of GCash/Maya/bank transfer (max 5MB)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Note (optional)</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={2}
                                        className="w-full rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white px-3 py-2.5"
                                        placeholder="Reference number, sender name, date paid, etc."
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-zinc-800/80 flex gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 border border-zinc-700 hover:text-white hover:border-zinc-600"
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
                        </DialogPanel>
                    )}
                </div>
            </Dialog>
        </>
    );
}
