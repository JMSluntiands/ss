import OptimizedImage from '@/Components/OptimizedImage';
import SiteFooter from '@/Components/SiteFooter';
import SiteNav from '@/Components/SiteNav';
import {
    formatPhpPrice,
    memberImageSrc,
    SHOP_CATEGORY_LABELS,
    type ShopCategory,
} from '@/utils/publicStorage';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface JerseyItemData {
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
}

type ShopFilter = 'all' | ShopCategory;

export default function Jersey({ items = [] }: { items?: JerseyItemData[] }) {
    const [selected, setSelected] = useState<number | null>(null);
    const [filter, setFilter] = useState<ShopFilter>('all');
    const filteredItems = useMemo(() => {
        if (filter === 'all') return items;
        return items.filter((item) => (item.category ?? 'jersey') === filter);
    }, [items, filter]);
    const selectedItem = items.find((j) => j.id === selected);

    return (
        <>
            <Head title="Jersey - Shadow Syndicate" />
            <div className="min-h-screen bg-zinc-950 text-white">
                <SiteNav activePage="jersey" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-10">
                        <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-full mb-4 uppercase">
                            Merch
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                            Official <span className="text-red-500">Shop & Merch</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            Browse official jerseys, Beyblade parts, and merch. Message us on Discord or Facebook to place your order.
                        </p>
                    </div>

                    {items.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {(
                                [
                                    ['all', 'All'],
                                    ['jersey', SHOP_CATEGORY_LABELS.jersey],
                                    ['beyblade_part', SHOP_CATEGORY_LABELS.beyblade_part],
                                ] as const
                            ).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFilter(key)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border transition-colors ${
                                        filter === key
                                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                            : 'bg-zinc-900/60 text-gray-500 border-zinc-800 hover:text-white'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="bg-zinc-900/60 border border-red-500/20 rounded-2xl p-5 mb-10 flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-gray-400">
                            <span className="font-bold text-white">How to order:</span> Choose your item, then send a message to our Facebook page or Discord with the item name, size, and your shipping details. Payment via GCash or bank transfer.
                        </div>
                    </div>

                    {filteredItems.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map((item) => {
                                const imgSrc = memberImageSrc(item.image_url);
                                const category = (item.category ?? 'jersey') as ShopCategory;

                                return (
                                <div
                                    key={item.id}
                                    className="group bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all cursor-pointer"
                                    onClick={() => setSelected(item.id)}
                                >
                                    <div className="relative aspect-square overflow-hidden bg-zinc-900">
                                        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-zinc-950/80 text-gray-300 border border-zinc-700/80">
                                            {SHOP_CATEGORY_LABELS[category]}
                                        </span>
                                        {imgSrc ? (
                                            <OptimizedImage
                                                src={imgSrc}
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
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-red-400 font-black text-lg">{formatPhpPrice(item.price)}</span>
                                            {item.sizes.length > 0 && (
                                                <span className="text-xs text-gray-600 truncate">{item.sizes.join(' / ')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                            })}
                        </div>
                    ) : items.length > 0 ? (
                        <div className="text-center py-20 text-gray-600">
                            <p className="text-lg">No items in this category.</p>
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
                                        {memberImageSrc(selectedItem.image_url) ? (
                                            <OptimizedImage src={memberImageSrc(selectedItem.image_url)!} alt={selectedItem.name} className="w-full h-full object-cover" priority />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-lg font-bold text-gray-500 text-center px-4">{selectedItem.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col justify-center">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-400/90 mb-2">
                                            {SHOP_CATEGORY_LABELS[(selectedItem.category ?? 'jersey') as ShopCategory]}
                                        </span>
                                        <h2 className="text-xl font-bold text-white mb-2">{selectedItem.name}</h2>
                                        <span className="text-2xl font-black text-red-400 mb-4">{formatPhpPrice(selectedItem.price)}</span>
                                        <p className="text-sm text-gray-400 leading-relaxed mb-5">{selectedItem.description}</p>

                                        <div className="space-y-3 text-sm mb-6">
                                            {selectedItem.sizes.length > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">
                                                        {(selectedItem.category ?? 'jersey') === 'jersey' ? 'Sizes' : 'Variant / spec'}
                                                    </span>
                                                    <span className="text-white font-medium">{selectedItem.sizes.join(', ')}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Color</span>
                                                <span className="text-white font-medium">{selectedItem.color || '—'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">
                                                    {(selectedItem.category ?? 'jersey') === 'jersey' ? 'Material' : 'Part type'}
                                                </span>
                                                <span className="text-white font-medium">{selectedItem.material || '—'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Status</span>
                                                <span className={selectedItem.available ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                                                    {selectedItem.available ? 'Available' : 'Sold Out'}
                                                </span>
                                            </div>
                                        </div>

                                        {selectedItem.available && selectedItem.facebook_url && (
                                            <a
                                                href={selectedItem.facebook_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full text-center px-6 py-3 text-sm font-bold bg-red-600 hover:bg-red-500 rounded-xl transition-colors"
                                            >
                                                Order via Facebook
                                            </a>
                                        )}
                                        {selectedItem.available && !selectedItem.facebook_url && (
                                            <p className="text-xs text-center text-gray-500 px-2">
                                                Walang Facebook order link para sa item na ito. Mag-message sa amin sa Discord o Facebook page ng Shadow Syndicate.
                                            </p>
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
