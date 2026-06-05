export type PromoConfig = {
    enabled: boolean;
    badge: string;
    title: string;
    subtitle: string;
    cta_label: string;
};

export default function TournamentXPromoBanner({
    promo,
    registerUrl,
}: {
    promo: PromoConfig;
    registerUrl: string;
}) {
    if (!promo.enabled) {
        return null;
    }

    return (
        <section
            id="promo"
            className="relative overflow-hidden border-b border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-950/80 via-violet-950/60 to-cyan-950/80"
        >
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute -left-20 top-0 h-full w-1/2 bg-gradient-to-r from-fuchsia-500/20 to-transparent" />
                <div className="absolute -right-20 top-0 h-full w-1/2 bg-gradient-to-l from-cyan-500/20 to-transparent" />
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-fuchsia-200 bg-fuchsia-500/20 border border-fuchsia-400/30 mb-4">
                            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                            {promo.badge}
                        </span>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">{promo.title}</h2>
                        <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed">{promo.subtitle}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <a
                            href={registerUrl}
                            className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold rounded-xl tx-btn text-white"
                        >
                            {promo.cta_label}
                        </a>
                        <a
                            href="#pricing"
                            className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold rounded-xl border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                        >
                            View pricing
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
