import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-semibold text-white">Delete Account</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Once your account is deleted, all of its resources and data will be permanently deleted.
                </p>
            </header>

            <button
                onClick={() => setConfirmingUserDeletion(true)}
                className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
            >
                Delete Account
            </button>

            {confirmingUserDeletion && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/60" onClick={closeModal} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 p-6">
                            <h2 className="text-lg font-semibold text-white">
                                Are you sure you want to delete your account?
                            </h2>
                            <p className="mt-2 text-sm text-slate-400">
                                Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm.
                            </p>

                            <form onSubmit={deleteUser}>
                                <div className="mt-6">
                                    <input
                                        type="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                        autoFocus
                                        className="block w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-3 px-4 text-white placeholder-slate-500 transition-all focus:border-cyan-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2.5 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-500 transition-all disabled:opacity-50"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
