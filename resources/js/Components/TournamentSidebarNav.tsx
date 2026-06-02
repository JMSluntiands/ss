import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

export interface SidebarNavItem {
    name: string;
    href: string;
    icon: ReactNode;
    active?: boolean;
    badge?: string | number;
}

interface TournamentSidebarNavProps {
    items: SidebarNavItem[];
    collapsed: boolean;
    variant?: 'default' | 'subtle';
}

function itemClass(active: boolean, collapsed: boolean, variant: 'default' | 'subtle') {
    const base = `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
        collapsed ? 'justify-center' : ''
    }`;

    if (!active) {
        return `${base} text-gray-500 hover:text-white hover:bg-zinc-800/60 border-transparent`;
    }

    if (variant === 'subtle') {
        return `${base} bg-zinc-800/90 text-gray-100 border-zinc-700/50 shadow-inner shadow-black/20`;
    }

    return `${base} tx-nav-active`;
}

function iconClass(active: boolean, variant: 'default' | 'subtle') {
    if (!active) {
        return 'text-gray-600';
    }

    return variant === 'subtle' ? 'text-gray-200' : 'tx-nav-active-icon';
}

export function TournamentSidebarNav({ items, collapsed, variant = 'default' }: TournamentSidebarNavProps) {
    return (
        <>
            {items.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className={itemClass(!!item.active, collapsed, variant)}
                    title={collapsed ? item.name : undefined}
                >
                    <span className={`shrink-0 ${iconClass(!!item.active, variant)}`}>{item.icon}</span>
                    {!collapsed && (
                        <>
                            <span className="flex-1 truncate">{item.name}</span>
                            {item.badge != null && item.badge !== '' && (
                                <span className="shrink-0 min-w-[1.25rem] px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-zinc-700/80 text-gray-300 text-center">
                                    {item.badge}
                                </span>
                            )}
                        </>
                    )}
                </Link>
            ))}
        </>
    );
}

export function SidebarSectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
    if (collapsed) {
        return <div className="h-px bg-zinc-800/60 my-2" aria-hidden />;
    }

    return (
        <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">{label}</p>
    );
}
