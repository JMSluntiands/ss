import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    tournament: {
        id: number;
        name: string;
        slug: string;
    };
    prefillCode?: string | null;
}

export default function JudgeLogin({ tournament, prefillCode = null }: Props) {
    const [code, setCode] = useState(() => prefillCode?.toUpperCase() ?? '');
    const [submitting, setSubmitting] = useState(false);
    const autoSubmitDone = useRef(false);
    const { errors } = usePage().props as { errors?: { code?: string } };

    const submitCode = (value: string) => {
        const normalized = value.trim().toUpperCase();
        if (!normalized) return;
        setSubmitting(true);
        router.post(route('judge.verify', tournament.slug), { code: normalized }, {
            onFinish: () => setSubmitting(false),
        });
    };

    useEffect(() => {
        if (autoSubmitDone.current) return;
        const params = new URLSearchParams(window.location.search);
        const fromUrl = (params.get('code') ?? prefillCode ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!fromUrl) return;
        setCode(fromUrl);
        if (fromUrl.length === 6) {
            autoSubmitDone.current = true;
            submitCode(fromUrl);
        }
    }, [prefillCode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitCode(code);
    };

    return (
        <>
            <Head title={`Judge Access - ${tournament.name}`} />
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
                            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">Judge Access</h1>
                        <p className="text-sm text-slate-400">{tournament.name}</p>
                    </div>

                    {submitting && code.length === 6 ? (
                        <div className="text-center py-8">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mb-3" />
                            <p className="text-sm text-slate-400">Opening judge panel…</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                                    Enter Judge Code
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. ABC123"
                                    maxLength={6}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-center text-2xl font-mono tracking-[0.5em] placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                                    autoFocus
                                />
                                {errors?.code && (
                                    <p className="mt-2 text-xs text-red-400">{errors.code}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || code.length === 0}
                                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Verifying...' : 'Enter as Judge'}
                            </button>
                        </form>
                    )}

                    {!submitting && (
                        <p className="text-center text-xs text-slate-600 mt-6">
                            Ask the tournament organizer for the judge code, or scan their QR code.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
