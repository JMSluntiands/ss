import SiteFooter from '@/Components/SiteFooter';
import SiteLogo from '@/Components/SiteLogo';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface JerseyItemData {
    id: number;
    name: string;
    price: string;
    sizes: string[];
    color: string | null;
    material: string | null;
    description: string | null;
    image_url: string | null;
    available: boolean;
}

export default function Jersey({ items = [] }: { items?: JerseyItemData[] }) {
    const [selected, setSelected] = useState<number | null>(null);
    const selectedItem = items.find((j) => j.id === selected);

    return (
        <>
            <Head title="Jersey - Shadow Syndicate" />
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
                                <Link href={route('blog')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Blog</Link>
                                <Link href={route('jersey')} className="px-4 py-2 text-sm font-medium text-red-400 transition-colors">Shop</Link>
                            </div>
                        </div>
                    </div>
                </nav>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-10">
                        <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-full mb-4 uppercase">
                            Merch
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                            Official <span className="text-red-500">Shop & Merch</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            Browse official Shadow Syndicate jerseys and merch. Message us on Discord or Facebook to place your order.
                        </p>
                    </div>

                    <div className="bg-zinc-900/60 border border-red-500/20 rounded-2xl p-5 mb-10 flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-gray-400">
                            <span className="font-bold text-white">How to order:</span> Choose your item, then send a message to our Facebook page or Discord with the item name, size, and your shipping details. Payment via GCash or bank transfer.
                        </div>
                    </div>

                    {items.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="group bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all cursor-pointer"
                                    onClick={() => setSelected(item.id)}
                                >
                                    <div className="relative aspect-square overflow-hidden bg-zinc-900">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                                <span className="text-lg font-bold text-gray-500 text-center px-4">{item.name}</span>
                                            </div>
                                        )}
                                        {!item.available && (
                                            <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center">
                                                <span className="px-4 py-2 text-sm font-bold bg-zinc-900/90 border border-zinc-700 rounded-lg text-gray-400">
                                                    Sold Out
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-white mb-1">{item.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-red-400 font-black text-lg">{item.price}</span>
                                            <span className="text-xs text-gray-600">{item.sizes.join(' / ')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-600">
                            <p className="text-lg">No items yet.</p>
                        </div>
                    )}
                </div>

                {/* Item Detail Modal */}
                {selected && selectedItem && (
                    <>
                        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} />
                        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full overflow-hidden relative shadow-2xl shadow-black/50">
                                <button
                                    onClick={() => setSelected(null)}
                                    className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <div className="grid sm:grid-cols-2">
                                    <div className="aspect-square bg-zinc-800">
                                        {selectedItem.image_url ? (
                                            <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-lg font-bold text-gray-500 text-center px-4">{selectedItem.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col justify-center">
                                        <h2 className="text-xl font-bold text-white mb-2">{selectedItem.name}</h2>
                                        <span className="text-2xl font-black text-red-400 mb-4">{selectedItem.price}</span>
                                        <p className="text-sm text-gray-400 leading-relaxed mb-5">{selectedItem.description}</p>

                                        <div className="space-y-3 text-sm mb-6">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Sizes</span>
                                                <span className="text-white font-medium">{selectedItem.sizes.join(', ')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Color</span>
                                                <span className="text-white font-medium">{selectedItem.color || '—'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Material</span>
                                                <span className="text-white font-medium">{selectedItem.material || '—'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Status</span>
                                                <span className={selectedItem.available ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                                                    {selectedItem.available ? 'Available' : 'Sold Out'}
                                                </span>
                                            </div>
                                        </div>

                                        {selectedItem.available && (
                                            <a
                                                href="https://www.facebook.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full text-center px-6 py-3 text-sm font-bold bg-red-600 hover:bg-red-500 rounded-xl transition-colors"
                                            >
                                                Order via Facebook
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <SiteFooter />
            </div>
        </>
    );
}
