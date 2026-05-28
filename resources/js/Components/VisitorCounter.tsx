import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

function formatCount(n: number): string {
    return n.toLocaleString();
}

export default function VisitorCounter({ className = '' }: { className?: string }) {
    const raw = usePage<PageProps>().props.site_visit_count;
    const total = typeof raw === 'number' ? raw : Number(raw) || 0;

    return (
        <div
            className={`inline-flex items-center gap-3 rounded-xl border border-red-900/25 bg-gradient-to-br from-zinc-900/90 to-black/80 px-4 py-2.5 shadow-[0_0_24px_-4px_rgba(220,38,38,0.15)] ${className}`}
            title="Count of page views on public site pages (home, blog, events, public tournament pages, login, etc.). Excludes the admin dashboard, live polling API, and authenticated tournament tools."
        >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
                <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            </div>
            <div className="text-left min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-400/80 leading-none">Site visits</p>
                <p className="text-lg font-black tabular-nums text-white tracking-tight leading-tight mt-0.5 transition-all duration-300">
                    {formatCount(total)}
                </p>
                <p className="text-[10px] text-gray-600 leading-tight mt-0.5">Public page views counted</p>
            </div>
        </div>
    );
}
