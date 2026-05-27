import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function AdminLogin({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.login.store'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Admin Access" />

            <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
                {/* Animated background grid */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Red glow accents */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-red-900/8 rounded-full blur-[100px]" />
                <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-red-800/5 rounded-full blur-[80px]" />

                {/* Scan lines effect */}
                <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
                    }}
                />

                <div className="relative z-10 w-full max-w-md">
                    {/* Top badge */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            {/* Outer ring pulse */}
                            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '3s' }} />

                            {/* Shield icon container */}
                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-900 border-2 border-red-500/30 flex items-center justify-center shadow-2xl shadow-red-500/20">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-red-600/20 to-red-900/20 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-red-500/50" />
                            <span className="text-[10px] font-bold text-red-400/80 uppercase tracking-[0.3em]">Restricted Access</span>
                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-red-500/50" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-1">
                            ADMIN <span className="text-red-500">PORTAL</span>
                        </h1>
                        <p className="text-sm text-gray-600">
                            Authorized personnel only
                        </p>
                    </div>

                    {/* Login card */}
                    <div className="rounded-2xl bg-zinc-900/70 backdrop-blur-sm border border-zinc-800/80 shadow-2xl shadow-black/50 overflow-hidden">
                        {/* Top red line */}
                        <div className="h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

                        <div className="p-8">
                            {status && (
                                <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                                    {status}
                                </div>
                            )}

                            {errors.email && !errors.email.includes('required') && (
                                <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                                    <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span className="text-sm text-red-400">{errors.email}</span>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                                        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Identity
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        autoComplete="username"
                                        autoFocus
                                        placeholder="admin@shadowsyndicate.com"
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="block w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 py-3 px-4 text-white placeholder-gray-600 text-sm transition-all focus:border-red-500/50 focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-mono"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                                        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                        Access Key
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            autoComplete="current-password"
                                            placeholder="••••••••••••"
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="block w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 py-3 px-4 pr-12 text-white placeholder-gray-600 text-sm transition-all focus:border-red-500/50 focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600 hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? (
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center gap-2.5 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', (e.target.checked || false) as false)}
                                                className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-red-500 focus:ring-red-500/20 focus:ring-offset-0 transition-colors"
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                                            Keep session active
                                        </span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="relative w-full rounded-xl bg-gradient-to-r from-red-700 to-red-500 px-6 py-3.5 text-sm font-bold text-white uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all hover:shadow-red-500/40 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-red-500/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Authenticating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            Authorize Access
                                        </span>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Bottom red line */}
                        <div className="h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <div className="flex items-center justify-center gap-3 text-gray-700 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 animate-pulse" />
                                <span>Encrypted Connection</span>
                            </div>
                            <span>·</span>
                            <span>Shadow Syndicate</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
