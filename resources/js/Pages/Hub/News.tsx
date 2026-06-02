import OptimizedImage from '@/Components/OptimizedImage';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { blogCoverSrc, normalizeImages } from '@/utils/blogImages';
import { mainSiteBlogPostUrl } from '@/utils/mainSiteUrl';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps } from '@/types';

interface BlogPostData {
    id: number;
    title: string;
    excerpt: string;
    images: string[] | null;
    category: string;
    author: string;
    read_time: string | null;
    created_at: string;
}

export default function News({
    posts = [],
    mainSiteUrl = '',
}: {
    posts?: BlogPostData[];
    mainSiteUrl?: string;
}) {
    const { main_site_url } = usePage<PageProps>().props;
    const siteBase = mainSiteUrl || main_site_url;
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', ...new Set(posts.map((p) => p.category))];
    const filtered = activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);

    return (
        <AuthenticatedLayout currentPage="news">
            <Head title="News" />

            <div className="p-6 lg:p-10 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">News</h1>
                    <div className="mt-2 w-16 h-1 rounded-full tx-underline" />
                    <p className="mt-3 text-sm text-gray-500 max-w-xl">
                        Updates from Shadow Syndicate — tournament recaps, guides, and community stories.
                    </p>
                </div>

                {posts.length > 0 ? (
                    <>
                        <div className="flex flex-wrap gap-2 mb-8">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                                        activeCategory === cat
                                            ? 'bg-fuchsia-500/10 text-cyan-300 border-fuchsia-500/25'
                                            : 'text-gray-500 border-zinc-800 hover:border-zinc-700 hover:text-white'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {filtered.length > 0 ? (
                            <div className="space-y-4">
                                {filtered.map((post) => {
                                    const imgs = normalizeImages(post.images);
                                    const cover = imgs[0];
                                    const href = mainSiteBlogPostUrl(siteBase, post.id);

                                    return (
                                        <a
                                            key={post.id}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex gap-4 sm:gap-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:p-5 hover:border-fuchsia-500/25 transition-colors"
                                        >
                                            {cover && (
                                                <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-zinc-800">
                                                    <OptimizedImage
                                                        src={blogCoverSrc(cover)}
                                                        alt=""
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80">
                                                        {post.category}
                                                    </span>
                                                    {post.read_time && (
                                                        <span className="text-[10px] text-gray-600">{post.read_time}</span>
                                                    )}
                                                </div>
                                                <h2 className="font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-2">
                                                    {post.title}
                                                </h2>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                                                <p className="text-xs text-gray-600 mt-2">
                                                    {post.author} · {new Date(post.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <svg
                                                className="w-5 h-5 shrink-0 text-zinc-600 group-hover:text-cyan-400 self-center transition-colors"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No posts in this category.</p>
                        )}
                    </>
                ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
                        <p className="text-gray-500">No published posts yet. Check back soon on the main site blog.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
