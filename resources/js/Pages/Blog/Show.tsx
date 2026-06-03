import OptimizedImage from '@/Components/OptimizedImage';
import SiteFooter from '@/Components/SiteFooter';
import SiteNav from '@/Components/SiteNav';
import { blogImageSrc, normalizeImages } from '@/utils/blogImages';
import { Head, Link } from '@inertiajs/react';

interface BlogPostData {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    images: string[] | null;
    category: string;
    author: string;
    read_time: string | null;
    created_at: string;
}

export default function BlogShow({ post }: { post: BlogPostData }) {
    const imgs = normalizeImages(post.images);

    return (
        <>
            <Head title={`${post.title} - Shadow Syndicate Blog`} />
            <div className="min-h-screen bg-zinc-950 text-white">
                <SiteNav activePage="blog" />
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <Link
                        href={route('blog')}
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors mb-8"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Blog
                    </Link>

                    <article className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden">
                        {imgs.length > 0 && (
                            <div className={`${imgs.length > 1 ? 'grid grid-cols-3 gap-1' : ''}`}>
                                {imgs.map((path, i) => (
                                    <div
                                        key={i}
                                        className={`overflow-hidden bg-zinc-800 ${
                                            imgs.length === 1 ? 'max-h-72 sm:max-h-80' : 'aspect-[4/3]'
                                        }`}
                                    >
                                        <OptimizedImage
                                            src={blogImageSrc(path, 'full')}
                                            alt={`${post.title} ${i + 1}`}
                                            priority={i === 0}
                                            loading={i === 0 ? undefined : 'lazy'}
                                            className={`w-full object-cover object-center ${
                                                imgs.length === 1 ? 'h-full max-h-72 sm:max-h-80' : 'h-full'
                                            }`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-6 sm:p-8">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                    {post.category}
                                </span>
                                <span className="text-xs text-gray-600">
                                    {new Date(post.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                                {post.read_time && <span className="text-xs text-gray-600">{post.read_time}</span>}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4">{post.title}</h1>

                            <p className="text-gray-400 leading-relaxed mb-6 pb-6 border-b border-zinc-800/60">{post.excerpt}</p>

                            <div className="text-gray-300 leading-relaxed whitespace-pre-line mb-8">{post.content}</div>

                            <div className="flex items-center gap-3 pt-6 border-t border-zinc-800/60">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                                    {post.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{post.author}</p>
                                    <p className="text-xs text-gray-600">Shadow Syndicate</p>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>

                <SiteFooter className="mt-12" />
            </div>
        </>
    );
}
