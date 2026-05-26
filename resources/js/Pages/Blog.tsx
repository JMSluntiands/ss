import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const posts = [
    {
        id: 1,
        title: 'Shadow Syndicate Championship Series #4 Recap',
        excerpt: 'DarkBlade takes the crown once again in a nail-biting finals match against StormRider. Here\'s a full recap of the biggest tournament of the year so far.',
        date: 'May 12, 2026',
        author: 'DarkBlade',
        category: 'Tournament Recap',
        readTime: '5 min read',
        content: `The Shadow Syndicate Championship Series #4 was held at SM Megamall Event Hall with 48 participants battling it out for the title. The tournament used a Double Elimination bracket format.\n\nHighlights:\n- DarkBlade went undefeated through the winners bracket with his Dranzer Spiral\n- StormRider fought back from the losers bracket, defeating PhantomX and BlitzKing along the way\n- The Grand Finals went to a reset, with DarkBlade clutching it in the final round\n- New player CrimsonEdge made a surprise Top 8 debut\n\nCongratulations to all participants! See you at Series #5.`,
    },
    {
        id: 2,
        title: 'Top 5 Beyblade Combos for Competitive Play in 2026',
        excerpt: 'Looking to build the best competitive Beyblade? Here are the top 5 combos dominating the tournament scene right now.',
        date: 'May 5, 2026',
        author: 'StormRider',
        category: 'Guide',
        readTime: '8 min read',
        content: `Whether you're a seasoned blader or just getting into competitive play, having the right combo can make all the difference. Here are the top 5 combos:\n\n1. Dranzer Spiral - Excellent stamina and defensive capabilities\n2. Dragoon Storm - Raw attack power with great burst resistance\n3. Wolborg MS - The ultimate stamina type for long battles\n4. Draciel Shield - Defensive powerhouse that outlasts opponents\n5. Galaxy Pegasus - Balanced performance with explosive attack mode\n\nRemember, the best combo depends on your playstyle and your opponent. Practice makes perfect!`,
    },
    {
        id: 3,
        title: 'How to Join Shadow Syndicate: A Complete Guide',
        excerpt: 'Interested in joining the Shadow Syndicate community? Here\'s everything you need to know about becoming a member.',
        date: 'April 20, 2026',
        author: 'PhantomX',
        category: 'Community',
        readTime: '4 min read',
        content: `Welcome to the Shadow Syndicate! We're always looking for new bladers to join our community. Here's how you can become a member:\n\n1. Join our Discord server and introduce yourself\n2. Attend at least one of our events (online or in-person)\n3. Register on our website and create your blader profile\n4. Participate in a Rookie Rumble tournament\n5. Once approved by an officer, you'll receive your official member role\n\nBenefits of membership:\n- Access to exclusive tournaments and events\n- Member-only Discord channels\n- Ranking and stats tracking\n- Community meetups and practice sessions`,
    },
    {
        id: 4,
        title: 'Stadium Setup Guide: Building the Perfect Arena',
        excerpt: 'Learn how to set up a regulation Beyblade stadium for tournaments and casual play. Tips on surfaces, barriers, and more.',
        date: 'April 10, 2026',
        author: 'BlitzKing',
        category: 'Guide',
        readTime: '6 min read',
        content: `Setting up a proper Beyblade stadium is essential for fair and exciting battles. Here's our complete guide:\n\nStadium Types:\n- Standard Stadium: Best for 1v1 battles\n- Wide Stadium: Great for multi-bey battles\n- Portable Stadium: Perfect for events on the go\n\nKey Considerations:\n- Surface must be smooth and level\n- Proper lighting for spectators and judges\n- Adequate space around the stadium for players\n- Camera setup for live streaming\n\nWe recommend the official BeyStadium for tournament play.`,
    },
    {
        id: 5,
        title: 'Community Spotlight: ShadowViper\'s Journey',
        excerpt: 'From a casual player to a Top 5 ranked member, ShadowViper shares his story of growth in the Beyblade community.',
        date: 'March 28, 2026',
        author: 'ShadowViper',
        category: 'Spotlight',
        readTime: '7 min read',
        content: `I started playing Beyblade casually with friends in high school. When I discovered the Shadow Syndicate community, everything changed.\n\nMy first tournament was a disaster — I went 0-3 and got eliminated immediately. But the community was so welcoming that I kept coming back.\n\nOver the next few months, I studied combos, practiced launches, and learned from the veterans. By my 5th tournament, I made it to the semifinals.\n\nToday I'm ranked in the Top 5 with a 52-25 record. The key to my improvement? Consistency, learning from losses, and the incredible support of this community.\n\nTo new players: don't give up after your first loss. The journey is what makes it worth it.`,
    },
];

const categories = ['All', 'Tournament Recap', 'Guide', 'Community', 'Spotlight'];

export default function Blog() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [expandedPost, setExpandedPost] = useState<number | null>(null);

    const filtered = activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);

    return (
        <>
            <Head title="Blog - Shadow Syndicate" />
            <div className="min-h-screen bg-zinc-950 text-white">
                <nav className="bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 sm:h-20">
                            <Link href={route('home')} className="flex items-center gap-3">
                                <img src="/storage/sslogo.png" alt="Shadow Syndicate" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_12px_rgba(220,38,38,0.4)]" />
                                <span className="text-lg sm:text-xl font-black tracking-tight">
                                    SHADOW <span className="text-red-500">SYNDICATE</span>
                                </span>
                            </Link>
                            <div className="hidden md:flex items-center gap-2">
                                <Link href={route('home')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
                                <Link href={route('members')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Members</Link>
                                <Link href={route('events')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Event</Link>
                                <Link href={route('blog')} className="px-4 py-2 text-sm font-medium text-red-400 transition-colors">Blog</Link>
                                <Link href={route('jersey')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Jersey</Link>
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

                    <div className="space-y-6">
                        {filtered.map((post) => (
                            <article
                                key={post.id}
                                className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 sm:p-8 hover:border-red-500/30 transition-all"
                            >
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                        {post.category}
                                    </span>
                                    <span className="text-xs text-gray-600">{post.date}</span>
                                    <span className="text-xs text-gray-600">{post.readTime}</span>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{post.title}</h2>
                                <p className="text-gray-400 leading-relaxed mb-4">{post.excerpt}</p>

                                {expandedPost === post.id && (
                                    <div className="border-t border-zinc-800/60 pt-4 mb-4">
                                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{post.content}</div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                                            {post.author.charAt(0)}
                                        </div>
                                        <span className="text-sm text-gray-400">{post.author}</span>
                                    </div>
                                    <button
                                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                                        className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        {expandedPost === post.id ? 'Show Less' : 'Read More'}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20 text-gray-600">
                            <p className="text-lg">No posts found in this category.</p>
                        </div>
                    )}
                </div>

                <footer className="border-t border-zinc-800/60 py-8 mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-xs text-gray-700">&copy; {new Date().getFullYear()} Shadow Syndicate. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
