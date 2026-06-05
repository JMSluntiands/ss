export type PricingPlan = {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    featured: boolean;
    features: string[];
    cta_label?: string;
    coming_soon?: boolean;
};

export default function TournamentXPricingSection({
    plans,
    registerUrl,
}: {
    plans: PricingPlan[];
    registerUrl: string;
}) {
    return (
        <section id="pricing" className="relative py-20 sm:py-28 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-14">
                    <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full mb-4 uppercase">
                        Pricing
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                        Plans for every <span className="tx-accent-text">organizer</span>
                    </h2>
                    <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                        Start free, scale when your community grows. Shadow Syndicate communities get partner rates.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 ${
                                plan.featured
                                    ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 to-zinc-900/80 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                                    : 'border-zinc-800/70 bg-zinc-900/50'
                            }`}
                        >
                            {plan.featured && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-950 bg-cyan-400 rounded-full">
                                    Popular
                                </span>
                            )}
                            {plan.coming_soon && !plan.featured && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-950 bg-violet-400 rounded-full">
                                    Soon
                                </span>
                            )}
                            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                            <div className="mt-3 flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">{plan.price}</span>
                                {plan.period && <span className="text-sm text-gray-500">{plan.period}</span>}
                            </div>
                            <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                            <ul className="mt-6 space-y-3 flex-1">
                                {plan.features.map((feature) => {
                                    const excluded = feature.startsWith('No ');

                                    return (
                                        <li
                                            key={feature}
                                            className={`flex items-start gap-2 text-sm ${excluded ? 'text-gray-500' : 'text-gray-300'}`}
                                        >
                                            {excluded ? (
                                                <svg
                                                    className="w-5 h-5 shrink-0 text-zinc-600 mt-0.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="w-5 h-5 shrink-0 text-cyan-400 mt-0.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                            {feature}
                                        </li>
                                    );
                                })}
                            </ul>
                            {plan.coming_soon ? (
                                <span
                                    className="mt-8 block text-center py-3 rounded-xl text-sm font-bold border border-zinc-700/80 text-gray-500 cursor-not-allowed"
                                    aria-disabled
                                >
                                    {plan.cta_label ?? 'Coming soon'}
                                </span>
                            ) : (
                                <a
                                    href={registerUrl}
                                    className={`mt-8 block text-center py-3 rounded-xl text-sm font-bold transition-all ${
                                        plan.featured
                                            ? 'tx-btn text-white'
                                            : 'border border-zinc-700 text-gray-300 hover:border-cyan-500/40 hover:text-white'
                                    }`}
                                >
                                    {plan.cta_label ?? 'Get started'}
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
