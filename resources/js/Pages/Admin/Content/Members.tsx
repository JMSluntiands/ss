import AdminLayout from '@/Layouts/AdminLayout';
import { memberImageSrc } from '@/utils/publicStorage';
import { resizeImageFile } from '@/utils/resizeImageFile';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';

interface LinkedUser {
    id: number;
    name: string;
    email: string;
}

interface SiteMember {
    id: number;
    name: string;
    role: string;
    rank: string;
    wins: number;
    losses: number;
    bey: string | null;
    joined: string | null;
    image_url: string | null;
    sort_order: number;
    created_at: string;
    user_id?: number | null;
    user?: LinkedUser | null;
}

interface PaginatedData<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    total: number;
}

type ModalMode = 'create' | 'edit';

const ROLE_OPTIONS = ['Founder', 'Co-Founder', 'Officer', 'Member', 'Recruit'] as const;
const RANK_OPTIONS = ['S', 'A', 'B', 'C', 'D'] as const;

const emptyForm = {
    name: '',
    role: 'Member',
    rank: 'C',
    wins: 0,
    losses: 0,
    bey: '',
    joined: '',
    sort_order: 0,
};

function rankColor(rank: string) {
    switch (rank) {
        case 'S': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'A': return 'bg-red-500/10 text-red-400 border-red-500/20';
        case 'B': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'C': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'D': return 'bg-zinc-700/30 text-gray-400 border-zinc-700/50';
        default:  return 'bg-zinc-700/30 text-gray-400 border-zinc-700/50';
    }
}

