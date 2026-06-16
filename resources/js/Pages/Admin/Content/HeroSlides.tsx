import AdminLayout from '@/Layouts/AdminLayout';
import OptimizedImage from '@/Components/OptimizedImage';
import { memberImageSrc } from '@/utils/publicStorage';
import { resizeImageFile } from '@/utils/resizeImageFile';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';

interface HeroSlide {
    id: number;
    title_primary: string;
    title_secondary: string;
    tagline: string | null;
    tagline_accent: string | null;
    cta_label: string | null;
    cta_url: string | null;
    cta_opens_join_modal: boolean;
    image_url: string | null;
    use_logo_visual: boolean;
    published: boolean;
    sort_order: number;
    created_at: string;
}

interface PaginatedData<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    total: number;
}

type ModalMode = 'create' | 'edit';

const emptyForm = {
    title_primary: '',
    title_secondary: '',
    tagline: '',
    tagline_accent: '',
    cta_label: '',
    cta_url: '',
    cta_opens_join_modal: false,
    use_logo_visual: false,
    published: true,
    sort_order: 0,
};

export default function HeroSlides({ slides }: { slides: PaginatedData<HeroSlide> }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [processing, setProcessing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<HeroSlide | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setImageFile(null);
        setExistingImageUrl(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        setModalMode('create');
        setModalOpen(true);
    };

    const openEdit = (slide: HeroSlide) => {
        setForm({
            title_primary: slide.title_primary,
            title_secondary: slide.title_secondary,
            tagline: slide.tagline ?? '',
            tagline_accent: slide.tagline_accent ?? '',
            cta_label: slide.cta_label ?? '',
            cta_url: slide.cta_url ?? '',
            cta_opens_join_modal: slide.cta_opens_join_modal,
            use_logo_visual: slide.use_logo_visual,
            published: slide.published,
            sort_order: slide.sort_order,
        });
        setEditingId(slide.id);
        setImageFile(null);
        setExistingImageUrl(slide.image_url);
        if (imageInputRef.current) imageInputRef.current.value = '';
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
        formData.append('title_primary', form.title_primary);
        formData.append('title_secondary', form.title_secondary);
        if (form.tagline) formData.append('tagline', form.tagline);
        if (form.tagline_accent) formData.append('tagline_accent', form.tagline_accent);
        if (form.cta_label) formData.append('cta_label', form.cta_label);
        if (!form.cta_opens_join_modal && form.cta_url) {
            formData.append('cta_url', form.cta_url.trim());
        }
        formData.append('cta_opens_join_modal', form.cta_opens_join_modal ? '1' : '0');
        formData.append('use_logo_visual', form.use_logo_visual ? '1' : '0');
        formData.append('published', form.published ? '1' : '0');
        formData.append('sort_order', String(form.sort_order));
        if (imageFile) formData.append('image', imageFile);

        if (modalMode === 'create') {
            router.post(route('admin.content.hero-slides.store'), formData, {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => closeModal(),
            });
        } else {
            formData.append('_method', 'PUT');
            router.post(route('admin.content.hero-slides.update', editingId!), formData, {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (slide: HeroSlide) => {
        router.delete(route('admin.content.hero-slides.destroy', slide.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const setField = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleImageChange = async (file: File | null) => {
        if (!file) {
            setImageFile(null);
            return;
        }
        const resized = await resizeImageFile(file, 1600, 0.85);
        setImageFile(resized);
    };

    return (
        <AdminLayout currentPage="hero-slides">
            <Head title="Hero Carousel" />

            <div className="p-6 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Hero Carousel</h1>
                        <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                        <p className="text-sm text-gray-500 mt-3">
                            Manage homepage hero slides — {slides.total} slide{slides.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Slide
                    </button>
                </div>

                {slides.data.length > 0 ? (
                    <div className="space-y-3">
                        {slides.data.map((slide) => {
                            const imgSrc = slide.use_logo_visual ? null : memberImageSrc(slide.image_url, 'thumb');
                            const imgFallback = slide.use_logo_visual ? null : memberImageSrc(slide.image_url, 'full');

                            return (
                                <div
                                    key={slide.id}
                                    className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 hover:border-zinc-700/80 transition-all"
                                >
                                    <div className="w-full sm:w-28 h-20 rounded-xl bg-zinc-800/50 overflow-hidden shrink-0 flex items-center justify-center">
                                        {slide.use_logo_visual ? (
                                            <span className="text-[10px] font-bold uppercase text-red-400/80">Logo</span>
                                        ) : imgSrc ? (
                                            <OptimizedImage
                                                src={imgSrc}
                                                fallbackSrc={imgFallback ?? undefined}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-600">No image</span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="text-sm font-semibold text-white truncate">
                                                {slide.title_primary}{' '}
                                                <span className="text-red-400">{slide.title_secondary}</span>
                                            </h3>
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                slide.published
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-zinc-800 text-gray-500 border border-zinc-700/50'
                                            }`}>
                                                {slide.published ? 'Published' : 'Draft'}
                                            </span>
                                            <span className="text-[10px] text-gray-600">Order: {slide.sort_order}</span>
                                        </div>
                                        {slide.tagline && (
                                            <p className="text-xs text-gray-500 truncate">{slide.tagline}</p>
                                        )}
                                        {slide.cta_label && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                CTA: {slide.cta_label}
                                                {slide.cta_opens_join_modal
                                                    ? ' (Join modal)'
                                                    : slide.cta_url
                                                    ? ` → ${slide.cta_url}`
                                                    : ''}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => openEdit(slide)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(slide)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 px-6 py-12 text-center">
                        <p className="text-gray-500 text-sm">No slides yet. Add your first hero slide for the homepage.</p>
                    </div>
                )}

                {slides.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-6">
                        {slides.links.map((link, idx) => (
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

            {modalOpen && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="fixed z-50 inset-0 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 p-6 my-8">
                            <h3 className="text-lg font-semibold text-white mb-6">
                                {modalMode === 'create' ? 'Add Hero Slide' : 'Edit Hero Slide'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title line 1</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.title_primary}
                                            onChange={(e) => setField('title_primary', e.target.value)}
                                            placeholder="SHADOW"
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white focus:outline-none focus:border-red-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title line 2 (red)</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.title_secondary}
                                            onChange={(e) => setField('title_secondary', e.target.value)}
                                            placeholder="SYNDICATE"
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white focus:outline-none focus:border-red-500/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tagline</label>
                                    <input
                                        type="text"
                                        value={form.tagline}
                                        onChange={(e) => setField('tagline', e.target.value)}
                                        placeholder="Stay sharp. Stay ready."
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white focus:outline-none focus:border-red-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tagline accent (red)</label>
                                    <input
                                        type="text"
                                        value={form.tagline_accent}
                                        onChange={(e) => setField('tagline_accent', e.target.value)}
                                        placeholder="Feel the Shadow"
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white focus:outline-none focus:border-red-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Button label</label>
                                        <input
                                            type="text"
                                            value={form.cta_label}
                                            onChange={(e) => setField('cta_label', e.target.value)}
                                            placeholder="Join Us"
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white focus:outline-none focus:border-red-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Sort order</label>
                                        <input
                                            type="number"
                                            value={form.sort_order}
                                            onChange={(e) => setField('sort_order', parseInt(e.target.value, 10) || 0)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white focus:outline-none focus:border-red-500/50"
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.cta_opens_join_modal}
                                        onChange={(e) => setField('cta_opens_join_modal', e.target.checked)}
                                        className="rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500/30"
                                    />
                                    <span className="text-sm text-gray-400">Button opens Join Us modal</span>
                                </label>

                                {!form.cta_opens_join_modal && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Button link</label>
                                        <input
                                            type="text"
                                            value={form.cta_url}
                                            onChange={(e) => setField('cta_url', e.target.value)}
                                            placeholder="https://tournamentx.example.com or /events"
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white focus:outline-none focus:border-red-500/50"
                                        />
                                        <p className="text-xs text-gray-600 mt-1">Use full URL for Tournament X or other external sites.</p>
                                    </div>
                                )}

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.use_logo_visual}
                                        onChange={(e) => setField('use_logo_visual', e.target.checked)}
                                        className="rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500/30"
                                    />
                                    <span className="text-sm text-gray-400">Use Shadow Syndicate logo (with lightning effects)</span>
                                </label>

                                {!form.use_logo_visual && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Slide image</label>
                                        {(imageFile || existingImageUrl) && (
                                            <div className="mb-2 rounded-xl overflow-hidden border border-zinc-700/50 max-h-40">
                                                <img
                                                    src={imageFile ? URL.createObjectURL(imageFile) : memberImageSrc(existingImageUrl) ?? ''}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover max-h-40"
                                                />
                                            </div>
                                        )}
                                        <input
                                            ref={imageInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                                            className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-white"
                                        />
                                    </div>
                                )}

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.published}
                                        onChange={(e) => setField('published', e.target.checked)}
                                        className="rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500/30"
                                    />
                                    <span className="text-sm text-gray-400">Published (visible on homepage)</span>
                                </label>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 disabled:opacity-50 transition-all"
                                    >
                                        {processing ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {deleteConfirm && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                    <div className="fixed z-50 inset-0 flex items-center justify-center p-4">
                        <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Delete slide?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Remove &quot;{deleteConfirm.title_primary} {deleteConfirm.title_secondary}&quot; from the carousel.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500"
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
