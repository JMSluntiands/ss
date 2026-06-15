import { Fragment, ReactNode } from 'react';
import BracketColumn, { BRACKET_COLUMN_W, BRACKET_CONNECTOR_W, bracketTreeHeight } from './BracketColumn';
import BracketConnectors from './BracketConnectors';

function sortByMatchNumber<T extends { match_number: number }>(matches: T[]): T[] {
    return [...matches].sort((a, b) => a.match_number - b.match_number);
}

export default function BracketRoundsTree<T extends { id: number; match_number: number; winner_id?: number | null }>({
    rounds,
    roundsMap,
    roundLabel,
    firstRoundMatchCount,
    hideMatch,
    renderMatch,
}: {
    rounds: number[];
    roundsMap: Record<number, T[]>;
    roundLabel: (roundIndex: number, totalRounds: number) => string;
    firstRoundMatchCount: number;
    hideMatch?: (match: T) => boolean;
    renderMatch: (match: T) => ReactNode;
}) {
    const visibleRounds = rounds.filter((round) => (roundsMap[round] ?? []).length > 0);
    const treeMinHeight = bracketTreeHeight(firstRoundMatchCount);

    return (
        <div className="min-w-max">
            {/* Round labels — no panel background */}
            <div className="flex items-end mb-4">
                {visibleRounds.map((round, roundIndex) => (
                    <Fragment key={`hdr-${round}`}>
                        {roundIndex > 0 && (
                            <div className="shrink-0" style={{ width: BRACKET_CONNECTOR_W }} />
                        )}
                        <div
                            className="shrink-0 flex items-center justify-center px-1"
                            style={{ width: BRACKET_COLUMN_W }}
                        >
                            <span className="text-xs font-semibold text-slate-400 tracking-wide">
                                {roundLabel(roundIndex, visibleRounds.length)}
                            </span>
                        </div>
                    </Fragment>
                ))}
            </div>

            <div className="flex items-start" style={{ minHeight: treeMinHeight }}>
                {visibleRounds.map((round, roundIndex) => {
                    const roundMatches = sortByMatchNumber(roundsMap[round] ?? []);
                    const prevRoundMatches =
                        roundIndex > 0 ? sortByMatchNumber(roundsMap[visibleRounds[roundIndex - 1]] ?? []) : [];

                    return (
                        <Fragment key={round}>
                            {roundIndex > 0 && (
                                <BracketConnectors
                                    roundIndex={roundIndex - 1}
                                    firstRoundMatchCount={firstRoundMatchCount}
                                    matchCountInRound={prevRoundMatches.length}
                                    matchesInRound={prevRoundMatches}
                                    hideMatch={hideMatch}
                                />
                            )}
                            <BracketColumn
                                roundIndex={roundIndex}
                                firstRoundMatchCount={firstRoundMatchCount}
                                matches={roundMatches}
                                hideMatch={hideMatch}
                                renderMatch={renderMatch}
                            />
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
}