export default function Members({ members }: { members: PaginatedData<SiteMember> }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<SiteMember | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const openCreate = () => {
        setForm(emptyForm);
        setImageFile(null);
        setExistingImageUrl(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        setEditingId(null);
        setModalMode('create');
        setModalOpen(true);
    };

    const openEdit = (member: SiteMember) => {
        setForm({
            name: member.name,
            role: member.role,
            rank: member.rank,
            wins: member.wins,
            losses: member.losses,
            bey: member.bey ?? '',
            joined: member.joined ?? '',
            sort_order: member.sort_order,
        });
        setImageFile(null);
        setExistingImageUrl(member.image_url);
        if (imageInputRef.current) imageInputRef.current.value = '';
        setEditingId(member.id);
        setModalMode('edit');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingId(null);
        setImageFile(null);
        setExistingImageUrl(null);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('role', form.role);
        formData.append('rank', form.rank);
        formData.append('wins', String(form.wins));
        formData.append('losses', String(form.losses));
        if (form.bey) formData.append('bey', form.bey);
        if (form.joined) formData.append('joined', form.joined);
        formData.append('sort_order', String(form.sort_order));
        if (imageFile) formData.append('image', imageFile);

        if (modalMode === 'create') {
            router.post(route('admin.content.members.store'), formData, {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => closeModal(),
            });
        } else {
            formData.append('_method', 'PUT');
            router.post(route('admin.content.members.update', editingId!), formData, {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (member: SiteMember) => {
        router.delete(route('admin.content.members.destroy', member.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const handleProvisionAccount = (member: SiteMember) => {
        router.post(route('admin.content.members.provision', member.id), {}, {
            preserveScroll: true,
        });
    };

    const setField = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <AdminLayout currentPage="members">
            <Head title="Manage Members" />

            <div className="p-6 lg:p-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Manage Members</h1>
                        <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                        <p className="text-sm text-gray-500 mt-3">
                            {members.total} total member{members.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Member
                    </button>
                </div>

                {/* Members Table */}
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800/60">
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">W / L</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Bey</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">TournamentX</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {members.data.map((member) => (
                                    <tr key={member.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {memberImageSrc(member.image_url) ? (
                                                    <img
                                                        src={memberImageSrc(member.image_url)!}
                                                        alt={member.name}
                                                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-zinc-700/50"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <p className="text-sm font-medium text-white truncate">{member.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-red-500/10 text-red-400 border-red-500/20">
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${rankColor(member.rank)}`}>
                                                {member.rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-sm text-emerald-400">{member.wins}</span>
                                            <span className="text-sm text-gray-600 mx-1">/</span>
                                            <span className="text-sm text-red-400">{member.losses}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-sm text-gray-400">{member.bey ?? '—'}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-xs text-gray-500">
                                                {member.joined ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden xl:table-cell">
                                            {member.user ? (
                                                <span className="text-xs text-emerald-400" title={member.user.email}>
                                                    {member.user.email}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-amber-400/80">No account</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!member.user && (
                                                    <button
                                                        onClick={() => handleProvisionAccount(member)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
                                                    >
                                                        Create account
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEdit(member)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(member)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {members.data.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-500 text-sm">No members found. Add your first member to get started.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {members.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-6">
                        {members.links.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                disabled={!link.url}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    link.active
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        : link.url
                                        ? 'text-gray-500 hover:text-white hover:bg-zinc-800'
                                        : 'text-gray-700 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {modalOpen && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="fixed z-50 inset-0 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 p-6 my-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={modalMode === 'create' ? 'M12 4v16m8-8H4' : 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'} />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    {modalMode === 'create' ? 'Add Member' : 'Edit Member'}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setField('name', e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        placeholder="Member name"
                                    />
                                </div>

                                {/* Role & Rank */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Role</label>
                                        <select
                                            value={form.role}
                                            onChange={(e) => setField('role', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        >
                                            {ROLE_OPTIONS.map((r) => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Rank</label>
                                        <select
                                            value={form.rank}
                                            onChange={(e) => setField('rank', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        >
                                            {RANK_OPTIONS.map((r) => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Wins & Losses */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Wins</label>
                                        <input
                                            type="number"
                                            value={form.wins}
                                            onChange={(e) => setField('wins', parseInt(e.target.value) || 0)}
                                            min={0}
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Losses</label>
                                        <input
                                            type="number"
                                            value={form.losses}
                                            onChange={(e) => setField('losses', parseInt(e.target.value) || 0)}
                                            min={0}
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Bey */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Bey</label>
                                    <input
                                        type="text"
                                        value={form.bey}
                                        onChange={(e) => setField('bey', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        placeholder="e.g. Dranzer Flame"
                                    />
                                </div>

                                {/* Joined & Sort Order */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Joined</label>
                                        <input
                                            type="text"
                                            value={form.joined}
                                            onChange={(e) => setField('joined', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                            placeholder="e.g. Jan 2024"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Sort Order</label>
                                        <input
                                            type="number"
                                            value={form.sort_order}
                                            onChange={(e) => setField('sort_order', parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Profile Image */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Profile Image</label>
                                    {existingImageUrl && !imageFile && (
                                        <div className="mb-2">
                                            <img
                                                src={memberImageSrc(existingImageUrl)!}
                                                alt="Current"
                                                className="w-20 h-20 rounded-xl object-cover border border-zinc-700/50"
                                            />
                                            <p className="text-[11px] text-gray-600 mt-1">Current photo. Upload a new one to replace.</p>
                                        </div>
                                    )}
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const picked = e.target.files?.[0];
                                            if (!picked) {
                                                setImageFile(null);
                                                return;
                                            }
                                            setImageFile(await resizeImageFile(picked, 800, 0.82));
                                        }}
                                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20 file:cursor-pointer file:transition-colors"
                                    />
                                    <p className="text-[11px] text-gray-600 mt-1">Upload member photo (max 5MB)</p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Saving...' : modalMode === 'create' ? 'Add Member' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                    <div className="fixed z-50 inset-0 flex items-center justify-center p-4">
                        <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white">Delete Member</h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-6">
                                Are you sure you want to delete <span className="text-white font-medium">"{deleteConfirm.name}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
