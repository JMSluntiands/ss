import { ReactNode } from 'react';

/** Full MatchCard height (players + Play/Score/Edit) for tree spacing. */
export const BRACKET_CARD_H = 164;
export const BRACKET_CARD_W = 208;
export const BRACKET_MATCH_GAP = 16;
/** Vertical half-step between first-round match connector points. */
export const BRACKET_ROW_PX = (BRACKET_CARD_H + BRACKET_MATCH_GAP) / 2;
/** Y offset from card top to the divider between the two player rows (py-2.5 × 2). */
export const BRACKET_CONNECTOR_OFFSET_Y = 40;
export const BRACKET_CONNECTOR_W = 40;
export const BRACKET_COLUMN_W = 200;
export const BRACKET_TOP_PAD = 12;
export const BRACKET_BOTTOM_PAD = 16;

/** Horizontal scroll only — never clip or scroll vertically. */
export const BRACKET_SCROLL_CLASS =
    'overflow-x-auto overflow-y-visible overscroll-x-contain [scrollbar-width:thin] [scrollbar-color:rgb(71_85_105)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600';

export function bracketTreeHeight(firstRoundMatchCount: number): number {
    if (firstRoundMatchCount <= 0) {
        return BRACKET_CARD_H + BRACKET_TOP_PAD + BRACKET_BOTTOM_PAD;
    }
    const lastTop = bracketMatchTop(0, firstRoundMatchCount - 1);
    return lastTop + BRACKET_CARD_H + BRACKET_BOTTOM_PAD;
}

export function bracketMatchCenterY(roundIndex: number, matchIndex: number): number {
    const span = 2 ** roundIndex;
    return (
        matchIndex * span * BRACKET_ROW_PX * 2 +
        span * BRACKET_ROW_PX +
        BRACKET_TOP_PAD
    );
}

export function bracketMatchTop(roundIndex: number, matchIndex: number): number {
    return bracketMatchCenterY(roundIndex, matchIndex) - BRACKET_CONNECTOR_OFFSET_Y;
}

export default function BracketColumn<T extends { id: number; match_number: number }>({
    roundIndex,
    firstRoundMatchCount,
    matches,
    hideMatch,
    renderMatch,
    showLabel = false,
    label = '',
}: {
    roundIndex: number;
    firstRoundMatchCount: number;
    matches: T[];
    hideMatch?: (match: T) => boolean;
    renderMatch: (match: T) => ReactNode;
    showLabel?: boolean;
    label?: string;
}) {
    const treeHeight = bracketTreeHeight(firstRoundMatchCount);
    const sorted = [...matches].sort((a, b) => a.match_number - b.match_number);

    return (
        <div className="flex flex-col shrink-0" style={{ width: BRACKET_COLUMN_W }}>
            {showLabel && (
                <h4 className="text-xs font-semibold text-slate-400 mb-3 text-center shrink-0 tracking-wide">
                    {label}
                </h4>
            )}
            <div
                className="relative flex-1 shrink-0"
                style={{ height: treeHeight, minHeight: treeHeight }}
            >
                {sorted.map((match, pos) => {
                    const hidden = hideMatch?.(match) ?? false;

                    return (
                        <div
                            key={match.id}
                            className="absolute left-0 right-0 flex justify-center items-start"
                            style={{ top: bracketMatchTop(roundIndex, pos) }}
                        >
                            {hidden ? (
                                <div
                                    style={{ width: BRACKET_CARD_W, height: BRACKET_CARD_H }}
                                    className="invisible pointer-events-none"
                                    aria-hidden
                                />
                            ) : (
                                renderMatch(match)
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
