import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <div className="p-6 lg:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Profile</h1>
                    <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                </div>

                <div className="max-w-2xl space-y-6">
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8">
                        <UpdatePasswordForm />
                    </div>

                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
