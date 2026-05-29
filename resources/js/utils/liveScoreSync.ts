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

/** Push live round scores to the server so the public matches board can poll them. */
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
