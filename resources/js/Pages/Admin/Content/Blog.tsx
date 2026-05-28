import AdminLayout from '@/Layouts/AdminLayout';
import { blogImageSrc } from '@/utils/blogImages';
import { resizeImageFile } from '@/utils/resizeImageFile';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const MAX_BLOG_IMAGE_BYTES = 10 * 1024 * 1024;

function isHeicFile(file: File): boolean {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    return ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif';
}

function isAcceptedBlogImage(file: File): boolean {
    if (file.size === 0) return false;
    if (isHeicFile(file)) return true;
    if (file.type.startsWith('image/')) return true;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
}

async function prepareBlogImageFile(file: File): Promise<File> {
    let prepared = file;

    if (isHeicFile(file)) {
        const { default: heic2any } = await import('heic2any');
        const converted = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.88,
        });
        const blob = Array.isArray(converted) ? converted[0] : converted;
        const baseName = file.name.replace(/\.(heic|heif)$/i, '') || 'photo';
        prepared = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
    }

    return resizeImageFile(prepared, 1600, 0.82);
}

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    images: string[] | null;
    category: string;
    author: string;
    read_time: string | null;
    published: boolean;
    created_at: string;
}

function normalizeImages(images: unknown): string[] {
    if (!images) return [];
    if (typeof images === 'string') {
        try {
            const parsed = JSON.parse(images);
            return Array.isArray(parsed) ? normalizeImages(parsed) : [];
        } catch {
            return images.length > 0 ? [images] : [];
        }
    }
    if (!Array.isArray(images)) return [];
    return images.filter((p): p is string => typeof p === 'string' && p.trim().length > 0);
}

function ImagePreview({ src, className, borderClass }: { src: string; className?: string; borderClass: string }) {
    const [failed, setFailed] = useState(false);

    if (failed || !src) {
        return (
            <div className={`w-full aspect-square rounded-lg border ${borderClass} bg-zinc-800 flex items-center justify-center p-2`}>
                <span className="text-[10px] text-gray-600 text-center">Preview unavailable</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt=""
            className={className}
            onError={() => setFailed(true)}
        />
    );
}

interface PaginatedData<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    total: number;
}

const emptyPost = {
    title: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    read_time: '',
    published: true,
};

