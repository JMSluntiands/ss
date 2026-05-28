import OptimizedImage from '@/Components/OptimizedImage';
import SiteFooter from '@/Components/SiteFooter';
import SiteLogo from '@/Components/SiteLogo';
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

function SiteNav({ active }: { active?: 'blog' }) {
    return (
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
                        <Link
                            href={route('blog')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${active === 'blog' ? 'text-red-400' : 'text-gray-300 hover:text-white'}`}
                        >
                            Blog
                        </Link>
                        <Link href={route('jersey')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Shop</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default function BlogShow({ post }: { post: BlogPostData }) {
    const imgs = normalizeImages(post.images);

    return (
        <>
            <Head title={`${post.title} - Shadow Syndicate Blog`} />
            <div className="min-h-screen bg-zinc-950 text-white">
                <SiteNav active="blog" />
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
                                            src={blogImageSrc(path)}
                                            alt={`${post.title} ${i + 1}`}
                                            priority={i === 0}
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
