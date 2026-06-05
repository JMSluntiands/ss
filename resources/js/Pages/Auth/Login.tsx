import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

const inputClass =
    'guest-tx-input block w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-3 text-white placeholder-gray-600 transition-all focus:bg-zinc-900 focus:outline-none';

export default function Login({
    status,
    canResetPassword,
    mainSiteUrl = '',
    memberLoginUrl = null as string | null,
    registerUrl = route('register', undefined, false),
    homeUrl = route('tournamentx.home', undefined, false),
}: {
    status?: string;
    canResetPassword: boolean;
    mainSiteUrl?: string;
    memberLoginUrl?: string | null;
    registerUrl?: string;
    homeUrl?: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Organizer log in</h2>
                <p className="text-gray-500 mb-8">Tournament X — manage brackets, judging, and live scores</p>

                {status && (
                    <div className="mb-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-4 py-3 text-sm text-cyan-300">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Email address
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                autoFocus
                                placeholder="you@example.com"
                                onChange={(e) => setData('email', e.target.value)}
                                className={`${inputClass} pl-12 pr-4`}
                            />
                        </div>
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                onChange={(e) => setData('password', e.target.value)}
                                className={`${inputClass} pl-12 pr-12`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600 hover:text-cyan-300 transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', (e.target.checked || false) as false)}
                                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-fuchsia-500 focus:ring-cyan-400/20 focus:ring-offset-0 transition-colors"
                            />
                            <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                                Remember me
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link href={route('password.request')} className="text-sm guest-tx-link">
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="guest-tx-btn relative w-full rounded-xl px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    No account?{' '}
                    <a href={registerUrl} className="guest-tx-link font-semibold">
                        Register free
                    </a>
                </p>

                {(memberLoginUrl || mainSiteUrl) && (
                    <p className="mt-4 text-center text-xs text-gray-600 leading-relaxed">
                        Shadow Syndicate member?{' '}
                        {memberLoginUrl ? (
                            <a href={memberLoginUrl} className="guest-tx-link font-medium">
                                Log in on the main site
                            </a>
                        ) : (
                            <a href={mainSiteUrl} className="guest-tx-link font-medium">
                                Go to Shadow Syndicate
                            </a>
                        )}{' '}
                        for profile & stats.
                    </p>
                )}

                <p className="mt-4 text-center text-xs text-gray-600">
                    <a href={homeUrl} className="guest-tx-link">
                        ← Back to Tournament X
                    </a>
                </p>
            </div>
        </GuestLayout>
    );
}
