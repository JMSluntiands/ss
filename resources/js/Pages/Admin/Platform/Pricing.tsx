import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type PricingPlan = {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    featured: boolean;
    coming_soon?: boolean;
    cta_label?: string;
    features: string[];
};

type PlanUpgradePayment = {
    amount: string;
    period: string;
    payment_method: string;
    instructions: string;
    payment_qr: string | null;
    payment_qr_url: string | null;
};

export default function Pricing({
    pricing,
    usesOverride,
    planUpgradePayment,
}: {
    pricing: PricingPlan[];
    defaults: PricingPlan[];
    usesOverride: boolean;
    planUpgradePayment?: PlanUpgradePayment;
}) {
    const [paymentQrFile, setPaymentQrFile] = useState<File | null>(null);
    const [removePaymentQr, setRemovePaymentQr] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: planUpgradePayment?.amount ?? '₱499',
        period: planUpgradePayment?.period ?? '/ month',
        payment_method: planUpgradePayment?.payment_method ?? '',
        instructions: planUpgradePayment?.instructions ?? '',
    });

    const { data, setData, processing } = useForm({
        plans: pricing.map((plan) => ({
            ...plan,
            period: plan.period ?? '',
            cta_label: plan.cta_label ?? '',
            coming_soon: Boolean(plan.coming_soon),
            featured: Boolean(plan.featured),
            features: [...plan.features],
        })),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.put(route('admin.platform.pricing.update'), { plans: data.plans });
    };

    const submitPayment: FormEventHandler = (e) => {
        e.preventDefault();
        router.post(
            route('admin.platform.plan-upgrade-payment.update'),
            {
                amount: paymentForm.amount,
                period: paymentForm.period,
                payment_method: paymentForm.payment_method,
                instructions: paymentForm.instructions,
                payment_qr: paymentQrFile,
                remove_payment_qr: removePaymentQr,
            },
            {
                forceFormData: true,
                onSuccess: () => {
                    setPaymentQrFile(null);
                    setRemovePaymentQr(false);
                },
            },
        );
    };

    const updatePlan = (index: number, field: keyof PricingPlan, value: string | boolean) => {
        const plans = [...data.plans];
        plans[index] = { ...plans[index], [field]: value };
        setData('plans', plans);
    };

    const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
        const plans = [...data.plans];
        const features = [...plans[planIndex].features];
        features[featureIndex] = value;
        plans[planIndex] = { ...plans[planIndex], features };
        setData('plans', plans);
    };

    const addFeature = (planIndex: number) => {
        const plans = [...data.plans];
        plans[planIndex] = {
            ...plans[planIndex],
            features: [...plans[planIndex].features, ''],
        };
        setData('plans', plans);
    };

    const removeFeature = (planIndex: number, featureIndex: number) => {
        const plans = [...data.plans];
        plans[planIndex] = {
            ...plans[planIndex],
            features: plans[planIndex].features.filter((_, i) => i !== featureIndex),
        };
        setData('plans', plans);
    };

    return (
        <AdminLayout currentPage="pricing">
            <Head title="Pricing — Platform Admin" />

            <div className="p-6 lg:p-10 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Tournament X Pricing</h1>
                        <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-cyan-600 to-violet-500" />
                        <p className="text-sm text-gray-500 mt-3">
                            Shown on the Tournament X marketing page. {usesOverride ? 'Using saved overrides.' : 'Using config defaults.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post(route('admin.platform.pricing.reset'))}
                        className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium border border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-600 transition-colors"
                    >
                        Reset to defaults
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {data.plans.map((plan, planIndex) => (
                        <section
                            key={plan.id}
                            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-lg font-bold text-white">{plan.name}</h2>
                                <span className="text-xs text-gray-600 font-mono">{plan.id}</span>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Plan name</label>
                                    <input
                                        value={plan.name}
                                        onChange={(e) => updatePlan(planIndex, 'name', e.target.value)}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Price</label>
                                        <input
                                            value={plan.price}
                                            onChange={(e) => updatePlan(planIndex, 'price', e.target.value)}
                                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Period</label>
                                        <input
                                            value={plan.period}
                                            onChange={(e) => updatePlan(planIndex, 'period', e.target.value)}
                                            placeholder="/ month"
                                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                                <textarea
                                    value={plan.description}
                                    onChange={(e) => updatePlan(planIndex, 'description', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white resize-none"
                                />
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm">
                                <label className="flex items-center gap-2 text-gray-400">
                                    <input
                                        type="checkbox"
                                        checked={plan.featured}
                                        onChange={(e) => updatePlan(planIndex, 'featured', e.target.checked)}
                                        className="rounded border-zinc-700 bg-zinc-900 text-cyan-500"
                                    />
                                    Featured (Popular)
                                </label>
                                <label className="flex items-center gap-2 text-gray-400">
                                    <input
                                        type="checkbox"
                                        checked={plan.coming_soon}
                                        onChange={(e) => updatePlan(planIndex, 'coming_soon', e.target.checked)}
                                        className="rounded border-zinc-700 bg-zinc-900 text-violet-500"
                                    />
                                    Coming soon
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">Features</label>
                                <div className="space-y-2">
                                    {plan.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex gap-2">
                                            <input
                                                value={feature}
                                                onChange={(e) => updateFeature(planIndex, featureIndex, e.target.value)}
                                                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-sm text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(planIndex, featureIndex)}
                                                className="px-3 text-gray-500 hover:text-red-400"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => addFeature(planIndex)}
                                    className="mt-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                                >
                                    + Add feature
                                </button>
                            </div>
                        </section>
                    ))}

                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-sm font-bold text-white disabled:opacity-50"
                    >
                        Save pricing
                    </button>
                </form>

                {planUpgradePayment && (
                    <form onSubmit={submitPayment} className="mt-10 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 space-y-4">
                        <div>
                            <h2 className="text-lg font-bold text-white">Community upgrade payment</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Shown when organizers request a Community plan upgrade. They must upload payment proof.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Amount</label>
                                <input
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Period</label>
                                <input
                                    value={paymentForm.period}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, period: e.target.value })}
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white"
                                    placeholder="/ month"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Payment method / account</label>
                            <input
                                value={paymentForm.payment_method}
                                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white"
                                placeholder="GCash 09XX XXX XXXX"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Instructions</label>
                            <textarea
                                value={paymentForm.instructions}
                                onChange={(e) => setPaymentForm({ ...paymentForm, instructions: e.target.value })}
                                rows={2}
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Payment QR code</label>
                            {planUpgradePayment.payment_qr_url && !removePaymentQr && (
                                <img
                                    src={planUpgradePayment.payment_qr_url}
                                    alt="Payment QR"
                                    className="w-36 h-36 object-contain rounded-lg border border-zinc-800 mb-3"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setPaymentQrFile(e.target.files?.[0] ?? null);
                                    setRemovePaymentQr(false);
                                }}
                                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-amber-500/10 file:text-amber-400"
                            />
                            {planUpgradePayment.payment_qr_url && (
                                <label className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                    <input
                                        type="checkbox"
                                        checked={removePaymentQr}
                                        onChange={(e) => setRemovePaymentQr(e.target.checked)}
                                        className="rounded border-zinc-700"
                                    />
                                    Remove current QR
                                </label>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-sm font-bold text-white"
                        >
                            Save payment settings
                        </button>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
}
