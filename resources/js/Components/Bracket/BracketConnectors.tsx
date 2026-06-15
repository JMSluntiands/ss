import { bracketMatchCenterY, bracketTreeHeight, BRACKET_CONNECTOR_W } from './BracketColumn';

type MatchSlot = { winner_id?: number | null };

export default function BracketConnectors<T extends MatchSlot>({
    roundIndex,
    firstRoundMatchCount,
    matchCountInRound,
    matchesInRound = [],
    hideMatch,
}: {
    roundIndex: number;
    firstRoundMatchCount: number;
    matchCountInRound: number;
    matchesInRound?: T[];
    hideMatch?: (match: T) => boolean;
}) {
    const height = bracketTreeHeight(firstRoundMatchCount);
    const xMid = BRACKET_CONNECTOR_W * 0.55;
    const paths: { d: string; highlight: boolean }[] = [];

    const isHidden = (pos: number) => {
        const match = matchesInRound[pos];
        if (!match) return true;
        return hideMatch?.(match) ?? false;
    };

    for (let pos = 0; pos < matchCountInRound; pos += 2) {
        const hasPair = pos + 1 < matchCountInRound;
        const topHidden = isHidden(pos);
        const botHidden = hasPair && isHidden(pos + 1);

        if (topHidden && botHidden) continue;

        const y0 = bracketMatchCenterY(roundIndex, pos);
        const y1 = hasPair ? bracketMatchCenterY(roundIndex, pos + 1) : y0;

        const midY = hasPair ? (y0 + y1) / 2 : y0;

        if (topHidden || botHidden) {
            const y = topHidden ? y1 : y0;
            const feeder = topHidden ? matchesInRound[pos + 1] : matchesInRound[pos];
            const won = !!feeder?.winner_id;

            // Single feeder: horizontal → vertical to pair midpoint → into next round
            paths.push({ d: `M 0 ${y} H ${xMid}`, highlight: won });
            if (hasPair && Math.abs(y - midY) > 0.5) {
                paths.push({ d: `M ${xMid} ${y} V ${midY}`, highlight: won });
            }
            paths.push({ d: `M ${xMid} ${midY} H ${BRACKET_CONNECTOR_W}`, highlight: won });
            continue;
        }

        const topWon = !!matchesInRound[pos]?.winner_id;
        const botWon = hasPair && !!matchesInRound[pos + 1]?.winner_id;
        const pairComplete = topWon && (!hasPair || botWon);

        if (hasPair) {
            paths.push({ d: `M 0 ${y0} H ${xMid}`, highlight: topWon });
            paths.push({ d: `M 0 ${y1} H ${xMid}`, highlight: botWon });
            paths.push({ d: `M ${xMid} ${y0} V ${y1}`, highlight: topWon || botWon });
            paths.push({ d: `M ${xMid} ${midY} H ${BRACKET_CONNECTOR_W}`, highlight: pairComplete });
        } else {
            paths.push({ d: `M 0 ${y0} H ${BRACKET_CONNECTOR_W}`, highlight: topWon });
        }
    }

    return (
        <div className="shrink-0 self-start" style={{ width: BRACKET_CONNECTOR_W, height }}>
            <svg width={BRACKET_CONNECTOR_W} height={height} className="overflow-visible" aria-hidden>
                {paths.map((path, i) => (
                    <path
                        key={i}
                        d={path.d}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={path.highlight ? 1.75 : 1}
                        className={path.highlight ? 'text-slate-300' : 'text-slate-600'}
                    />
                ))}
            </svg>
        </div>
    );
}
