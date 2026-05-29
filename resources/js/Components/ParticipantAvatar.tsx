type Size = 'sm' | 'md';

const sizeClass: Record<Size, string> = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
};

function initialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ParticipantAvatar({
    name,
    avatarUrl,
    size = 'md',
    editable = false,
    onClick,
    className = '',
}: {
    name: string;
    avatarUrl?: string | null;
    size?: Size;
    editable?: boolean;
    onClick?: () => void;
    className?: string;
}) {
    const clickable = editable && onClick;

    return (
        <button
            type="button"
            onClick={clickable ? onClick : undefined}
            disabled={!clickable}
            title={editable ? (avatarUrl ? 'Change photo' : 'Add photo') : name}
            className={`relative shrink-0 rounded-full overflow-hidden border border-slate-700/60 bg-slate-800/80 flex items-center justify-center ${sizeClass[size]} ${
                clickable ? 'cursor-pointer hover:border-cyan-500/50 hover:ring-2 hover:ring-cyan-500/20 transition-all' : 'cursor-default'
            } ${className}`}
        >
            {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
                <span className="font-bold text-slate-400">{initialsFromName(name)}</span>
            )}
            {editable && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </span>
            )}
        </button>
    );
}