export default function Blog({ posts }: { posts: PaginatedData<BlogPost> }) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const [showModal, setShowModal] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [form, setForm] = useState(emptyPost);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [confirmDelete, setConfirmDelete] = useState<BlogPost | null>(null);
    const [processing, setProcessing] = useState(false);
    const [convertingHeic, setConvertingHeic] = useState(false);
    const imagesInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const urls = newImages.map((file) => URL.createObjectURL(file));
        setNewImagePreviews(urls);
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [newImages]);

    const openCreate = () => {
        setEditingPost(null);
        setForm(emptyPost);
        setExistingImages([]);
        setNewImages([]);
        if (imagesInputRef.current) imagesInputRef.current.value = '';
        setShowModal(true);
    };

    const openEdit = (post: BlogPost) => {
        setEditingPost(post);
        setForm({
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            author: post.author,
            read_time: post.read_time ?? '',
            published: post.published,
        });
        setExistingImages(normalizeImages(post.images));
        setNewImages([]);
        if (imagesInputRef.current) imagesInputRef.current.value = '';
        setShowModal(true);
    };

    const removeExistingImage = (path: string) => {
        setExistingImages((prev) => prev.filter((p) => p !== path));
    };

    const removeNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleImagesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files ?? []);
        if (picked.length === 0) return;

        const accepted = picked.filter(isAcceptedBlogImage);
        const rejected = picked.length - accepted.length;

        if (rejected > 0) {
            setFormErrors((prev) => ({
                ...prev,
                images: 'Some files were skipped. Use images or iPhone HEIC photos.',
            }));
        }

        if (accepted.length === 0) {
            if (imagesInputRef.current) imagesInputRef.current.value = '';
            return;
        }

        setConvertingHeic(true);
        const prepared: File[] = [];

        try {
            for (const file of accepted) {
                try {
                    const out = await prepareBlogImageFile(file);
                    if (out.size > MAX_BLOG_IMAGE_BYTES) {
                        setFormErrors((prev) => ({
                            ...prev,
                            images: `${file.name} is too large after conversion (max 10MB).`,
                        }));
                        continue;
                    }
                    prepared.push(out);
                } catch {
                    setFormErrors((prev) => ({
                        ...prev,
                        images: `Could not process ${file.name}. Try again or save as JPG.`,
                    }));
                }
            }

            if (prepared.length > 0) {
                setNewImages((prev) => [...prev, ...prepared]);
            }
        } finally {
            setConvertingHeic(false);
            if (imagesInputRef.current) imagesInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('excerpt', form.excerpt);
        formData.append('content', form.content);
        formData.append('category', form.category);
        formData.append('author', form.author);
        if (form.read_time) formData.append('read_time', form.read_time);
        formData.append('published', form.published ? '1' : '0');

        existingImages.forEach((path) => formData.append('keep_images[]', path));
        newImages.forEach((file, index) => {
            if (file.size > 0) {
                formData.append(`images[${index}]`, file, file.name);
            }
        });

        const submitOptions = {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                setFormErrors({});
                setShowModal(false);
            },
            onError: (errs: Record<string, string>) => setFormErrors(errs),
        };

        if (editingPost) {
            formData.append('_method', 'PUT');
            router.post(route('admin.content.blog.update', editingPost.id), formData, submitOptions);
        } else {
            router.post(route('admin.content.blog.store'), formData, submitOptions);
        }
    };

    const fieldError = (field: string) => formErrors[field] || errors[field];

    const handleDelete = (post: BlogPost) => {
        setProcessing(true);
        router.delete(route('admin.content.blog.destroy', post.id), {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setConfirmDelete(null);
            },
        });
    };

    return (
        <AdminLayout currentPage="blog">
            <Head title="Blog Posts" />

            <div className="p-6 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
                        <div className="mt-2 w-16 h-1 rounded-full bg-gradient-to-r from-red-600 to-red-400" />
                        <p className="text-sm text-gray-500 mt-3">
                            {posts.total} total post{posts.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Post
                    </button>
                </div>

                {/* Posts Table */}
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800/60">
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {posts.data.map((post) => (
                                    <tr key={post.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate max-w-[250px]">{post.title}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[250px]">{post.excerpt}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-sm text-gray-400">{post.author}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-zinc-700/30 text-gray-400 border-zinc-700/50">
                                                {post.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                post.published
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-zinc-700/30 text-gray-400 border-zinc-700/50'
                                            }`}>
                                                {post.published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-xs text-gray-500">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(post)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(post)}
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

                    {posts.data.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <p className="text-gray-500 text-sm">No blog posts yet.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {posts.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-6">
                        {posts.links.map((link, idx) => (
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

            {/* Create/Edit Modal */}
            {showModal && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="fixed z-50 inset-0 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 p-6 my-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    {editingPost ? 'Edit Post' : 'Add Post'}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {Object.keys(formErrors).length > 0 && (
                                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                                        Please fix the errors below and try again.
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Title</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        placeholder="Post title"
                                    />
                                    {fieldError('title') && <p className="text-xs text-red-400 mt-1">{fieldError('title')}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Excerpt</label>
                                    <input
                                        type="text"
                                        value={form.excerpt}
                                        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        placeholder="Brief summary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Content</label>
                                    <textarea
                                        value={form.content}
                                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors resize-none"
                                        placeholder="Write your post content..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                                        <input
                                            type="text"
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                            placeholder="e.g. News"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Author</label>
                                        <input
                                            type="text"
                                            value={form.author}
                                            onChange={(e) => setForm({ ...form, author: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                            placeholder="Author name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Read Time</label>
                                    <input
                                        type="text"
                                        value={form.read_time}
                                        onChange={(e) => setForm({ ...form, read_time: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
                                        placeholder="e.g. 5 min read"
                                    />
                                </div>

                                {/* Images */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Images</label>
                                    <input
                                        ref={imagesInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,image/heic,image/heif,.heic,.heif,.jpg,.jpeg,.png,.gif,.webp"
                                        multiple
                                        disabled={convertingHeic}
                                        onChange={handleImagesSelect}
                                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20 file:cursor-pointer file:transition-colors disabled:opacity-50"
                                    />
                                    <p className="text-[11px] text-gray-600 mt-1">
                                        {convertingHeic
                                            ? 'Converting iPhone photos (HEIC)…'
                                            : 'JPG, PNG, WebP, or iPhone HEIC — max 10MB each'}
                                    </p>
                                    {(fieldError('images') || fieldError('images.0')) && (
                                        <p className="text-xs text-red-400 mt-1">{fieldError('images') || fieldError('images.0')}</p>
                                    )}

                                    {(existingImages.length > 0 || newImages.length > 0) && (
                                        <div className="grid grid-cols-3 gap-2 mt-3">
                                            {existingImages.map((path) => (
                                                <div key={path} className="relative group">
                                                    <ImagePreview
                                                        src={blogImageSrc(path)}
                                                        borderClass="border-zinc-700/50"
                                                        className="w-full aspect-square object-cover rounded-lg border border-zinc-700/50 bg-zinc-800"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(path)}
                                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            {newImages.map((file, i) => (
                                                <div key={`${file.name}-${file.size}-${file.lastModified}`} className="relative group">
                                                    <ImagePreview
                                                        src={newImagePreviews[i] ?? ''}
                                                        borderClass="border-red-500/30"
                                                        className="w-full aspect-square object-cover rounded-lg border border-red-500/30 bg-zinc-800"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImage(i)}
                                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-1">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, published: !form.published })}
                                            className={`relative w-10 h-5 rounded-full transition-colors ${
                                                form.published ? 'bg-red-500' : 'bg-zinc-700'
                                            }`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                                form.published ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                        </button>
                                        <span className="text-sm text-gray-400">
                                            {form.published ? 'Published — visible on /blog' : 'Draft — hidden from public blog'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <>
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
                    <div className="fixed z-50 inset-0 flex items-center justify-center p-4">
                        <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white">Delete Post</h3>
                            </div>
                            <p className="text-sm text-gray-400 mb-6">
                                Are you sure you want to delete &ldquo;{confirmDelete.title}&rdquo;? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-zinc-800 border border-zinc-700/50 hover:text-white hover:bg-zinc-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(confirmDelete)}
                                    disabled={processing}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
