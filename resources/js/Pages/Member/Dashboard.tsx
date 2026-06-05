import InputError from '@/Components/InputError';
import OptimizedImage from '@/Components/OptimizedImage';
import MemberLayout from '@/Layouts/MemberLayout';
import { PageProps } from '@/types';
import { memberImageSrc } from '@/utils/publicStorage';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface MemberProfile {
    name: string;
    role: string;
    rank: string;
    bey: string | null;
    joined: string | null;
    image_url: string | null;
    email: string;
}

interface FinishStats {
    sf: number;
    of: number;
    bf: number;
    xf: number;
    matches_played: number;
    rounds_won: number;
}

const finishCards = [
    { key: 'xf' as const, label: 'XF', className: 'border-red-500/20 bg-red-500/10 text-red-400' },
    { key: 'bf' as const, label: 'BF', className: 'border-amber-500/20 bg-amber-500/10 text-amber-400' },
    { key: 'of' as const, label: 'OF', className: 'border-blue-500/20 bg-blue-500/10 text-blue-400' },
    { key: 'sf' as const, label: 'SF', className: 'border-slate-600/40 bg-slate-500/10 text-slate-300' },
];

function rankBadgeClass(rank: string): string {
    switch (rank) {
        case 'S':
            return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'A':
            return 'bg-red-500/10 text-red-400 border-red-500/20';
        case 'B':
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'C':
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        default:
            return 'bg-zinc-700/30 text-gray-400 border-zinc-700/50';
    }
}

export default function MemberDashboard({
    profile,
    win_rate,
    wins,
    losses,
    finish_stats,
}: {
    profile: MemberProfile;
    win_rate: number;
    wins: number;
    losses: number;
    finish_stats: FinishStats;
}) {
    const { flash } = usePage<PageProps>().props;

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(route('member.password', undefined, false), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const inputClass =
        'block w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2.5 px-4 text-sm text-white placeholder-gray-600 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20';

    const profileImage = memberImageSrc(profile.image_url, 'full');

    return (
        <MemberLayout>
            <Head title="My Profile" />

            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">My Profile</h1>
                <p className="mt-2 text-sm text-gray-500">Your stats and account settings</p>
            </div>

            <section className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-6 sm:p-8 mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-5">Profile</h2>
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 sm:items-center">
                    <div className="shrink-0 mx-auto sm:mx-0">
                        {profileImage ? (
                            <OptimizedImage
                                src={profileImage}
                                alt={profile.name}
                                priority
                                className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover border-2 border-zinc-700/60 shadow-lg shadow-black/30"
                            />
                        ) : (
                            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-zinc-800 border-2 border-zinc-700/60 flex items-center justify-center text-5xl font-bold text-red-400">
                                {profile.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                            <p className="text-3xl sm:text-4xl font-bold text-white">{profile.name}</p>
                            {profile.rank && (
                                <span
                                    className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold border ${rankBadgeClass(profile.rank)}`}
                                >
                                    Rank {profile.rank}
                                </span>
                            )}
                        </div>
                        {profile.role && <p className="text-base text-gray-400">{profile.role}</p>}
                        {profile.bey && (
                            <p className="text-base text-gray-500">
                                Bey: <span className="text-gray-200 font-medium">{profile.bey}</span>
                            </p>
                        )}
                        {profile.joined && (
                            <p className="text-base text-gray-500">
                                Joined: <span className="text-gray-200">{profile.joined}</span>
                            </p>
                        )}
                        <p className="text-base text-gray-500">
                            Email: <span className="text-gray-200">{profile.email}</span>
                        </p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80">Win Rate</p>
                    <p className="text-4xl font-black text-white mt-2">{win_rate}%</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {wins}W · {losses}L
                    </p>
                </section>

                <section className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Finish Points</p>
                    <div className="grid grid-cols-4 gap-2">
                        {finishCards.map((card) => (
                            <div
                                key={card.key}
                                className={`rounded-xl border px-2 py-3 text-center ${card.className}`}
                            >
                                <p className="text-xl font-bold">{finish_stats[card.key]}</p>
                                <p className="text-[10px] font-bold uppercase mt-0.5 opacity-80">{card.label}</p>
                            </div>
                        ))}
                    </div>
                    {finish_stats.matches_played > 0 ? (
                        <p className="text-[11px] text-gray-600 mt-3">
                            {finish_stats.matches_played} matches · {finish_stats.rounds_won} rounds won
                        </p>
                    ) : (
                        <p className="text-[11px] text-gray-600 mt-3">Stats appear after tournament matches are scored.</p>
                    )}
                </section>
            </div>

            <section className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-5 sm:p-6">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Change Password</h2>
                <p className="text-sm text-gray-600 mb-5">Use a strong password and do not share it with anyone.</p>

                {flash?.success && (
                    <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={updatePassword} className="space-y-4 max-w-md">
                    <div>
                        <label htmlFor="current_password" className="block text-sm font-medium text-gray-300 mb-1.5">
                            Current password
                        </label>
                        <input
                            id="current_password"
                            type="password"
                            value={passwordForm.data.current_password}
                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                            autoComplete="current-password"
                            className={inputClass}
                        />
                        <InputError message={passwordForm.errors.current_password} className="mt-1.5" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                            New password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={passwordForm.data.password}
                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                            autoComplete="new-password"
                            className={inputClass}
                        />
                        <InputError message={passwordForm.errors.password} className="mt-1.5" />
                    </div>
                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-300 mb-1.5">
                            Confirm new password
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={passwordForm.data.password_confirmation}
                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                            className={inputClass}
                        />
                        <InputError message={passwordForm.errors.password_confirmation} className="mt-1.5" />
                    </div>
                    <button
                        type="submit"
                        disabled={passwordForm.processing}
                        className="rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                    >
                        {passwordForm.processing ? 'Saving…' : 'Update password'}
                    </button>
                </form>
            </section>
        </MemberLayout>
    );
}
