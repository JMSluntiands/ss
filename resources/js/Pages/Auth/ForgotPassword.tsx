import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Reset password</h2>
                <p className="text-slate-400 mb-8">
                    Enter your email and we'll send you a link to reset your password.
                </p>

                {status && (
                    <div className="mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                            Email address
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoFocus
                                placeholder="you@example.com"
                                onChange={(e) => setData('email', e.target.value)}
                                className="block w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 backdrop-blur-sm transition-all focus:border-cyan-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                            />
                        </div>
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="relative w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Sending...
                            </span>
                        ) : (
                            'Send reset link'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link
                        href={route('login')}
                        className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        Back to sign in
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
