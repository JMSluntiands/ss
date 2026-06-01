import OptimizedImage from '@/Components/OptimizedImage';
import SiteFooter from '@/Components/SiteFooter';
import SiteLogo from '@/Components/SiteLogo';
import { blogCoverSrc, normalizeImages } from '@/utils/blogImages';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

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

export default function Blog({ posts = [] }: { posts?: BlogPostData[] }) {
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', ...new Set(posts.map((p) => p.category))];
    const filtered = activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);

    return (
        <>
            <Head title="Blog - Shadow Syndicate" />
            <div className="min-h-screen bg-zinc-950 text-white">
                <nav className="bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 sm:h-20">
                            <Link href={route('home')} className="flex items-center gap-3">
                                <SiteLogo className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_12px_rgba(220,38,38,0.4)]" />
                                <span className="text-lg sm:text-xl font-black tracking-tight">
                                    SHADOW <span className="text-red-500">SYNDICATE</span>
                                </span>
                            </Link>
                            <div className="hidden md:flex items-center gap-2">
                                <Link href={route('home')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
                                <Link href={route('members')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Members</Link>
                                <Link href={route('events')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Event</Link>
                                <Link href={route('blog')} className="px-4 py-2 text-sm font-medium text-red-400 transition-colors">Blog</Link>
                                <Link href={route('jersey')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Shop</Link>
                            </div>
                        </div>
                    </div>
                </nav>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-10">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                            Community <span className="text-red-500">Blog</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            News, guides, tournament recaps, and stories from the Shadow Syndicate community.
                        </p>
                    </div>

                    {posts.length > 0 ? (
                        <>
                            <div className="flex flex-wrap gap-2 mb-10">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                            activeCategory === cat
                                                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                                : 'text-gray-500 hover:text-white border border-zinc-800 hover:border-zinc-700'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {filtered.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filtered.map((post) => {
                                        const imgs = normalizeImages(post.images);
                                        const cover = imgs[0];
                                        const coverUrls = cover ? blogCoverSrc(cover) : null;

                                        return (
                                            <Link
                                                key={post.id}
                                                href={route('blog.show', post.id)}
                                                className="group flex flex-col bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all"
                                            >
                                                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
                                                    {coverUrls ? (
                                                        <OptimizedImage
                                                            src={coverUrls.src}
                                                            fallbackSrc={coverUrls.fallbackSrc}
                                                            alt={post.title}
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                                            <span className="text-4xl font-black text-red-500/30">SS</span>
                                                        </div>
                                                    )}
                                                    {imgs.length > 1 && (
                                                        <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-black/70 text-gray-300 border border-zinc-700/60">
                                                            +{imgs.length - 1} photos
                                                        </span>
                                                    )}
                                                    <span className="absolute top-2 left-2 px-2.5 py-1 text-[10px] font-bold rounded-full bg-red-500/90 text-white border border-red-400/30">
                                                        {post.category}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col flex-1 p-5">
                                                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600 mb-2">
                                                        <span>
                                                            {new Date(post.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                        {post.read_time && (
                                                            <>
                                                                <span>·</span>
                                                                <span>{post.read_time}</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <h2 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                                                        {post.title}
                                                    </h2>

                                                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 flex-1 mb-4">
                                                        {post.excerpt}
                                                    </p>

                                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 mt-auto">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                                                {post.author.charAt(0)}
                                                            </div>
                                                            <span className="text-xs text-gray-500 truncate">{post.author}</span>
                                                        </div>
                                                        <span className="text-xs font-medium text-red-400 shrink-0">Read More →</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-600">
                                    <p className="text-lg">No posts found in this category.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 text-gray-600">
                            <p className="text-lg">No posts yet.</p>
                        </div>
                    )}
                </div>

                <SiteFooter className="mt-12" />
            </div>
        </>
    );
}
