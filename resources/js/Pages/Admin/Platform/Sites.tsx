import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type SiteInfo = {
    main_site_url: string;
    main_site_domain: string | null;
    tournamentx_url: string;
    tournamentx_domain: string | null;
    tournamentx_home: string;
    app_url: string;
};

type Promo = {
    enabled: boolean;
    badge: string;
    title: string;
    subtitle: string;
    cta_label: string;
};

export default function Sites({
    sites,
    promo,
}: {
    sites: SiteInfo;
    promo: Promo;
    promoDefaults: Promo;
}) {
    const { data, setData, processing } = useForm({
        enabled: Boolean(promo.enabled),
        badge: promo.badge ?? '',
        title: promo.title ?? '',
        subtitle: promo.subtitle ?? '',
        cta_label: promo.cta_label ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.put(route('admin.platform.promo.update'), data);
    };

    return (
        <AdminLayout currentPage="sites">
            <Head title="Websites — Platform Admin" />

            <div className="p-6 lg:p-10 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Websites</h1>
                    <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-red-600 to-cyan-500" />
                    <p className="text-sm text-gray-500 mt-3">URLs and domains for both properties (from .env / config).</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-5">
                        <h2 className="font-bold text-white">Shadow Syndicate</h2>
                        <p className="text-xs text-gray-500 mt-1 mb-4">Main community site</p>
                        <dl className="space-y-2 text-sm">
                            <div>
                                <dt className="text-gray-600 text-xs">URL</dt>
                                <dd>
                                    <a href={sites.main_site_url} target="_blank" rel="noreferrer" className="text-red-400 hover:underline break-all">
                                        {sites.main_site_url}
                                    </a>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-600 text-xs">Domain</dt>
                                <dd className="text-gray-300 font-mono text-xs">{sites.main_site_domain ?? '(any host)'}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-5">
                        <h2 className="font-bold text-white">Tournament X</h2>
                        <p className="text-xs text-gray-500 mt-1 mb-4">Organizer / tournament app</p>
                        <dl className="space-y-2 text-sm">
                            <div>
                                <dt className="text-gray-600 text-xs">URL</dt>
                                <dd>
                                    <a href={sites.tournamentx_home} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline break-all">
                                        {sites.tournamentx_home}
                                    </a>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-600 text-xs">Domain</dt>
                                <dd className="text-gray-300 font-mono text-xs">{sites.tournamentx_domain ?? '(same host /tournamentx)'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-white">Tournament X promo banner</h2>
                            <p className="text-xs text-gray-500 mt-1">Hero promo on the TX marketing homepage</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.post(route('admin.platform.promo.reset'))}
                            className="text-xs font-medium text-gray-500 hover:text-white"
                        >
                            Reset
                        </button>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                            <input
                                type="checkbox"
                                checked={data.enabled}
                                onChange={(e) => setData('enabled', e.target.checked)}
                                className="rounded border-zinc-700 bg-zinc-900 text-cyan-500"
                            />
                            Show promo banner
                        </label>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">Badge</label>
                                <input
                                    value={data.badge}
                                    onChange={(e) => setData('badge', e.target.value)}
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">CTA label</label>
                                <input
                                    value={data.cta_label}
                                    onChange={(e) => setData('cta_label', e.target.value)}
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">Title</label>
                            <input
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1.5">Subtitle</label>
                            <textarea
                                value={data.subtitle}
                                onChange={(e) => setData('subtitle', e.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-sm text-white resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-cyan-600 text-sm font-bold text-white disabled:opacity-50"
                        >
                            Save promo
                        </button>
                    </form>
                </section>

                <p className="mt-6 text-xs text-gray-600">
                    Domain URLs are set in <code className="text-gray-500">.env</code> (MAIN_SITE_URL, TOURNAMENTX_URL, etc.). This admin panel does not change server DNS.
                </p>
            </div>
        </AdminLayout>
    );
}
