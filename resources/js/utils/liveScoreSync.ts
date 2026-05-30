import { csrfHeaders } from './csrf';

export interface RoundEntry {
    round: number;
    winner: 'p1' | 'p2';
    finish: string;
    points: number;
}

export function totalsFromRounds(roundDetails: RoundEntry[]) {
    const p1 = roundDetails.filter((r) => r.winner === 'p1').reduce((s, r) => s + r.points, 0);
    const p2 = roundDetails.filter((r) => r.winner === 'p2').reduce((s, r) => s + r.points, 0);
    return { p1, p2 };
}

const saveChains = new Map<string, Promise<boolean>>();

/** Push live round scores to the server (one in-flight chain per match URL). */
export async function patchLiveScore(url: string, roundDetails: RoundEntry[]): Promise<boolean> {
    const { p1, p2 } = totalsFromRounds(roundDetails);

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: csrfHeaders(),
            body: JSON.stringify({
                round_details: roundDetails,
                player1_score: p1,
                player2_score: p2,
            }),
        });

        return res.ok;
    } catch {
        return false;
    }
}

/** Queue saves so rapid clicks stay in order and each click eventually hits the DB. */
export function persistLiveScoreQueued(url: string, roundDetails: RoundEntry[]): Promise<boolean> {
    const previous = saveChains.get(url) ?? Promise.resolve(true);
    const job = previous
        .catch(() => true)
        .then(() => patchLiveScore(url, roundDetails));

    saveChains.set(url, job);

    return job.finally(() => {
        if (saveChains.get(url) === job) {
            saveChains.delete(url);
        }
    });
}

export function waitForPendingLiveScore(url: string): Promise<void> {
    return (saveChains.get(url) ?? Promise.resolve(true)).then(() => undefined);
}
