import AdminLayout from '@/Layouts/AdminLayout';
import {
    formatPhpPrice,
    memberImageSrc,
    SHOP_CATEGORY_LABELS,
    type ShopCategory,
} from '@/utils/publicStorage';
import { resizeImageFile } from '@/utils/resizeImageFile';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';

interface JerseyItem {
    id: number;
    name: string;
    category: ShopCategory;
    price: string | number;
    sizes: string[];
    color: string | null;
    material: string | null;
    description: string | null;
    facebook_url: string | null;
    image_url: string | null;
    available: boolean;
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
    name: '',
    category: 'jersey' as ShopCategory,
    price: '',
    sizes: '',
    color: '',
    material: '',
    description: '',
    facebook_url: '',
    available: true,
    sort_order: 0,
};

export default function Jersey({ items }: { items: PaginatedData<JerseyItem> }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [processing, setProcessing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<JerseyItem | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const isJersey = form.category === 'jersey';

    const openCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setImageFile(null);
        setExistingImageUrl(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        setModalMode('create');
        setModalOpen(true);
    };

    const openEdit = (item: JerseyItem) => {
        setForm({
            name: item.name,
            category: item.category ?? 'jersey',
            price: String(item.price),
            sizes: item.sizes.join(', '),
            color: item.color ?? '',
            material: item.material ?? '',
            description: item.description ?? '',
            facebook_url: item.facebook_url ?? '',
            available: item.available,
            sort_order: item.sort_order,
        });
        setEditingId(item.id);
        setImageFile(null);
        setExistingImageUrl(item.image_url);
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

        const sizes = form.sizes
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('category', form.category);
        formData.append('price', form.price);
        sizes.forEach((size) => formData.append('sizes[]', size));
        if (form.color) formData.append('color', form.color);
        if (form.material) formData.append('material', form.material);
        if (form.description) formData.append('description', form.description);
        formData.append('facebook_url', form.facebook_url.trim());
        formData.append('available', form.available ? '1' : '0');
        formData.append('sort_order', String(form.sort_order));
        if (imageFile) formData.append('image', imageFile);

        if (modalMode === 'create') {
            router.post(route('admin.content.jersey.store'), formData, {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => closeModal(),
            });
        } else {
            formData.append('_method', 'PUT');
            router.post(route('admin.content.jersey.update', editingId!), formData, {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (item: JerseyItem) => {
        router.delete(route('admin.content.jersey.destroy', item.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const setField = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <AdminLayout currentPage="jersey">
            <Head title="Shop" />

            <div className="p-6 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Shop</h1>
                        <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                        <p className="text-sm text-gray-500 mt-3">
                            Jerseys, Beyblade parts, and merch — {items.total} item{items.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Item
                    </button>
                </div>

                {items.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.data.map((item) => {
                            const imgSrc = memberImageSrc(item.image_url);
                            const category = (item.category ?? 'jersey') as ShopCategory;

                            return (
                                <div
                                    key={item.id}
                                    className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden group hover:border-zinc-700/80 transition-all"
                                >
                                    <div className="relative aspect-square bg-zinc-800/50">
                                        {imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-16 h-16 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-zinc-950/80 text-gray-300 border border-zinc-700/80 backdrop-blur-sm">
                                                {SHOP_CATEGORY_LABELS[category]}
                                            </span>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border backdrop-blur-sm ${
                                                item.available
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                {item.available ? 'Available' : 'Sold Out'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-lg font-bold text-red-400">{formatPhpPrice(item.price)}</span>
                                            {item.color && (
                                                <span className="text-xs text-gray-500">{item.color}</span>
                                            )}
                                        </div>

                                        {item.sizes.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {item.sizes.map((size) => (
                                                    <span
                                                        key={size}
                                                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-zinc-800 text-gray-400 border border-zinc-700/50"
                                                    >
                                                        {size}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {item.material && (
                                            <p className="text-xs text-gray-600 mt-2 truncate">{item.material}</p>
                                        )}

                                        <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-800/60">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all text-center"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(item)}
                                                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-center"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 px-6 py-12 text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p className="text-gray-500 text-sm">No items yet. Add jerseys, Beyblade parts, or merch to get started.</p>
                    </div>
                )}

                {items.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-6">
                        {items.links.map((link, idx) => (
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
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={modalMode === 'create' ? 'M12 4v16m8-8H4' : 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'} />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    {modalMode === 'create' ? 'Add Shop Item' : 'Edit Shop Item'}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setField('category', e.target.value as ShopCategory)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                    >
                                        {(Object.entries(SHOP_CATEGORY_LABELS) as [ShopCategory, string][]).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setField('name', e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        placeholder={isJersey ? 'Shadow Syndicate Jersey' : 'RB26 Blade — Red'}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Price (PHP)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">₱</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={form.price}
                                                onChange={(e) => setField('price', e.target.value)}
                                                required
                                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                                placeholder="1200.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Color</label>
                                        <input
                                            type="text"
                                            value={form.color}
                                            onChange={(e) => setField('color', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                            placeholder="Black / Red"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                        {isJersey ? 'Sizes' : 'Variant / spec (optional)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.sizes}
                                        onChange={(e) => setField('sizes', e.target.value)}
                                        required={isJersey}
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        placeholder={isJersey ? 'S, M, L, XL, 2XL' : 'Used, New — or leave blank'}
                                    />
                                    <p className="text-[11px] text-gray-600 mt-1">Separate with commas</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                        {isJersey ? 'Material' : 'Part type'}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.material}
                                        onChange={(e) => setField('material', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        placeholder={isJersey ? 'Drifit / Cotton' : 'Blade, Ratchet, Bit'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setField('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors resize-none"
                                        placeholder="Item description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Facebook order link</label>
                                    <input
                                        type="url"
                                        value={form.facebook_url}
                                        onChange={(e) => setField('facebook_url', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        placeholder="https://www.facebook.com/yourpage"
                                    />
                                    <p className="text-[11px] text-gray-600 mt-1">
                                        FB page o Messenger link kung sa ibang seller bibili ang item na ito.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Product Image</label>
                                    {existingImageUrl && !imageFile && memberImageSrc(existingImageUrl) && (
                                        <div className="mb-2">
                                            <img
                                                src={memberImageSrc(existingImageUrl)!}
                                                alt="Current"
                                                className="w-24 h-24 rounded-xl object-cover border border-zinc-700/50"
                                            />
                                            <p className="text-[11px] text-gray-600 mt-1">Current image. Upload a new one to replace.</p>
                                        </div>
                                    )}
                                    <input
                                        ref={imageInputRef}
                                        type="file"
                                        accept="image/*"
                                        required={modalMode === 'create' && !imageFile}
                                        onChange={async (e) => {
                                            const picked = e.target.files?.[0];
                                            if (!picked) {
                                                setImageFile(null);
                                                return;
                                            }
                                            setImageFile(await resizeImageFile(picked, 1000, 0.82));
                                        }}
                                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20 file:cursor-pointer file:transition-colors"
                                    />
                                    <p className="text-[11px] text-gray-600 mt-1">Upload product photo (max 5MB)</p>
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

                                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                                    <div>
                                        <p className="text-sm font-medium text-white">Available</p>
                                        <p className="text-[11px] text-gray-500">Show item as available for purchase</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setField('available', !form.available)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            form.available ? 'bg-red-500' : 'bg-zinc-700'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                form.available ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>

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
                                        {processing ? 'Saving...' : modalMode === 'create' ? 'Add Item' : 'Save Changes'}
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
                        <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white">Delete Item</h3>
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
