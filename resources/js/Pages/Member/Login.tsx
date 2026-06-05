import InputError from '@/Components/InputError';
import SiteLogo from '@/Components/SiteLogo';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

const inputClass =
    'block w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-3 px-4 text-white placeholder-gray-600 transition-all focus:border-red-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20';

export default function MemberLogin({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('member.login.store', undefined, false), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
            <Head title="Member Login" />

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                <Link href={route('home')} className="mb-8 flex flex-col items-center gap-3">
                    <SiteLogo className="w-16 h-16 drop-shadow-[0_0_20px_rgba(220,38,38,0.45)]" />
                    <span className="text-sm font-bold tracking-wide text-gray-400">Shadow Syndicate</span>
                </Link>

                <div className="w-full max-w-md rounded-2xl border border-zinc-800/70 bg-zinc-900/50 p-6 sm:p-8 shadow-xl shadow-black/30">
                    <h1 className="text-2xl font-bold text-white mb-1">Member Login</h1>
                    <p className="text-sm text-gray-500 mb-6">Sign in with the account your admin gave you.</p>

                    {status && (
                        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                autoFocus
                                placeholder="you@shadowsyndicate.com"
                                onChange={(e) => setData('email', e.target.value)}
                                className={inputClass}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    placeholder="Your password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`${inputClass} pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600 hover:text-red-400 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', (e.target.checked || false) as false)}
                                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-red-500 focus:ring-red-500/20"
                            />
                            <span className="text-sm text-gray-500">Remember me</span>
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-red-600 hover:bg-red-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-gray-600">
                        <Link href={route('home')} className="text-gray-500 hover:text-red-400 transition-colors">
                            ← Back to homepage
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
